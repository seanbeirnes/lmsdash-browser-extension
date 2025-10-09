type ValueOf<T> = T[keyof T];
type DeepValueOf<T> = T extends object ? DeepValueOf<ValueOf<T>> : T;

export const MESSAGE_TYPE = {
  Canvas: {
    REQUESTS: 1,
    RESPONSES: 2,
  },
  Task: {
    Request: {
      App: {
        STATE: 100, // Application info and state
        SET_PANEL_OPENED: 101,
      },
      Info: {
        USER: 200, // User info
        SEARCH_TERMS: 210,
      },
      NEW: 300,
      STOP: 301,
      PROGRESS: 302,
      BY_ID: 303,
      BY_TYPE: 305,
    },
    Response: {
      App: {
        STATE: 1001, // Application info and state
        SET_PANEL_OPENED: 1011,
      },
      Info: {
        USER: 2001, // User info
        SEARCH_TERMS: 2101,
      },
      NEW: 3000,
      STOP: 3001,
      PROGRESS: 3002,
      BY_ID: 3003,
      BY_TYPE: 3004,
    },
  },
} as const;

export const MESSAGE_TARGET = {
  SERVICE_WORKER: 100,
  SIDE_PANEL: 200,
  TAB: 300,
} as const;

export const MESSAGE_SENDER = {
  SERVICE_WORKER: 101,
  SIDE_PANEL: 201,
  TAB: 301,
} as const;

export type MessageType = DeepValueOf<typeof MESSAGE_TYPE>;
export type MessageTarget = ValueOf<typeof MESSAGE_TARGET>;
export type MessageSender = ValueOf<typeof MESSAGE_SENDER>;

export class Message {
  target: MessageTarget;
  sender: MessageSender;
  type: MessageType;
  text: string;
  data: any;
  time: number;

  constructor(
    target: MessageTarget,
    sender: MessageSender,
    type: MessageType,
    text: string = "",
    data: any = {},
    time: number = Date.now()
  ) {
    this.target = target;
    this.sender = sender;
    this.type = type;
    this.text = text;
    this.data = data;
    this.time = time;
  }
}