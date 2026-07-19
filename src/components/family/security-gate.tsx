"use client";

import React from "react";
import { Typography, Input, Button, Card } from "@material-tailwind/react";
import { LockClosedIcon } from "@heroicons/react/24/solid";

interface SecurityGateProps {
  passcode: string;
  setPasscode: (val: string) => void;
  handleUnlock: (e: React.FormEvent) => void;
  isLoading: boolean;
  errorMsg: string;
}

export function SecurityGate({
  passcode,
  setPasscode,
  handleUnlock,
  isLoading,
  errorMsg,
}: SecurityGateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-900 text-white">
      {/* Glowing Background Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/25 rounded-full blur-3xl pointer-events-none" />

      <Card
        className="w-full max-w-md p-8 md:p-10 border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative z-10 flex flex-col items-center text-center"
        placeholder={undefined}
      >
        <div className="h-16 w-16 mb-6 flex items-center justify-center rounded-2xl bg-indigo-900/30 border border-indigo-500/25 text-indigo-400">
          <LockClosedIcon className="h-8 w-8" />
        </div>

        <Typography
          variant="h3"
          className="text-2xl md:text-3xl font-extrabold text-white font-heading mb-3"
          placeholder={undefined}
        >
          Security Gate
        </Typography>
        <Typography
          className="text-slate-400 font-normal leading-relaxed text-sm md:text-base font-sans mb-8"
          placeholder={undefined}
        >
          This area contains private family records. Please enter the shared access passcode to view the Family Tree.
        </Typography>

        <form onSubmit={handleUnlock} className="w-full space-y-6">
          <div className="relative w-full">
            <Input
              type="password"
              label="Enter Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              error={!!errorMsg}
              disabled={isLoading}
              color="indigo"
              className="text-white bg-slate-950/30 border-slate-800 focus:border-indigo-500"
              crossOrigin={undefined}
            />
          </div>

          {errorMsg && (
            <Typography
              className="text-red-400 font-sans text-sm font-semibold text-left"
              placeholder={undefined}
            >
              ⚠️ {errorMsg}
            </Typography>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl capitalize font-bold text-base tracking-wide py-3 shadow-md hover:shadow-lg transition-all duration-200"
            placeholder={undefined}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Unlock Access"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default SecurityGate;
