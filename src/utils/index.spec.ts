import {
  formatDate,
  formatCurrency,
  formatFileSize,
  getInitials,
  buildQueryString,
} from './index';

describe('utils', () => {
  describe('formatDate', () => {
    it('formats a valid date string', () => {
      expect(formatDate('2024-01-15T00:00:00.000Z')).toMatch(/Jan 15, 2024/);
    });

    it('returns N/A for undefined input', () => {
      expect(formatDate(undefined)).toBe('N/A');
    });
  });

  describe('formatCurrency', () => {
    it('formats a number as dollars', () => {
      expect(formatCurrency(1500)).toBe('$1,500');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes, kilobytes, and megabytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(2048)).toBe('2.0 KB');
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
    });
  });

  describe('getInitials', () => {
    it('returns up to two uppercase initials', () => {
      expect(getInitials('Jane Doe')).toBe('JD');
    });
  });

  describe('buildQueryString', () => {
    it('builds a query string from params', () => {
      expect(buildQueryString({ page: 1, search: 'math' })).toBe(
        '?page=1&search=math',
      );
    });

    it('returns empty string when all params are empty', () => {
      expect(buildQueryString({ search: '', page: undefined })).toBe('');
    });
  });
});
