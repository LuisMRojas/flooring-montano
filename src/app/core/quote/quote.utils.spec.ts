import { FormControl } from '@angular/forms';
import {
  formatPhone,
  isServedZip,
  isZip,
  notPastDateValidator,
  phoneDigits,
  phoneValidator,
  sqftValidator,
  todayIso,
  zipValidator,
} from './quote.utils';

describe('quote utils', () => {
  it('reads US phone numbers in any common format', () => {
    expect(phoneDigits('(313) 555-0142')).toBe('3135550142');
    expect(phoneDigits('313.555.0142')).toBe('3135550142');
    expect(phoneDigits('+1 313 555 0142')).toBe('3135550142');
    expect(phoneDigits('555-0142')).toBeNull();
    expect(formatPhone('3135550142')).toBe('(313) 555-0142');
    expect(formatPhone('12')).toBe('12');
  });

  it('checks ZIP codes and the service area', () => {
    const served = ['48120', '48126', '482*'];
    expect(isZip('48126')).toBe(true);
    expect(isZip('4812')).toBe(false);
    expect(isZip('48126-1234')).toBe(false);
    expect(isServedZip('48126', served)).toBe(true); // Dearborn
    expect(isServedZip('48201', served)).toBe(true); // Detroit by prefix
    expect(isServedZip('49503', served)).toBe(false); // Grand Rapids
  });

  it('validates fields, leaving optional ones alone when empty', () => {
    const v = (fn: typeof phoneValidator, value: unknown) => fn(new FormControl(value));
    expect(v(phoneValidator, '')).toBeNull();
    expect(v(phoneValidator, '313 555')).toEqual({ phone: true });
    expect(v(zipValidator, 'abcde')).toEqual({ zip: true });
    expect(v(sqftValidator, '1,200')).toBeNull();
    expect(v(sqftValidator, '0')).toEqual({ sqft: true });
    expect(v(sqftValidator, '12.5')).toEqual({ sqft: true });
    expect(v(notPastDateValidator, todayIso())).toBeNull();
    expect(v(notPastDateValidator, '2000-01-01')).toEqual({ date: true });
  });
});
