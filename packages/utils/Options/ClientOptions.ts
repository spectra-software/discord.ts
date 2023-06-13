import { DeviceType } from "../Type/DeviceType";
import { IntentsOptions } from "./IntentsOptions";

export interface ClientOptions {
  device?: DeviceType;
  shards?: number;
  reconnect?: boolean;
  compress?: boolean;
  largeThreshold?: number;
  intents?: IntentsOptions[];
}
