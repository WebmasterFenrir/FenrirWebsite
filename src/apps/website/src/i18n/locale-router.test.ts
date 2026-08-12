import { describe, test, expect } from "bun:test";
import {
  LOCALE_COOKIE,
  detectLocaleFromAcceptLanguage,
  isSupportedLocale,
  resolveLanguageRouting,
} from "./locale-router";

const base = {
  pathname: "/",
  langParam: null,
  urlLocale: undefined,
  cookieLocale: undefined,
  preferredLocale: undefined,
};

describe("isSupportedLocale", () => {
  test("accepts nl and en", () => {
    expect(isSupportedLocale("nl")).toBe(true);
    expect(isSupportedLocale("en")).toBe(true);
  });

  test("rejects everything else", () => {
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale("de")).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
    expect(isSupportedLocale(null)).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
  });
});

describe("resolveLanguageRouting", () => {
  test("defaults to Dutch when nothing signals otherwise", () => {
    const result = resolveLanguageRouting({ ...base });
    expect(result.cookie).toBe("nl");
    expect(result.redirect).toBeNull();
  });

  test("redirects to /en when the browser prefers English", () => {
    const result = resolveLanguageRouting({ ...base, preferredLocale: "en" });
    expect(result).toEqual({ cookie: "en", redirect: "/en" });
  });

  test("redirects a deep link to its English counterpart", () => {
    const result = resolveLanguageRouting({
      ...base,
      pathname: "/over-ons",
      preferredLocale: "en",
    });
    expect(result).toEqual({ cookie: "en", redirect: "/en/over-ons" });
  });

  test("the saved cookie beats the browser preference", () => {
    const result = resolveLanguageRouting({
      ...base,
      cookieLocale: "nl",
      preferredLocale: "en",
    });
    expect(result.cookie).toBe("nl");
    expect(result.redirect).toBeNull();
  });

  test("keeps serving English when the cookie says en", () => {
    const result = resolveLanguageRouting({ ...base, cookieLocale: "en" });
    expect(result).toEqual({ cookie: "en", redirect: "/en" });
  });

  test("an explicit /en URL wins and is served directly", () => {
    const result = resolveLanguageRouting({
      ...base,
      pathname: "/en/over-ons",
      urlLocale: "en",
      cookieLocale: "nl",
    });
    expect(result).toEqual({ cookie: "en", redirect: null });
  });

  test("?lang=nl overrides an en cookie and strips the param", () => {
    const result = resolveLanguageRouting({
      ...base,
      pathname: "/over-ons",
      langParam: "nl",
      cookieLocale: "en",
    });
    expect(result).toEqual({ cookie: "nl", redirect: "/over-ons" });
  });

  test("?lang=en localizes the path even when the cookie says nl", () => {
    const result = resolveLanguageRouting({
      ...base,
      pathname: "/over-ons",
      langParam: "en",
      cookieLocale: "nl",
    });
    expect(result).toEqual({ cookie: "en", redirect: "/en/over-ons" });
  });

  test("?lang=nl on an English URL strips the /en prefix", () => {
    const result = resolveLanguageRouting({
      ...base,
      pathname: "/en/over-ons",
      langParam: "nl",
      cookieLocale: "en",
    });
    expect(result).toEqual({ cookie: "nl", redirect: "/over-ons" });
  });

  test("unknown ?lang values are ignored", () => {
    const result = resolveLanguageRouting({ ...base, langParam: "fr", preferredLocale: "en" });
    expect(result).toEqual({ cookie: "en", redirect: "/en" });
  });
});

describe("detectLocaleFromAcceptLanguage", () => {
  test("matches a bare region code via its language subtag", () => {
    expect(detectLocaleFromAcceptLanguage("en-US")).toBe("en");
    expect(detectLocaleFromAcceptLanguage("nl-BE")).toBe("nl");
  });

  test("prefers the highest quality entry", () => {
    expect(detectLocaleFromAcceptLanguage("fr;q=0.9,en;q=0.8")).toBe("en");
    expect(detectLocaleFromAcceptLanguage("en;q=0.8,nl;q=0.9")).toBe("nl");
  });

  test("returns undefined for unsupported or missing headers", () => {
    expect(detectLocaleFromAcceptLanguage(null)).toBeUndefined();
    expect(detectLocaleFromAcceptLanguage("fr-FR,de-DE")).toBeUndefined();
    expect(detectLocaleFromAcceptLanguage("*")).toBeUndefined();
  });
});

describe("cookie name", () => {
  test("is stable", () => {
    expect(LOCALE_COOKIE).toBe("fenrir_lang");
  });
});
