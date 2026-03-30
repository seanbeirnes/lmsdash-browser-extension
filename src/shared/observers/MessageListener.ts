import { Message, MessageTarget } from "../models/Message";

export class MessageListener<TArgs = any>
{
  target: MessageTarget;
  callback: (message: Message, args?: TArgs) => void;
  args: TArgs | null;
  private boundHandleMessage: (message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void;

  constructor(target: MessageTarget, callback: (message: Message, args?: TArgs) => void, args: TArgs | null = null)
  {
    this.target = target;
    this.callback = callback;
    this.args = args;

    this.boundHandleMessage = this.handleMessage.bind(this);
  }

  listen(): void
  {
    chrome.runtime.onMessage.addListener(this.boundHandleMessage);
  }

  remove(): void
  {
    chrome.runtime.onMessage.removeListener(this.boundHandleMessage);
  }

  // Handles the message incoming from the chrome runtime message listener
  // Incoming message follows Message.ts data structure
  private handleMessage(message: Message, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void): void
  {
    if (this.target !== message.target) return;

    if (this.args !== null)
    {
      this.callback(message, this.args);
    }
    else
    {
      this.callback(message);
    }
  }
}