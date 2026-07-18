"use client";

import Image from "next/image";
import { Typography, Button } from "@material-tailwind/react";
import { ScrollReveal } from "@/components";

function Hero({ userInfo, isLoading }: { userInfo: any; isLoading?: boolean }) {
  return (
    <header className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 py-16 lg:py-24 px-6 overflow-hidden" id="home">
      <div className="container mx-auto grid min-h-[60vh] grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <ScrollReveal className="lg:col-span-7 text-left order-2 lg:order-1" direction="left">
          <Typography
            className="mb-2 text-indigo-600 font-bold uppercase tracking-widest text-sm"
            placeholder={undefined}
          >
            Available for interesting projects
          </Typography>
          <Typography
            variant="h1"
            className="mb-6 text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-slate-900 font-heading"
            placeholder={undefined}
          >
            Hi, I&apos;m Shubhanshu. <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Let&apos;s build something real.
            </span>
          </Typography>
          <Typography
            variant="lead"
            className="mb-8 text-base md:text-lg text-slate-600 max-w-xl font-normal leading-relaxed font-sans"
            placeholder={undefined}
          >
            {isLoading ? (
              <span className="block space-y-3">
                <span className="block h-4 w-full bg-slate-200 rounded animate-pulse" />
                <span className="block h-4 w-4/5 bg-slate-200 rounded animate-pulse" />
                <span className="block h-4 w-3/5 bg-slate-200 rounded animate-pulse" />
              </span>
            ) : (
              userInfo?.description ||
              "I'm a full-stack engineer who loves building clean, intuitive, and high-performing web applications. Over the last 2.5+ years, I've focused on bridging the gap between clean engineering and human-centric design, using React, Node.js, and AWS to bring creative concepts to life."
            )}
          </Typography>
          <div className="flex flex-wrap gap-4">
            <Button
              size="md"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full capitalize font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200"
              placeholder={undefined}
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            >
              See My Work
            </Button>
            <Button
              size="md"
              variant="outlined"
              className="border-slate-200 hover:border-slate-900 text-slate-800 rounded-full capitalize font-bold text-sm tracking-wide hover:bg-slate-50 transition-all duration-200"
              placeholder={undefined}
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Let&apos;s Talk
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-5 flex justify-center order-1 lg:order-2" direction="right" delay={200}>
          {isLoading ? (
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[22rem] lg:h-[22rem] bg-slate-200 rounded-[2.5rem] animate-pulse" />
          ) : userInfo?.profileImg ? (
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[22rem] lg:h-[22rem]">
              {/* Background decorative glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-[2.5rem] transform rotate-6 scale-95 opacity-20 blur-md transition-transform duration-300 hover:rotate-3" />
              {/* Profile Image container */}
              <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl hover:scale-[1.02] transition-transform duration-300">
                <Image
                  width={500}
                  height={500}
                  alt="profile"
                  src={userInfo.profileImg}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[22rem] lg:h-[22rem] bg-slate-100 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-slate-200">
              <span className="text-slate-400">Loading Profile...</span>
            </div>
          )}
        </ScrollReveal>
      </div>
    </header>
  );
}

export default Hero;


