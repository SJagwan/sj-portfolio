"use client";

import React from "react";
import { Typography, Dialog, DialogBody, Button } from "@material-tailwind/react";
import { CalendarIcon, MapPinIcon, PencilIcon } from "@heroicons/react/24/solid";

interface FamilyMember {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  bio?: string;
}

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  onEdit: (member: FamilyMember) => void;
}

export function MemberDetailsModal({
  isOpen,
  onClose,
  member,
  onEdit,
}: MemberDetailsModalProps) {
  if (!member) return null;

  const isFemale = member.gender === "female";

  return (
    <Dialog
      open={isOpen}
      handler={onClose}
      className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 overflow-hidden max-w-lg w-full mx-auto"
      placeholder={undefined}
    >
      <DialogBody
        className="text-slate-700 flex flex-col items-center font-sans"
        placeholder={undefined}
      >
        <div className="w-full space-y-6">
          {/* Header Identity */}
          <div className="flex flex-col items-center border-b border-slate-100 pb-4 text-center">
            <div
              className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center text-xl font-bold shadow-inner ${
                isFemale
                  ? "bg-pink-50 text-pink-600"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {member.name.charAt(0)}
            </div>
            <Typography
              variant="h4"
              className="text-xl font-black text-slate-900 font-heading mb-1"
              placeholder={undefined}
            >
              {member.name}
            </Typography>
            <Typography
              className="text-xs font-bold text-slate-400 capitalize"
              placeholder={undefined}
            >
              {member.gender} relative
            </Typography>
          </div>

          {/* Lifespan & Location Details */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            {member.birthDate && (
              <div className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-xl">
                <CalendarIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold">
                    Lifespan / Birthdate
                  </p>
                  <p className="font-semibold text-slate-800">
                    {member.birthDate}
                    {member.deathDate ? ` — ${member.deathDate} (Deceased)` : ""}
                  </p>
                </div>
              </div>
            )}
            {member.birthPlace && (
              <div className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-xl">
                <MapPinIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold">
                    Birthplace
                  </p>
                  <p className="font-semibold text-slate-800">
                    {member.birthPlace}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Biography Details */}
          {member.bio && (
            <div className="space-y-2">
              <Typography
                className="text-xs font-extrabold text-slate-400 uppercase tracking-widest"
                placeholder={undefined}
              >
                Biography & History
              </Typography>
              <Typography
                className="text-sm text-slate-600 leading-relaxed font-normal bg-slate-50/30 p-4 rounded-2xl border border-slate-100"
                placeholder={undefined}
              >
                {member.bio}
              </Typography>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
            <Button
              size="md"
              variant="outlined"
              onClick={() => onEdit(member)}
              className="flex items-center gap-2 border-slate-200 hover:border-slate-850 text-slate-650 hover:text-slate-900 rounded-xl capitalize font-bold text-sm tracking-wide px-5 py-2.5 transition-all duration-150 shadow-none hover:shadow-none"
              placeholder={undefined}
            >
              <PencilIcon className="h-4 w-4 text-indigo-500" />
              Edit Profile
            </Button>
            <Button
              size="md"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl capitalize font-bold text-sm tracking-wide shadow-md px-6 py-2.5 transition-all duration-150"
              placeholder={undefined}
            >
              Close Archive
            </Button>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default MemberDetailsModal;
