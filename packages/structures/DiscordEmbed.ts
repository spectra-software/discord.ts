import { _testURL, _formatColor } from "../utils/Utils";
import { FooterOptions } from "../utils/Options/FooterOptions";
import { ImageOptions } from "../utils/Options/ImageOptions";
import { ThumbnailOptions } from "../utils/Options/ThumbnailOptions";
import { VideoOptions } from "../utils/Options/VideoOptions";
import { ProviderOptions } from "../utils/Options/ProviderOptions";
import { AuthorOptions } from "../utils/Options/AuthorOptions";

export class DiscordEmbed {
  public title?: string;
  public description?: string;
  public url?: string;
  public timestamp?: Date;
  public color?: string | number;
  public footer?: FooterOptions;
  public image?: ImageOptions;
  public thumbnail?: ThumbnailOptions;
  public video?: VideoOptions;
  public provider?: ProviderOptions;
  public author?: AuthorOptions;
  public fields?: any;

  constructor() {
    this.title = undefined;
    this.description = undefined;
    this.url = undefined;
    this.timestamp = undefined;
    this.color = undefined;
    this.footer = undefined;
    this.image = undefined;
    this.thumbnail = undefined;
    this.video = undefined;
    this.provider = undefined;
    this.author = undefined;
    this.fields = undefined;
  }

  setAuthor(author: string, image?: string, url?: string): DiscordEmbed {
    if (!author || typeof author !== "string")
      throw new SyntaxError("[DISCORD-EMBED] No author provided");
    this.author = {};
    this.author.name = author;
    this.author.url = url && _testURL(url) ? url : undefined;
    this.author.icon_url =
      image && typeof image === "string" && _testURL(image) ? image : undefined;
    return this;
  }

  setTitle(title: string): DiscordEmbed {
    if (!title || typeof title !== "string")
      throw new SyntaxError("[DISCORD-EMBED] No title provided");
    this.title = title;
    return this;
  }

  setURL(url: string): DiscordEmbed {
    if (!url || !_testURL(url))
      throw new SyntaxError("[DISCORD-EMBED] No url provided");
    this.url = url;
    return this;
  }

  setThumbnail(thumbnail: string | undefined): DiscordEmbed {
    this.thumbnail = {};
    this.thumbnail.url =
      thumbnail && _testURL(thumbnail) ? thumbnail : undefined;
    return this;
  }

  setImage(image: string): DiscordEmbed {
    if (!image || !_testURL(image))
      throw new SyntaxError("[DISCORD-EMBED] No image url provided");
    this.image = {};
    this.image.url = image;
    return this;
  }

  setTimestamp(date?: Date): DiscordEmbed {
    if (date) {
      this.timestamp = date;
    } else {
      this.timestamp = new Date();
    }
    return this;
  }

  setColor(color: string): DiscordEmbed {
    if (!color || typeof color !== "string")
      throw new SyntaxError("[DISCORD-EMBED] No color provided");
    this.color = _formatColor(color);
    return this;
  }

  setDescription(description: string): DiscordEmbed {
    if (!description || typeof description !== "string")
      throw new SyntaxError("[DISCORD-EMBED] No description provided");
    this.description = description;
    return this;
  }

  addField(name: string, value: string, inline?: boolean): DiscordEmbed {
    if (
      !name ||
      typeof name !== "string" ||
      !value ||
      typeof value !== "string"
    )
      throw new SyntaxError("[DISCORD-EMBED] Invalid field provided");
    this.fields.push({
      name: name,
      value: value,
      inline: inline && typeof inline === "boolean" ? inline : true,
    });
    return this;
  }

  setFooter(footer: string, image?: string): DiscordEmbed {
    if (!footer || typeof footer !== "string")
      throw new SyntaxError("[DISCORD-EMBED] No footer provided");
    this.footer = {};
    this.footer.icon_url =
      image && typeof image === "string" && _testURL(image) ? image : undefined;
    this.footer.text = footer;
    return this;
  }

  setVideo(video: string): DiscordEmbed {
    if (!video || typeof video !== "string" || !_testURL(video))
      throw new SyntaxError("[DISCORD-EMBED] No video url provided");
    this.video = {};
    this.video.url = video;
    return this;
  }

  setProvider(name: string, url?: string): DiscordEmbed {
    if (!name || typeof name !== "string")
      throw new SyntaxError("[DISCORD-EMBED] No provider name provided");
    this.provider = {};
    this.provider.name = name;
    this.provider.url =
      url && typeof url === "string" && _testURL(url) ? url : undefined;
    return this;
  }

  getJSON(): object {
    return {
      title: this.title,
      description: this.description,
      url: this.url,
      timestamp: this.timestamp,
      color: this.color,
      footer: this.footer,
      image: this.image,
      thumbnail: this.thumbnail,
      video: this.video,
      provider: this.provider,
      author: this.author,
      fields: this.fields,
    };
  }
}
