import moment from "moment";

import { Channel } from "./Channel";
import { Author } from "./Author";
import { Websocket } from "../ws/Websocket";
import { RestManager } from "../rest/RestManager";
import { DISCORD_API } from "../utils/Constants";
import { SentMessage } from "./SentMessage";
import { CreateThreadOptions } from "../utils/Options/CreateThreadOptions";
import { MessageMentions } from "../utils/core/MessageMentions";
export class Message {
  public channel!: Channel;
  public content!: string;
  public author!: Author;
  public id!: string;
  public timestamp!: string;
  public formatedTimestamp!: number;
  public tts!: boolean;
  public pinned!: boolean;
  public mentions!: MessageMentions[] | undefined;
  public mentionsRoles!: string[] | [];
  public components!: string[] | [];
  public embeds!: string[] | [];
  public mentionEveryone!: boolean;
  public editedTimestamp!: any;
  public attachments!: any[] | [];

  private _token: string;
  private WS!: Websocket;

  constructor(messageData: object | any, token: string, WS: any) {
    this._token = token;
    this.WS = WS;
    this._patchData(messageData);
  }

  public async inlineReply(content: string): Promise<SentMessage> {
    if (!content || typeof content !== "string")
      throw new SyntaxError("[MESSAGE] No content provided");
    const payload = {
      content: content,
      message_reference: {
        message_id: this.id,
        channel_id: this.channel.id,
        guild_id: this.channel.guild.id,
      },
    };
    const res: any = RestManager.prototype.request(
      `${DISCORD_API}channels/${this.channel.id}/messages`,
      {
        token: this._token,
        data: JSON.stringify(payload),
      }
    );
    return new SentMessage(await res, this._token);
  }

  public async inlineReplyNoMention(content: string): Promise<SentMessage> {
    if (!content || typeof content !== "string")
      throw new SyntaxError("[MESSAGE] No content provided");
    const payload = {
      content: content,
      message_reference: {
        message_id: this.id,
        channel_id: this.channel.id,
        guild_id: this.channel.guild.id,
      },
      allowed_mentions: { replied_user: false },
    };
    const res: any = RestManager.prototype.request(
      `${DISCORD_API}channels/${this.channel.id}/messages`,
      {
        token: this._token,
        data: JSON.stringify(payload),
      }
    );
    return new SentMessage(await res, this._token);
  }

  public async pin(): Promise<void> {
    return await RestManager.prototype.request(
      `${DISCORD_API}channels/${this.channel.id}/pins/messages/${this.id}`,
      {
        token: this._token,
        method: "put",
      }
    );
  }

  public async createThread(
    name: string,
    options?: CreateThreadOptions
  ): Promise<void> {
    if (!name || typeof name !== "string")
      throw new SyntaxError("[MESSAGE] No thread name provided");
    return await RestManager.prototype.request(
      `${DISCORD_API}channels/${this.channel.id}/messages/${this.id}/threads`,
      {
        token: this._token,
        method: "post",
        data: JSON.stringify({
          name: name,
          auto_archive_duration:
            options &&
            options.autoArchiveDuration &&
            typeof options.autoArchiveDuration === "string"
              ? Number(options.autoArchiveDuration)
              : 1440,
        }),
      }
    );
  }

  public async unpin(): Promise<void> {
    return await RestManager.prototype.request(
      `${DISCORD_API}channels/${this.channel.id}/pins/messages/${this.id}`,
      {
        token: this._token,
        method: "delete",
      }
    );
  }

  public async addReaction(emoji: string): Promise<void> {
    if (!emoji || typeof emoji !== "string")
      throw new SyntaxError("[MESSAGE] No emoji provided");
    if (emoji.startsWith("<")) emoji = emoji.replace("<:", "").replace(">", "");
    return await RestManager.prototype.request(
      `${DISCORD_API}channels/${this.channel.id}/messages/${
        this.id
      }/reactions/${encodeURIComponent(emoji)}/@me`,
      {
        token: this._token,
        method: "put",
      }
    );
  }

  public async reply(message: string): Promise<SentMessage> {
    if (!message) throw new SyntaxError("[MESSAGE] No message provided");
    message = `<@${this.author.id}> ${message}`;
    const res: any = await RestManager.prototype.request(
      `${DISCORD_API}channels/${this.channel.id}/messages`,
      {
        token: this._token,
        data: JSON.stringify({ content: message }),
      }
    );
    return new SentMessage(await res, this._token);
  }

  private _patchData(data: any): void {
    this.channel = new Channel(
      data.channel_id,
      this._token,
      data.guild_id !== undefined ? data.guild_id : null
    );
    this.author = new Author(data, this._token, this.WS);
    this.content = data.content;
    this.id = data.id;
    this.timestamp = data.timestamp;
    this.formatedTimestamp = Number(moment(data.timestamp).format("LLLL"));
    this.tts = data.tts;
    this.pinned = data.pinned;
    this.mentions =
      Object.keys(data.mentions).length === 0 ? undefined : data.mentions;
    this.mentionsRoles = data.mentions_roles;
    this.components = data.components;
    this.embeds = data.embeds;
    this.mentionEveryone = data.mention_everyone;
    this.editedTimestamp = data.edited_timestamp;
    this.attachments = data.attachments;
  }
}
