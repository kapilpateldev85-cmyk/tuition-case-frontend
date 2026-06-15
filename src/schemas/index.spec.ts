import { loginSchema, registerSchema } from './index';

describe('schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid login input', () => {
      const result = loginSchema.safeParse({
        email: 'parent@example.com',
        password: 'password123',
        role: 'parent',
        rememberMe: false,
      });

      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
        role: 'parent',
        rememberMe: false,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration input', () => {
      const result = registerSchema.safeParse({
        email: 'tutor@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'tutor',
      });

      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = registerSchema.safeParse({
        email: 'tutor@example.com',
        password: 'password123',
        confirmPassword: 'different',
        role: 'tutor',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match');
      }
    });
  });
});
