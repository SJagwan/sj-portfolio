"use client";

import React from "react";
import { Typography } from "@material-tailwind/react";
import { FamilyMember, PrefilledRelation } from "./utils";

interface CreateMemberFormProps {
  name: string;
  setName: (v: string) => void;
  gender: "male" | "female" | "other";
  setGender: (g: "male" | "female" | "other") => void;
  birthPlace: string;
  setBirthPlace: (v: string) => void;
  birthDate: string;
  setBirthDate: (v: string) => void;
  deathDate: string;
  setDeathDate: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  fatherId: string;
  setFatherId: (v: string) => void;
  motherId: string;
  setMotherId: (v: string) => void;
  spouseId: string;
  setSpouseId: (v: string) => void;
  potentialFathers: FamilyMember[];
  potentialMothers: FamilyMember[];
  potentialSpouses: FamilyMember[];
  prefilledRelation: PrefilledRelation | null;
  isEdit?: boolean;
}

export function CreateMemberForm({
  name,
  setName,
  gender,
  setGender,
  birthPlace,
  setBirthPlace,
  birthDate,
  setBirthDate,
  deathDate,
  setDeathDate,
  bio,
  setBio,
  fatherId,
  setFatherId,
  motherId,
  setMotherId,
  spouseId,
  setSpouseId,
  potentialFathers,
  potentialMothers,
  potentialSpouses,
  prefilledRelation,
  isEdit = false,
}: CreateMemberFormProps) {
  return (
    <>
      {/* Name Field */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
          Full Name *
        </label>
        <input
          type="text"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white border border-slate-200 text-slate-855 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Gender & Lifespan Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            className="w-full bg-white border border-slate-200 text-slate-855 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            disabled={
              !!prefilledRelation &&
              (prefilledRelation.relationType === "father" ||
                prefilledRelation.relationType === "mother")
            }
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
            Birthplace
          </label>
          <input
            type="text"
            placeholder="E.g., Rishikesh, India"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-855 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
            Birth Date
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-855 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
            Death Date (Optional)
          </label>
          <input
            type="date"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-855 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Relational Parent Connections (Only if not prefilled or if editing) */}
      {(!prefilledRelation || isEdit) && (
        <div className="border-t border-slate-100 pt-3 space-y-4">
          <Typography
            className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2"
            placeholder={undefined}
          >
            Relationships Links
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Father
              </label>
              <select
                value={fatherId}
                onChange={(e) => setFatherId(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-855 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- None --</option>
                {potentialFathers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Mother
              </label>
              <select
                value={motherId}
                onChange={(e) => setMotherId(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-855 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- None --</option>
                {potentialMothers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Spouse
              </label>
              <select
                value={spouseId}
                onChange={(e) => setSpouseId(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-855 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- None --</option>
                {potentialSpouses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Biography Textbox */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
          Biography / Notes
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Record brief details, stories, or comments here..."
          className="w-full bg-white border border-slate-200 text-slate-855 text-sm rounded-xl p-3 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </div>
    </>
  );
}

export default CreateMemberForm;
