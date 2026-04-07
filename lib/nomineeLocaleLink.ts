/** Appends `lang=` for middleware to set NEXT_LOCALE (see middleware.ts). */
export function pathWithNomineeLang(
    pathWithQuery: string,
    lang: "en" | "fr"
): string {
    const joiner = pathWithQuery.includes("?") ? "&" : "?";
    return `${pathWithQuery}${joiner}lang=${lang}`;
}

/**
 * Nominee detail links intentionally do not force `?lang=`. Automatic locale
 * alignment happens server-side only for visitors without an explicit locale
 * cookie, so manual language switches are respected.
 */
export function nomineeDetailPath(nominee: { id: string }): string {
    return `/nominees/${nominee.id}`;
}
