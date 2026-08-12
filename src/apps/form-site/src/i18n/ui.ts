/**
 * Form-site chrome strings (NL source of truth + EN mirror).
 * These are the fixed UI strings around the form itself; the form's own
 * labels come from the form definition (label / label_en).
 */

export const languages = {
  nl: 'Nederlands',
  en: 'English',
} as const;

export type Locale = keyof typeof languages;

export const defaultLang: Locale = 'nl';

const nl = {
  'submit': 'Verzenden',
  'submitting': 'Verzenden…',
  'required': 'verplicht',
  'languageLabel': 'Taal',
  'successTitle': 'Bedankt!',
  'successText': 'Je antwoorden werden succesvol verzonden.',
  'successAgain': 'Nieuw antwoord indienen',
  'closedTitle': 'Dit formulier is gesloten',
  'closedText': 'Dit formulier aanvaardt geen nieuwe antwoorden meer.',
  'notFoundTitle': 'Ongeldige link',
  'notFoundText':
    'Dit formulier werd niet gevonden. De link is mogelijk fout of verlopen.',
  'backToSite': 'Terug naar fenrirclub.be',
  'errorRequired': 'Dit veld is verplicht.',
  'errorEmail': 'Geef een geldig e-mailadres in.',
  'errorNumber': 'Geef een geldig getal in.',
  'errorDate': 'Geef een geldige datum in.',
  'errorOption': 'Kies een geldige optie.',
  'submitFailed': 'Er ging iets mis bij het verzenden. Probeer opnieuw.',
} as const;

export type UiKey = keyof typeof nl;
export type Ui = Record<UiKey, string>;

const en: Ui = {
  'submit': 'Submit',
  'submitting': 'Submitting…',
  'required': 'required',
  'languageLabel': 'Language',
  'successTitle': 'Thank you!',
  'successText': 'Your answers were submitted successfully.',
  'successAgain': 'Submit another response',
  'closedTitle': 'This form is closed',
  'closedText': 'This form no longer accepts new responses.',
  'notFoundTitle': 'Invalid link',
  'notFoundText':
    'This form was not found. The link may be incorrect or expired.',
  'backToSite': 'Back to fenrirclub.be',
  'errorRequired': 'This field is required.',
  'errorEmail': 'Please enter a valid email address.',
  'errorNumber': 'Please enter a valid number.',
  'errorDate': 'Please enter a valid date.',
  'errorOption': 'Please choose a valid option.',
  'submitFailed': 'Something went wrong while submitting. Please try again.',
};

export const ui: Record<Locale, Ui> = { nl, en };

/** Normalize a raw locale string to a known locale (falls back to Dutch). */
export function pickLocale(code: string | null | undefined): Locale {
  return code === 'en' || code === 'nl' ? code : defaultLang;
}
