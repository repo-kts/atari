/**
 * Parse a raw `curl` command (as copied from browser devtools "Copy as cURL")
 * into a request descriptor the engine can replay with fetch().
 *
 * Supports: bare URL, -X/--request, -H/--header, -b/--cookie,
 * --data/--data-raw/--data-binary/-d, and compressed/silent flags (ignored).
 * Quoting: handles single-quoted ('…') and double-quoted ("…") args, the
 * dominant forms emitted by Chrome/Firefox.
 */
function tokenize(input) {
    const tokens = [];
    let i = 0;
    const n = input.length;
    while (i < n) {
        // Skip whitespace and line continuations.
        if (/\s/.test(input[i]) || input[i] === '\\') {
            i++;
            continue;
        }
        let quote = null;
        let buf = '';
        if (input[i] === "'" || input[i] === '"') {
            quote = input[i];
            i++;
        }
        while (i < n) {
            const ch = input[i];
            if (quote) {
                if (ch === quote) {
                    i++;
                    break;
                }
                // Inside double quotes a backslash escapes the next char.
                if (ch === '\\' && quote === '"' && i + 1 < n) {
                    buf += input[i + 1];
                    i += 2;
                    continue;
                }
                buf += ch;
                i++;
            } else {
                if (/\s/.test(ch) || ch === '\\') break;
                buf += ch;
                i++;
            }
        }
        tokens.push(buf);
    }
    return tokens;
}

function parseCurl(raw) {
    if (!raw || typeof raw !== 'string') {
        throw new Error('Empty curl command');
    }
    const tokens = tokenize(raw.trim());
    if (tokens[0] === 'curl') tokens.shift();

    const req = { url: null, method: null, headers: {}, body: null };

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const next = () => tokens[++i];

        if (t === '-X' || t === '--request') {
            req.method = next();
        } else if (t === '-H' || t === '--header') {
            const h = next();
            const idx = h.indexOf(':');
            if (idx > -1) {
                const key = h.slice(0, idx).trim();
                const val = h.slice(idx + 1).trim();
                req.headers[key.toLowerCase()] = val;
            }
        } else if (t === '-b' || t === '--cookie') {
            req.headers['cookie'] = next();
        } else if (
            t === '--data' ||
            t === '--data-raw' ||
            t === '--data-binary' ||
            t === '--data-ascii' ||
            t === '-d'
        ) {
            req.body = next();
        } else if (t === '--compressed' || t === '-s' || t === '--silent' || t === '-i' || t === '-L' || t === '--location') {
            // no-op flags
        } else if (t.startsWith('http://') || t.startsWith('https://')) {
            req.url = t;
        } else if (!t.startsWith('-') && !req.url) {
            // bare positional URL without scheme is unusual; accept anyway
            req.url = t;
        }
    }

    if (!req.url) throw new Error('No URL found in curl command');
    if (!req.method) req.method = req.body ? 'POST' : 'GET';

    return req;
}

module.exports = { parseCurl };
