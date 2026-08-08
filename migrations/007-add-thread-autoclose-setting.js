'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[Migration] Добавление колонки defaultThreadAutoClose в guild_settings...');
    try {
      await queryInterface.addColumn('guild_settings', 'defaultThreadAutoClose', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      });
      console.log('[Migration] Колонка defaultThreadAutoClose успешно добавлена.');
    } catch (e) {
      console.log('[Migration] Добавление колонки defaultThreadAutoClose пропущено или уже выполнено:', e.message);
    }
  },
  async down(queryInterface, Sequelize) {
    console.log('[Migration Rollback] Удаление колонки defaultThreadAutoClose из guild_settings...');
    try {
      await queryInterface.removeColumn('guild_settings', 'defaultThreadAutoClose');
    } catch (e) {
      console.log('[Migration Rollback] Ошибка при удалении колонки defaultThreadAutoClose:', e.message);
    }
  }
};
