/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Typography, Dialog, DialogBody, Button } from "@material-tailwind/react";
import { CalendarIcon, MapPinIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { FamilyMember } from "@/types";

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  onEdit: (member: FamilyMember) => void;
  onDelete?: (memberId: string) => Promise<void> | void;
}

export function MemberDetailsModal({
  isOpen,
  onClose,
  member,
  onEdit,
  onDelete,
}: MemberDetailsModalProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!member) return null;

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(member.id);
      setIsConfirmingDelete(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

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
              className={`h-20 w-20 mb-4 rounded-3xl overflow-hidden flex items-center justify-center text-2xl font-black shadow-inner border-2 ${
                isFemale
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-indigo-50 text-indigo-600 border-indigo-100"
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

          {/* Delete Confirmation Alert */}
          {isConfirmingDelete ? (
            <div className="bg-red-50/80 border border-red-200 p-4 rounded-2xl text-center space-y-3">
              <p className="text-xs font-bold text-red-700">
                Are you sure you want to delete {member.name}? All parent, child, and spouse links to this record will be removed.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  size="sm"
                  variant="outlined"
                  disabled={isDeleting}
                  onClick={() => setIsConfirmingDelete(false)}
                  className="border-slate-300 text-slate-700 rounded-xl capitalize font-bold text-xs py-2 px-4"
                  placeholder={undefined}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl capitalize font-bold text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
                  placeholder={undefined}
                >
                  {isDeleting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-3.5 w-3.5" />
                      Confirm Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Actions */
            <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-slate-100/80">
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
                  title="Delete member record"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              ) : <div />}

              <div className="flex items-center gap-3">
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
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default MemberDetailsModal;
