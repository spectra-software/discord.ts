import { _isEmoji, _testURL } from "../utils/Utils";
import { buttonStyles } from "../utils/Constants";
import { ButtonStyle } from "../utils/Format/ButtonStyle";
import { EmojiOptions } from "../utils/Options/EmojiOptions";

export class DiscordButton {
  public type: number;
  public disable?: boolean;
  public style?: ButtonStyle | number;
  public label: string | any;
  public emoji?: EmojiOptions;
  public customID?: string;
  public URL?: string;

  constructor() {
    this.type = 2;
    this.disable = false;
    this.style = 1;
    this.label = undefined;
    this.emoji = undefined;
    this.customID = undefined;
    this.URL = undefined;
  }

  setLabel(label: string): DiscordButton {
    if (!label || label.length > 80)
      throw new SyntaxError("[DISCORD-BUTTON] No label provided");
    this.label = label;
    return this;
  }

  setStyle(style?: ButtonStyle | number): DiscordButton {
    if (!style) this.style = 1;
    else {
      const btnStyle = buttonStyles.find(
        (elm) => elm.color === style || elm.number === style
      );
      if (!btnStyle) throw new SyntaxError("[DISCORD-BUTTON] Invalid style");
      this.style = btnStyle.number;
    }
    return this;
  }

  setEmoji(emoji: string): DiscordButton {
    if (!emoji || !_isEmoji(emoji))
      throw new SyntaxError("[DISCORD-BUTTON] No emoji provided");
    this.emoji = {};
    this.emoji.name = emoji;
    return this;
  }

  setID(id: string): DiscordButton {
    if (!id || id.length > 100)
      throw new SyntaxError("[DISCORD-BUTTON] No id provided");
    this.customID = id;
    return this;
  }

  setURL(url: string): DiscordButton {
    if (this.style !== 5)
      throw new SyntaxError("[DISCORD-BUTTON] Style must be 5");
    if (!url || !_testURL(url))
      throw new SyntaxError("[DISCORD-BUTTON] No url provided");
    this.URL = url;
    return this;
  }

  setDisable(state?: boolean): DiscordButton {
    if (this.style === 5) throw new SyntaxError("[DISCORD-BUTTON] Style is 5");
    if (!state) {
      this.disable = true;
    } else {
      this.disable = state;
    }
    return this;
  }

  getJSON(): object {
    if (!this.customID)
      throw new SyntaxError("[DISCORD-BUTTON] Custom id is required");
    return {
      type: this.type,
      label: this.label,
      style: this.style,
      custom_id: this.customID,
      emoji: this.emoji,
      disable: this.disable,
      url: this.URL,
    };
  }
}
