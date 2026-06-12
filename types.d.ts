// types.d.ts

import { 
  Client, 
  Collection, 
  Guild, 
  GuildMember, 
  TextBasedChannel, 
  User, 
  Message, 
  Role, 
  Channel, 
  Attachment,
  AutocompleteInteraction
} from 'discord.js';

/**
 * Расширенный класс бота, используемый в проекте.
 */
export class KoyomiBot extends Client {
  commands: Collection<string, Command>;
  cooldowns: Collection<string, Collection<string, number>>;
  lastMessages: Map<string, any[]>;
  lastChannels: Map<string, any[]>;
  queues: Map<any, any>;
  services: ServiceInstance[];
  servicesCount: number;
  eventsCount: number;
  commandsCount: number;
  keyManager?: ApiKeyManager;
  ipcServer?: any; // BotIPCServer
}

/**
 * Интерфейс для создания периодических фоновых служб (сервисов).
 */
export interface ServiceInstance {
  name: string;
  interval: NodeJS.Timeout | null;
  isRunning: boolean;
  stop(): void;
}

/**
 * Структура экспортируемой команды.
 */
export interface Command {
  cooldown?: number;
  data: any; // Сюда передается SlashCommandBuilder или JSON-структура
  execute(interaction: KoyomiInteraction): Promise<any> | any;
  autocomplete?(interaction: AutocompleteInteraction): Promise<any> | any;
}

/**
 * Интерфейс, объединяющий свойства оригинального ChatInputCommandInteraction 
 * и кастомного класса MessageInteraction для унифицированной разработки.
 */
export interface KoyomiInteraction {
  client: KoyomiBot;
  guild: Guild | null;
  channel: TextBasedChannel | null;
  user: User;
  member: GuildMember | null;
  id: string;
  createdTimestamp: number;
  commandName: string;
  guildLocale: string;
  replied: boolean;
  deferred: boolean;
  options: KoyomiInteractionOptions;
  memberPermissions: any;
  message?: Message; // Присутствует, если команда вызвана через префикс

  deferReply(options?: { ephemeral?: boolean, flags?: number, withResponse?: boolean }): Promise<any>;
  reply(options: string | any): Promise<any>;
  editReply(options: string | any): Promise<any>;
  followUp(options: string | any): Promise<any>;
  fetchReply(): Promise<any>;
}

/**
 * Опции аргументов команд, поддерживающие как Slash, так и Message парсинг.
 */
export interface KoyomiInteractionOptions {
  getSubcommand(required?: boolean): string | null;
  getSubcommandGroup(required?: boolean): string | null;
  getString(name: string): string | null;
  getInteger(name: string): number | null;
  getNumber(name: string): number | null;
  getBoolean(name: string): boolean | null;
  getAttachment(name: string): Attachment | null;
  getUser(name: string): User | null;
  getMember(name: string): GuildMember | null;
  getRole(name: string): Role | null;
  getChannel(name: string): Channel | null;
}

/**
 * Менеджер API ключей Gemini.
 */
export interface ApiKeyConfig {
  key: string;
  requestsLimit?: number | null;
  timeoutDuration?: number;
  priority?: number;
}

export class ApiKeyManager {
  constructor(keyConfigList: ApiKeyConfig[]);
  getAvailableKey(): string | null;
  call<T>(apiFn: (key: string) => Promise<T>): Promise<T>;
  markKeyAsRateLimited(key: string): void;
  resetRequestCounts(): void;
  destroy(): void;
}