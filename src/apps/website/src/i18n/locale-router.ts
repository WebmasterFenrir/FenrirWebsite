import { defaultLang, isSupportedLocale, SUPPORTED_LOCALES, type Locale } from "./ui";
import { localizePathname } from "./utils";

export { isSupportedLocale, SUPPORTED_LOCALES };

/** Cookie that remembers the visitor's language choice. */
export const LOCALE_COOKIE = "fenrir_lang";

/**
 * Fallback detection from the raw Accept-Language header, matching on the
 * language subtag prefix ("en-US" → "en", "nl-BE" → "nl"). Used when
 * Astro's `preferredLocale` finds no exact match, e.g. a browser sending only
 * "en-US" without the bare "en" fallback entry.
 */
export function detectLocaleFromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  const entries = header
    .split(",")
    .map((part) => {
      const [lang, quality] = part.trim().split(";");
      const q = quality ? Number.parseFloat(quality.replace(/^q=/, "")) : 1;
      return { lang: lang.trim().toLowerCase(), q: Number.isNaN(q) ? 0 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of entries) {
    if (lang === "*") continue;
    const base = lang.split("-")[0];
    if (isSupportedLocale(base)) return base;
  }
  return undefined;
}

export interface LanguageRoutingInput {
  /** URL pathname without query string (e.g. "/over-ons"). */
  pathname: string;
  /** Value of the `?lang=` query param, if present. */
  langParam: string | null;
  /** Locale derived from the URL prefix (e.g. "/en/..." → "en"). */
  urlLocale: Locale | undefined;
  /** Locale stored in the fenrir_lang cookie. */
  cookieLocale: Locale | undefined;
  /** Browser preference matched against the supported locales. */
  preferredLocale: Locale | undefined;
}

export interface LanguageRoutingResult {
  /** The locale the visitor should be associated with (written to the cookie). */
  cookie: Locale;
  /**
   * Path to redirect to, or null to serve the requested page as-is.
   * A non-null redirect also strips the `?lang` param from the URL.
   */
  redirect: string | null;
}

/**
 * Decide which language the visitor should see and where (if anywhere) to
 * redirect. Priority: explicit `?lang=` choice > locale in the URL > saved
 * cookie > browser preference > default locale.
 */
export function resolveLanguageRouting(input: LanguageRoutingInput): LanguageRoutingResult {
  const { pathname, langParam, urlLocale, cookieLocale, preferredLocale } = input;

  // 1) In-the-moment choice from the language switcher (?lang=nl|en).
  //    Redirect to the clean localized URL so the param disappears.
  if (isSupportedLocale(langParam)) {
    return { redirect: localizePathname(pathname, langParam), cookie: langParam };
  }

  // 2) Visitor opened a localized URL directly (/en/...) → respect it.
  if (urlLocale) {
    return { redirect: null, cookie: urlLocale };
  }

  // 3) No explicit signal: remembered choice wins, then the browser
  //    preference, then the default locale.
  const target = cookieLocale ?? preferredLocale ?? defaultLang;
  if (target === "en") {
    return { redirect: `/en${pathname === "/" ? "" : pathname}`, cookie: "en" };
  }
  return { redirect: null, cookie: "nl" };
}
