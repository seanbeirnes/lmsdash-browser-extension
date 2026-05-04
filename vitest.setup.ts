import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

Object.defineProperty(globalThis, "__app_version", {
  value: "test-version",
  configurable: true,
});

Object.defineProperty(globalThis, "__app_description", {
  value: "test-description",
  configurable: true,
});

Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid"),
  },
  configurable: true,
});

Object.defineProperty(globalThis, "chrome", {
  value: {
    runtime: {
      onMessage: { addListener: vi.fn() },
      sendMessage: vi.fn(),
    },
    tabs: {
      get: vi.fn(),
      query: vi.fn(),
      onUpdated: { addListener: vi.fn() },
      onRemoved: { addListener: vi.fn() },
      onActivated: { addListener: vi.fn() },
    },
    sidePanel: {
      setPanelBehavior: vi.fn(),
    },
  },
  configurable: true,
});
