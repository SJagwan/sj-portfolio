/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";
import { CameraIcon, XMarkIcon, UserCircleIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import ImageCropperModal from "./image-cropper-modal";

interface AvatarPickerProps {
  photoUrl: string;
  setPhotoUrl: (url: string) => void;
}

export function AvatarPicker({ photoUrl, setPhotoUrl }: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string>("");

  // When a new image is selected from file picker, open the cropper modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setPendingImageSrc(event.target.result);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);

    // Reset input so re-uploading the same file works
    e.target.value = "";
  };

  // Open cropper with existing photo to reposition/re-center
  const handleEditCurrentPhoto = () => {
    if (photoUrl) {
      setPendingImageSrc(photoUrl);
      setCropperOpen(true);
    }
  };

  return (
    <div className="space-y-2 pt-1">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
        Profile Photo (Optional)
      </label>

      <div className="flex items-center gap-4 bg-slate-50/90 p-3 rounded-2xl border border-slate-200/90">
        {/* Photo Preview Box */}
        <div className="relative group shrink-0">
          <div className="h-16 w-16 rounded-2xl border-2 border-indigo-300 bg-white overflow-hidden flex items-center justify-center shadow-inner">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-12 w-12 text-slate-300" />
            )}
          </div>

          {photoUrl && (
            <button
              type="button"
              onClick={() => setPhotoUrl("")}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow transition-colors"
              title="Remove photo"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Upload & Edit Buttons */}
        <div className="flex-1 flex flex-col gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <CameraIcon className="h-4 w-4 text-indigo-500" />
              {photoUrl ? "Change Photo" : "Upload Photo"}
            </button>

            {photoUrl && (
              <button
                type="button"
                onClick={handleEditCurrentPhoto}
                className="flex items-center gap-1.5 px-3.5 py-1.5 border border-indigo-200 hover:border-indigo-400 bg-indigo-50/60 hover:bg-indigo-100/60 text-indigo-700 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 text-indigo-600" />
                Center / Zoom
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            {photoUrl
              ? "Click 'Center / Zoom' to adjust positioning"
              : "Upload any photo, then drag to center face"}
          </p>
        </div>
      </div>

      {/* Interactive Crop & Zoom Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={pendingImageSrc}
        onClose={() => setCropperOpen(false)}
        onCropComplete={(croppedUrl) => setPhotoUrl(croppedUrl)}
      />
    </div>
  );
}

export default AvatarPicker;
