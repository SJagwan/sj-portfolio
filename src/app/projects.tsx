import React from "react";
import { Typography } from "@material-tailwind/react";
import { ProjectCard, ScrollReveal } from "@/components";

export function Projects({ projectInfo, isLoading }: { projectInfo: any; isLoading?: boolean }) {
  return (
    <section className="px-6 py-20 bg-slate-50/30" id="projects">
      <div className="container mx-auto">
        <ScrollReveal className="mb-16 text-center max-w-2xl mx-auto">
          <Typography
            className="mb-2 text-indigo-600 font-bold uppercase tracking-widest text-sm"
            placeholder={undefined}
          >
            Curated Works
          </Typography>
          <Typography
            variant="h2"
            className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mb-4"
            placeholder={undefined}
          >
            Things I&apos;ve Built
          </Typography>
          <Typography
            variant="lead"
            className="text-slate-500 font-normal leading-relaxed text-base font-sans"
            placeholder={undefined}
          >
            A collection of digital solutions I&apos;ve designed, coded, and shipped.
            Each project represents a unique set of challenges solved with care, clean architecture, and a focus on user experience.
          </Typography>
        </ScrollReveal>
        <div className="flex flex-col gap-12 max-w-5xl mx-auto">
          {isLoading ? (
            // Skeleton project cards
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 p-8 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="h-6 w-24 bg-slate-200 rounded-full" />
                    <div className="h-8 w-3/4 bg-slate-200 rounded" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-slate-200 rounded" />
                      <div className="h-4 w-5/6 bg-slate-200 rounded" />
                      <div className="h-4 w-2/3 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="w-full rounded-2xl bg-slate-200 aspect-[4/3]" />
                  </div>
                </div>
              </div>
            ))
          ) : projectInfo && projectInfo.length > 0 ? (
            projectInfo.map((props: any, idx: any) => (
              <ScrollReveal key={idx} delay={idx * 150}>
                <ProjectCard {...props} />
              </ScrollReveal>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <Typography className="text-slate-400 font-sans" placeholder={undefined}>
                No projects found.
              </Typography>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Projects;


