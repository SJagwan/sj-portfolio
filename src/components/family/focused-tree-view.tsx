import React from "react";
import { Typography, Card } from "@material-tailwind/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { FamilyMember, RelationshipType } from "@/types";
import MemberCard from "./member-card";

interface FocusedTreeViewProps {
  activeMember: FamilyMember;
  father?: FamilyMember;
  mother?: FamilyMember;
  spouse?: FamilyMember;
  siblings: FamilyMember[];
  childrenList: FamilyMember[];
  onNavigateToMember: (id: string) => void;
  onAddRelation: (
    refId: string,
    refName: string,
    relType: RelationshipType
  ) => void;
  onViewDetails: (member: FamilyMember) => void;
}

export function FocusedTreeView({
  activeMember,
  father,
  mother,
  spouse,
  siblings,
  childrenList,
  onNavigateToMember,
  onAddRelation,
  onViewDetails,
}: FocusedTreeViewProps) {
  const hasParents = !!father || !!mother;
  const hasChildren = childrenList.length > 0;

  return (
    <div
      id="focused-tree-canvas"
      className="flex flex-col items-center w-full max-w-5xl mx-auto py-6 px-4 sm:px-8 bg-slate-50/40 rounded-3xl select-none"
    >

      {/* ========================================================================= */}
      {/* 1. PARENTS LEVEL (ABOVE) */}
      {/* ========================================================================= */}
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <Typography
            className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest"
            placeholder={undefined}
          >
            Parents
          </Typography>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8 relative">
          <MemberCard
            member={father}
            label="Father"
            onClick={() => father && onNavigateToMember(father.id)}
            onViewDetails={!father ? () => onAddRelation(activeMember.id, activeMember.name, "father") : undefined}
            onQuickView={father ? onViewDetails : undefined}
          />
          <MemberCard
            member={mother}
            label="Mother"
            onClick={() => mother && onNavigateToMember(mother.id)}
            onViewDetails={!mother ? () => onAddRelation(activeMember.id, activeMember.name, "mother") : undefined}
            onQuickView={mother ? onViewDetails : undefined}
          />
        </div>

        {/* Tree Branch: Vertical connector from parents down to focus node */}
        <div className="flex flex-col items-center my-1">
          <div className="w-0.5 h-6 sm:h-8 bg-gradient-to-b from-slate-300 to-indigo-300 rounded-full" />
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-sm -mt-0.5" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRIMARY FOCUS LEVEL (CENTER) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 relative w-full justify-center my-3">

        {/* Siblings Panel (Left Side) */}
        <div className="flex flex-col gap-2 sm:absolute sm:right-[72%] lg:right-[68%] items-center sm:items-end w-full sm:w-44">
          <div className="flex items-center gap-1.5 justify-center sm:justify-end w-full pr-1">
            <Typography
              className="text-center sm:text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-widest"
              placeholder={undefined}
            >
              Siblings ({siblings.length})
            </Typography>
            <button
              onClick={() => onAddRelation(activeMember.id, activeMember.name, "sibling")}
              className="no-export h-4 w-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-colors border border-indigo-100 shadow-sm"
              title="Add Sibling"
            >
              <PlusIcon className="h-2.5 w-2.5" />
            </button>
          </div>

          {siblings.length > 0 ? (
            <div className="flex sm:flex-col gap-2 max-h-[260px] overflow-y-auto sm:overflow-x-hidden overflow-x-auto w-full items-center sm:items-end pb-1 justify-center sm:justify-start">
              {siblings.map((sib) => {
                const isSister = sib.gender?.toLowerCase() === "female";
                return (
                  <div key={sib.id} className="relative group w-36 sm:w-full shrink-0">
                    <div
                      onClick={() => onNavigateToMember(sib.id)}
                      className={`p-3 border-2 ${
                        isSister
                          ? "border-rose-300 bg-rose-50/40 hover:border-rose-400 hover:bg-rose-50/70"
                          : "border-indigo-300 bg-indigo-50/40 hover:border-indigo-400 hover:bg-indigo-50/70"
                      } shadow-sm cursor-pointer transition-all duration-150 rounded-xl flex flex-col items-center justify-center text-center w-full`}
                    >
                      <Typography
                        className="text-xs font-bold text-slate-900 leading-tight font-heading truncate w-full"
                        placeholder={undefined}
                      >
                        {sib.name}
                      </Typography>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md mt-0.5 ${
                        isSister ? "text-rose-700 bg-rose-100/90" : "text-indigo-700 bg-indigo-100/90"
                      }`}>
                        {isSister ? "Sister" : "Brother"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(sib);
                      }}
                      className="no-export absolute top-2 right-2 p-0.5 rounded text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="View Details"
                    >
                      <span className="text-[10px] font-bold">ℹ</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <button
              onClick={() => onAddRelation(activeMember.id, activeMember.name, "sibling")}
              className="no-export p-3.5 border-2 border-dashed border-slate-200 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 text-slate-400 hover:text-indigo-600 text-xs rounded-xl flex flex-col items-center justify-center w-36 sm:w-full transition-all gap-1"
            >
              <PlusIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold">Add Sibling</span>
            </button>
          )}
        </div>

        {/* Primary Centered Focus Node */}
        <MemberCard
          member={activeMember}
          label="Active Focus"
          isActive={true}
          onViewDetails={() => onViewDetails(activeMember)}
        />

        {/* Spouse/Partner (Right Side) */}
        <div className="flex items-center sm:absolute sm:left-[72%] lg:left-[68%]">
          <MemberCard
            member={spouse}
            label="Spouse"
            onClick={() => spouse && onNavigateToMember(spouse.id)}
            onViewDetails={!spouse ? () => onAddRelation(activeMember.id, activeMember.name, "spouse") : undefined}
            onQuickView={spouse ? onViewDetails : undefined}
          />
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CHILDREN LEVEL (BELOW) */}
      {/* ========================================================================= */}
      <div className="flex flex-col items-center w-full mt-1">
        {/* Downward Tree Connector */}
        <div className="flex flex-col items-center my-1">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-sm mb-0.5" />
          <div className="w-0.5 h-6 sm:h-8 bg-gradient-to-b from-indigo-300 to-slate-300 rounded-full" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <Typography
            className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest"
            placeholder={undefined}
          >
            Children ({childrenList.length})
          </Typography>
          <button
            onClick={() => onAddRelation(activeMember.id, activeMember.name, "child")}
            className="no-export h-5 w-5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-colors shadow-sm ml-1"
            title="Add Child"
          >
            <PlusIcon className="h-3 w-3 text-indigo-600" />
          </button>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full">
          {hasChildren ? (
            childrenList.map((child) => (
              <MemberCard
                key={child.id}
                member={child}
                label={child.gender === "female" ? "Daughter" : "Son"}
                onClick={() => onNavigateToMember(child.id)}
                onQuickView={onViewDetails}
              />
            ))
          ) : (
            <button
              onClick={() => onAddRelation(activeMember.id, activeMember.name, "child")}
              className="no-export px-8 py-6 border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50/40 hover:bg-indigo-50/30 text-slate-400 hover:text-indigo-600 text-xs rounded-2xl font-medium flex flex-col items-center gap-2 transition-all duration-200 group"
            >
              <div className="h-8 w-8 rounded-full bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                <PlusIcon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">
                Record First Child
              </span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

export default FocusedTreeView;
