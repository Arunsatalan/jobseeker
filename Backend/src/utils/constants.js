const ROLES = {
  ADMIN: 'admin',
  EMPLOYER: 'employer',
  JOB_SEEKER: 'jobseeker',
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

const JOB_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PAUSED: 'paused',
  EXPIRED: 'expired',
  CLOSED: 'closed',
};

const APPLICATION_STATUS = {
  APPLIED: 'applied',
  REVIEWING: 'reviewing',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
};

const EMPLOYMENT_TYPE = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  TEMPORARY: 'temporary',
  INTERNSHIP: 'internship',
};

const EXPERIENCE_LEVEL = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior',
  EXECUTIVE: 'executive',
};

const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
  PAID: 'paid', // Legacy support
};

const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

const MESSAGE_TYPE = {
  TEXT: 'text',
  DOCUMENT: 'document',
  IMAGE: 'image',
  SUPPORT: 'support',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  USER_STATUS,
  JOB_STATUS,
  APPLICATION_STATUS,
  EMPLOYMENT_TYPE,
  EXPERIENCE_LEVEL,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  MESSAGE_TYPE,
  PAYMENT_STATUS,
  PAGINATION,
};
