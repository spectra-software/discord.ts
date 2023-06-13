import { EventEmitter } from "events";

import { Websocket } from "../ws/Websocket";
import {
  INTENTS_ARRAY,
  GATEWAY_OPCODES,
  gameType,
  numberGameType,
  statusType,
} from "../utils/Constants";
import { Users } from "../structures/Users";
import { _testURL } from "../utils/Utils";
import { Message } from "../structures/Message";
import { ButtonInteraction } from "../structures/ButtonInteraction";
import { ClientUser } from "./ClientUser";
import { GuildMember } from "../structures/GuildMember";
import { Channels } from "../structures/Channels";
import { SlashCommandInteraction } from "../structures/slashCommands/SlashCommandInteraction";
import { SelectMenuInteraction } from "../structures/SelectMenuInteraction";
import { Messages } from "../structures/Messages";
import { Guilds } from "../structures/Guilds";
import { MessageReaction } from "../structures/MessageReaction";
import { StatusType } from "../utils/Type/StatusType";
import { GameOptions } from "../utils/Options/GameOptions";
import { ClientOptions } from "../utils/Options/ClientOptions";
import { ClientGame } from "../utils/core/ClientGame";

export declare interface Client extends EventEmitter {
  on(
    event: "MESSAGE",
    listener: (message: Message) => void | Promise<void> | any
  ): this;
  on(
    event: "SLASH_COMMAND_USED",
    listener: (
      interaction: SlashCommandInteraction
    ) => void | Promise<void> | any
  ): this;
  on(
    event: "BUTTON_CLICKED",
    listener: (button: ButtonInteraction) => void | Promise<void> | any
  ): this;
  on(event: "READY", listener: () => void | any): this;
  on(event: "ERROR", listener: (error: Error) => void | any): this;
  on(event: "WARN", listener: (warn: string) => void | any): this;
  on(
    event: "GUILD_MEMBER_ADD",
    listener: (member: GuildMember) => void | Promise<void> | any
  ): this;
  on(
    event: "SELECT_MENU_CLICKED",
    listener: (selectMenu: SelectMenuInteraction) => void | Promise<void> | any
  ): this;
  on(event: "RECONNECTING", listener: (statusCode: string) => void | any): this;
  on(
    event: "MESSAGE_REACTION_ADD",
    listener: (reaction: MessageReaction) => void | Promise<void> | any
  ): this;
}

export class Client extends EventEmitter {
  public users!: Users;
  public messages!: Messages;
  public game: ClientGame;
  public status: string;
  public user!: ClientUser;
  public channels!: Channels;
  public guilds!: Guilds;

  private _token!: string;
  private WS!: Websocket;

  constructor(options?: ClientOptions) {
    super();
    this.WS = new Websocket(this);
    this.status = "online";
    this.game = { name: "", type: 0, url: "" };
    this._patchData(options);
  }

  public async connect(token: string): Promise<void> {
    if (!token || typeof token !== "string")
      throw new SyntaxError("[CLIENT] No token provided");
    if (token.length !== 72)
      throw new SyntaxError("[CLIENT] Invalid token provided");
    this.user = new ClientUser(token, this);
    this._token = token;
    this.users = new Users(this._token);
    this.channels = new Channels(this._token);
    this.messages = new Messages(this._token);
    this.guilds = new Guilds(this._token);
    await this.WS.initConnection(token, this);
  }

  public async setGame(
    game: string,
    options?: GameOptions
  ): Promise<ClientGame> {
    if (!game || typeof game !== "string")
      throw new SyntaxError("[CLIENT] No game provided");
    this.game = {
      name: game,
      type:
        options?.type &&
        typeof options.type === "string" &&
        gameType.indexOf(options.type.toUpperCase()) > -1
          ? numberGameType.find((el) => el.type === options.type?.toUpperCase())
              ?.number
          : 0,
      url:
        options?.url &&
        _testURL(options.url) &&
        (/https:\/\/www\.twitch\.tv\/(\w+)/.test(options.url) ||
          /https:\/\/www\.youtube\.com\/channel\/(\w+)/.test(options.url))
          ? options.url
          : undefined,
    };
    if (this.WS.online === true)
      await this.WS.sendToWS(
        GATEWAY_OPCODES.PRESENCE_UPDATE,
        await this.WS.getMetaData(3, this)
      );
    return this.game;
  }

  public async setStatus(status: StatusType): Promise<void> {
    if (!status || typeof status !== "string")
      throw SyntaxError("[CLIENT] No status provided");
    if (!statusType.includes(status.toUpperCase()))
      throw new SyntaxError("[CLIENT] Invalid status provided");
    this.status = status.toLowerCase();
    if (this.WS.online === true)
      this.WS.sendToWS(
        GATEWAY_OPCODES.PRESENCE_UPDATE,
        await this.WS.getMetaData(3, this)
      );
  }

  public async setAFK(state?: boolean): Promise<void> {
    if (
      (this.WS.AFK === true && state === true) ||
      (this.WS.AFK === false && state === false)
    )
      throw new Error("[CLIENT] This status is already in use");
    this.WS.AFK =
      state && typeof state === "boolean"
        ? state
        : this.WS.AFK === true
        ? false
        : true;
    this.WS.sendToWS(
      GATEWAY_OPCODES.PRESENCE_UPDATE,
      await this.WS.getMetaData(3, this)
    );
  }

  public get ping(): number {
    return Number(this.WS.ping);
  }

  private async _patchData(options: ClientOptions | undefined): Promise<void> {
    switch (options?.device?.toUpperCase()) {
      case "MOBILE":
        this.WS.wsProperties.browser = "Discord iOS";
        break;
      case "DESKTOP":
        this.WS.wsProperties.browser = "win32";
        break;
      default:
        this.WS.wsProperties.browser = process.platform;
        break;
    }
    options?.reconnect && typeof options.reconnect === "boolean"
      ? (this.WS.wsProperties.reconnect = options.reconnect)
      : true;
    options?.compress && typeof options.compress === "boolean"
      ? (this.WS.wsProperties.compress = options.compress)
      : true;
    options?.largeThreshold && typeof options.largeThreshold === "number"
      ? (this.WS.wsProperties.largeThreshold = options.largeThreshold)
      : 250;
    options?.shards && typeof options.shards === "number"
      ? (this.WS.wsProperties.shards = options.shards)
      : 1;
    if (
      !options?.intents ||
      options.intents.map((el) => el.toUpperCase()).includes("ALL")
    )
      this.WS.intents = 65534;
    else
      this.WS.intents = INTENTS_ARRAY.map((elm) =>
        options.intents?.map((el) => el.toUpperCase()).includes(elm.intent)
          ? elm.number
          : 0
      ).reduce((a, b) => a + b);
  }
}
