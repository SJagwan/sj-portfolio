/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Card } from "@material-tailwind/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { FamilyMember } from "@/types";

interface FamilySearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  familyData: FamilyMember[];
  onMemberSelect: (id: string) => void;
  className?: string;
}

export function FamilySearch({
  searchQuery,
  setSearchQuery,
  familyData,
  onMemberSelect,
  className,
}: FamilySearchProps) {
  // Filter members matching search query
  const filteredSearch = searchQuery.trim()
    ? familyData.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : [];

  return (
    <div className={`relative ${className || "w-full"}`}>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search relative by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-semibold pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200/90 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs focus:shadow-md"
        />
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
        </div>

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            title="Clear search"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Search Result Dropdown */}
      {searchQuery.trim() && (
        <Card
          className="absolute left-0 right-0 mt-2 p-1.5 max-h-64 overflow-y-auto border border-slate-200 bg-white z-50 shadow-xl rounded-2xl"
          placeholder={undefined}
        >
          {filteredSearch.length > 0 ? (
            filteredSearch.map((member) => {
              const isFemale = member.gender === "female";
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    onMemberSelect(member.id);
                    setSearchQuery("");
                  }}
                  className="w-full text-left p-2.5 hover:bg-indigo-50/50 rounded-xl transition-colors duration-150 flex items-center gap-3"
                >
                  <div
                    className={`h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center text-xs font-bold shrink-0 border ${
                      isFemale
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
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {member.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span className={isFemale ? "text-rose-500 font-semibold" : "text-indigo-500 font-semibold"}>
                        {isFemale ? "Female" : "Male"}
                      </span>
                      {member.birthDate && (
                        <span>• b. {member.birthDate.split("-")[0]}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 p-3 text-center">
              No relatives found matching &quot;{searchQuery}&quot;
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

export default FamilySearch;

