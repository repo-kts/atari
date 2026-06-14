// Fetch a remote image (e.g. a presigned S3 URL) into a Buffer for embedding
// in Excel/Word exports. Returns null on any failure so exports never break.
async function fetchImageBuffer(url) {
    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) return null;
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) return null;
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        const buffer = Buffer.from(await res.arrayBuffer());
        if (!buffer.length) return null;
        let extension = 'png';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpeg';
        else if (contentType.includes('png')) extension = 'png';
        else if (contentType.includes('gif')) extension = 'gif';
        return { buffer, extension };
    } catch {
        return null;
    }
}

module.exports = { fetchImageBuffer };
