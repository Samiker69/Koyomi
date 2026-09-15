'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[Migration] Запуск миграции 01-initial-transition...');
    await queryInterface.createTable('admin_users', {
      user_id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      added_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
    console.log('[Migration] Таблица admin_users создана.');
    try {
      await queryInterface.changeColumn('mod_cases', 'timestamp', {
        type: Sequelize.DATE,
        allowNull: false
      });
    } catch (e) {
      console.log('[Migration] mod_cases.timestamp: изменение типа пропущено (особенность SQLite).');
    }

    try {
      await queryInterface.changeColumn('tokens', 'public_use', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
    } catch (e) {
      console.log('[Migration] tokens.public_use: изменение типа пропущено (особенность SQLite).');
    }
    try {
      await queryInterface.changeColumn('role_menus', 'roles', {
        type: Sequelize.JSON,
        allowNull: false
      });
    } catch (e) {
      console.log('[Migration] role_menus.roles: изменение типа пропущено (особенность SQLite).');
    }

    try {
        await queryInterface.addColumn('user_punishment', 'created_at', { type: Sequelize.DATE });
        await queryInterface.addColumn('user_punishment', 'updated_at', { type: Sequelize.DATE });
    } catch (e) {
    }
    console.log('[Migration] 01-initial-transition успешно завершена.');
  },

  async down(queryInterface, Sequelize) {
    // В функции down() мы описываем, как откатить базу назад, 
    // если миграция выполнилась ошибочно или мы хотим откатить версию.

    console.log('[Migration] Откат миграции 01-initial-transition...');
    await queryInterface.dropTable('admin_users');
    try {
        await queryInterface.changeColumn('mod_cases', 'timestamp', { type: Sequelize.INTEGER });
        await queryInterface.changeColumn('tokens', 'public_use', { type: Sequelize.INTEGER });
        await queryInterface.changeColumn('role_menus', 'roles', { type: Sequelize.TEXT });
    } catch (e) {
        console.log('[Migration Rollback] Ошибка отката типов колонок (SQLite)');
    }
  }
};