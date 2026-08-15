/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { FamilyMember, extractYear } from "./utils";

interface FullTreeViewProps {
  familyData: FamilyMember[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  onViewDetails?: (member: FamilyMember) => void;
}

export function FullTreeView({
  familyData,
  activeMemberId,
  onSelectMember,
  onViewDetails,
}: FullTreeViewProps) {
  const [zoom, setZoom] = useState<number>(1);

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
    const extracted = extractYear(member.birthDate);
    if (!extracted) return Infinity;
    const year = parseInt(extracted, 10);
    return isNaN(year) ? Infinity : year;
  };

  /**
   * Component: MemberNodeCard
   * Renders a single family member card with color-coded side borders.
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

    const getBorderClass = () => {
      if (isCurrentFocus) {
        return "border-l-indigo-600 border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/30 shadow-md";
      }
      if (isFemale) {
        return "border-l-rose-400 border-rose-200/80 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50/60";
      }
      return "border-l-indigo-400 border-indigo-200/80 bg-indigo-50/30 hover:border-indigo-400 hover:bg-indigo-50/60";
    };

    return (
      <div className="relative group">
        <div
          onClick={() => onSelectMember(member.id)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer shadow-xs hover:shadow transition-all duration-150 select-none min-w-[140px] max-w-[200px] shrink-0 border-l-4 ${getBorderClass()} ${
            isDeemphasized ? "opacity-75 hover:opacity-100" : ""
          }`}
          title={
            isCurrentFocus
              ? "Currently Focused Member"
              : `Click to center tree on ${member.name}`
          }
        >
          <div
            className={`h-7 w-7 rounded-xl overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0 border shadow-inner ${
              isCurrentFocus
                ? "bg-indigo-600 text-white border-indigo-600"
                : isFemale
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-indigo-50 text-indigo-600 border-indigo-200"
            }`}
          >
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            ) : (
              member.name.charAt(0)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-[11px] font-bold leading-snug whitespace-normal break-words ${
                isCurrentFocus ? "text-indigo-950 font-extrabold" : "text-slate-900"
              }`}
            >
              {member.name}
            </p>
          </div>

          {/* Quick Profile Details Button */}
          {onViewDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(member);
              }}
              className="no-export p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-white/80 transition-all opacity-0 group-hover:opacity-100 shrink-0"
              title={`View ${member.name}'s Profile Details`}
            >
              <InformationCircleIcon className="h-3.5 w-3.5" />
            </button>
          )}
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

  const hasParents = Boolean(father || mother);

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

  const hasGrandparents = Boolean(
    paternalGrandfather || paternalGrandmother || maternalGrandfather || maternalGrandmother
  );

  // 4. Resolve Active Member's Siblings (Level 0)
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
  const renderGrandparentsCouple = (
    gFather: FamilyMember | null,
    gMother: FamilyMember | null
  ) => {
    if (!gFather && !gMother) return null;

    return (
      <div className="flex items-center gap-2 bg-slate-50/90 p-2 rounded-2xl border border-slate-200/80 shadow-xs z-10 shrink-0">
        {gFather && (
          <MemberNodeCard
            member={gFather}
            isCurrentFocus={gFather.id === activeMemberId}
          />
        )}
        {gFather && gMother && (
          <div className="w-4 h-0.5 bg-gradient-to-r from-indigo-300 to-rose-300 shrink-0 rounded-full" />
        )}
        {gMother && (
          <MemberNodeCard
            member={gMother}
            isCurrentFocus={gMother.id === activeMemberId}
          />
        )}
      </div>
    );
  };

  /**
   * Helper: renderDescendantsTier
   * Recursively renders the descendants of a given family member down to maxDepthRemaining.
   */
  const renderDescendantsTier = (
    parentMember: FamilyMember,
    isCollateral: boolean,
    maxDepthRemaining: number = 2
  ): React.ReactNode => {
    if (maxDepthRemaining <= 0) return null;

    const parentSpouseId = parentMember.spouseId;
    const children = familyData
      .filter(
        (child) =>
          child.fatherId === parentMember.id ||
          child.motherId === parentMember.id ||
          (parentSpouseId &&
            (child.fatherId === parentSpouseId || child.motherId === parentSpouseId))
      )
      .sort((a, b) => {
        const yearA = getBirthYear(a);
        const yearB = getBirthYear(b);
        if (yearA !== yearB) return yearA - yearB;
        return a.name.localeCompare(b.name);
      });

    // If no children exist, render NOTHING below (no empty lines)
    if (children.length === 0) return null;

    const isSingle = children.length === 1;

    return (
      <div className="flex flex-col items-center w-full mt-1 z-0">
        {/* Branching stem from parent with dot */}
        <div className="flex flex-col items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white shadow-xs" />
          <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-300 to-indigo-200" />
        </div>

        {/* Children Row with Continuous Seamless Crossbar */}
        <div className="flex flex-row justify-center items-start">
          {children.map((child, index) => {
            const spouse = child.spouseId ? memberMap.get(child.spouseId) || null : null;
            const isFirst = index === 0;
            const isLast = index === children.length - 1;

            return (
              <div key={child.id} className="relative flex flex-col items-center px-3 sm:px-5">
                {/* Seamless Edge-to-Edge Crossbar */}
                {!isSingle && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 flex z-0">
                    <div
                      className={`flex-1 border-t-2 border-indigo-200 ${
                        isFirst ? "invisible" : ""
                      }`}
                    />
                    <div
                      className={`flex-1 border-t-2 border-indigo-200 ${
                        isLast ? "invisible" : ""
                      }`}
                    />
                  </div>
                )}

                {/* Vertical Drop Stem with junction dot into card */}
                <div className="flex flex-col items-center pointer-events-none mb-1 z-0">
                  <div className="w-0.5 h-4 bg-indigo-200" />
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 -mt-0.5 ring-2 ring-white shadow-xs" />
                </div>

                {/* Node Card */}
                <div
                  className={`flex items-center gap-2 p-2 rounded-2xl border shadow-xs z-10 shrink-0 ${
                    isCollateral
                      ? "border-slate-200/40 bg-slate-50/40"
                      : "border-slate-200/70 bg-white"
                  }`}
                >
                  <MemberNodeCard
                    member={child}
                    isCurrentFocus={child.id === activeMemberId}
                    isDeemphasized={isCollateral}
                  />
                  {spouse && (
                    <>
                      <div className="w-4 h-0.5 bg-gradient-to-r from-indigo-300 to-rose-300 shrink-0 rounded-full" />
                      <MemberNodeCard
                        member={spouse}
                        isCurrentFocus={spouse.id === activeMemberId}
                        isDeemphasized={isCollateral}
                      />
                    </>
                  )}
                </div>

                {/* Recurse to render the next generation! */}
                {maxDepthRemaining > 1 && renderDescendantsTier(child, isCollateral, maxDepthRemaining - 1)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card
      className="p-6 border border-slate-200/50 bg-white/75 backdrop-blur-md shadow-xl rounded-3xl w-full mx-auto min-h-[500px] overflow-hidden"
      placeholder={undefined}
    >
      <div className="space-y-6 select-none">
        {/* Top Header & Zoom Controls */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
          <div>
            <Typography
              variant="h6"
              className="text-slate-900 font-bold font-heading"
              placeholder={undefined}
            >
              Interactive Family Tree Explorer
            </Typography>
            <Typography
              className="text-[11px] text-slate-400 font-semibold mt-0.5"
              placeholder={undefined}
            >
              Ancestors, siblings, spouses, and descendants centered around the active family member.
            </Typography>
          </div>

          {/* Floating Zoom Controls */}
          {activeMember && (
            <div className="no-export flex items-center gap-1 bg-slate-50/90 border border-slate-200/90 p-1 rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))
                }
                className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-indigo-600 transition-colors"
                title="Zoom Out"
              >
                <MagnifyingGlassMinusIcon className="h-4 w-4" />
              </button>

              <span className="text-[11px] font-extrabold text-slate-700 px-2 min-w-[48px] text-center font-mono">
                {Math.round(zoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() =>
                  setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))
                }
                className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-indigo-600 transition-colors"
                title="Zoom In"
              >
                <MagnifyingGlassPlusIcon className="h-4 w-4" />
              </button>

              {zoom !== 1 && (
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="p-1.5 rounded-xl hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Reset Zoom"
                >
                  <ArrowPathIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {activeMember ? (
          <div className="py-6 w-full overflow-x-auto overflow-y-auto">
            <div
              id="full-tree-canvas"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease-out",
              }}
              className="inline-flex flex-col items-center min-w-full px-8 py-6 bg-slate-50/40 rounded-3xl"
            >
              {/* Generation -2: Grandparents Tier */}
              {hasGrandparents && (
                <div className="flex flex-row justify-center items-center pb-0 z-0">
                  {paternalGrandfather || paternalGrandmother ? (
                    <div className="flex flex-col items-center">
                      {renderGrandparentsCouple(
                        paternalGrandfather,
                        paternalGrandmother
                      )}
                      {/* Vertical stem connecting Grandparents down to Generation -1 crossbar */}
                      <div className="flex flex-col items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white shadow-xs" />
                        <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-300 to-indigo-200" />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Generation -1 & 0: Parent with Paternal Uncles/Aunts & Children */}
              {hasParents && father ? (
                <div className="flex flex-row justify-center items-start">
                  {fatherSiblings.map((sib, index) => {
                    const spouse =
                      sib.id === father.id
                        ? mother
                        : sib.spouseId
                        ? memberMap.get(sib.spouseId) || null
                        : null;
                    const isFatherNode = sib.id === father.id;
                    const isFirst = index === 0;
                    const isLast = index === fatherSiblings.length - 1;
                    const isSingle = fatherSiblings.length === 1;

                    const showTopConnector =
                      !isSingle || Boolean(paternalGrandfather || paternalGrandmother);

                    return (
                      <div
                        key={sib.id}
                        className="relative flex flex-col items-center px-4 sm:px-6"
                      >
                        {/* Seamless Horizontal Crossbar for Father & Uncles/Aunts */}
                        {!isSingle && (
                          <div className="absolute top-0 left-0 right-0 h-0.5 flex z-0">
                            <div
                              className={`flex-1 border-t-2 border-indigo-200 ${
                                isFirst ? "invisible" : ""
                              }`}
                            />
                            <div
                              className={`flex-1 border-t-2 border-indigo-200 ${
                                isLast ? "invisible" : ""
                              }`}
                            />
                          </div>
                        )}

                        {/* Top connector for each brother/uncle card */}
                        {showTopConnector && (
                          <div className="flex flex-col items-center pointer-events-none mb-1 z-0">
                            <div className="w-0.5 h-4 bg-indigo-200" />
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 -mt-0.5 ring-2 ring-white shadow-xs" />
                          </div>
                        )}

                        {/* Card Unit */}
                        <div
                          className={`flex items-center gap-2 p-2 rounded-2xl border shadow-xs z-10 shrink-0 ${
                            isFatherNode
                              ? "bg-indigo-50/40 border-indigo-200 ring-2 ring-indigo-500/15 shadow-sm"
                              : "bg-slate-50/50 border-slate-200/50"
                          }`}
                        >
                          <MemberNodeCard
                            member={sib}
                            isCurrentFocus={sib.id === activeMemberId}
                            isDeemphasized={!isFatherNode}
                          />
                          {spouse && (
                            <>
                              <div className="w-4 h-0.5 bg-gradient-to-r from-indigo-300 to-rose-300 shrink-0 rounded-full" />
                              <MemberNodeCard
                                member={spouse}
                                isCurrentFocus={spouse.id === activeMemberId}
                                isDeemphasized={!isFatherNode}
                              />
                            </>
                          )}
                        </div>

                        {/* Generation 0 (You + Siblings) or Cousins */}
                        {isFatherNode ? (
                          <div className="flex flex-col items-center w-full mt-1 z-0">
                            {/* Stem dropping from Father & Mother down to Generation 0 */}
                            <div className="flex flex-col items-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white shadow-xs" />
                              <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-300 to-indigo-200" />
                            </div>

                            <div className="flex flex-row justify-center items-start">
                              {siblings.map((sibling, siblingIndex) => {
                                const siblingSpouse = sibling.spouseId
                                  ? memberMap.get(sibling.spouseId) || null
                                  : null;
                                const isFocus = sibling.id === activeMemberId;
                                const isSibFirst = siblingIndex === 0;
                                const isSibLast = siblingIndex === siblings.length - 1;
                                const isSibSingle = siblings.length === 1;

                                return (
                                  <div
                                    key={sibling.id}
                                    className="relative flex flex-col items-center px-4 sm:px-6"
                                  >
                                    {/* Seamless Sibling Crossbar */}
                                    {!isSibSingle && (
                                      <div className="absolute top-0 left-0 right-0 h-0.5 flex z-0">
                                        <div
                                          className={`flex-1 border-t-2 border-indigo-200 ${
                                            isSibFirst ? "invisible" : ""
                                          }`}
                                        />
                                        <div
                                          className={`flex-1 border-t-2 border-indigo-200 ${
                                            isSibLast ? "invisible" : ""
                                          }`}
                                        />
                                      </div>
                                    )}

                                    <div className="flex flex-col items-center pointer-events-none mb-1 z-0">
                                      <div className="w-0.5 h-4 bg-indigo-200" />
                                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 -mt-0.5 ring-2 ring-white shadow-xs" />
                                    </div>

                                    <div
                                      className={`flex items-center gap-2 p-2 rounded-2xl border shadow-xs z-10 shrink-0 ${
                                        isFocus
                                          ? "bg-indigo-50/40 border-indigo-200 ring-2 ring-indigo-500/15 shadow-sm"
                                          : "bg-white border-slate-200/60"
                                      }`}
                                    >
                                      <MemberNodeCard
                                        member={sibling}
                                        isCurrentFocus={isFocus}
                                      />
                                      {siblingSpouse && (
                                        <>
                                          <div className="w-4 h-0.5 bg-gradient-to-r from-indigo-300 to-rose-300 shrink-0 rounded-full" />
                                          <MemberNodeCard
                                            member={siblingSpouse}
                                            isCurrentFocus={siblingSpouse.id === activeMemberId}
                                          />
                                        </>
                                      )}
                                    </div>

                                    {renderDescendantsTier(sibling, !isFocus, 2)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          renderDescendantsTier(sib, true, 3)
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback Level 0 Sibling Row when parents do not exist */
                <div className="flex flex-row justify-center items-start">
                  {siblings.map((sibling, index) => {
                    const spouse = sibling.spouseId
                      ? memberMap.get(sibling.spouseId) || null
                      : null;
                    const isFocus = sibling.id === activeMemberId;
                    const isFirst = index === 0;
                    const isLast = index === siblings.length - 1;
                    const isSingle = siblings.length === 1;

                    return (
                      <div
                        key={sibling.id}
                        className="relative flex flex-col items-center px-4 sm:px-6"
                      >
                        {/* Only render horizontal line if multiple siblings exist */}
                        {!isSingle && (
                          <>
                            <div className="absolute top-0 left-0 right-0 h-0.5 flex z-0">
                              <div
                                className={`flex-1 border-t-2 border-indigo-200 ${
                                  isFirst ? "invisible" : ""
                                }`}
                              />
                              <div
                                className={`flex-1 border-t-2 border-indigo-200 ${
                                  isLast ? "invisible" : ""
                                }`}
                              />
                            </div>
                            <div className="flex flex-col items-center pointer-events-none mb-1 z-0">
                              <div className="w-0.5 h-4 bg-indigo-200" />
                              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 -mt-0.5 ring-2 ring-white shadow-xs" />
                            </div>
                          </>
                        )}

                        <div
                          className={`flex items-center gap-2 p-2 rounded-2xl border shadow-xs z-10 shrink-0 ${
                            isFocus
                              ? "bg-indigo-50/40 border-indigo-200 ring-2 ring-indigo-500/15 shadow-sm"
                              : "bg-white border-slate-200/60"
                          }`}
                        >
                          <MemberNodeCard
                            member={sibling}
                            isCurrentFocus={isFocus}
                          />
                          {spouse && (
                            <>
                              <div className="w-4 h-0.5 bg-gradient-to-r from-indigo-300 to-rose-300 shrink-0 rounded-full" />
                              <MemberNodeCard
                                member={spouse}
                                isCurrentFocus={spouse.id === activeMemberId}
                              />
                            </>
                          )}
                        </div>

                        {renderDescendantsTier(sibling, !isFocus, 2)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <Typography
            className="text-sm text-slate-400 font-medium text-center py-10"
            placeholder={undefined}
          >
            No family members registered. Switch to Focused View to add the first member.
          </Typography>
        )}
      </div>
    </Card>
  );
}

export default FullTreeView;
