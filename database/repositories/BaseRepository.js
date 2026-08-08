class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findById(id) {
        return await this.model.findByPk(id);
    }

    async create(data, transaction = null) {
        return await this.model.create(data, { transaction });
    }

    async update(id, data, transaction = null) {
        const [affectedRows] = await this.model.update(data, {
            where: { [this.model.primaryKeyAttribute]: id },
            transaction
        });
        return affectedRows > 0;
    }

    async delete(id, transaction = null) {
        const deleted = await this.model.destroy({
            where: { [this.model.primaryKeyAttribute]: id },
            transaction
        });
        return deleted > 0;
    }
}

module.exports = BaseRepository;