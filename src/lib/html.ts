import sanitizeHtml from 'sanitize-html';

const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'a', 'ul', 'ol', 'li'],
	allowedAttributes: {
		a: ['href', 'target', 'rel'],
	},
	allowedSchemes: ['http', 'https', 'mailto'],
	transformTags: {
		a: sanitizeHtml.simpleTransform('a', {
			rel: 'noopener noreferrer',
			target: '_blank',
		}),
	},
};

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Plain text (legacy) → HTML paragraphs. */
export function plainTextToHtml(text: string): string {
	return text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean)
		.map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
		.join('');
}

export function looksLikeHtml(value: string): boolean {
	return /<(p|br|strong|b|em|i|a|ul|ol|li)\b/i.test(value);
}

/** Normalize stored about content to safe HTML. */
export function sanitizeRichText(input: string): string {
	const raw = input.trim();
	if (!raw) return '';
	const html = looksLikeHtml(raw) ? raw : plainTextToHtml(raw);
	const cleaned = sanitizeHtml(html, RICH_TEXT_OPTIONS).trim();
	return cleaned || '';
}

/** HTML suitable for the Quill editor initial load. */
export function richTextForEditor(input: string): string {
	return sanitizeRichText(input) || '<p><br></p>';
}
