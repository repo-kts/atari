/**
 * One-off: reset credentials for every kvk_admin user.
 *
 *   - password  -> "Atari@32"
 *   - email     -> kvk<first two words of the KVK name>@atariams.org
 *                  e.g. KVK "KVK Patna" -> kvkpatna@atariams.org
 *
 * Email is globally unique, so collisions (two KVKs with the same first two
 * words, or a name already taken by another user) get a numeric suffix:
 *   kvkpatna@atariams.org, kvkpatna2@atariams.org, kvkpatna3@atariams.org, ...
 *
 * SAFETY: dry-run by default — it only PRINTS the planned changes. Pass
 * `--apply` to actually write. Run from the backend/ directory:
 *
 *   node reset_kvk_admin_credentials.js            # preview only
 *   node reset_kvk_admin_credentials.js --apply    # perform the update
 */

const prisma = require('./config/prisma.js');
const { hashPassword } = require('./utils/password.js');

const NEW_PASSWORD = 'Atari@32';
const EMAIL_DOMAIN = 'atariams.org';
const TARGET_ROLE = 'kvk_admin';
const APPLY = process.argv.includes('--apply');

// Local part = first two words of the KVK name, lowercased, non-alphanumerics
// stripped. "KVK Patna" -> "kvkpatna"; "K.V.K. Gaya-II" -> "kvkgaya".
function baseLocalPart(kvkName) {
    const words = String(kvkName || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(' ');
    return words.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
    console.log(`\n=== Reset kvk_admin credentials (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===\n`);

    const users = await prisma.user.findMany({
        where: { deletedAt: null, role: { roleName: TARGET_ROLE } },
        include: { kvk: { select: { kvkId: true, kvkName: true } } },
        orderBy: { userId: 'asc' },
    });

    console.log(`Found ${users.length} ${TARGET_ROLE} user(s).\n`);
    if (users.length === 0) return;

    // Emails already in use by users we are NOT touching — must not collide.
    const targetIds = new Set(users.map((u) => u.userId));
    const others = await prisma.user.findMany({
        where: { deletedAt: null, userId: { notIn: [...targetIds] } },
        select: { email: true },
    });
    const usedEmails = new Set(
        others.map((u) => String(u.email || '').toLowerCase()).filter(Boolean),
    );

    // Deterministic order → stable suffix assignment.
    const plan = [];
    const skipped = [];
    for (const u of users) {
        if (!u.kvk || !u.kvk.kvkName) {
            skipped.push({ userId: u.userId, email: u.email, reason: 'no KVK / kvkName' });
            continue;
        }
        const base = baseLocalPart(u.kvk.kvkName);
        if (!base) {
            skipped.push({ userId: u.userId, email: u.email, reason: `unusable KVK name "${u.kvk.kvkName}"` });
            continue;
        }
        // Find the first free local part: base, base2, base3, ...
        let n = 1;
        let candidate = `${base}@${EMAIL_DOMAIN}`;
        while (usedEmails.has(candidate.toLowerCase())) {
            n += 1;
            candidate = `${base}${n}@${EMAIL_DOMAIN}`;
        }
        usedEmails.add(candidate.toLowerCase());
        plan.push({
            userId: u.userId,
            kvkName: u.kvk.kvkName,
            oldEmail: u.email,
            newEmail: candidate,
        });
    }

    console.log('Planned changes (password -> "Atari@32" for all):\n');
    for (const p of plan) {
        const changed = p.oldEmail !== p.newEmail ? '' : '  (email unchanged)';
        console.log(`  user #${p.userId}  [${p.kvkName}]`);
        console.log(`      ${p.oldEmail}  ->  ${p.newEmail}${changed}`);
    }
    if (skipped.length) {
        console.log('\nSkipped:');
        for (const s of skipped) console.log(`  user #${s.userId} (${s.email}) — ${s.reason}`);
    }

    if (!APPLY) {
        console.log(`\nDRY-RUN only. Re-run with --apply to write ${plan.length} change(s).\n`);
        return;
    }

    const passwordHash = await hashPassword(NEW_PASSWORD);
    let ok = 0;
    for (const p of plan) {
        await prisma.user.update({
            where: { userId: p.userId },
            data: { email: p.newEmail, passwordHash },
        });
        ok += 1;
    }
    console.log(`\nApplied ${ok} update(s).${skipped.length ? ` Skipped ${skipped.length}.` : ''}\n`);
}

main()
    .catch((err) => {
        console.error('FAILED:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
