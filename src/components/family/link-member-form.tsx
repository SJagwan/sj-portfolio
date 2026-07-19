"use client";

import React from "react";
import { Typography } from "@material-tailwind/react";
import { FamilyMember, PrefilledRelation } from "./utils";

interface LinkMemberFormProps {
  eligibleLinkMembers: FamilyMember[];
  selectedLinkMemberIds: string[];
  setSelectedLinkMemberIds: (ids: string[]) => void;
  prefilledRelation: PrefilledRelation | null;
}

export function LinkMemberForm({
  eligibleLinkMembers,
  selectedLinkMemberIds,
  setSelectedLinkMemberIds,
  prefilledRelation,
}: LinkMemberFormProps) {
  const isMultiSelect =
    prefilledRelation?.relationType === "child" ||
    prefilledRelation?.relationType === "sibling";

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLinkMemberIds([...selectedLinkMemberIds, id]);
    } else {
      setSelectedLinkMemberIds(selectedLinkMemberIds.filter((mId) => mId !== id));
    }
  };

  return (
    <div className="space-y-4 py-4">
      <Typography className="text-sm font-medium text-slate-500" placeholder={undefined}>
        {isMultiSelect
          ? `Select one or more existing members from your archive to link as the **${prefilledRelation?.relationType}(s)** of **${prefilledRelation?.memberName}**.`
          : `Select an existing member from your archive to link as the **${prefilledRelation?.relationType}** of **${prefilledRelation?.memberName}**.`}
      </Typography>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">
          {isMultiSelect ? "Select Member(s)" : "Select Member"}
        </label>

        {isMultiSelect ? (
          /* Multi-Select Checkboxes list */
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 max-h-48 overflow-y-auto space-y-2.5">
            {eligibleLinkMembers.map((m) => {
              const isChecked = selectedLinkMemberIds.includes(m.id);
              return (
                <label
                  key={m.id}
                  className="flex items-center gap-3 cursor-pointer select-none text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(m.id, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold block">{m.name}</span>
                    {m.birthDate && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        b. {m.birthDate.split("-")[0]}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          /* Single dropdown selection */
          <select
            value={selectedLinkMemberIds[0] || ""}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedLinkMemberIds(val ? [val] : []);
            }}
            className="w-full bg-white border border-slate-200 text-slate-850 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">-- Choose Member --</option>
            {eligibleLinkMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {eligibleLinkMembers.length === 0 && (
        <Typography
          className="text-xs text-amber-500 bg-amber-50 border border-amber-100 p-3 rounded-xl font-medium"
          placeholder={undefined}
        >
          ⚠️ No eligible members in database match this criteria. Please select &apos;Create New Member&apos; to register them.
        </Typography>
      )}
    </div>
  );
}

export default LinkMemberForm;
