import React from "react";
import { Typography } from "@material-tailwind/react";
import { ProjectCard } from "@/components";

export function Projects({ projectInfo }: { projectInfo: any }) {
  return (
    <section className="px-8" id="projects">
      <div className="container mx-auto border-t border-gray-200 pt-12">
        <div className="container mx-auto mb-20 text-center">
          <Typography
            variant="h2"
            color="blue-gray"
            className="mb-4"
            placeholder={undefined}
          >
            My Work
          </Typography>
          <Typography
            variant="lead"
            className="mx-auto w-full px-4 font-normal !text-gray-500 lg:w-8/12"
            placeholder={undefined}
          >
            Explore the projects I&apos;ve worked on, showcasing my skills and
            expertise.
          </Typography>
        </div>
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-1 xl:grid-cols-1 ">
        {projectInfo?.map((props: any, idx: any) => (
          <ProjectCard key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}

export default Projects;
