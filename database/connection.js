const fs = require('fs');
const { Umzug, SequelizeStorage } = require('umzug');
const { sequelize, AllowedLauncher, ModMapping } = require('./models/models');

class DatabaseConnection {
    static async init() {
        if (!fs.existsSync('./database')) {
            fs.mkdirSync('./database');
        }
        await sequelize.sync();
        const umzug = new Umzug({
            migrations: {
                glob: 'migrations/*.js',
                resolve: ({ name, path, context }) => {
                    const migration = require(path);
                    return {
                        name,
                        up: async () => migration.up(context, sequelize.Sequelize),
                        down: async () => migration.down(context, sequelize.Sequelize),
                    };
                }
            },
            context: sequelize.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize }),
            logger: console,
        });
        const pendingMigrations = await umzug.pending();
        if (pendingMigrations.length > 0) {
            await umzug.up();
        }
        try {
            await sequelize.query(`
                UPDATE mod_cases
                SET timestamp = datetime(timestamp / 1000, 'unixepoch')
                WHERE (typeof(timestamp) = 'integer' OR typeof(timestamp) = 'real') AND timestamp > 100000000000;
            `);
            await sequelize.query(`
                UPDATE mod_cases
                SET timestamp = datetime(timestamp, 'unixepoch')
                WHERE (typeof(timestamp) = 'integer' OR typeof(timestamp) = 'real') AND timestamp <= 100000000000;
            `);
        } catch (err) {
            console.error('[DB Service] Error during timestamp corrections:', err);
        }
        const countLaunchers = await AllowedLauncher.count();
        if (countLaunchers === 0) {
            await AllowedLauncher.create({ launcher_name: 'hebe' });
        }
        const countMapping = await ModMapping.count();
        if (countMapping === 0) {
            await ModMapping.create({ original_name: 'yet_another_config_lib_v3', modrinth_id: 'yacl' });
        }
    }
}

module.exports = DatabaseConnection;