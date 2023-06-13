import { MethodOptions } from "../Options/MethodOptions";

export interface RestOptions {
  method?: MethodOptions;
  data?: object | any;
  token?: string;
}
