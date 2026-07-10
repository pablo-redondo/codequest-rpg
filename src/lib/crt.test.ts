import { describe, expect, it } from 'vitest';
import { shouldApplyCrt } from './crt';

describe('shouldApplyCrt', () => {
  it('con crtEnabled=false no aplica el overlay, tenga o no reduced-motion', () => {
    expect(shouldApplyCrt(false, false)).toBe(false);
    expect(shouldApplyCrt(false, true)).toBe(false);
  });

  it('con crtEnabled=true y reduced-motion activo tampoco aplica el overlay', () => {
    expect(shouldApplyCrt(true, true)).toBe(false);
  });

  it('con crtEnabled=true y reduced-motion inactivo sí aplica el overlay', () => {
    expect(shouldApplyCrt(true, false)).toBe(true);
  });
});
