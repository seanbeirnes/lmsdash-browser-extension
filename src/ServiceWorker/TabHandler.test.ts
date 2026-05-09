import { beforeEach, describe, expect, it, vi } from "vitest";
import { TabHandler } from "./TabHandler";

type AsyncListener = (...args: any[]) => void | Promise<void>;

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("TabHandler", () => {
  let updatedListener: AsyncListener | undefined;
  let removedListener: AsyncListener | undefined;
  let activatedListener: AsyncListener | undefined;

  beforeEach(() => {
    updatedListener = undefined;
    removedListener = undefined;
    activatedListener = undefined;

    vi.mocked(chrome.tabs.get as unknown as ReturnType<typeof vi.fn>).mockReset();
    vi.mocked(chrome.tabs.query as unknown as ReturnType<typeof vi.fn>).mockReset();
    vi.mocked(chrome.tabs.query as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    vi.mocked(chrome.tabs.onUpdated.addListener).mockImplementation((listener) => {
      updatedListener = listener as AsyncListener;
    });
    vi.mocked(chrome.tabs.onRemoved.addListener).mockImplementation((listener) => {
      removedListener = listener as AsyncListener;
    });
    vi.mocked(chrome.tabs.onActivated.addListener).mockImplementation((listener) => {
      activatedListener = listener as AsyncListener;
    });
  });

  it("discovers already-open Canvas tabs during init without needing a refresh", async () => {
    vi.mocked(chrome.tabs.query as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        { id: 11, url: "https://school.instructure.com/courses/11", active: true } as chrome.tabs.Tab,
      ])
      .mockResolvedValueOnce([
        { id: 11, url: "https://school.instructure.com/courses/11", active: true } as chrome.tabs.Tab,
      ]);
    vi.mocked(chrome.tabs.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 11,
      url: "https://school.instructure.com/courses/11",
      active: true,
    } as chrome.tabs.Tab);

    const handler = new TabHandler();
    handler.init();
    await flushPromises();

    expect(handler.hasTabs()).toBe(true);
    expect(handler.getLastActiveTabId()).toBe(11);
  });

  it("tracks the last active valid Canvas tab", async () => {
    vi.mocked(chrome.tabs.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 22,
      url: "https://school.instructure.com/courses/22/pages/home",
      active: true,
    } as chrome.tabs.Tab);
    vi.mocked(chrome.tabs.query as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 22, url: "https://school.instructure.com/courses/22/pages/home", active: true } as chrome.tabs.Tab,
    ]);

    const handler = new TabHandler();
    handler.init();

    await updatedListener?.(22, { status: "complete" }, { id: 22 } as chrome.tabs.Tab);
    await flushPromises();
    await activatedListener?.({ tabId: 22 });
    await flushPromises();

    expect(handler.getLastActiveTabId()).toBe(22);
    expect(handler.getTabId()).toBe(22);
  });

  it("removes closed Canvas tabs from tracking", async () => {
    vi.mocked(chrome.tabs.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 33,
      url: "https://canvas.school.edu/courses/33",
      active: true,
    } as chrome.tabs.Tab);

    const handler = new TabHandler();
    handler.init();

    await updatedListener?.(33, { status: "complete" }, { id: 33 } as chrome.tabs.Tab);
    await flushPromises();
    await removedListener?.(33, { isWindowClosing: false });
    await flushPromises();

    expect(handler.hasTabs()).toBe(false);
    expect(handler.getLastActiveTabId()).toBeNull();
  });
});
