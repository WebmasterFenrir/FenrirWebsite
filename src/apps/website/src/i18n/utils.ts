import { defaultLang, isSupportedLocale, showDefaultLang, type Locale } from "./ui";

/** Extract the locale from a URL pathname ("/en/...", "/en" → "en", otherwise default). */
export function getLangFromUrl(url: URL | string): Locale {
  const pathname = typeof url === "string" ? url : url.pathname;
  const [, lang] = pathname.split("/");
  return isSupportedLocale(lang) ? lang : defaultLang;
}

/** Locale-aware path, mirroring Astro's `prefixDefaultLocale` behaviour. */
export function useTranslatedPath(lang: Locale) {
  return function translatePath(path: string, l: Locale = lang): string {
    const cleanPath = path.replace(/^\//, "");
    if (l === defaultLang && !showDefaultLang) {
      return cleanPath === "" ? "/" : `/${cleanPath}`;
    }
    return `/${l}${cleanPath === "" ? "/" : `/${cleanPath}`}`;
  };
}

/** Swap the current pathname to another locale ("/activiteiten" → "/en/activiteiten"). */
export function localizePathname(pathname: string, targetLang: Locale): string {
  const translated = useTranslatedPath(targetLang);
  if (pathname === "/") {
    return translated("");
  }
  // strip an existing locale prefix (with or without trailing slash) before re-applying
  const withoutPrefix = pathname.replace(/^\/(nl|en)(\/|$)/, "/");
  const clean = withoutPrefix.replace(/^\/+/, "");
  return translated(clean);
}
