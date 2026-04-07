/** Appends `lang=` for middleware to set NEXT_LOCALE (see middleware.ts). */
export function pathWithNomineeLang(
    pathWithQuery: string,
    lang: "en" | "fr"
): string {
    const joiner = pathWithQuery.includes("?") ? "&" : "?";
    return `${pathWithQuery}${joiner}lang=${lang}`;
}

/** `/nominees/[id]` with optional `?lang=` from Airtable "English or French". */
export function nomineeDetailPath(nominee: {
    id: string;
    languagePreference: "en" | "fr" | null;
}): string {
    if (!nominee.languagePreference) {
        return `/nominees/${nominee.id}`;
    }
    return pathWithNomineeLang(`/nominees/${nominee.id}`, nominee.languagePreference);
}
