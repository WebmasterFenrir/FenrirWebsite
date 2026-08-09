import { describe, test, expect } from "bun:test";
import { cn } from "./utils";

describe("cn", () => {
  test("joins class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("filters out falsy values", () => {
    expect(cn("foo", false && "bar", undefined, null, "baz")).toBe("foo baz");
  });

  test("resolves tailwind conflicts — last value wins", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  test("handles conditional object syntax", () => {
    expect(cn({ "font-bold": true, italic: false })).toBe("font-bold");
  });

  test("returns empty string with no input", () => {
    expect(cn()).toBe("");
  });
});
