/** Timezone for community events (Utah / Mountain Time). */
export const COMMUNITY_TZ = 'America/Denver';

export function getLastSundayOfMonth(year: number, monthIndex: number): Date {
	const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
	const day = lastDay.getUTCDay();
	lastDay.setUTCDate(lastDay.getUTCDate() - day);
	return lastDay;
}

export function getNextMonthlyMass(from = new Date()): Date {
	let year = from.getFullYear();
	let month = from.getMonth();

	for (let i = 0; i < 14; i++) {
		const sunday = getLastSundayOfMonth(year, month);
		const massLocal = new Date(
			`${sunday.getUTCFullYear()}-${String(sunday.getUTCMonth() + 1).padStart(2, '0')}-${String(sunday.getUTCDate()).padStart(2, '0')}T18:00:00-06:00`,
		);
		if (massLocal.getTime() >= from.getTime()) {
			return massLocal;
		}
		month += 1;
		if (month > 11) {
			month = 0;
			year += 1;
		}
	}

	return from;
}

export function formatDatePt(iso: string | Date, options?: Intl.DateTimeFormatOptions): string {
	const date = typeof iso === 'string' ? new Date(iso) : iso;
	return new Intl.DateTimeFormat('pt-BR', {
		timeZone: COMMUNITY_TZ,
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		...options,
	}).format(date);
}

export function formatDateTimePt(iso: string | Date): string {
	const date = typeof iso === 'string' ? new Date(iso) : iso;
	const datePart = new Intl.DateTimeFormat('pt-BR', {
		timeZone: COMMUNITY_TZ,
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date);
	const timePart = new Intl.DateTimeFormat('en-US', {
		timeZone: COMMUNITY_TZ,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	}).format(date);
	return `${datePart}, ${timePart}`;
}

export function formatTimeAmPm(iso: string | Date): string {
	const date = typeof iso === 'string' ? new Date(iso) : iso;
	return new Intl.DateTimeFormat('en-US', {
		timeZone: COMMUNITY_TZ,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	}).format(date);
}

export function formatMonthYear(year: number, monthIndex: number): string {
	return new Intl.DateTimeFormat('pt-BR', {
		month: 'long',
		year: 'numeric',
	}).format(new Date(year, monthIndex, 1));
}

export function toDatetimeLocalValue(iso: string): string {
	const date = new Date(iso);
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: COMMUNITY_TZ,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).formatToParts(date);

	const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
	return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function fromDatetimeLocalValue(value: string): string {
	// Treat admin input as Mountain Time (-06:00 / -07:00). Use offset-less ISO with Denver assumption via fixed -06 for simplicity in storage.
	if (!value) return new Date().toISOString();
	const hasZone = /[zZ]|[+-]\d{2}:\d{2}$/.test(value);
	if (hasZone) return new Date(value).toISOString();
	return new Date(`${value}:00-06:00`).toISOString();
}

export function isActiveFeatured(eventAt: string, now = new Date()): boolean {
	return new Date(eventAt).getTime() >= now.getTime();
}

export function monthMatrix(year: number, monthIndex: number): (number | null)[][] {
	const first = new Date(year, monthIndex, 1);
	const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
	const startWeekday = first.getDay();
	const cells: (number | null)[] = [];
	for (let i = 0; i < startWeekday; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) cells.push(d);
	while (cells.length % 7 !== 0) cells.push(null);
	const weeks: (number | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
	return weeks;
}
