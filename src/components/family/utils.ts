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
