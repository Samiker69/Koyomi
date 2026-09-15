'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[Migration] Adding evidenceUrl column to mod_cases...');
    try {
      await queryInterface.addColumn('mod_cases', 'evidenceUrl', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('[Migration] evidenceUrl column added successfully.');
    } catch (e) {
      console.log('[Migration] evidenceUrl column addition skipped or failed:', e.message);
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('[Migration Rollback] Removing evidenceUrl column from mod_cases...');
    try {
      await queryInterface.removeColumn('mod_cases', 'evidenceUrl');
    } catch (e) {
      console.log('[Migration Rollback] evidenceUrl column removal skipped or failed:', e.message);
    }
  }
};
