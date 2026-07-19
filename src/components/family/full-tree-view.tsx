"use client";

import React, { useMemo } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { FamilyMember } from "./utils";

interface FullTreeViewProps {
  familyData: FamilyMember[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
}

export function FullTreeView({ familyData, activeMemberId, onSelectMember }: FullTreeViewProps) {
  // Index family members by ID for fast lookup access
  const memberMap = useMemo(() => {
    return new Map(familyData.map((member) => [member.id, member]));
  }, [familyData]);

  // Retrieve the active family member
  const activeMember = useMemo(() => {
    return memberMap.get(activeMemberId);
  }, [memberMap, activeMemberId]);

  // Helper to extract birth year for chronological sorting
  const getBirthYear = (member: FamilyMember): number => {
    if (!member.birthDate) return Infinity;
    const year = parseInt(member.birthDate.split("-")[0], 10);
    return isNaN(year) ? Infinity : year;
  };

  /**
   * Component: MemberNodeCard
   * Renders a single family member card with color-coded side borders and lifespan details.
   */
  const MemberNodeCard = ({
    member,
    isCurrentFocus = false,
    isDeemphasized = false,
  }: {
    member: FamilyMember;
    isCurrentFocus?: boolean;
    isDeemphasized?: boolean;
  }) => {
    const isFemale = member.gender === "female";
    const lifespan =
      member.birthDate || member.deathDate
        ? `(${member.birthDate?.split("-")[0] || "?"} — ${
            member.deathDate?.split("-")[0] || (member.birthDate ? "Present" : "?")
          })`
        : "";

    return (
      <div
        onClick={() => onSelectMember(member.id)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-xl bg-white hover:border-indigo-400 cursor-pointer shadow-sm hover:shadow transition-all duration-150 select-none min-w-[130px] max-w-[170px] shrink-0 border-l-4 ${
          isCurrentFocus
            ? "border-l-indigo-600 border-indigo-600 bg-indigo-50/10 ring-2 ring-indigo-500/20"
            : isFemale
            ? "border-l-pink-400 border-slate-200"
            : "border-l-indigo-400 border-slate-200"
        } ${isDeemphasized ? "opacity-70 hover:opacity-100" : ""}`}
        title={isCurrentFocus ? "Currently Focused Member" : "Click to view family tree centered on this member"}
      >
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            isCurrentFocus
              ? "bg-indigo-600 text-white"
              : isFemale
              ? "bg-pink-50 text-pink-600"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {member.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className={`text-[11px] font-bold leading-tight truncate ${isCurrentFocus ? "text-indigo-900" : "text-slate-900"}`}>
            {member.name}
          </p>
          {lifespan && <p className="text-[8px] text-slate-400 font-semibold">{lifespan}</p>}
        </div>
      </div>
    );
  };

  // 1. Resolve Parents with self-healing spouse lookup fallback
  const father = useMemo(() => {
    if (!activeMember) return null;
    let resolvedFather = activeMember.fatherId ? memberMap.get(activeMember.fatherId) || null : null;
    const resolvedMother = activeMember.motherId ? memberMap.get(activeMember.motherId) || null : null;
    if (!resolvedFather && resolvedMother && resolvedMother.spouseId) {
      resolvedFather = memberMap.get(resolvedMother.spouseId) || null;
    }
    return resolvedFather;
  }, [activeMember, memberMap]);

  const mother = useMemo(() => {
    if (!activeMember) return null;
    let resolvedMother = activeMember.motherId ? memberMap.get(activeMember.motherId) || null : null;
    const resolvedFather = activeMember.fatherId ? memberMap.get(activeMember.fatherId) || null : null;
    if (!resolvedMother && resolvedFather && resolvedFather.spouseId) {
      resolvedMother = memberMap.get(resolvedFather.spouseId) || null;
    }
    return resolvedMother;
  }, [activeMember, memberMap]);

  const hasParents = father || mother;

  // 2. Resolve Paternal Grandparents with self-healing fallback
  const paternalGrandfather = useMemo(() => {
    if (!father) return null;
    let gf = father.fatherId ? memberMap.get(father.fatherId) || null : null;
    const gm = father.motherId ? memberMap.get(father.motherId) || null : null;
    if (!gf && gm && gm.spouseId) {
      gf = memberMap.get(gm.spouseId) || null;
    }
    return gf;
  }, [father, memberMap]);

  const paternalGrandmother = useMemo(() => {
    if (!father) return null;
    let gm = father.motherId ? memberMap.get(father.motherId) || null : null;
    const gf = father.fatherId ? memberMap.get(father.fatherId) || null : null;
    if (!gm && gf && gf.spouseId) {
      gm = memberMap.get(gf.spouseId) || null;
    }
    return gm;
  }, [father, memberMap]);

  // 3. Resolve Maternal Grandparents with self-healing fallback
  const maternalGrandfather = useMemo(() => {
    if (!mother) return null;
    let gf = mother.fatherId ? memberMap.get(mother.fatherId) || null : null;
    const gm = mother.motherId ? memberMap.get(mother.motherId) || null : null;
    if (!gf && gm && gm.spouseId) {
      gf = memberMap.get(gm.spouseId) || null;
    }
    return gf;
  }, [mother, memberMap]);

  const maternalGrandmother = useMemo(() => {
    if (!mother) return null;
    let gm = mother.motherId ? memberMap.get(mother.motherId) || null : null;
    const gf = mother.fatherId ? memberMap.get(mother.fatherId) || null : null;
    if (!gm && gf && gf.spouseId) {
      gm = memberMap.get(gf.spouseId) || null;
    }
    return gm;
  }, [mother, memberMap]);

  const hasGrandparents = paternalGrandfather || paternalGrandmother || maternalGrandfather || maternalGrandmother;

  // 4. Resolve Active Member's Siblings (Level 0)
  // Combines parent object check + direct fatherId/motherId mapping for robust lookup
  const siblings = useMemo(() => {
    if (!activeMember) return [];

    const siblingIdSet = new Set<string>();
    siblingIdSet.add(activeMember.id);

    // Method 1: Children of resolved parents
    if (father) {
      familyData.forEach((member) => {
        if (member.fatherId === father.id || member.motherId === father.id) siblingIdSet.add(member.id);
      });
    }
    if (mother) {
      familyData.forEach((member) => {
        if (member.fatherId === mother.id || member.motherId === mother.id) siblingIdSet.add(member.id);
      });
    }

    // Method 2: Direct matching (catches siblings sharing parent IDs directly)
    if (activeMember.fatherId) {
      familyData.forEach((member) => {
        if (member.fatherId === activeMember.fatherId) siblingIdSet.add(member.id);
      });
    }
    if (activeMember.motherId) {
      familyData.forEach((member) => {
        if (member.motherId === activeMember.motherId) siblingIdSet.add(member.id);
      });
    }

    const result = familyData.filter((member) => siblingIdSet.has(member.id));

    return result.sort((a, b) => {
      const yearA = getBirthYear(a);
      const yearB = getBirthYear(b);
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
  }, [activeMember, father, mother, familyData]);

  // 5. Resolve Father's Siblings (Paternal Uncles & Aunts)
  const fatherSiblings = useMemo(() => {
    if (!father) return [];
    const siblingIdSet = new Set<string>();
    siblingIdSet.add(father.id);
    if (paternalGrandfather) {
      familyData.forEach((member) => {
        if (member.fatherId === paternalGrandfather.id || member.motherId === paternalGrandfather.id) siblingIdSet.add(member.id);
      });
    }
    if (paternalGrandmother) {
      familyData.forEach((member) => {
        if (member.fatherId === paternalGrandmother.id || member.motherId === paternalGrandmother.id) siblingIdSet.add(member.id);
      });
    }
    if (father.fatherId) {
      familyData.forEach((member) => {
        if (member.fatherId === father.fatherId) siblingIdSet.add(member.id);
      });
    }
    if (father.motherId) {
      familyData.forEach((member) => {
        if (member.motherId === father.motherId) siblingIdSet.add(member.id);
      });
    }
    return familyData
      .filter((member) => siblingIdSet.has(member.id))
      .sort((a, b) => {
        const yearA = getBirthYear(a);
        const yearB = getBirthYear(b);
        return yearA !== yearB ? yearA - yearB : a.name.localeCompare(b.name);
      });
  }, [father, paternalGrandfather, paternalGrandmother, familyData]);

  // Helper to render grandparent couple cards
  const renderGrandparentsCouple = (gFather: FamilyMember | null, gMother: FamilyMember | null) => {
    if (!gFather && !gMother) return <div className="min-w-[130px]" />;

    return (
      <div className="flex items-center gap-1.5 bg-slate-50/50 p-2 rounded-2xl border border-slate-200/40 shadow-sm z-10 shrink-0">
        {gFather && <MemberNodeCard member={gFather} isCurrentFocus={gFather.id === activeMemberId} />}
        {gFather && gMother && (
          <div className="w-4 h-0.5 bg-slate-350 shrink-0 border-t border-dashed border-slate-400" />
        )}
        {gMother && <MemberNodeCard member={gMother} isCurrentFocus={gMother.id === activeMemberId} />}
      </div>
    );
  };

  /**
   * Helper: renderDescendantsTier
   * Renders the descendants (children and optionally grandchildren) of a given family member.
   * - isCollateral = true: renders children as a de-emphasized branch with no grandchildren expansion.
   * - isCollateral = false: renders children with full styling, and expands grandchildren.
   */
  const renderDescendantsTier = (parentMember: FamilyMember, isCollateral: boolean) => {
    const children = familyData
      .filter((child) => child.fatherId === parentMember.id || child.motherId === parentMember.id)
      .sort((a, b) => {
        const yearA = getBirthYear(a);
        const yearB = getBirthYear(b);
        if (yearA !== yearB) return yearA - yearB;
        return a.name.localeCompare(b.name);
      });

    if (children.length === 0) return null;

    const connectorBorderClass = isCollateral ? "border-dashed border-slate-300/70" : "border-slate-300";
    const connectorBgClass = isCollateral ? "bg-slate-300/50" : "bg-slate-300";

    return (
      <div className="flex flex-col items-center w-full mt-0.5 z-0">
        {/* Vertical connector line */}
        <div className={`w-0.5 h-4 ${connectorBgClass} z-0`} />

        <div className="flex flex-row justify-center items-start gap-8 relative pt-4">
          {children.map((child, index) => {
            const spouse = child.spouseId ? memberMap.get(child.spouseId) || null : null;

            // Only retrieve grandchildren for the focus member's direct lineage
            const grandchildren = !isCollateral
              ? familyData
                  .filter((grandchild) => grandchild.fatherId === child.id || grandchild.motherId === child.id)
                  .sort((a, b) => {
                    const yearA = getBirthYear(a);
                    const yearB = getBirthYear(b);
                    if (yearA !== yearB) return yearA - yearB;
                    return a.name.localeCompare(b.name);
                  })
              : [];

            return (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Horizontal connection line for sibling nodes */}
                {children.length > 1 && (
                  <div className="absolute top-0 left-0 right-0 flex z-0">
                    <div className={`w-1/2 h-0.5 border-t ${connectorBorderClass} ${index === 0 ? "invisible" : ""}`} />
                    <div className={`w-1/2 h-0.5 border-t ${connectorBorderClass} ${index === children.length - 1 ? "invisible" : ""}`} />
                  </div>
                )}
                {/* Vertical connector line */}
                <div className={`w-0.5 h-4 ${connectorBgClass} pointer-events-none mb-1 z-0`} />

                {/* Sibling Couple / Single Card */}
                <div className={`flex items-center gap-1.5 p-2 rounded-2xl border shadow-sm z-10 shrink-0 ${
                  isCollateral
                    ? "border-slate-200/30 bg-slate-50/30"
                    : "border-slate-200/40 bg-slate-50/50"
                }`}>
                  <MemberNodeCard member={child} isCurrentFocus={child.id === activeMemberId} isDeemphasized={isCollateral} />
                  {spouse && (
                    <>
                      <div className={`w-4 h-0.5 shrink-0 border-t ${isCollateral ? "border-dashed border-slate-300/50" : "border-dashed border-slate-400"}`} />
                      <MemberNodeCard member={spouse} isCurrentFocus={spouse.id === activeMemberId} isDeemphasized={isCollateral} />
                    </>
                  )}
                </div>

                {/* Grandchildren Tier (Direct active branch only) */}
                {!isCollateral && grandchildren.length > 0 && (
                  <div className="flex flex-col items-center w-full mt-0.5 z-0">
                    <div className="w-0.5 h-4 bg-slate-300 z-0" />

                    <div className="flex flex-row justify-center items-start gap-8 relative pt-4">
                      {grandchildren.map((grandchild, grandchildIndex) => (
                        <div key={grandchild.id} className="relative flex flex-col items-center">
                          {grandchildren.length > 1 && (
                            <div className="absolute top-0 left-0 right-0 flex z-0">
                              <div className={`w-1/2 h-0.5 border-t border-slate-300 ${grandchildIndex === 0 ? "invisible" : ""}`} />
                              <div className={`w-1/2 h-0.5 border-t border-slate-300 ${grandchildIndex === grandchildren.length - 1 ? "invisible" : ""}`} />
                            </div>
                          )}
                          <div className="w-0.5 h-4 bg-slate-300 pointer-events-none mb-1 z-0" />
                          <MemberNodeCard member={grandchild} isCurrentFocus={grandchild.id === activeMemberId} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card
      className="p-6 border border-slate-200/50 bg-white/75 backdrop-blur-md shadow-xl rounded-3xl w-full mx-auto min-h-[500px] overflow-x-auto"
      placeholder={undefined}
    >
      <div className="space-y-6 select-none">
        <div className="border-b border-slate-100 pb-3">
          <Typography variant="h6" className="text-slate-800 font-bold font-heading" placeholder={undefined}>
            Interactive Family Tree Explorer
          </Typography>
          <Typography className="text-[11px] text-slate-400 font-semibold mt-0.5" placeholder={undefined}>
            An interactive explorer showing ancestors, siblings, spouses, children, and grandchildren centered around the active family member.
          </Typography>
        </div>

        {activeMember ? (
          <div className="py-8 w-full">
            <div className="inline-flex flex-col items-center min-w-full px-4">
              
              {/* Generation -2: Grandparents */}
              {hasGrandparents && (
                <div className="flex flex-row justify-center gap-24 relative pb-4 z-0">
                  {/* Paternal Grandparents */}
                  <div className="flex flex-col items-center">
                    {renderGrandparentsCouple(paternalGrandfather, paternalGrandmother)}
                    {(paternalGrandfather || paternalGrandmother) && father && <div className="w-0.5 h-4 bg-slate-300 z-0" />}
                  </div>

                  {/* Maternal Grandparents */}
                  <div className="flex flex-col items-center">
                    {renderGrandparentsCouple(maternalGrandfather, maternalGrandmother)}
                    {(maternalGrandfather || maternalGrandmother) && mother && <div className="w-0.5 h-4 bg-slate-300 z-0" />}
                  </div>
                </div>
              )}

              {/* Generation -1 & 0: Parent with Paternal Uncles/Aunts & Children */}
              {hasParents && father ? (
                <div className="flex flex-row justify-center items-start gap-12 relative pt-4">
                  {fatherSiblings.map((sib, index) => {
                    const spouse = sib.id === father.id ? mother : (sib.spouseId ? memberMap.get(sib.spouseId) || null : null);
                    const isFatherNode = sib.id === father.id;

                    return (
                      <div key={sib.id} className="relative flex flex-col items-center">
                        {/* Horizontal connection line for father's siblings */}
                        {fatherSiblings.length > 1 && (
                          <div className="absolute top-0 left-0 right-0 flex z-0">
                            <div className={`w-1/2 h-0.5 border-t border-slate-300 ${index === 0 ? "invisible" : ""}`} />
                            <div className={`w-1/2 h-0.5 border-t border-slate-300 ${index === fatherSiblings.length - 1 ? "invisible" : ""}`} />
                          </div>
                        )}
                        <div className="w-0.5 h-4 bg-slate-300 pointer-events-none mb-1 z-0" />

                        {/* Card Unit */}
                        <div className={`flex items-center gap-1.5 p-2 rounded-2xl border shadow-sm z-10 shrink-0 ${
                          isFatherNode
                            ? "bg-indigo-50/30 border-indigo-200 ring-2 ring-indigo-500/10 shadow"
                            : "bg-slate-50/50 border-slate-200/40"
                        }`}>
                          <MemberNodeCard member={sib} isCurrentFocus={sib.id === activeMemberId} isDeemphasized={!isFatherNode} />
                          {spouse && (
                            <>
                              <div className="w-4 h-0.5 bg-slate-350 shrink-0 border-t border-dashed border-slate-400" />
                              <MemberNodeCard member={spouse} isCurrentFocus={spouse.id === activeMemberId} isDeemphasized={!isFatherNode} />
                            </>
                          )}
                        </div>

                        {/* Descendants Tier:
                            - For Father: renders your sibling row (you + siblings), which then expands to Level +1 and +2.
                            - For Father's siblings: renders cousins de-emphasized.
                        */}
                        {isFatherNode ? (
                          <div className="flex flex-col items-center w-full mt-0.5 z-0">
                            <div className="w-0.5 h-4 bg-slate-300 z-0" />
                            <div className="flex flex-row justify-center items-start gap-12 relative pt-4">
                              {siblings.map((sibling, siblingIndex) => {
                                const siblingSpouse = sibling.spouseId ? memberMap.get(sibling.spouseId) || null : null;
                                const isFocus = sibling.id === activeMemberId;

                                return (
                                  <div key={sibling.id} className="relative flex flex-col items-center">
                                    {siblings.length > 1 && (
                                      <div className="absolute top-0 left-0 right-0 flex z-0">
                                        <div className={`w-1/2 h-0.5 border-t border-slate-300 ${siblingIndex === 0 ? "invisible" : ""}`} />
                                        <div className={`w-1/2 h-0.5 border-t border-slate-300 ${siblingIndex === siblings.length - 1 ? "invisible" : ""}`} />
                                      </div>
                                    )}
                                    <div className="w-0.5 h-4 bg-slate-300 pointer-events-none mb-1 z-0" />
                                    <div className={`flex items-center gap-1.5 p-2 rounded-2xl border shadow-sm z-10 shrink-0 ${
                                      isFocus
                                        ? "bg-indigo-50/30 border-indigo-200 ring-2 ring-indigo-500/10 shadow"
                                        : "bg-slate-50/50 border-slate-200/40"
                                    }`}>
                                      <MemberNodeCard member={sibling} isCurrentFocus={isFocus} />
                                      {siblingSpouse && (
                                        <>
                                          <div className="w-4 h-0.5 bg-slate-350 shrink-0 border-t border-dashed border-slate-400" />
                                          <MemberNodeCard member={siblingSpouse} isCurrentFocus={siblingSpouse.id === activeMemberId} />
                                        </>
                                      )}
                                    </div>
                                    {renderDescendantsTier(sibling, !isFocus)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          renderDescendantsTier(sib, true)
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback Level 0 Sibling Row when parents do not exist */
                <div className="flex flex-row justify-center items-start gap-12 relative pt-4">
                  {siblings.map((sibling, index) => {
                    const spouse = sibling.spouseId ? memberMap.get(sibling.spouseId) || null : null;
                    const isFocus = sibling.id === activeMemberId;

                    return (
                      <div key={sibling.id} className="relative flex flex-col items-center">
                        {siblings.length > 1 && (
                          <div className="absolute top-0 left-0 right-0 flex z-0">
                            <div className={`w-1/2 h-0.5 border-t border-slate-300 ${index === 0 ? "invisible" : ""}`} />
                            <div className={`w-1/2 h-0.5 border-t border-slate-300 ${index === siblings.length - 1 ? "invisible" : ""}`} />
                          </div>
                        )}
                        <div className="w-0.5 h-4 bg-slate-300 pointer-events-none mb-1 z-0" />

                        <div className={`flex items-center gap-1.5 p-2 rounded-2xl border shadow-sm z-10 shrink-0 ${
                          isFocus
                            ? "bg-indigo-50/30 border-indigo-200 ring-2 ring-indigo-500/10 shadow"
                            : "bg-slate-50/50 border-slate-200/40"
                        }`}>
                          <MemberNodeCard member={sibling} isCurrentFocus={isFocus} />
                          {spouse && (
                            <>
                              <div className="w-4 h-0.5 bg-slate-350 shrink-0 border-t border-dashed border-slate-400" />
                              <MemberNodeCard member={spouse} isCurrentFocus={spouse.id === activeMemberId} />
                            </>
                          )}
                        </div>

                        {renderDescendantsTier(sibling, !isFocus)}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        ) : (
          <Typography className="text-sm text-slate-400 font-medium text-center py-10" placeholder={undefined}>
            No family members registered. Switch to Hourglass explorer to add the first member.
          </Typography>
        )}
      </div>
    </Card>
  );
}

export default FullTreeView;
