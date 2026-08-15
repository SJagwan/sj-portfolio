"use client";

import React, { useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import {
  ChartBarIcon,
  PuzzlePieceIcon,
  CursorArrowRaysIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { ResumeItem } from "@/components/portfolio";
import { downloadResume } from "@/firebase/firebase.utils";
import { ScrollReveal } from "@/components";

const RESUME_ITEMS = [
  {
    icon: CursorArrowRaysIcon,
    children: "AWS Cloud Services",
  },
  {
    icon: ChartBarIcon,
    children: "React & Next.js",
  },
  {
    icon: PuzzlePieceIcon,
    children: "Node.js & Databases",
  },
];

export function Resume() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError("");
      await downloadResume();
    } catch (err: any) {
      console.error("Resume download failed:", err);
      setError("Unable to download resume directly. Please contact me via the form below.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="px-6 py-20 bg-slate-50/50" id="resume">
      <div className="container mx-auto grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <ScrollReveal className="lg:col-span-6" direction="left">
          <Typography
            className="mb-2 text-indigo-600 font-bold uppercase tracking-widest text-sm"
            placeholder={undefined}
          >
            Background
          </Typography>
          <Typography
            variant="h2"
            className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mb-4"
            placeholder={undefined}
          >
            Professional Resume
          </Typography>
          <Typography
            className="mb-8 font-normal text-slate-600 leading-relaxed font-sans text-base"
            placeholder={undefined}
          >
            From architecting cloud infrastructure on AWS to building
            pixel-perfect React interfaces — I work across the entire stack
            to ship products that users love. 2.5+ years of hands-on
            engineering experience.
          </Typography>
          <div className="flex flex-col items-start gap-3">
            <Button
              size="md"
              disabled={isDownloading}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full capitalize font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
              placeholder={"resume"}
              onClick={handleDownload}
            >
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Downloading...
                </>
              ) : (
                <>
                  Download Resume
                  <ArrowDownTrayIcon
                    strokeWidth={3}
                    className="h-4 w-4 text-white"
                  />
                </>
              )}
            </Button>
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
          </div>
        </ScrollReveal>
        <ScrollReveal className="lg:col-span-6 flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center lg:justify-end" direction="right" delay={200}>
          {RESUME_ITEMS?.map((props, idx) => (
            <ResumeItem key={idx} {...props} />
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

export default Resume;

