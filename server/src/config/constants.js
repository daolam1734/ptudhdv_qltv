module.exports = {
  ROLES: {
    ADMIN: 'admin',
    LIBRARIAN: 'librarian',
    READER: 'reader'
  },
  BORROW_STATUS: {
    PENDING: 'pending',
    BORROWED: 'borrowed',
    RETURNED: 'returned',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled'
  },
  MEMBERSHIP_TYPES: {
    BASIC: 'basic',
    PREMIUM: 'premium',
    VIP: 'vip'
  },
  READER_LIMITS: {
    DEFAULT: 5,
    PREMIUM: 10,
    VIP: 20
  }
};
