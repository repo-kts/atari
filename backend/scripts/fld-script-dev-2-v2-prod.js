// Re-seed category / sub_category / crop in the SHADOW DB from FLD Seed Data "All" sheet.
// Sets unit_id (hectare->Hectare, Number->Number) and quantity_data_type (hectare->decimal, Number->whole_number).
// Preserves FLD/budget rows by re-pointing them to the new crops (by crop-name + sector), then deletes old rows.
// ALL IN ONE TRANSACTION. DRY_RUN=1 => rollback (preview only). SHADOW DB ONLY.
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const SOURCE = process.env.FLD_SEED_SOURCE || '/Users/vinodkr/Downloads/FLD-Seed-Data.xlsx';

async function loadSeed(sourcePath) {
    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
        const jsonPath = path.join(sourcePath, 'seed_all.json');
        return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }

    if (sourcePath.toLowerCase().endsWith('.json')) {
        return JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    }

    if (sourcePath.toLowerCase().endsWith('.xlsx')) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(sourcePath);
        const sheet = workbook.getWorksheet('All') || workbook.worksheets[0];
        if (!sheet) throw new Error('No worksheet found in seed workbook: ' + sourcePath);
        const rows = [];
        for (let r = 2; r <= sheet.rowCount; r++) {
            const row = sheet.getRow(r);
            if (!row || !row.values || !row.values[2]) continue;
            rows.push({
                sector: row.getCell(2).text.trim(),
                category: row.getCell(3).text.trim(),
                subcategory: row.getCell(4).text.trim(),
                crop: row.getCell(5).text.trim(),
                unit: row.getCell(6).text.trim(),
            });
        }
        if (!rows.length) throw new Error('No data rows found in seed workbook: ' + sourcePath);
        return rows;
    }

    throw new Error('Unsupported FLD seed source: ' + sourcePath);
}

const seed = [];
const S = new Pool({ connectionString: 'postgresql://neondb_owner:npg_LHd7GTfI9iZK@ep-orange-dream-ah704npi-pooler.c-3.us-east-1.aws.neon.tech/prisma_migrate_shadow_db_426b9540-de80-46bb-9a49-68dcfdfbd47f?sslmode=require&channel_binding=require', ssl: { rejectUnauthorized: false } });
const DRY = !!process.env.DRY_RUN;
const norm = s => String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
const UNIT = { hectare: 3, Number: 4 };          // shadow unit ids
const QDT = { hectare: 'decimal', Number: 'whole_number' };

