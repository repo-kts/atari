export function calculatePercentIncrease({
    farmerYield,
    demoYieldAvg,
}: {
    farmerYield: number | string | null | undefined;
    demoYieldAvg: number | string | null | undefined;
}): number {
    const farmer = Number(farmerYield);
    const demo = Number(demoYieldAvg);

    if (!Number.isFinite(farmer) || !Number.isFinite(demo) || farmer === 0) {
        return 0;
    }

    return Math.round(((demo - farmer) / farmer) * 100);
}
