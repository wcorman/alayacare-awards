import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const DEFAULT_LOCALE = "en";

const normalizeLocale = (value: string | undefined) => {
  if (!value) return DEFAULT_LOCALE;
  const lower = value.toLowerCase();
  return lower.startsWith("fr") ? "fr" : DEFAULT_LOCALE;
};

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const headerLocale = headerStore.get("accept-language")?.split(",")[0];

  // Auto French for Quebec visitors (no cookie = first visit or no explicit choice)
  const country = headerStore.get("x-vercel-ip-country") ?? "";
  const region = headerStore.get("x-vercel-ip-country-region") ?? "";
  const isQuebec = country === "CA" && region === "QC";
  const quebecLocale = !cookieLocale && isQuebec ? "fr" : undefined;

  const locale = normalizeLocale(cookieLocale ?? quebecLocale ?? headerLocale);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
