declare const __app_version: string;
declare const __app_description: string;

export default class Config {
  static APP_VERSION: string = __app_version;
  static APP_DESCRIPTION: string = __app_description;
  static DEBUG_MODE: boolean = (process.env.NODE_ENV === 'development');
}