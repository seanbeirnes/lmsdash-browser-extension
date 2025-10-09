type ValueOf<T> = T[keyof T];
type DeepValueOf<T> = T extends object ? DeepValueOf<ValueOf<T>> : T;

export const CANVAS_REQUEST_TYPE = {
  Get: {
    Announcements: 100,
    Assignments: 101,
    Course: 102,
    CourseFiles: 103,
    CoursesUser: 104,
    CoursesByAdminSearch: 105,
    CoursesAccount: 106,
    Discussions: 107,
    Modules: 108,
    ModuleItems: 109,
    Pages: 110,
    Tabs: 111,
    TermsBySearch: 112,
    UsersSelf: 113,
    CoursesByTermId: 114,
  },
} as const;

export type CanvasRequestType = DeepValueOf<typeof CANVAS_REQUEST_TYPE>;
export const CANVAS_REQUEST_GET = CANVAS_REQUEST_TYPE.Get;
export type CanvasRequestGet = ValueOf<typeof CANVAS_REQUEST_GET>;

export interface CanvasRequestInfo {
  id: string;
  created: number;
  type: CanvasRequestGet;
  params: Record<string, any>;
}

export class CanvasRequest {
  created: number;
  started: number | null;
  finished: number | null;
  id: string;
  type: CanvasRequestGet;
  params: Record<string, any>;

  static readonly Get = CANVAS_REQUEST_TYPE.Get;

  constructor(
    type: CanvasRequestGet,
    params: Record<string, any> = {},
    id: string = crypto.randomUUID(),
    created: number = Date.now()
  ) {
    this.created = created;
    this.started = null;
    this.finished = null;

    this.id = id;
    this.type = type;
    this.params = params;
  }

  isRunning(): boolean {
    if (this.started !== null && this.finished === null) {
      return true;
    }

    return false;
  }

  isFinished(): boolean {
    if (this.finished !== null) {
      return true;
    }

    return false;
  }

  start(): number {
    return (this.started = Date.now());
  }

  finish(): number | null {
    if (this.started !== null) {
      return (this.finished = Date.now());
    }

    return null;
  }

  getInfo(): CanvasRequestInfo {
    return {
      id: this.id,
      created: this.created,
      type: this.type,
      params: this.params,
    };
  }
}