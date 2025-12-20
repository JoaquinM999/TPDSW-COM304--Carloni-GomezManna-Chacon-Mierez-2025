import { describe, it, expect } from 'vitest';
import { validateEmail } from '../../services/validation.service';

describe('validation - minimal test', () => {
  it('debe validar un email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
});
