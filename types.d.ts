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
  keyManager?: KeyRotator;
  ipcServer?: any;
}

export interface ServiceInstance {
  name: string;
  interval: NodeJS.Timeout | null;
  isRunning: boolean;
  stop(): void;
}

export interface Command {
  cooldown?: number;
  data: any;
  execute(interaction: KoyomiInteraction): Promise<any> | any;
  autocomplete?(interaction: AutocompleteInteraction): Promise<any> | any;
}

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
  message?: Message;
  deferReply(options?: { ephemeral?: boolean, flags?: number, withResponse?: boolean }): Promise<any>;
  reply(options: string | any): Promise<any>;
  editReply(options: string | any): Promise<any>;
  followUp(options: string | any): Promise<any>;
  fetchReply(): Promise<any>;
}

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

export class KeyRotator {
  constructor(keysSource: string | any[], fallbackType?: string);
  getApiKey(type?: string): string;
  call<T>(apiFn: (key: string) => Promise<T>, type?: string): Promise<T>;
  resetUsageCounters(): void;
  destroy(): void;
}