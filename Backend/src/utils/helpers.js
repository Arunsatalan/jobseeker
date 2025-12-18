const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\-\+\(\)]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

const helpers = {
  // Validation helpers
  isValidEmail: (email) => emailRegex.test(email),
  isValidPhone: (phone) => phoneRegex.test(phone),
  isValidPassword: (password) => passwordRegex.test(password),
  isValidUrl: (url) => urlRegex.test(url),

  // String helpers
  slugify: (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, ''),
  capitalize: (text) => text.charAt(0).toUpperCase() + text.slice(1),
  truncate: (text, length = 100) => text.length > length ? text.substring(0, length) + '...' : text,

  // Array helpers
  chunk: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // Object helpers
  pick: (obj, keys) => {
    return keys.reduce((result, key) => {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  omit: (obj, keys) => {
    return Object.keys(obj).reduce((result, key) => {
      if (!keys.includes(key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  // Date helpers
  getDaysDifference: (date1, date2) => {
    const time = Math.abs(date2 - date1);
    return Math.ceil(time / (1000 * 60 * 60 * 24));
  },

  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Number helpers
  formatCurrency: (amount, currency = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Pagination helpers
  getPaginationData: (page = 1, limit = 10, total) => {
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;

    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      startIndex,
    };
  },

  // Random helpers
  generateToken: (length = 20) => {
    return Math.random().toString(36).substring(2, length + 2);
  },

  generateOTP: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
};

module.exports = helpers;
