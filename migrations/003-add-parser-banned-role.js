'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[Migration] Adding parserBannedRoleId column to guild_settings...');
    try {
      await queryInterface.addColumn('guild_settings', 'parserBannedRoleId', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ''
      });
      console.log('[Migration] parserBannedRoleId column added successfully.');
    } catch (e) {
      console.log('[Migration] parserBannedRoleId column addition skipped or failed:', e.message);
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('[Migration Rollback] Removing parserBannedRoleId column from guild_settings...');
    try {
      await queryInterface.removeColumn('guild_settings', 'parserBannedRoleId');
    } catch (e) {
      console.log('[Migration Rollback] parserBannedRoleId column removal skipped or failed:', e.message);
    }
  }
};
