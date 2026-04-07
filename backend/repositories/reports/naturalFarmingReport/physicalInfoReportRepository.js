const prisma = require('../../../config/prisma.js');

function toInt(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

function computeRowTotals(r) {
	const genM = toInt(r.generalM ?? r.genMale);
	const genF = toInt(r.generalF ?? r.genFemale);
	const obcM = toInt(r.obcM ?? r.obcMale);
	const obcF = toInt(r.obcF ?? r.obcFemale);
	const scM = toInt(r.scM ?? r.scMale);
	const scF = toInt(r.scF ?? r.scFemale);
	const stM = toInt(r.stM ?? r.stMale);
	const stF = toInt(r.stF ?? r.stFemale);
	const totM = genM + obcM + scM + stM;
	const totF = genF + obcF + scF + stF;
	return {
		genM, genF, genT: genM + genF,
		obcM, obcF, obcT: obcM + obcF,
		scM, scF, scT: scM + scF,
		stM, stF, stT: stM + stF,
		totM, totF, totT: totM + totF,
	};
}

async function getNaturalFarmingPhysicalInfoData(kvkId, filters = {}) {
	const where = {};
	if (kvkId) where.kvkId = kvkId;

	// Apply date/year on trainingDate; include "other activities" (with null training fields)
	if (filters.year || filters.startDate || filters.endDate) {
		const g = {};
		if (filters.year && !filters.startDate && !filters.endDate) {
			const y = Number(filters.year);
			if (Number.isFinite(y)) {
				g.gte = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
				g.lte = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
			}
		} else {
			if (filters.startDate) {
				const d = new Date(filters.startDate);
				if (!isNaN(d)) { d.setHours(0,0,0,0); g.gte = d; }
			}
			if (filters.endDate) {
				const d = new Date(filters.endDate);
				if (!isNaN(d)) { d.setHours(23,59,59,999); g.lte = d; }
			}
		}
		where.OR = [
			{ trainingDate: null },
			{ trainingDate: g },
		];
	}

	const rows = await prisma.physicalInfo.findMany({
		where,
		include: {
			kvk: {
				include: {
					state: true,
				},
			},
			activityMaster: true,
		},
		orderBy: [{ trainingDate: 'asc' }, { physicalInfoId: 'asc' }],
	});

	const normalized = rows.map(r => {
		const base = {
			stateName: r.kvk?.state?.stateName || '',
			kvkName: r.kvk?.kvkName || '',
			activityName: r.activityMaster?.activityName || '',
			trainingTitle: r.trainingTitle || '',
			trainingDate: r.trainingDate ? r.trainingDate.toISOString().split('T')[0] : '',
			venue: r.venue || '',
			remarks: r.remarks || '',
			innovativeProgrammeName: r.innovativeProgrammeName || '',
			significanceOfInnovativeProgramme: r.significanceOfInnovativeProgramme || '',
			isOtherActivity: !r.trainingTitle && !r.trainingDate && !r.venue, // per repository semantics
		};
		const totals = computeRowTotals(r);
		return { ...base, ...totals };
	});

	// Group dynamically by activityName from DB; "other" rows (no training fields) go under a special key
	const OTHER_KEY = '__other_activities__';
	const activityGroups = {};   // { <activityName>: [...rows], __other_activities__: [...rows] }
	const activityOrder = [];    // preserves first-seen order of keys
	for (const row of normalized) {
		const key = row.isOtherActivity ? OTHER_KEY : (row.activityName || 'Uncategorised');
		if (!activityGroups[key]) {
			activityGroups[key] = [];
			activityOrder.push(key);
		}
		activityGroups[key].push(row);
	}
	const activityNames = activityOrder.filter(k => k !== OTHER_KEY);

	// State-wise overall aggregates – one dynamic column per activity + "other"
	const stateMap = new Map();
	for (const r of normalized) {
		const key = r.stateName || '-';
		if (!stateMap.has(key)) {
			const entry = { stateName: key, totalProgrammes: 0, totM: 0, totF: 0, totT: 0, other: 0 };
			for (const a of activityNames) entry[a] = 0;
			stateMap.set(key, entry);
		}
		const agg = stateMap.get(key);
		if (r.isOtherActivity) {
			agg.other += 1;
		} else {
			const aName = r.activityName || 'Uncategorised';
			if (agg[aName] === undefined) agg[aName] = 0;
			agg[aName] += 1;
		}
		agg.totalProgrammes += 1;
		agg.totM += toInt(r.totM);
		agg.totF += toInt(r.totF);
		agg.totT += toInt(r.totT);
	}
	const stateAggregates = Array.from(stateMap.values()).sort((a, b) => a.stateName.localeCompare(b.stateName));

	return {
		activityGroups,   // e.g. { "Training": [...], "Awareness": [...], "__other_activities__": [...] }
		activityOrder,    // e.g. ["Training", "Awareness", "__other_activities__"]
		activityNames,    // e.g. ["Training", "Awareness"] – excludes "other"
		stateAggregates,  // [{ stateName, Training: 3, Awareness: 2, other: 1, totalProgrammes: 6, totM, totF, totT }]
	};
}

module.exports = { getNaturalFarmingPhysicalInfoData };
