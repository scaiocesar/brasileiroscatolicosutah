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

const ARTICLE_MEDIA_PREFIX = '/api/media/articles/';

const ARTICLE_HTML_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'img', 'blockquote'],
	allowedAttributes: {
		a: ['href', 'target', 'rel'],
		img: ['src', 'alt', 'width', 'height', 'class'],
	},
	allowedSchemes: ['http', 'https', 'mailto'],
	transformTags: {
		a: sanitizeHtml.simpleTransform('a', {
			rel: 'noopener noreferrer',
			target: '_blank',
		}),
	},
	allowedSchemesByTag: {
		img: ['http', 'https'],
	},
};

function isAllowedArticleImageSrc(src: string): boolean {
	return src.startsWith(ARTICLE_MEDIA_PREFIX);
}

/** Normalize stored article body to safe HTML with images. */
export function sanitizeArticleHtml(input: string): string {
	const raw = input.trim();
	if (!raw) return '';

	const cleaned = sanitizeHtml(raw, {
		...ARTICLE_HTML_OPTIONS,
		exclusiveFilter(frame) {
			if (frame.tag === 'img') {
				const src = String(frame.attribs?.src || '');
				return !isAllowedArticleImageSrc(src);
			}
			return false;
		},
	}).trim();

	return cleaned || '';
}

/** HTML suitable for the article Quill editor initial load. */
export function articleHtmlForEditor(input: string): string {
	return sanitizeArticleHtml(input) || '<p><br></p>';
}

/** Strip HTML tags for plain-text previews. */
export function plainTextFromHtml(input: string): string {
	return input
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
