const helpers = require('../../src/utils/helpers');

describe('Helper Functions', () => {
  describe('Email Validation', () => {
    it('should validate email correctly', () => {
      expect(helpers.isValidEmail('test@example.com')).toBe(true);
      expect(helpers.isValidEmail('invalid-email')).toBe(false);
    });
  });

  describe('String Helpers', () => {
    it('should slugify text', () => {
      expect(helpers.slugify('Hello World')).toBe('hello-world');
    });

    it('should capitalize text', () => {
      expect(helpers.capitalize('hello')).toBe('Hello');
    });

    it('should truncate text', () => {
      expect(helpers.truncate('Hello World', 5)).toBe('Hello...');
    });
  });

  describe('Pagination', () => {
    it('should calculate pagination correctly', () => {
      const pagination = helpers.getPaginationData(1, 10, 100);
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(10);
      expect(pagination.total).toBe(100);
      expect(pagination.totalPages).toBe(10);
      expect(pagination.hasNext).toBe(true);
      expect(pagination.hasPrev).toBe(false);
    });
  });

  describe('Random Generators', () => {
    it('should generate token', () => {
      const token = helpers.generateToken();
      expect(token).toHaveLength(20);
    });

    it('should generate OTP', () => {
      const otp = helpers.generateOTP();
      expect(otp).toHaveLength(6);
      expect(parseInt(otp)).toBeGreaterThanOrEqual(100000);
    });
  });
});
