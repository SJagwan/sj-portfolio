"use client";

import React from "react";
import { Typography, Card } from "@material-tailwind/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { FamilyMember } from "./utils";
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
    relType: "father" | "mother" | "spouse" | "child" | "sibling"
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
  return (
    <div className="flex flex-col items-center gap-12 py-6">
      
      {/* 1. Parents Level (Above) */}
      <div className="flex flex-col items-center">
        <Typography className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4" placeholder={undefined}>
          Parents
        </Typography>
        <div className="flex items-center gap-6 sm:gap-12 relative">
          <MemberCard
            member={father}
            label="Father"
            onClick={() => father && onNavigateToMember(father.id)}
            onViewDetails={!father ? () => onAddRelation(activeMember.id, activeMember.name, "father") : undefined}
          />
          <MemberCard
            member={mother}
            label="Mother"
            onClick={() => mother && onNavigateToMember(mother.id)}
            onViewDetails={!mother ? () => onAddRelation(activeMember.id, activeMember.name, "mother") : undefined}
          />
        </div>
      </div>

      {/* Connecting line */}
      <div className="w-1 h-8 bg-slate-300 pointer-events-none rounded-full" />

      {/* 2. Active Focus Level (Center) */}
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 relative w-full justify-center">
        {/* Siblings (Left Side) */}
        <div className="flex flex-col gap-3 sm:absolute sm:right-[72%] lg:right-[68%] items-center sm:items-end">
          <div className="flex items-center gap-1.5 justify-center sm:justify-end w-full">
            <Typography className="text-center sm:text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1" placeholder={undefined}>
              Siblings
            </Typography>
            <button
              onClick={() => onAddRelation(activeMember.id, activeMember.name, "sibling")}
              className="h-4 w-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-colors border border-indigo-100 shadow-sm"
              title="Add Sibling"
            >
              <PlusIcon className="h-2 w-2" />
            </button>
          </div>
          {siblings.length > 0 ? (
            <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1.5 w-full items-center sm:items-end">
              {siblings.map((sib) => (
                <Card
                  key={sib.id}
                  onClick={() => onNavigateToMember(sib.id)}
                  className="p-4 border border-slate-200/50 bg-white hover:border-slate-300 shadow-sm cursor-pointer transition-all duration-150 w-36 text-center rounded-xl flex flex-col items-center justify-center shrink-0"
                  placeholder={undefined}
                >
                  <Typography className="text-xs font-bold text-slate-900 leading-tight font-heading text-ellipsis overflow-hidden whitespace-nowrap w-full" placeholder={undefined}>
                    {sib.name}
                  </Typography>
                </Card>
              ))}
            </div>
          ) : (
            <button
              onClick={() => onAddRelation(activeMember.id, activeMember.name, "sibling")}
              className="p-4 border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50/80 text-slate-400 hover:text-slate-600 text-xs rounded-xl flex flex-col items-center justify-center w-36 transition-all duration-200 gap-1"
            >
              <span className="text-[14px] font-bold text-indigo-400">+</span>
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
          />
        </div>
      </div>

      {/* Connecting line */}
      <div className="w-1 h-8 bg-slate-300 pointer-events-none rounded-full" />

      {/* 3. Children Level (Below) */}
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center gap-2 mb-4">
          <Typography className="text-xs font-extrabold text-slate-400 uppercase tracking-widest" placeholder={undefined}>
            Children
          </Typography>
          <button
            onClick={() => onAddRelation(activeMember.id, activeMember.name, "child")}
            className="h-5 w-5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-colors shadow-sm"
            title="Add Child"
          >
            <PlusIcon className="h-3 w-3 text-indigo-600" />
          </button>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6">
          {childrenList.length > 0 ? (
            childrenList.map((child) => (
              <MemberCard
                key={child.id}
                member={child}
                label={child.gender === "female" ? "Daughter" : "Son"}
                onClick={() => onNavigateToMember(child.id)}
              />
            ))
          ) : (
            <button
              onClick={() => onAddRelation(activeMember.id, activeMember.name, "child")}
              className="px-10 py-6 border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50/80 text-slate-400 hover:text-slate-600 text-xs rounded-2xl font-medium font-sans flex flex-col items-center gap-2 transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5" strokeWidth={2} />
              Record First Child
            </button>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default FocusedTreeView;
