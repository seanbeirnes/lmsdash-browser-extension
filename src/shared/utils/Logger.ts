import Config from "../config/Config";

export default class Logger {
  static log(message: string): void {
    const date = new Date();
    console.log(date.toUTCString() + "      " + message);
  }

  static debug(filePath: string, message: string): void {
    const date = new Date();
    if (Config && Config.DEBUG_MODE) {
      console.log(date.toUTCString() + "      " + filePath + "      " + message);
    }
  }
}