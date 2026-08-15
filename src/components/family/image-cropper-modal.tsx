/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogBody, Typography, Button } from "@material-tailwind/react";
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

const VIEWPORT_SIZE = 260; // preview box width & height in px
const OUTPUT_SIZE = 240;   // final saved image resolution in px

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [imgDim, setImgDim] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Reset positioning when new image is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setImgLoaded(false);

      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImgDim({ w: img.width, h: img.height });
        setImgLoaded(true);
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Compute scale and bounds
  const getRenderParams = useCallback(() => {
    if (!imgDim.w || !imgDim.h) {
      return { drawW: VIEWPORT_SIZE, drawH: VIEWPORT_SIZE, left: 0, top: 0 };
    }

    const baseScale = Math.max(VIEWPORT_SIZE / imgDim.w, VIEWPORT_SIZE / imgDim.h);
    const currentScale = baseScale * zoom;
    const drawW = imgDim.w * currentScale;
    const drawH = imgDim.h * currentScale;

    // Center base position
    const baseLeft = (VIEWPORT_SIZE - drawW) / 2;
    const baseTop = (VIEWPORT_SIZE - drawH) / 2;

    // Constrain pan within edges
    const maxPanX = Math.max(0, (drawW - VIEWPORT_SIZE) / 2);
    const maxPanY = Math.max(0, (drawH - VIEWPORT_SIZE) / 2);

    const clampedPanX = Math.min(maxPanX, Math.max(-maxPanX, pan.x));
    const clampedPanY = Math.min(maxPanY, Math.max(-maxPanY, pan.y));

    const left = baseLeft + clampedPanX;
    const top = baseTop + clampedPanY;

    return { drawW, drawH, left, top };
  }, [imgDim, zoom, pan]);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Export cropped canvas
  const handleApplyCrop = () => {
    if (!imgRef.current || !imgLoaded) return;

    const { drawW, drawH, left, top } = getRenderParams();
    const ratio = OUTPUT_SIZE / VIEWPORT_SIZE;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Draw zoomed/panned image
      ctx.drawImage(
        imgRef.current,
        left * ratio,
        top * ratio,
        drawW * ratio,
        drawH * ratio
      );

      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      onCropComplete(dataUrl);
      onClose();
    }
  };

  const { drawW, drawH, left, top } = getRenderParams();

  return (
    <Dialog
      open={isOpen}
      handler={onClose}
      size="xs"
      className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 max-w-sm mx-auto"
      placeholder={undefined}
    >
      <DialogBody className="p-0 flex flex-col items-center select-none" placeholder={undefined}>
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-3">
          <div>
            <Typography className="text-base font-extrabold text-slate-900 font-heading" placeholder={undefined}>
              Adjust & Center Photo
            </Typography>
            <p className="text-xs text-slate-400">Drag to center face, use slider to zoom</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Interactive Viewport Box */}
        <div
          className="relative rounded-2xl overflow-hidden border-2 border-indigo-400 shadow-md bg-slate-950 cursor-grab active:cursor-grabbing mb-4"
          style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {imgLoaded && (
            <img
              src={imageSrc}
              alt="Crop target"
              className="absolute pointer-events-none max-w-none transition-none"
              style={{
                width: `${drawW}px`,
                height: `${drawH}px`,
                left: `${left}px`,
                top: `${top}px`,
              }}
              draggable={false}
            />
          )}

          {/* Semi-transparent circular guide overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center border-2 border-white/40 rounded-2xl">
            <div className="h-full w-full rounded-full border border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="w-full space-y-3 px-1">
          <div className="flex items-center gap-3">
            <MagnifyingGlassMinusIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <MagnifyingGlassPlusIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
              title="Reset Zoom & Position"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outlined"
              onClick={onClose}
              className="flex-1 rounded-xl text-slate-600 border-slate-300 capitalize text-xs font-bold py-2.5"
              placeholder={undefined}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="filled"
              onClick={handleApplyCrop}
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl capitalize text-xs font-bold py-2.5 shadow-md"
              placeholder={undefined}
            >
              <CheckIcon className="h-4 w-4" />
              Apply Photo
            </Button>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default ImageCropperModal;
