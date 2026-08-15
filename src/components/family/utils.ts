import { FamilyMember, PrefilledRelation, Gender, RelationshipType } from "@/types";

export type { FamilyMember, PrefilledRelation, Gender, RelationshipType };

/**
 * Computes all descendants recursively for a given member in O(N) using pre-built lookup maps.
 */
export function getDescendants(memberId: string, existingMembers: FamilyMember[]): Set<string> {
  const childrenMap = new Map<string, string[]>();
  for (const member of existingMembers) {
    if (member.fatherId) {
      const list = childrenMap.get(member.fatherId) || [];
      list.push(member.id);
      childrenMap.set(member.fatherId, list);
    }
    if (member.motherId) {
      const list = childrenMap.get(member.motherId) || [];
      list.push(member.id);
      childrenMap.set(member.motherId, list);
    }
  }

  const descendants = new Set<string>();
  const queue = [memberId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = childrenMap.get(currentId) || [];
    for (const childId of children) {
      if (!descendants.has(childId)) {
        descendants.add(childId);
        queue.push(childId);
      }
    }
  }
  return descendants;
}

/**
 * Computes all ancestors recursively for a given member in O(N) using pre-built lookup maps.
 */
export function getAncestors(memberId: string, existingMembers: FamilyMember[]): Set<string> {
  const memberMap = new Map<string, FamilyMember>(
    existingMembers.map((m) => [m.id, m])
  );

  const ancestors = new Set<string>();
  const queue = [memberId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const member = memberMap.get(currentId);
    if (member) {
      if (member.fatherId && !ancestors.has(member.fatherId)) {
        ancestors.add(member.fatherId);
        queue.push(member.fatherId);
      }
      if (member.motherId && !ancestors.has(member.motherId)) {
        ancestors.add(member.motherId);
        queue.push(member.motherId);
      }
    }
  }
  return ancestors;
}

/**
 * Generates a collision-safe unique name slug.
 */
export function generateUniqueSlug(name: string, existingIds: Set<string>): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug;
  let counter = 1;
  while (existingIds.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

/**
 * Extracts a 4-digit calendar year from various date string formats
 * (e.g., "1997-05-12", "12/05/1997", "May 1997", "1997", "c. 1997").
 */
export function extractYear(dateStr?: string): string | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const match = dateStr.match(/\b(1[6-9]|20)\d{2}\b/);
  return match ? match[0] : null;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Formats a raw date string into natural Indian / standard display format (e.g. "27 December 1997").
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr || typeof dateStr !== "string") return "";
  const trimmed = dateStr.trim();

  // Pattern 1: YYYY-MM-DD (ISO format)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIndex = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${MONTH_NAMES[monthIndex]} ${year}`;
    }
  }

  // Pattern 2: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthIndex = parseInt(dmyMatch[2], 10) - 1;
    const year = dmyMatch[3];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${MONTH_NAMES[monthIndex]} ${year}`;
    }
  }

  // Pattern 3: Year only (e.g., "1997")
  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Fallback: parse standard date if valid
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const day = parsed.getDate();
    const month = MONTH_NAMES[parsed.getMonth()];
    const year = parsed.getFullYear();
    return `${day} ${month} ${year}`;
  }

  return trimmed;
}

/**
 * Formats a lifespan string like "(1940 — 2012)" or "(1995 — Present)" or ""
 */
export function formatLifespan(birthDate?: string, deathDate?: string): string {
  const birthYear = extractYear(birthDate);
  const deathYear = extractYear(deathDate);

  if (!birthYear && !deathYear) return "";
  if (birthYear && deathYear) return `(${birthYear} — ${deathYear})`;
  if (birthYear && !deathYear) return `(${birthYear} — Present)`;
  return `(? — ${deathYear})`;
}

export interface AgeInfo {
  years: number;
  months: number;
  formatted: string;
  isDeceased: boolean;
}

/**
 * Calculates current age or age at passing with exact years and months.
 */
export function calculateAge(birthDateStr?: string, deathDateStr?: string): AgeInfo | null {
  if (!birthDateStr) return null;
  const bYear = extractYear(birthDateStr);
  if (!bYear) return null;
  const birthYear = parseInt(bYear, 10);
  if (isNaN(birthYear)) return null;

  // Check if parseable full calendar date
  const hasFullDate = birthDateStr.includes("-") || birthDateStr.includes("/");
  const birthDate = new Date(birthDateStr);
  const isValidBirthDate = !isNaN(birthDate.getTime()) && hasFullDate;

  const endDate = deathDateStr ? new Date(deathDateStr) : new Date();
  const isValidEndDate = !isNaN(endDate.getTime());
  const isDeceased = Boolean(deathDateStr);

  let years = 0;
  let months = 0;

  if (isValidBirthDate && isValidEndDate) {
    years = endDate.getFullYear() - birthDate.getFullYear();
    months = endDate.getMonth() - birthDate.getMonth();
    const days = endDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    years = Math.max(0, years);
    months = Math.max(0, months);
  } else {
    // Year-only fallback
    const endYear =
      deathDateStr && extractYear(deathDateStr)
        ? parseInt(extractYear(deathDateStr)!, 10)
        : new Date().getFullYear();
    years = Math.max(0, endYear - birthYear);
    months = 0;
  }

  // Format string
  let formatted = "";
  if (years > 0 && months > 0) {
    formatted = `${years} yrs, ${months} ${months === 1 ? "mo" : "mos"}`;
  } else if (years > 0) {
    formatted = `${years} years old`;
  } else {
    formatted = `${months} ${months === 1 ? "month" : "months"} old`;
  }

  if (isDeceased) {
    formatted = `${formatted} at passing`;
  }

  return {
    years,
    months,
    formatted,
    isDeceased,
  };
}
