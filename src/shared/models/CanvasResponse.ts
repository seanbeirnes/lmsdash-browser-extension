// Stores data for a Canvas API call response in a predefined data structure
export class CanvasResponse {
  id: string | number;
  text: string;
  bodyUsed: boolean;
  link: string[] | null;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: string;

  constructor(
    id: string | number,
    text: string,
    bodyUsed: boolean,
    link: string[] | null,
    ok: boolean,
    redirected: boolean,
    status: number,
    statusText: string,
    type: string
  ) {
    this.id = id;
    this.text = text;
    this.bodyUsed = bodyUsed;
    this.link = link;
    this.ok = ok;
    this.redirected = redirected;
    this.status = status;
    this.statusText = statusText;
    this.type = type;
  }
}