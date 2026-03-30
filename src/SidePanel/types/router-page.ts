export const ROUTER_PAGES = {
  ERROR: "error",
  LOADING: "loading",
  MENU: "menu",
  ABOUT: "about",
  COURSES_SCANNER: "courses_scanner",
  ADJUST_DATES: "adjust_dates",
  ADMIN_TOOLS: "admin_tools",
  EXTERNAL_TOOLS: "external_tools",
} as const;

export type RouterPage = typeof ROUTER_PAGES[keyof typeof ROUTER_PAGES];
