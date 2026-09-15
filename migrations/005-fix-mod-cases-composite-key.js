'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[Migration] Fixing composite primary key for mod_cases...');
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Rename existing table
      await queryInterface.renameTable('mod_cases', 'mod_cases_old', { transaction });
      console.log('[Migration] Renamed mod_cases to mod_cases_old.');

      // 2. Create the table correctly without UNIQUE constraints on individual columns
      await queryInterface.sequelize.query(`
        CREATE TABLE \`mod_cases\` (
          \`serverId\` VARCHAR(255) NOT NULL,
          \`caseNum\` INTEGER NOT NULL,
          \`targetId\` VARCHAR(255) NOT NULL,
          \`moderatorId\` VARCHAR(255) NOT NULL,
          \`action\` TEXT NOT NULL,
          \`reason\` VARCHAR(255),
          \`evidenceUrl\` VARCHAR(255),
          \`logMessageId\` VARCHAR(255),
          \`timestamp\` DATETIME NOT NULL,
          PRIMARY KEY (\`serverId\`, \`caseNum\`)
        );
      `, { transaction });
      console.log('[Migration] Created new mod_cases table.');

      // 3. Copy the data
      await queryInterface.sequelize.query(`
        INSERT INTO \`mod_cases\` (\`serverId\`, \`caseNum\`, \`targetId\`, \`moderatorId\`, \`action\`, \`reason\`, \`evidenceUrl\`, \`logMessageId\`, \`timestamp\`)
        SELECT \`serverId\`, \`caseNum\`, \`targetId\`, \`moderatorId\`, \`action\`, \`reason\`, \`evidenceUrl\`, \`logMessageId\`, \`timestamp\`
        FROM \`mod_cases_old\`;
      `, { transaction });
      console.log('[Migration] Copied data from mod_cases_old to mod_cases.');

      // 4. Drop the old table
      await queryInterface.sequelize.query('DROP TABLE `mod_cases_old`;', { transaction });
      console.log('[Migration] Dropped mod_cases_old.');

      await transaction.commit();
      console.log('[Migration] Composite key fix applied successfully.');
    } catch (e) {
      await transaction.rollback();
      console.error('[Migration] Failed to fix composite key:', e.message);
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    // No rollback needed as the new schema is correct and fixes a bug.
  }
};
