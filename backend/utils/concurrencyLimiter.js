/**
 * Minimal dependency-free concurrency limiter (semaphore).
 *
 * Report aggregation fans out multiplicatively — every report section fires in
 * parallel, and each section fires one `getSectionData` call per KVK (~130) in
 * parallel. On a cold cache that produces thousands of concurrent Prisma
 * queries competing for the pg pool (`max: 20`). Queries that cannot acquire a
 * connection within `connectionTimeoutMillis` throw "timeout exceeded when
 * trying to connect", the KVK's rows are silently dropped, and the section
 * renders blank. Routing DB fetches through a shared limiter caps in-flight DB
 * work below the pool size so the burst queues in-process instead of thrashing
 * the pool.
 *
 * @param {number} maxConcurrent - Max tasks allowed to run at once.
 * @returns {<T>(task: () => Promise<T>) => Promise<T>} run - Wrap an async task;
 *   it starts immediately if a slot is free, otherwise queues FIFO.
 */
function createLimiter(maxConcurrent) {
    const limit = Math.max(1, Math.floor(maxConcurrent) || 1);
    let active = 0;
    const queue = [];

    const next = () => {
        if (active >= limit || queue.length === 0) return;
        active += 1;
        const { task, resolve, reject } = queue.shift();
        // Ensure a throwing (synchronous) task is still funneled through the
        // promise chain so the slot is always released.
        Promise.resolve()
            .then(task)
            .then(resolve, reject)
            .finally(() => {
                active -= 1;
                next();
            });
    };

    return function run(task) {
        return new Promise((resolve, reject) => {
            queue.push({ task, resolve, reject });
            next();
        });
    };
}

module.exports = { createLimiter };
