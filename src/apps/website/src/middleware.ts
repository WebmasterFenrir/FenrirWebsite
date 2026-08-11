import { defineMiddleware } from "astro:middleware";
import {
  LOCALE_COOKIE,
  detectLocaleFromAcceptLanguage,
  isSupportedLocale,
  resolveLanguageRouting,
} from "./i18n/locale-router";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Assets, internal routes and other non-HTML requests must never be redirected. */
function isLanguageRoutable(pathname: string): boolean {
  if (pathname.startsWith("/_")) return false; // /_astro/* bundles, /_image, ...
  return !/\.[a-z0-9]+$/i.test(pathname); // skip anything with a file extension
}

export const onRequest = defineMiddleware((context, next) => {
  const { request } = context;
  if (request.method !== "GET") return next();

  const url = new URL(request.url);
  if (!isLanguageRoutable(url.pathname)) return next();

  // Locale derived from the first URL segment (e.g. "/en/..." → "en").
  const [, firstSegment] = url.pathname.split("/");
  const urlLocale = isSupportedLocale(firstSegment) ? firstSegment : undefined;

  const cookieValue = context.cookies.get(LOCALE_COOKIE)?.value;
  const cookieLocale = isSupportedLocale(cookieValue) ? cookieValue : undefined;

  // Astro's preferredLocale only matches exact codes ("en-US,en;q=0.9" → "en",
  // but a bare "en-US" matches nothing) — fall back to a prefix match.
  const browserLocale =
    (isSupportedLocale(context.preferredLocale) ? context.preferredLocale : undefined) ??
    detectLocaleFromAcceptLanguage(context.request.headers.get("accept-language"));

  const { redirect, cookie } = resolveLanguageRouting({
    pathname: url.pathname,
    langParam: url.searchParams.get("lang"),
    urlLocale,
    cookieLocale,
    preferredLocale: browserLocale,
  });

  // Remember the decision (only sends a Set-Cookie when it actually changed).
  if (cookieLocale !== cookie) {
    context.cookies.set(LOCALE_COOKIE, cookie, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  if (redirect) {
    return context.redirect(redirect, 302);
  }
  return next();
});
