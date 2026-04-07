import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { pathWithNomineeLang } from "@/lib/nomineeLocaleLink";

/**
 * When a nomination record specifies English or French, align the site locale via
 * the existing middleware (?lang=) cookie flow for visitors who have not chosen
 * a locale yet. Root layout resolves locale before child pages render, so a
 * redirect is required on first load.
 */
export async function redirectIfNomineeLocaleMismatch(
    preference: "en" | "fr" | null,
    pathWithQuery: string
): Promise<void> {
    if (preference == null) return;
    const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
    if (cookieLocale === "en" || cookieLocale === "fr") return;
    const locale = await getLocale();
    if (locale === preference) return;
    redirect(pathWithNomineeLang(pathWithQuery, preference));
}
