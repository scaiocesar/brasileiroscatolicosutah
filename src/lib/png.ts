const PNG_SIG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

/** Chunks safe for social crawlers (Facebook rejects PNGs with C2PA/caBX etc.). */
const KEEP = new Set([
	'IHDR',
	'PLTE',
	'IDAT',
	'IEND',
	'tRNS',
	'cHRM',
	'gAMA',
	'iCCP',
	'sBIT',
	'sRGB',
	'bKGD',
	'pHYs',
]);

function isPng(buf: Uint8Array): boolean {
	if (buf.length < 8) return false;
	for (let i = 0; i < 8; i++) {
		if (buf[i] !== PNG_SIG[i]) return false;
	}
	return true;
}

/**
 * Drop private/provenance PNG chunks (e.g. caBX / C2PA) that break Facebook/WhatsApp og:image.
 * Returns the original buffer if not PNG or if nothing needs stripping.
 */
export function sanitizePngForSocial(input: ArrayBuffer): ArrayBuffer {
	const src = new Uint8Array(input);
	if (!isPng(src)) return input;

	const parts: Uint8Array[] = [PNG_SIG];
	let pos = 8;
	let stripped = false;

	while (pos + 12 <= src.length) {
		const length = (src[pos] << 24) | (src[pos + 1] << 16) | (src[pos + 2] << 8) | src[pos + 3];
		if (length < 0 || pos + 12 + length > src.length) break;

		const type = String.fromCharCode(src[pos + 4], src[pos + 5], src[pos + 6], src[pos + 7]);
		const chunk = src.subarray(pos, pos + 12 + length);

		if (KEEP.has(type)) {
			parts.push(chunk);
		} else {
			stripped = true;
		}

		pos += 12 + length;
		if (type === 'IEND') break;
	}

	if (!stripped) return input;

	const total = parts.reduce((n, p) => n + p.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const part of parts) {
		out.set(part, offset);
		offset += part.length;
	}
	return out.buffer;
}
