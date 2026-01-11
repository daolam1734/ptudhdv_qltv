const BaseRepository = require('../../../shared/base/BaseRepository');

class ReaderRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }

    async findByIdCard(idCard) {
        return await this.model.findOne({ idCard });
    }

    async findByUsername(username) {
        return await this.model.findOne({ username });
    }

    async findByEmail(email) {
        return await this.model.findOne({ email });
    }
}

module.exports = ReaderRepository;
