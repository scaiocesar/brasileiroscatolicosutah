const ARTICLE_MEDIA_PREFIX = '/api/media/articles/';

const VOID_TAGS = new Set(['br', 'img']);

type TagRule = {
	attrs?: Set<string>;
};

const RICH_TEXT_TAGS: Record<string, TagRule> = {
	p: {},
	br: {},
	strong: {},
	b: {},
	em: {},
	i: {},
	a: { attrs: new Set(['href']) },
	ul: {},
	ol: {},
	li: {},
};

const ARTICLE_TAGS: Record<string, TagRule> = {
	...RICH_TEXT_TAGS,
	h2: {},
	h3: {},
	blockquote: {},
	img: { attrs: new Set(['src', 'alt', 'width', 'height', 'class']) },
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
	return /<(p|br|strong|b|em|i|a|ul|ol|li|h2|h3|img|blockquote)\b/i.test(value);
}

function isSafeHref(href: string): boolean {
	const value = href.trim();
	if (!value) return false;
	if (value.startsWith('/') && !value.startsWith('//')) return true;
	return /^(https?:|mailto:)/i.test(value);
}

function isAllowedArticleImageSrc(src: string): boolean {
	return src.startsWith(ARTICLE_MEDIA_PREFIX);
}

function parseAttrs(raw: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
	let match: RegExpExecArray | null;
	while ((match = re.exec(raw))) {
		attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
	}
	return attrs;
}

function serializeOpenTag(tag: string, attrs: Record<string, string>, selfClosing = false): string {
	const parts = Object.entries(attrs).map(([key, value]) => `${key}="${escapeHtml(value)}"`);
	const attrText = parts.length ? ` ${parts.join(' ')}` : '';
	return selfClosing ? `<${tag}${attrText} />` : `<${tag}${attrText}>`;
}

function sanitizeWithAllowlist(input: string, allowlist: Record<string, TagRule>): string {
	const tokenRe = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|[^<]+/g;
	let out = '';
	let match: RegExpExecArray | null;

	while ((match = tokenRe.exec(input))) {
		const token = match[0];

		if (token.startsWith('<!--')) continue;

		if (!token.startsWith('<')) {
			out += token;
			continue;
		}

		const tagName = match[1].toLowerCase();
		const isClose = token.startsWith('</');
		const rule = allowlist[tagName];
		if (!rule) continue;

		if (isClose) {
			if (!VOID_TAGS.has(tagName)) out += `</${tagName}>`;
			continue;
		}

		const rawAttrs = match[2] || '';
		const parsed = parseAttrs(rawAttrs);
		const kept: Record<string, string> = {};

		if (rule.attrs) {
			for (const name of rule.attrs) {
				if (!(name in parsed)) continue;
				const value = parsed[name].trim();
				if (!value) continue;

				if (tagName === 'a' && name === 'href') {
					if (!isSafeHref(value)) continue;
					kept.href = value;
					continue;
				}

				if (tagName === 'img' && name === 'src') {
					if (!isAllowedArticleImageSrc(value)) continue;
					kept.src = value;
					continue;
				}

				if (tagName === 'img' && (name === 'width' || name === 'height')) {
					if (!/^\d+$/.test(value)) continue;
					kept[name] = value;
					continue;
				}

				if (tagName === 'img' && name === 'class') {
					kept.class = value.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
					continue;
				}

				if (tagName === 'img' && name === 'alt') {
					kept.alt = value;
				}
			}
		}

		if (tagName === 'a') {
			if (!kept.href) continue;
			kept.rel = 'noopener noreferrer';
			kept.target = '_blank';
		}

		if (tagName === 'img' && !kept.src) continue;

		out += serializeOpenTag(tagName, kept, VOID_TAGS.has(tagName));
	}

	return out.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
}

/** Normalize stored about content to safe HTML. */
export function sanitizeRichText(input: string): string {
	const raw = input.trim();
	if (!raw) return '';
	const html = looksLikeHtml(raw) ? raw : plainTextToHtml(raw);
	return sanitizeWithAllowlist(html, RICH_TEXT_TAGS);
}

/** HTML suitable for the Quill editor initial load. */
export function richTextForEditor(input: string): string {
	return sanitizeRichText(input) || '<p><br></p>';
}

/** Normalize stored article body to safe HTML with images. */
export function sanitizeArticleHtml(input: string): string {
	const raw = input.trim();
	if (!raw) return '';
	return sanitizeWithAllowlist(raw, ARTICLE_TAGS);
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
