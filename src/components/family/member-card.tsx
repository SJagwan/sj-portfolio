"use client";

import React from "react";
import { Typography, Card, Button } from "@material-tailwind/react";
import { UserIcon, HeartIcon, AcademicCapIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

interface FamilyMember {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  bio?: string;
}

interface MemberCardProps {
  member?: FamilyMember;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  onViewDetails?: () => void;
}

export function MemberCard({
  member,
  label,
  isActive = false,
  onClick,
  onViewDetails,
}: MemberCardProps) {
  // 1. Fallback rendering for undefined relatives
  if (!member) {
    const isInteractive = !!onViewDetails;
    return (
      <div 
        onClick={isInteractive ? onViewDetails : undefined}
        className={`p-5 border border-dashed border-slate-200 bg-slate-50/50 w-44 sm:w-48 text-center rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs py-10 ${
          isInteractive 
            ? "hover:bg-slate-100/50 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-all duration-200" 
            : ""
        }`}
      >
        {isInteractive ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[14px] font-bold text-indigo-400">+</span>
            <Typography className="text-xs font-semibold font-sans text-indigo-500/80" placeholder={undefined}>
              Add {label}
            </Typography>
          </div>
        ) : (
          <Typography className="text-xs font-medium" placeholder={undefined}>
            No {label} Link
          </Typography>
        )}
      </div>
    );
  }

  const isFemale = member.gender === "female";
  const birthYear = member.birthDate ? member.birthDate.split("-")[0] : "";
  const deathYear = member.deathDate ? member.deathDate.split("-")[0] : "";

  // 2. Active Focus Member Card (Larger, styled borders, details button)
  if (isActive) {
    return (
      <Card
        className={`p-8 border-2 ${
          isFemale
            ? "border-pink-400/70 shadow-pink-100/30"
            : "border-indigo-400/70 shadow-indigo-100/30"
        } bg-white shadow-xl relative z-10 w-64 sm:w-72 text-center rounded-3xl flex flex-col items-center`}
        placeholder={undefined}
      >
        <div
          className={`h-14 w-14 mb-4 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
            isFemale ? "bg-pink-50 text-pink-600" : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {member.name.charAt(0)}
        </div>

        <Typography
          variant="h4"
          className="text-lg sm:text-xl font-black text-slate-900 leading-snug mb-1 font-heading"
          placeholder={undefined}
        >
          {member.name}
        </Typography>

        {birthYear && (
          <Typography
            className="text-xs text-slate-400 font-medium mb-4 font-sans"
            placeholder={undefined}
          >
            {birthYear} {deathYear ? ` - ${deathYear}` : ""}
          </Typography>
        )}

        {onViewDetails && (
          <Button
            size="sm"
            variant="filled"
            onClick={onViewDetails}
            className="mt-2 flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide rounded-full px-4 capitalize transition-all duration-150"
            placeholder={undefined}
          >
            <InformationCircleIcon className="h-4 w-4" />
            View Details
          </Button>
        )}
      </Card>
    );
  }

  // 3. Standard Relatives Node Card (Hover actions, navigation triggers)
  const renderIcon = () => {
    if (label.toLowerCase() === "spouse") {
      return <HeartIcon className="h-5 w-5" />;
    }
    if (label.toLowerCase() === "son" || label.toLowerCase() === "daughter") {
      return <AcademicCapIcon className="h-5 w-5" />;
    }
    return <UserIcon className="h-5 w-5" />;
  };

  const getBorderHoverColor = () => {
    if (label.toLowerCase() === "spouse") return "hover:border-red-200";
    if (isFemale) return "hover:border-pink-300/80";
    return "hover:border-indigo-300/80";
  };

  const getIconBgColor = () => {
    if (label.toLowerCase() === "spouse") return "bg-red-50 text-red-500";
    if (isFemale) return "bg-pink-50 text-pink-600";
    return "bg-blue-50 text-blue-600";
  };

  return (
    <Card
      onClick={onClick}
      className={`p-5 border border-slate-200/60 bg-white ${getBorderHoverColor()} shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 w-44 sm:w-48 text-center rounded-2xl flex flex-col items-center`}
      placeholder={undefined}
    >
      <div className={`h-10 w-10 mb-3 rounded-full flex items-center justify-center ${getIconBgColor()}`}>
        {renderIcon()}
      </div>
      <Typography
        className="text-sm font-extrabold text-slate-900 leading-tight mb-1 font-heading"
        placeholder={undefined}
      >
        {member.name}
      </Typography>
      <Typography
        className="text-xs text-slate-400 font-sans"
        placeholder={undefined}
      >
        {label}
      </Typography>
    </Card>
  );
}

export default MemberCard;
