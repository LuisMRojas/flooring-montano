import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** US phone → its 10 digits (drops a leading 1), or null if it isn't 10 digits. */
export function phoneDigits(value: string | null | undefined): string | null {
  let digits = (value ?? '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

/** "3135550142" → "(313) 555-0142". Leaves the input as typed if it isn't a valid number. */
export function formatPhone(value: string | null | undefined): string {
  const d = phoneDigits(value);
  return d ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : (value ?? '');
}

export function isZip(value: string | null | undefined): boolean {
  return /^\d{5}$/.test((value ?? '').trim());
}

/** Is a ZIP in the served list? Entries ending in * match a prefix ("482*"). */
export function isServedZip(zip: string, served: readonly string[]): boolean {
  const z = zip.trim();
  return served.some((s) => (s.endsWith('*') ? z.startsWith(s.slice(0, -1)) : z === s));
}

/** Local date as YYYY-MM-DD (the format of <input type="date">). */
export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// ---------- Validators ----------

export const phoneValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  !c.value || phoneDigits(c.value) ? null : { phone: true };

export const zipValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  !c.value || isZip(c.value) ? null : { zip: true };

/** Optional date that, if given, is today or later. */
export const notPastDateValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  !c.value || c.value >= todayIso() ? null : { date: true };

/** Optional whole number between 1 and 100,000 (commas allowed). */
export const sqftValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  if (c.value === null || c.value === '') return null;
  const n = Number(String(c.value).replace(/,/g, ''));
  return Number.isInteger(n) && n >= 1 && n <= 100_000 ? null : { sqft: true };
};
