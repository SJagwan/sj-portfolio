
import React from "react";
import { Typography } from "@material-tailwind/react";
import ProjectCard2 from "@/components/project-card-2";

export function Testimonial({ projectInfo }: { projectInfo: any }) {
  return (
    <section className="py-12 px-8 lg:py-24">
      <div className="container max-w-screen-lg mx-auto">
        <div className="container mx-auto mb-20 text-center">
          <Typography
            variant="h2"
            color="blue-gray"
            className="mb-4"
            placeholder={undefined}
          >
            What Clients Say
          </Typography>
          <Typography
            variant="lead"
            className="mx-auto w-full px-4 font-normal !text-gray-500 lg:w-8/12"
            placeholder={undefined}
          >
            Discover what clients have to say about their experiences working
            with me. My client&apos;s satisfaction is my greatest achievement!
          </Typography>
        </div>
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-1 xl:grid-cols-1">
        {projectInfo?.map((props: any, idx: any) => (
          <ProjectCard2 key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}

export default Testimonial;
