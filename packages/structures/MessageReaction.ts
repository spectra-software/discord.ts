import { Member } from "../structures/Member";
import { EmojiOptions } from "../utils/Options/EmojiOptions";

export class MessageReaction {
  public userID!: string;
  public messageID!: string;
  public emoji!: EmojiOptions;
  public channelID!: string;
  public guildID!: string;
  public member!: Member;

  private _token: string;

  constructor(data: object, token: string) {
    this._token = token;
    this._patchData(data);
  }

  private _patchData(data: any): void {
    this.userID = data.user_id;
    this.messageID = data.message_id;
    this.emoji = {
      name: data.emoji.name,
      id: data.emoji.id,
    };
    this.channelID = data.channel_id;
    this.guildID = data.guild_id;
    this.member = new Member(data.member, this._token, this.guildID);
  }
}
