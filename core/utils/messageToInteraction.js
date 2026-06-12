const { MessageFlags } = require('discord.js');

function parseArgs(content) {
    const args = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = null;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if ((char === '"' || char === "'") && (i === 0 || content[i - 1] !== '\\')) {
            if (inQuotes && char === quoteChar) {
                inQuotes = false;
                quoteChar = null;
            } else if (!inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else {
                current += char;
            }
        } else if (char === ' ' && !inQuotes) {
            if (current) {
                args.push(current);
                current = '';
            }
        } else {
            current += char;
        }
    }
    if (current) {
        args.push(current);
    }
    return args;
}

const OptionTypes = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTACHMENT: 11
};

function isType(optType, targetTypeName) {
    if (typeof optType === 'number') {
        return optType === OptionTypes[targetTypeName];
    }
    if (typeof optType === 'string') {
        return optType.toUpperCase() === targetTypeName;
    }
    return false;
}

function resolveValue(arg, type, message) {
    if (!arg) return null;

    if (isType(type, 'STRING')) {
        return arg;
    }
    if (isType(type, 'INTEGER') || isType(type, 'NUMBER')) {
        const num = Number(arg);
        return isNaN(num) ? null : num;
    }
    if (isType(type, 'BOOLEAN')) {
        return ['true', 'yes', '1', 'on'].includes(arg.toLowerCase());
    }
    if (isType(type, 'USER')) {
        const match = arg.match(/<@!?(\d{17,20})>/) || arg.match(/^(\d{17,20})$/);
        const id = match ? match[1] : null;
        if (id) {
            return message.mentions.users.get(id) || message.client.users.cache.get(id) || null;
        }
        return message.client.users.cache.find(u => u.username.toLowerCase() === arg.toLowerCase() || u.tag.toLowerCase() === arg.toLowerCase()) || null;
    }
    if (isType(type, 'CHANNEL')) {
        const match = arg.match(/<#(\d{17,20})>/) || arg.match(/^(\d{17,20})$/);
        const id = match ? match[1] : null;
        if (id) {
            return message.guild ? (message.guild.channels.cache.get(id) || null) : null;
        }
        return message.guild ? (message.guild.channels.cache.find(c => c.name.toLowerCase() === arg.toLowerCase()) || null) : null;
    }
    if (isType(type, 'ROLE')) {
        const match = arg.match(/<@&(\d{17,20})>/) || arg.match(/^(\d{17,20})$/);
        const id = match ? match[1] : null;
        if (id) {
            return message.guild ? (message.guild.roles.cache.get(id) || null) : null;
        }
        return message.guild ? (message.guild.roles.cache.find(r => r.name.toLowerCase() === arg.toLowerCase()) || null) : null;
    }
    return arg;
}

function getCommandOptions(commandOrSubcommand) {
    if (!commandOrSubcommand) return [];
    if (typeof commandOrSubcommand.toJSON === 'function') {
        return commandOrSubcommand.toJSON().options || [];
    }
    return commandOrSubcommand.options || [];
}

function buildOptionsMap(command, subcommandGroupName, subcommandName, args, message) {
    const parsed = {};
    if (subcommandGroupName) {
        parsed._subcommandGroup = subcommandGroupName;
    }
    if (subcommandName) {
        parsed._subcommand = subcommandName;
    }

    let activeOptions = [];
    const rootOptions = getCommandOptions(command.data);

    if (subcommandGroupName) {
        const groupOption = rootOptions.find(opt => opt.name === subcommandGroupName && isType(opt.type, 'SUB_COMMAND_GROUP'));
        if (groupOption && subcommandName) {
            const subOption = (groupOption.options || []).find(opt => opt.name === subcommandName && isType(opt.type, 'SUB_COMMAND'));
            if (subOption) {
                activeOptions = subOption.options || [];
            }
        }
    } else if (subcommandName) {
        const subOption = rootOptions.find(opt => opt.name === subcommandName && isType(opt.type, 'SUB_COMMAND'));
        if (subOption) {
            activeOptions = subOption.options || [];
        }
    } else {
        activeOptions = rootOptions.filter(opt => !isType(opt.type, 'SUB_COMMAND') && !isType(opt.type, 'SUB_COMMAND_GROUP'));
    }

    const textOptions = activeOptions.filter(opt => !isType(opt.type, 'ATTACHMENT'));
    const attachmentOptions = activeOptions.filter(opt => isType(opt.type, 'ATTACHMENT'));

    let argIndex = 0;
    for (let i = 0; i < textOptions.length; i++) {
        const opt = textOptions[i];
        
        if (argIndex >= args.length) {
            parsed[opt.name] = null;
            continue;
        }

        const isString = isType(opt.type, 'STRING');
        const isLastTextOption = (i === textOptions.length - 1);

        if (isString && isLastTextOption) {
            parsed[opt.name] = args.slice(argIndex).join(' ');
            argIndex = args.length;
        } else {
            const rawVal = args[argIndex];
            argIndex++;
            parsed[opt.name] = resolveValue(rawVal, opt.type, message);
        }
    }

    let attachIndex = 0;
    for (const opt of attachmentOptions) {
        const attachment = message.attachments.at(attachIndex);
        parsed[opt.name] = attachment || null;
        if (attachment) attachIndex++;
    }

    return parsed;
}

class MessageCommandOptions {
    constructor(parsed, message, client) {
        this.parsed = parsed;
        this.message = message;
        this.client = client;
    }

    getSubcommandGroup(required = true) {
        return this.parsed._subcommandGroup || null;
    }

    getSubcommand() {
        return this.parsed._subcommand || null;
    }

    getString(name) {
        return this.parsed[name] !== undefined ? this.parsed[name] : null;
    }

    getInteger(name) {
        return this.parsed[name] !== undefined ? this.parsed[name] : null;
    }

    getNumber(name) {
        return this.parsed[name] !== undefined ? this.parsed[name] : null;
    }

    getBoolean(name) {
        return this.parsed[name] !== undefined ? this.parsed[name] : null;
    }

    getAttachment(name) {
        return this.parsed[name] || null;
    }

    getUser(name) {
        return this.parsed[name] || null;
    }

    getMember(name) {
        const user = this.parsed[name];
        if (!user) return null;
        return this.message.guild ? (this.message.guild.members.cache.get(user.id) || null) : null;
    }

    getRole(name) {
        return this.parsed[name] || null;
    }

    getChannel(name) {
        return this.parsed[name] || null;
    }
}

class MessageInteraction {
    constructor(message, commandName, subcommandGroupName, subcommandName, args, preferredLang) {
        this.message = message;
        this.client = message.client;
        this.guild = message.guild;
        this.channel = message.channel;
        this.user = message.author;
        this.member = message.member;
        this.id = message.id;
        this.createdTimestamp = message.createdTimestamp;
        this.commandName = commandName;

        this.guildLocale = preferredLang || 'ru';

        this.replied = false;
        this.deferred = false;
        this.replyMsg = null;
        this.isEphemeral = false;
        this._deleteTimeout = null;

        const command = this.client.commands.get(commandName);
        const parsedOptions = buildOptionsMap(command, subcommandGroupName, subcommandName, args, message);
        this.options = new MessageCommandOptions(parsedOptions, message, this.client);
    }

    get memberPermissions() {
        try {
            const { privateAccess } = require('../../config.json');
            if (privateAccess && privateAccess.includes(this.user.id)) {
                return {
                    has: () => true
                };
            }
        } catch (e) {
            // Ignore config require errors
        }

        if (this.guild && this.member) {
            return this.member.permissions;
        }
        return null;
    }

    _scheduleDeletion(delay) {
        if (!this.guild) return; // Не удаляем сообщения в личных сообщениях
        if (this._deleteTimeout) {
            clearTimeout(this._deleteTimeout);
        }
        this._deleteTimeout = setTimeout(async () => {
            try {
                if (this.replyMsg) {
                    await this.replyMsg.delete().catch(() => {});
                }
                const me = this.guild.members.me || await this.guild.members.fetch(this.client.user.id).catch(() => null);
                if (this.message && me && me.permissions.has('ManageMessages')) {
                    await this.message.delete().catch(() => {});
                }
            } catch (err) {
                // Игнорируем ошибки удаления
            }
        }, delay);
    }

    async _sendResponse(payload) {
        try {
            const replyPayload = typeof payload === 'string' ? { content: payload } : { ...payload };
            if (!replyPayload.allowedMentions) {
                replyPayload.allowedMentions = { repliedUser: false, parse: [] };
            }
            return await this.message.reply(replyPayload);
        } catch (err) {
            if (err.code === 50035 || err.code === 10008 || err.message?.includes('message_reference')) {
                return await this.channel.send(payload);
            }
            throw err;
        }
    }

    async deferReply(options = {}) {
        this.deferred = true;
        if ((options.flags & MessageFlags.Ephemeral) || options.ephemeral) {
            this.isEphemeral = true;
        }

        let content = '\u200B';
        if (this.isEphemeral && this.guild) {
            content = this.guildLocale === 'ru' ? '*(Сообщение удалится автоматически)*' : '*(Message will auto-delete)*';
        }

        this.replyMsg = await this._sendResponse({ content });

        if (this.isEphemeral) {
            this._scheduleDeletion(7000);
        }
        return this.replyMsg;
    }

    async reply(options) {
        if (this.replied) {
            throw new Error('Interaction has already been replied to.');
        }
        this.replied = true;

        let payload = typeof options === 'string' ? { content: options } : { ...options };

        if ((payload.flags & MessageFlags.Ephemeral) || payload.ephemeral) {
            this.isEphemeral = true;
        }

        if (payload.flags !== undefined) {
            delete payload.flags;
        }

        if (this.isEphemeral && this.guild) {
            const suffix = this.guildLocale === 'ru' ? '\n*(Сообщение удалится через 10 сек.)*' : '\n*(Message will auto-delete in 10s)*';
            if (typeof payload.content === 'string') {
                payload.content += suffix;
            } else if (!payload.content && !payload.embeds) {
                payload.content = suffix;
            }
        }

        this.replyMsg = await this._sendResponse(payload);

        if (this.isEphemeral) {
            this._scheduleDeletion(10000);
        }
        return this.replyMsg;
    }

    async editReply(options) {
        let payload = typeof options === 'string' ? { content: options } : { ...options };

        if ((payload.flags & MessageFlags.Ephemeral) || payload.ephemeral) {
            this.isEphemeral = true;
        }

        if (payload.flags !== undefined) {
            delete payload.flags;
        }

        // Если контент не передан явно в payload, сбрасываем его в null, чтобы старый текст (например, '\u200B') стёрся
        if (payload.content === undefined) {
            payload.content = null;
        }

        if (this.isEphemeral && this.guild) {
            const suffix = this.guildLocale === 'ru' ? '\n*(Сообщение удалится через 10 сек.)*' : '\n*(Message will auto-delete in 10s)*';
            if (typeof payload.content === 'string') {
                payload.content += suffix;
            } else if (!payload.content && !payload.embeds) {
                payload.content = suffix;
            }
        }

        if (this.replyMsg) {
            await this.replyMsg.edit(payload);
            if (this.isEphemeral) {
                this._scheduleDeletion(10000);
            }
            return this.replyMsg;
        } else {
            this.replied = true;
            this.replyMsg = await this._sendResponse(payload);
            if (this.isEphemeral) {
                this._scheduleDeletion(10000);
            }
            return this.replyMsg;
        }
    }

    async followUp(options) {
        let payload = typeof options === 'string' ? { content: options } : { ...options };

        let isFollowUpEphemeral = false;
        if ((payload.flags & MessageFlags.Ephemeral) || payload.ephemeral) {
            isFollowUpEphemeral = true;
        }

        if (payload.flags !== undefined) {
            delete payload.flags;
        }

        if (isFollowUpEphemeral && this.guild) {
            const suffix = this.guildLocale === 'ru' ? '\n*(Сообщение удалится через 10 сек.)*' : '\n*(Message will auto-delete in 10s)*';
            if (typeof payload.content === 'string') {
                payload.content += suffix;
            } else if (!payload.content && !payload.embeds) {
                payload.content = suffix;
            }
        }

        const msg = await this._sendResponse(payload);

        if (isFollowUpEphemeral && this.guild) {
            setTimeout(async () => {
                try {
                    await msg.delete().catch(() => {});
                } catch (e) {}
            }, 10000);
        }

        return msg;
    }

    async fetchReply() {
        if (!this.replyMsg) {
            throw new Error('No reply has been sent yet.');
        }
        return this.replyMsg;
    }

    async deleteReply() {
        if (this.replyMsg) {
            await this.replyMsg.delete().catch(() => {});
            this.replyMsg = null;
        }
    }
}

module.exports = {
    MessageInteraction,
    parseArgs
};
