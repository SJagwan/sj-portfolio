"use client";

import React from "react";
import { Card } from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface FamilyMember {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  birthDate?: string;
}

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
  const filteredSearch = searchQuery
    ? familyData.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className={`relative ${className || "w-full sm:w-64"}`}>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search relative by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm font-semibold pl-11 pr-4 py-3 rounded-2xl border border-slate-200/85 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-sm focus:shadow-md"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
        </div>
      </div>
      
      {/* Autocomplete Search Result Dropdown */}
      {searchQuery && (
        <Card
          className="absolute left-0 right-0 mt-2 p-2 max-h-60 overflow-y-auto border border-slate-200 bg-white z-50 shadow-xl rounded-2xl"
          placeholder={undefined}
        >
          {filteredSearch.length > 0 ? (
            filteredSearch.map((member) => (
              <button
                key={member.id}
                onClick={() => onMemberSelect(member.id)}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors duration-150 flex items-center gap-3"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    member.gender === "female"
                      ? "bg-pink-50 text-pink-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {member.name}
                  </p>
                  {member.birthDate && (
                    <p className="text-xs text-slate-400">
                      b. {member.birthDate.split("-")[0]}
                    </p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-400 p-3 text-center">
              No relatives found matching query.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

export default FamilySearch;
