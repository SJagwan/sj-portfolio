"use client";

import { Typography, Button } from "@material-tailwind/react";
import {
  ChartBarIcon,
  PuzzlePieceIcon,
  CursorArrowRaysIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { ResumeItem } from "@/components";
import { downloadResume } from "@/firebase/firebase.utils";

const RESUME_ITEMS = [
  {
    icon: ChartBarIcon,
    children: "React",
  },
  {
    icon: PuzzlePieceIcon,
    children: "Node.js",
  },
  {
    icon: CursorArrowRaysIcon,
    children: "AWS Cloud",
  },
];

export function Resume() {
  return (
    <section className="px-8 py-24">
      <div className="container mx-auto grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div className="col-span-1">
          <Typography variant="h2" color="blue-gray" placeholder={undefined}>
            My Resume
          </Typography>
          <Typography
            className="mb-4 mt-3 w-9/12 font-normal !text-gray-500"
            placeholder={undefined}
          >
            Full-Stack Developer with a passion for building user-friendly and
            scalable web applications. Leveraging 2.5+ years of experience, I&apos;ve
            spearheaded the development of innovative solutions using AWS cloud
            technologies.
          </Typography>
          <Button
            variant="text"
            color="gray"
            className="flex items-center gap-2"
            placeholder={"resume"}
            onClick={() => downloadResume()}
          >
            Download
            <ArrowDownTrayIcon
              strokeWidth={4}
              className="h-5 w-5 text-gray-900"
            />
          </Button>
        </div>
        <div className="col-span-1 grid gap-y-6 lg:ml-auto pr-0 lg:pr-12 xl:pr-32">
          {RESUME_ITEMS.map((props, idx) => (
            <ResumeItem key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Resume;
