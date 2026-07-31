const { Sequelize, DataTypes } = require('sequelize');
const crypto = require('crypto');

// Инициализация подключения
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/main.db',
    logging: false, // отключить логгирование SQL в консоль (можно включить для дебага)
});

// Функции шифрования для токенов
const encryptToken = (text) => {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decryptToken = (text) => {
    if (!text) return text;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// =======================
// МОДЕЛИ НАСТРОЕК СЕРВЕРА
// =======================
const GuildSetting = sequelize.define('GuildSetting', {
    guildId: { type: DataTypes.STRING, primaryKey: true },
    logchannel: { type: DataTypes.STRING, defaultValue: '' },
    newMemberChannelId: { type: DataTypes.STRING, defaultValue: '' },
    inviteLoggerChannel: { type: DataTypes.STRING, defaultValue: '' },
    allowInviteLogging: { type: DataTypes.BOOLEAN, defaultValue: false },
    allowLogingMembersAdd: { type: DataTypes.BOOLEAN, defaultValue: false },
    mainVoiceChannelId: { type: DataTypes.STRING, defaultValue: '' },
    voiceCategoryId: { type: DataTypes.STRING, defaultValue: '' },
    supportChannelId: { type: DataTypes.STRING, defaultValue: '' },
    prefix: { type: DataTypes.STRING, defaultValue: '..' },
    reportsModerationChannelId: { type: DataTypes.STRING, defaultValue: '' },
    honeypotChannelId: { type: DataTypes.STRING, defaultValue: '' },
    honeypotLogChannelId: { type: DataTypes.STRING, defaultValue: '' },
    honeypotEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    verdictChannelId: { type: DataTypes.STRING, defaultValue: '' },
    language: { type: DataTypes.STRING, defaultValue: 'ru' },
    parserBannedRoleId: { type: DataTypes.STRING, defaultValue: '' },
    antiSpamEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    antiSpamConfig: { type: DataTypes.JSON, defaultValue: {} },
    defaultThreadAutoClose: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'guild_settings', timestamps: false });

const RoleMenu = sequelize.define('RoleMenu', {
    messageId: { type: DataTypes.STRING, primaryKey: true },
    guildId: { type: DataTypes.STRING, allowNull: false },
    channelId: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    roles: { type: DataTypes.JSON, allowNull: false } // Sequelize сам сделает JSON.stringify/parse
}, { tableName: 'role_menus', timestamps: false });

// =======================
// МОДЕЛИ ЛОГ-АНАЛИЗАТОРА
// =======================
const UnsupportedMod = sequelize.define('UnsupportedMod', {
    mod_id: { type: DataTypes.STRING, primaryKey: true },
    reason: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'unsupported_mods', timestamps: false });

const BannedMod = sequelize.define('BannedMod', {
    mod_id: { type: DataTypes.STRING, primaryKey: true }
}, { tableName: 'banned_mods', timestamps: false });

const ModMapping = sequelize.define('ModMapping', {
    original_name: { type: DataTypes.STRING, primaryKey: true },
    modrinth_id: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'mods_mapping', timestamps: false });

const AllowedLauncher = sequelize.define('AllowedLauncher', {
    launcher_name: { type: DataTypes.STRING, primaryKey: true }
}, { tableName: 'allowed_launchers', timestamps: false });

// =======================
// МОДЕЛИ МОДЕРАЦИИ
// =======================
const ModCase = sequelize.define('ModCase', {
    serverId: { type: DataTypes.STRING, primaryKey: true },
    caseNum: { type: DataTypes.INTEGER, primaryKey: true },
    targetId: { type: DataTypes.STRING, allowNull: false },
    moderatorId: { type: DataTypes.STRING, allowNull: false },
    action: { 
        type: DataTypes.ENUM('ban', 'mute', 'kick', 'unban', 'unmute', 'warn', 'unwarn', 'supportban', 'supportunban'),
        allowNull: false
    },
    reason: { type: DataTypes.STRING },
    evidenceUrl: { type: DataTypes.STRING, allowNull: true },
    logMessageId: { type: DataTypes.STRING, allowNull: true },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'mod_cases', timestamps: false });

const UserPunishment = sequelize.define('UserPunishment', {
    user_id: { type: DataTypes.STRING, primaryKey: true },
    guild_id: { type: DataTypes.STRING, primaryKey: true },
    channel_id: { type: DataTypes.STRING, allowNull: false },
    negative_points: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'user_punishment', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const DisabledCommand = sequelize.define('DisabledCommand', {
    guild_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: true },
    command_name: { type: DataTypes.STRING, allowNull: false }
}, { 
    tableName: 'disabled_commands', 
    timestamps: false,
    indexes: [{ unique: true, fields: ['guild_id', 'user_id', 'command_name'] }]
});
DisabledCommand.removeAttribute('id');

// =======================
// МОДЕЛИ GEMINI
// =======================
const GeminiUserSetting = sequelize.define('GeminiUserSetting', {
    user_id: { type: DataTypes.STRING, primaryKey: true },
    model: { type: DataTypes.STRING, defaultValue: "gemini-2.0-flash" },
    system_instructions: { type: DataTypes.TEXT, defaultValue: "" },
    max_output_tokens: { type: DataTypes.INTEGER, defaultValue: 1000 },
    temperature: { type: DataTypes.FLOAT, defaultValue: 1.0 },
    top_p: { type: DataTypes.FLOAT },
    top_k: { type: DataTypes.INTEGER },
    history_limit: { type: DataTypes.INTEGER, defaultValue: 100 }
}, { tableName: 'gemini_user_settings', timestamps: false });

const GeminiSafetySetting = sequelize.define('GeminiSafetySetting', {
    user_id: { type: DataTypes.STRING, primaryKey: true },
    HARM_CATEGORY_HARASSMENT: { type: DataTypes.STRING, defaultValue: "BLOCK_MEDIUM_AND_ABOVE" },
    HARM_CATEGORY_HATE_SPEECH: { type: DataTypes.STRING, defaultValue: "BLOCK_MEDIUM_AND_ABOVE" },
    HARM_CATEGORY_SEXUALLY_EXPLICIT: { type: DataTypes.STRING, defaultValue: "BLOCK_MEDIUM_AND_ABOVE" },
    HARM_CATEGORY_DANGEROUS_CONTENT: { type: DataTypes.STRING, defaultValue: "BLOCK_MEDIUM_AND_ABOVE" }
}, { tableName: 'gemini_safety_settings', timestamps: false });

const GeminiToken = sequelize.define('GeminiToken', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    token: { 
        type: DataTypes.STRING, 
        allowNull: false,
        set(val) { this.setDataValue('token', encryptToken(val)); },
        get() { return decryptToken(this.getDataValue('token')); }
    },
    public_use: { type: DataTypes.BOOLEAN, defaultValue: false },
    uses: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'tokens', timestamps: false });

// Отношения Gemini
GeminiUserSetting.hasOne(GeminiSafetySetting, { foreignKey: 'user_id', onDelete: 'CASCADE' });
GeminiSafetySetting.belongsTo(GeminiUserSetting, { foreignKey: 'user_id' });

// =======================
// ПРОЧЕЕ (Starboard, Теги)
// =======================
const StarboardSetting = sequelize.define('StarboardSetting', {
    guildId: { type: DataTypes.STRING, primaryKey: true },
    starboardChannelId: { type: DataTypes.STRING },
    enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    minReactions: { type: DataTypes.INTEGER, defaultValue: 5 }
}, { tableName: 'starboard_settings', timestamps: false });

const StarboardMessage = sequelize.define('StarboardMessage', {
    guildId: { type: DataTypes.STRING, primaryKey: true },
    messageId: { type: DataTypes.STRING, primaryKey: true },
    starboardMessageId: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'starboard_messages', timestamps: false });

const Tag = sequelize.define('Tag', {
    serverId: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, primaryKey: true },
    content: { type: DataTypes.TEXT },
    disallowedChannelsId: { 
        type: DataTypes.STRING, 
        defaultValue: '',
        get() { 
            const val = this.getDataValue('disallowedChannelsId');
            return val ? val.split(' ').map(Number) : []; 
        },
        set(val) { 
            this.setDataValue('disallowedChannelsId', Array.isArray(val) ? val.join(' ') : ''); 
        }
    },
    allowedChannelId: { 
        type: DataTypes.STRING, 
        defaultValue: '',
        get() { 
            const val = this.getDataValue('allowedChannelId');
            return val ? val.split(' ').map(Number) : []; 
        },
        set(val) { 
            this.setDataValue('allowedChannelId', Array.isArray(val) ? val.join(' ') : ''); 
        }
    }
}, { tableName: 'tags', timestamps: false });

//panel
const AdminUser = sequelize.define('AdminUser', {
    user_id: { type: DataTypes.STRING, primaryKey: true },
    username: DataTypes.STRING,
    added_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'admin_users', timestamps: false });

// Свадьбы и Семьи
const Marriage = sequelize.define('Marriage', {
    guildId: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.STRING, primaryKey: true },
    spouseId: { type: DataTypes.STRING, allowNull: false },
    marriedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'marriages', timestamps: false });

const ParentChild = sequelize.define('ParentChild', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    guildId: { type: DataTypes.STRING, allowNull: false },
    parentId: { type: DataTypes.STRING, allowNull: false },
    childId: { type: DataTypes.STRING, allowNull: false },
    adoptedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'parent_children', timestamps: false });

// Экспорт всех моделей и инстанса БД
module.exports = {
    sequelize,
    GuildSetting,
    RoleMenu,
    UnsupportedMod,
    BannedMod,
    ModMapping,
    AllowedLauncher,
    ModCase,
    UserPunishment,
    DisabledCommand,
    GeminiUserSetting,
    GeminiSafetySetting,
    GeminiToken,
    StarboardSetting,
    StarboardMessage,
    Tag,
    AdminUser,
    Marriage,
    ParentChild
};