"use client";

import React, { useState } from "react";
import { Dialog, DialogBody, Typography, Input, Button } from "@material-tailwind/react";
import { LockClosedIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { checkAdminPasscode } from "../../firebase/family.utils";

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminUnlockModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminUnlockModalProps) {
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setErrorMsg("Please enter the admin passcode.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const isAdmin = await checkAdminPasscode(passcode);
      if (isAdmin) {
        setPasscode("");
        onSuccess();
        onClose();
      } else {
        setErrorMsg("Incorrect admin passcode. Access denied.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Validation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      handler={onClose}
      className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 overflow-hidden max-w-sm w-full mx-auto"
      placeholder={undefined}
    >
      <DialogBody className="text-slate-800 flex flex-col items-center text-center font-sans p-0" placeholder={undefined}>
        <div className="w-full relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-0 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="h-12 w-12 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner">
            <LockClosedIcon className="h-6 w-6" />
          </div>

          <Typography variant="h5" className="text-lg font-bold text-slate-900 font-heading mb-1" placeholder={undefined}>
            Admin Edit Access
          </Typography>
          <Typography className="text-xs text-slate-500 font-normal mb-5 leading-relaxed" placeholder={undefined}>
            Enter the master passcode to unlock adding, editing, and managing family records.
          </Typography>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <Input
                type="password"
                label="Admin Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                error={!!errorMsg}
                disabled={isLoading}
                color="indigo"
                autoFocus
                crossOrigin={undefined}
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-600">
                ⚠️ {errorMsg}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                size="md"
                variant="outlined"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 border-slate-200 text-slate-600 rounded-xl capitalize font-bold text-xs py-2.5"
                placeholder={undefined}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="md"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl capitalize font-bold text-xs py-2.5 shadow-sm flex items-center justify-center gap-1.5"
                placeholder={undefined}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Unlock"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default AdminUnlockModal;
