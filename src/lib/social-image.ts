import UPNG from 'upng-js';
import jpeg from 'jpeg-js';

const MAX_EDGE = 1200;
const JPEG_QUALITY = 80;

function isPng(buf: Uint8Array): boolean {
	return (
		buf.length >= 8 &&
		buf[0] === 0x89 &&
		buf[1] === 0x50 &&
		buf[2] === 0x4e &&
		buf[3] === 0x47
	);
}

function isJpeg(buf: Uint8Array): boolean {
	return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

function resizeRgba(
	src: Uint8Array,
	srcW: number,
	srcH: number,
	dstW: number,
	dstH: number,
): Uint8Array {
	const out = new Uint8Array(dstW * dstH * 4);
	for (let y = 0; y < dstH; y++) {
		const sy = Math.min(srcH - 1, Math.floor((y * srcH) / dstH));
		for (let x = 0; x < dstW; x++) {
			const sx = Math.min(srcW - 1, Math.floor((x * srcW) / dstW));
			const si = (sy * srcW + sx) * 4;
			const di = (y * dstW + x) * 4;
			out[di] = src[si];
			out[di + 1] = src[si + 1];
			out[di + 2] = src[si + 2];
			out[di + 3] = src[si + 3];
		}
	}
	return out;
}

/**
 * Re-encode uploaded artwork as a social-friendly JPEG (FB/WhatsApp og:image).
 * Returns null if the buffer is not a supported raster image.
 */
export function encodeSocialJpeg(input: ArrayBuffer): { body: Uint8Array; width: number; height: number } | null {
	const bytes = new Uint8Array(input);

	let width = 0;
	let height = 0;
	let rgba: Uint8Array;

	if (isPng(bytes)) {
		const png = UPNG.decode(input);
		width = png.width;
		height = png.height;
		rgba = new Uint8Array(UPNG.toRGBA8(png)[0]);
	} else if (isJpeg(bytes)) {
		const decoded = jpeg.decode(bytes, { useTArray: true });
		width = decoded.width;
		height = decoded.height;
		rgba = decoded.data as Uint8Array;
	} else {
		return null;
	}

	let outW = width;
	let outH = height;
	const edge = Math.max(width, height);
	if (edge > MAX_EDGE) {
		const scale = MAX_EDGE / edge;
		outW = Math.max(1, Math.round(width * scale));
		outH = Math.max(1, Math.round(height * scale));
		rgba = resizeRgba(rgba, width, height, outW, outH);
	}

	const encoded = jpeg.encode({ data: rgba, width: outW, height: outH }, JPEG_QUALITY);
	return { body: encoded.data, width: outW, height: outH };
}
