export const AWARDS_PHASES = [
  "nomination_phase",
  "voting_phase",
  "judging_phase",
  "results_phase",
] as const;

export type AwardsPhase = (typeof AWARDS_PHASES)[number];

export type PrimaryNavCta = {
  href: string;
  /** Key under the `Navbar` next-intl namespace */
  labelKey: "nominateNow" | "voteNow" | "seeWinners";
};

const DEFAULT_PHASE: AwardsPhase = "results_phase";

function isAwardsPhase(value: string): value is AwardsPhase {
  return (AWARDS_PHASES as readonly string[]).includes(value);
}

/** Global awards program phase from `NEXT_PUBLIC_AWARDS_PHASE`. */
export function getAwardsPhase(): AwardsPhase {
  const raw = process.env.NEXT_PUBLIC_AWARDS_PHASE?.trim();
  if (raw && isAwardsPhase(raw)) {
    return raw;
  }
  return DEFAULT_PHASE;
}

export function isAwardsPhaseEqual(phase: AwardsPhase): boolean {
  return getAwardsPhase() === phase;
}

/** Primary navbar CTA href + label key for the current (or given) phase. */
export function getPrimaryNavCta(phase: AwardsPhase = getAwardsPhase()): PrimaryNavCta {
  switch (phase) {
    case "nomination_phase":
      return { href: "/nominate", labelKey: "nominateNow" };
    case "voting_phase":
      return { href: "/vote", labelKey: "voteNow" };
    case "judging_phase":
      return { href: "/vote", labelKey: "voteNow" };
    case "results_phase":
      return { href: "/winners", labelKey: "seeWinners" };
  }
}
