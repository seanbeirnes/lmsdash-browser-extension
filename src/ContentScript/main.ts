import { Message, MESSAGE_TYPE, MESSAGE_TARGET, MESSAGE_SENDER } from "../shared/models/Message";
import {RequestHandler} from "./RequestHandler";
import Logger from "../shared/utils/Logger";

declare const chrome: any;
declare const __dirname: string;

const requestHandler = new RequestHandler();

chrome.runtime.onMessage.addListener((message: Message, sender: any, sendResponse: (resp: any) => void) =>
  {
    const isTarget = (message.target === MESSAGE_TARGET.TAB && message.type === MESSAGE_TYPE.Canvas.REQUESTS);

    (async () =>
    {
      Logger.debug(__dirname, JSON.stringify(message))

      // Only accept messages for the content script
      if(message.target !== MESSAGE_TARGET.TAB)
      {
        return;
      }

      // If message is a request, make requests in batches and send responses back in a message
      if(isTarget)
      {
        requestHandler.enqueueList(message.data);

        const responses = await requestHandler.run(); // Array of responses returned

        const responseMessage = new Message( MESSAGE_TARGET.SERVICE_WORKER,
            MESSAGE_SENDER.TAB,
            MESSAGE_TYPE.Canvas.RESPONSES,
            "Response",
            responses )
        sendResponse(responseMessage);
      }
    })();

    if(isTarget) return true;
  }
)