(async () => {
    seed.push(...await loadSeed(SOURCE));
    const cl = await S.connect();
    try {
        console.log((DRY ? 'DRY-RUN (rollback)' : 'WRITE') + '  re-seed FLD masters -> SHADOW\n');
        // sector name -> id (existing, untouched)
        const secRows = (await cl.query('SELECT sector_id, sector_name FROM sector')).rows;
        const secByName = new Map(secRows.map(r => [norm(r.sector_name), r.sector_id]));
        for (const x of seed) { if (!secByName.has(norm(x.sector))) throw new Error('sector not found in shadow: ' + x.sector); }

        // capture OLD ids + FLD-crop context (crop -> name + sectorId) BEFORE inserting
        const oldCatIds = (await cl.query('SELECT category_id FROM category')).rows.map(r => r.category_id);
        const oldSubIds = (await cl.query('SELECT sub_category_id FROM sub_category')).rows.map(r => r.sub_category_id);
        const oldCrops = (await cl.query('SELECT cr.crop_id, cr.crop_name, c."sectorId" FROM crop cr JOIN category c ON c.category_id=cr."categoryId"')).rows;
        const oldCropIds = oldCrops.map(r => r.crop_id);
        const oldCropInfo = new Map(oldCrops.map(r => [r.crop_id, { name: norm(r.crop_name), sec: r.sectorId }]));

        await cl.query('BEGIN');

        // 1) categories: distinct (sector,category)
        const catMap = new Map();   // sectorId|catNorm -> newCatId
        const catSeen = [];
        for (const x of seed) { const k = secByName.get(norm(x.sector)) + '|' + norm(x.category); if (!catMap.has(k)) { catMap.set(k, null); catSeen.push({ k, name: x.category, sec: secByName.get(norm(x.sector)) }); } }
        for (const c of catSeen) { const r = await cl.query('INSERT INTO category (category_name,"sectorId",is_other,created_at,updated_at) VALUES ($1,$2,false,now(),now()) RETURNING category_id', [c.name, c.sec]); catMap.set(c.k, r.rows[0].category_id); }

        // 2) sub_categories: distinct (sector,category,subcategory)
        const subMap = new Map();   // newCatId|subNorm -> newSubId
        const subSeen = [];
        for (const x of seed) { const cat = catMap.get(secByName.get(norm(x.sector)) + '|' + norm(x.category)); const k = cat + '|' + norm(x.subcategory); if (!subMap.has(k)) { subMap.set(k, null); subSeen.push({ k, name: x.subcategory, cat, sec: secByName.get(norm(x.sector)) }); } }
        for (const s of subSeen) { const r = await cl.query('INSERT INTO sub_category (sub_category_name,"categoryId","sectorId",is_other,created_at,updated_at) VALUES ($1,$2,$3,false,now(),now()) RETURNING sub_category_id', [s.name, s.cat, s.sec]); subMap.set(s.k, r.rows[0].sub_category_id); }

        // 3) crops (batched) + build lookup maps for FLD remap
        const byNameSec = new Map();   // cropNorm|sectorId -> {crop,cat,sub}
        const byName = new Map();      // cropNorm -> {crop,cat,sub}
        const secOthers = new Map();   // sectorId -> cropId (name others/other)
        const secFirst = new Map();    // sectorId -> first cropId
        const CH = 100;
        for (let i = 0; i < seed.length; i += CH) {
            const batch = seed.slice(i, i + CH);
            const vals = []; const params = [];
            batch.forEach((x, bi) => {
                const sec = secByName.get(norm(x.sector));
                const cat = catMap.get(sec + '|' + norm(x.category));
                const sub = subMap.get(cat + '|' + norm(x.subcategory));
                const uid = UNIT[x.unit] || null; const qdt = QDT[x.unit] || null;
                const base = bi * 5;
                params.push(x.crop, cat, sub, uid, qdt);
                vals.push(`($${base + 1},$${base + 2},$${base + 3},false,false,$${base + 4},$${base + 5},now(),now())`);
            });
            const res = await cl.query(`INSERT INTO crop (crop_name,"categoryId","subCategoryId",is_other,quantity_required,unit_id,quantity_data_type,created_at,updated_at) VALUES ${vals.join(',')} RETURNING crop_id`, params);
            res.rows.forEach((row, bi) => {
                const x = batch[bi]; const sec = secByName.get(norm(x.sector));
                const cat = catMap.get(sec + '|' + norm(x.category)); const sub = subMap.get(cat + '|' + norm(x.subcategory));
                const rec = { crop: row.crop_id, cat, sub };
                const nk = norm(x.crop) + '|' + sec;
                if (!byNameSec.has(nk)) byNameSec.set(nk, rec);
                if (!byName.has(norm(x.crop))) byName.set(norm(x.crop), rec);
                if (['others', 'other'].includes(norm(x.crop)) && !secOthers.has(sec)) secOthers.set(sec, rec);
                if (!secFirst.has(sec)) secFirst.set(sec, rec);
            });
        }

        // 4) remap FLDs + budget (BULK): only crops actually referenced
        const refIds = [...new Set([
            ...(await cl.query('SELECT DISTINCT "cropId" FROM kvk_fld_introduction WHERE "cropId" IS NOT NULL')).rows.map(r => r.cropId),
            ...(await cl.query('SELECT DISTINCT "cropId" FROM kvk_budget_utilization WHERE "cropId" IS NOT NULL')).rows.map(r => r.cropId),
        ])];
        let exact = 0, byname = 0, others = 0, first = 0, unmapped = 0;
        const mrows = [];
        for (const oldId of refIds) {
            const info = oldCropInfo.get(oldId); if (!info) { unmapped++; continue; }
            let t = byNameSec.get(info.name + '|' + info.sec);
            if (t) exact++; else if ((t = byName.get(info.name))) byname++;
            else if ((t = secOthers.get(info.sec))) others++;
            else if ((t = secFirst.get(info.sec))) first++;
            else { unmapped++; continue; }
            mrows.push({ oc: oldId, nc: t.crop, ncat: t.cat, nsub: t.sub });
        }
        let fldUpd = 0, budUpd = 0;
        if (mrows.length) {
            const vals = mrows.map((_, i) => `($${i * 4 + 1}::int,$${i * 4 + 2}::int,$${i * 4 + 3}::int,$${i * 4 + 4}::int)`).join(',');
            const params = mrows.flatMap(r => [r.oc, r.nc, r.ncat, r.nsub]);
            fldUpd = (await cl.query(`UPDATE kvk_fld_introduction f SET "cropId"=m.nc,"categoryId"=m.ncat,"subCategoryId"=m.nsub FROM (VALUES ${vals}) AS m(oc,nc,ncat,nsub) WHERE f."cropId"=m.oc`, params)).rowCount;
            budUpd = (await cl.query(`UPDATE kvk_budget_utilization b SET "cropId"=m.nc FROM (VALUES ${vals}) AS m(oc,nc,ncat,nsub) WHERE b."cropId"=m.oc`, params)).rowCount;
        }
        // safety: any FLD/budget still referencing an OLD crop?
        const stillF = (await cl.query('SELECT count(*)::int n FROM kvk_fld_introduction WHERE "cropId" = ANY($1)', [oldCropIds])).rows[0].n;
        const stillB = (await cl.query('SELECT count(*)::int n FROM kvk_budget_utilization WHERE "cropId" = ANY($1)', [oldCropIds])).rows[0].n;
        if (stillF > 0 || stillB > 0) throw new Error('still referencing old crops: fld=' + stillF + ' budget=' + stillB + ' (aborting)');

        // 5) delete old crops -> subcats -> cats
        const dC = await cl.query('DELETE FROM crop WHERE crop_id = ANY($1)', [oldCropIds]);
        const dS = await cl.query('DELETE FROM sub_category WHERE sub_category_id = ANY($1)', [oldSubIds]);
        const dK = await cl.query('DELETE FROM category WHERE category_id = ANY($1)', [oldCatIds]);
        // reset sequences
        for (const [t, pk] of [['category', 'category_id'], ['sub_category', 'sub_category_id'], ['crop', 'crop_id']])
            await cl.query(`SELECT setval(pg_get_serial_sequence('${t}','${pk}'), (SELECT COALESCE(MAX(${pk}),1) FROM ${t}))`);

        // report
        const cCat = (await cl.query('SELECT count(*)::int n FROM category')).rows[0].n;
        const cSub = (await cl.query('SELECT count(*)::int n FROM sub_category')).rows[0].n;
        const cCrop = (await cl.query('SELECT count(*)::int n FROM crop')).rows[0].n;
        const qd = (await cl.query('SELECT quantity_data_type, count(*)::int c FROM crop GROUP BY 1 ORDER BY 2 DESC')).rows;
        const ud = (await cl.query('SELECT unit_id, count(*)::int c FROM crop GROUP BY 1 ORDER BY 2 DESC')).rows;
        console.log('inserted -> categories:', catSeen.length, '| sub_categories:', subSeen.length, '| crops:', seed.length);
        console.log('deleted old -> crops:', dC.rowCount, '| sub_categories:', dS.rowCount, '| categories:', dK.rowCount);
        console.log('FLD remap: exact(name+sector)=' + exact, 'byName=' + byname, 'sectorOthers=' + others, 'sectorFirst=' + first, 'unmapped=' + unmapped, '| FLD rows updated=' + fldUpd, '| budget rows updated=' + budUpd);
        console.log('FINAL counts -> category:', cCat, '| sub_category:', cSub, '| crop:', cCrop);
        console.log('quantity_data_type:', JSON.stringify(qd), '| unit_id:', JSON.stringify(ud));

        if (DRY) { await cl.query('ROLLBACK'); console.log('\n(DRY-RUN — rolled back, nothing written)'); }
        else { await cl.query('COMMIT'); console.log('\nCOMMITTED.'); }
    } catch (e) { await cl.query('ROLLBACK'); console.error('ROLLBACK:', e.message); process.exitCode = 1; }
    finally { cl.release(); await S.end(); }
})();
