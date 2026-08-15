/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { UserIcon, AcademicCapIcon, InformationCircleIcon, PlusIcon } from "@heroicons/react/24/solid";
import { FamilyMember } from "@/types";

interface MemberCardProps {
  member?: FamilyMember;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  onViewDetails?: () => void;
  onQuickView?: (member: FamilyMember) => void;
}

export function MemberCard({
  member,
  label,
  isActive = false,
  onClick,
  onViewDetails,
  onQuickView,
}: MemberCardProps) {
  const labelLower = label.toLowerCase();
  const isSpouse = labelLower === "spouse" || labelLower === "wife" || labelLower === "husband";
  
  // Robust detection: Explicit gender OR implied relation role
  const isFemale =
    member?.gender?.toLowerCase() === "female" ||
    ["mother", "daughter", "sister", "wife"].includes(labelLower);

  // 1. Fallback rendering for undefined relatives (Add Slot)
  if (!member) {
    const isInteractive = !!onViewDetails;
    const isFemaleSlot = ["mother", "daughter", "sister", "wife"].includes(labelLower);

    return (
      <div
        onClick={isInteractive ? onViewDetails : undefined}
        className={`group p-4 sm:p-5 border-2 border-dashed ${
          isFemaleSlot
            ? "border-rose-200 bg-rose-50/30 text-rose-500 hover:border-rose-400 hover:bg-rose-50/60 hover:text-rose-700"
            : "border-indigo-200 bg-indigo-50/30 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50/60 hover:text-indigo-700"
        } w-40 sm:w-48 text-center rounded-2xl flex flex-col items-center justify-center text-xs py-8 sm:py-10 transition-all duration-200 ${
          isInteractive ? "hover:shadow-sm cursor-pointer" : "opacity-60"
        }`}
      >
        {isInteractive ? (
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`h-8 w-8 rounded-full ${
                isFemaleSlot
                  ? "bg-rose-100 text-rose-600 group-hover:bg-rose-200"
                  : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200"
              } flex items-center justify-center transition-colors`}
            >
              <PlusIcon className="h-4 w-4" />
            </div>
            <Typography
              className={`text-xs font-bold font-heading ${
                isFemaleSlot
                  ? "text-rose-600 group-hover:text-rose-700"
                  : "text-indigo-600 group-hover:text-indigo-700"
              } transition-colors`}
              placeholder={undefined}
            >
              Add {label}
            </Typography>
          </div>
        ) : (
          <Typography className="text-xs font-medium text-slate-400" placeholder={undefined}>
            No {label} Link
          </Typography>
        )}
      </div>
    );
  }

  // 2. Active Focus Member Card (Primary node with glowing border and full details)
  if (isActive) {
    return (
      <div
        className={`p-6 sm:p-8 border-2 ${
          isFemale
            ? "border-rose-400 bg-rose-50/20 shadow-rose-100/60"
            : "border-indigo-500 bg-indigo-50/20 shadow-indigo-100/60"
        } bg-white shadow-xl relative z-10 w-64 sm:w-72 text-center rounded-3xl flex flex-col items-center transition-all`}
      >
        <div
          className={`h-16 w-16 mb-4 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black shadow-inner ${
            isFemale
              ? "bg-rose-100 text-rose-600 border-2 border-rose-200"
              : "bg-indigo-100 text-indigo-600 border-2 border-indigo-200"
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

        <span
          className={`text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full mb-1.5 ${
            isFemale
              ? "text-rose-700 bg-rose-100 border border-rose-200"
              : "text-indigo-700 bg-indigo-100 border border-indigo-200"
          }`}
        >
          Active Focus
        </span>

        <Typography
          variant="h4"
          className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug mb-4 font-heading"
          placeholder={undefined}
        >
          {member.name}
        </Typography>

        {onViewDetails && (
          <Button
            size="sm"
            variant="filled"
            onClick={onViewDetails}
            className="no-export mt-1 flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide rounded-full px-5 py-2.5 capitalize transition-all duration-150 shadow-md hover:shadow-lg"
            placeholder={undefined}
          >
            <InformationCircleIcon className="h-4 w-4 text-indigo-400" />
            View Full Profile
          </Button>
        )}
      </div>
    );
  }

  // 3. Standard Relatives Node Card
  const renderIcon = () => {
    if (member.photoUrl) {
      return (
        <img
          src={member.photoUrl}
          alt={member.name}
          className="h-full w-full object-cover rounded-xl"
        />
      );
    }
    if (labelLower === "son" || labelLower === "daughter") {
      return <AcademicCapIcon className="h-5 w-5" />;
    }
    return <UserIcon className="h-5 w-5" />;
  };

  const getCardStyling = () => {
    if (isFemale || isSpouse) {
      return "border-2 border-rose-300 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50/60 shadow-sm hover:shadow-md hover:shadow-rose-100/70";
    }
    return "border-2 border-indigo-300 bg-indigo-50/30 hover:border-indigo-400 hover:bg-indigo-50/60 shadow-sm hover:shadow-md hover:shadow-indigo-100/70";
  };

  const getIconBgColor = () => {
    if (member.photoUrl) return "bg-transparent p-0 overflow-hidden";
    if (isFemale || isSpouse) return "bg-rose-100 text-rose-600 border border-rose-200";
    return "bg-indigo-100 text-indigo-600 border border-indigo-200";
  };

  const getBadgeStyling = () => {
    if (isFemale || isSpouse) {
      return "text-rose-700 bg-rose-100 border border-rose-200";
    }
    return "text-indigo-700 bg-indigo-100 border border-indigo-200";
  };

  return (
    <div className="relative group">
      <div
        onClick={onClick}
        className={`p-4 sm:p-5 ${getCardStyling()} cursor-pointer transition-all duration-200 w-40 sm:w-48 text-center rounded-2xl flex flex-col items-center relative select-none`}
      >
        {/* Quick View Button on top-right */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(member);
            }}
            className="no-export absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            title="View Details"
          >
            <InformationCircleIcon className="h-4 w-4" />
          </button>
        )}

        <div className={`h-11 w-11 mb-2.5 rounded-xl flex items-center justify-center shadow-inner ${getIconBgColor()}`}>
          {renderIcon()}
        </div>

        <Typography
          className="text-sm font-extrabold text-slate-900 leading-tight mb-1 font-heading line-clamp-1 w-full"
          placeholder={undefined}
        >
          {member.name}
        </Typography>

        <span className={`text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${getBadgeStyling()}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default MemberCard;
