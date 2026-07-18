import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Typography } from "@material-tailwind/react";

interface ProjectCardProps {
  images: string[];
  title: string;
  description: string;
  prodLink: string;
  affiliation: string;
}

export function ProjectCard({
  images,
  title,
  description,
  prodLink,
  affiliation,
}: ProjectCardProps) {
  const [active, setActive] = React.useState(0);

  // Auto image changing code
  const intervalRef = useRef<any>(null);
  useEffect(() => {
    if (!images || images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setActive((prevActive) => (prevActive + 1) % images.length);
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [images]);

  const handleHoverStart = () => {
    clearInterval(intervalRef.current);
  };

  const handleHoverEnd = () => {
    if (!images || images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActive((prevActive) => (prevActive + 1) % images.length);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 hover:shadow-lg hover:border-indigo-100/50 transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col justify-between h-full order-2 lg:order-1">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-sans">
                {affiliation}
              </span>
            </div>
            
            <Typography
              variant="h3"
              className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading mb-4"
              placeholder={undefined}
            >
              {title}
            </Typography>

            <Typography
              className="text-slate-500 font-normal leading-relaxed text-base font-sans mb-6"
              placeholder={undefined}
            >
              {description}
            </Typography>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 border-t border-slate-100/80">
            <a
              href={prodLink}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-all duration-200 group"
            >
              See Project Details
              <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </a>

            {/* Custom Dot Indicators */}
            {images?.length > 1 && (
              <div className="flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      active === index ? "w-6 bg-slate-900" : "w-2 bg-slate-200 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2">
          {images && images[active] ? (
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 aspect-[4/3] flex items-center justify-center cursor-pointer"
              onMouseEnter={handleHoverStart}
              onMouseLeave={handleHoverEnd}
              onClick={() => {
                if (images.length > 1) {
                  setActive((prevActive) => (prevActive + 1) % images.length);
                }
              }}
            >
              <Image
                width={600}
                height={450}
                alt={`${title} image ${active + 1}`}
                src={images[active]}
                className="w-full h-full object-cover select-none transition-all duration-500"
                priority={active === 0}
              />
            </div>
          ) : (
            <div className="w-full rounded-2xl bg-slate-100 aspect-[4/3] flex items-center justify-center border-2 border-dashed border-slate-200">
              <span className="text-slate-400 text-sm">No image available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
