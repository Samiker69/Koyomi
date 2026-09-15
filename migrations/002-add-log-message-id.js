'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[Migration] Adding logMessageId column to mod_cases...');
    try {
      await queryInterface.addColumn('mod_cases', 'logMessageId', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('[Migration] logMessageId column added successfully.');
    } catch (e) {
      console.log('[Migration] logMessageId column addition skipped or failed:', e.message);
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('[Migration Rollback] Removing logMessageId column from mod_cases...');
    try {
      await queryInterface.removeColumn('mod_cases', 'logMessageId');
    } catch (e) {
      console.log('[Migration Rollback] logMessageId column removal skipped or failed:', e.message);
    }
  }
};
