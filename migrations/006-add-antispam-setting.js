'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[Migration] Добавление колонок antiSpamEnabled и antiSpamConfig в guild_settings...');
    
    try {
      await queryInterface.addColumn('guild_settings', 'antiSpamEnabled', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
      console.log('[Migration] Колонка antiSpamEnabled успешно добавлена.');
    } catch (e) {
      console.log('[Migration] Добавление колонки antiSpamEnabled пропущено или уже выполнено:', e.message);
    }

    try {
      await queryInterface.addColumn('guild_settings', 'antiSpamConfig', {
        type: Sequelize.JSON,
        defaultValue: {}
      });
      console.log('[Migration] Колонка antiSpamConfig успешно добавлена.');
    } catch (e) {
      console.log('[Migration] Добавление колонки antiSpamConfig пропущено или уже выполнено:', e.message);
    }
  },
  async down(queryInterface, Sequelize) {
    console.log('[Migration Rollback] Удаление колонок antiSpamEnabled и antiSpamConfig из guild_settings...');
    
    try {
      await queryInterface.removeColumn('guild_settings', 'antiSpamEnabled');
    } catch (e) {
      console.log('[Migration Rollback] Ошибка при удалении колонки antiSpamEnabled:', e.message);
    }

    try {
      await queryInterface.removeColumn('guild_settings', 'antiSpamConfig');
    } catch (e) {
      console.log('[Migration Rollback] Ошибка при удалении колонки antiSpamConfig:', e.message);
    }
  }
};