module.exports = {
    BORROW: {
        DEFAULT_DURATION_DAYS: 14,
        FINE_PER_DAY: 5000,
        MAX_RENEWALS: 2,
    },
    READER: {
        DEFAULT_LIMIT: 5,
        PREMIUM_LIMIT: 10,
        VIP_LIMIT: 15,
    },
    ROLES: {
        ADMIN: 'admin',
        LIBRARIAN: 'librarian',
        STAFF: 'staff',
        READER: 'reader',
    },
    STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended',
        EXPIRED: 'expired',
    }
};
