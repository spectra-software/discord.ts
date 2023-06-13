import { ImageFormat } from "../Format/ImageFormat";
import { ImageSize } from "../Format/ImageSize";

export interface BannerOptions {
  type?: ImageFormat;
  size: ImageSize;
}
