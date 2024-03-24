import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardBody, Typography, Avatar } from "@material-tailwind/react";

interface ProjectCardProps {
  images: [string];
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
  const [active, setActive] = React.useState(+images?.length);

  //Auto image changing code.
  const intervalRef = useRef<any>(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive((prevActive) => (prevActive + 1) % +images?.length);
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, [images?.length]);

  const handleHoverStart = () => {
    clearInterval(intervalRef.current);
  };

  const handleHoverEnd = () => {
    intervalRef.current = setInterval(() => {
      setActive((prevActive) => (prevActive + 1) % +images?.length);
    }, 2000);
  };

  return (
    <Card
      color="transparent"
      shadow={false}
      className="py-8  lg:flex-row"
      placeholder={undefined}
    >
      <CardBody
        className="w-full lg:gap-10 h-full lg:!flex justify-between "
        placeholder={undefined}
      >
        <div className="w-full mb-10 lg:mb-0">
          <Typography
            variant="h3"
            color="blue-gray"
            className="mb-4 font-bold lg:max-w-xs"
            placeholder={undefined}
          >
            {title}
          </Typography>
          <Typography
            className="mb-3 w-full lg:w-8/12 font-normal !text-gray-500"
            placeholder={undefined}
          >
            {description}
          </Typography>
          <Typography
            variant="h6"
            color="blue-gray"
            className="ml-1 mb-2 bg-blue-500 text-white py-1 px-2 rounded-full w-max"
            placeholder={undefined}
          >
            {affiliation}
          </Typography>
          <a href={prodLink} target="_blank">
            <Typography
              variant="paragraph"
              className="ml-3 text-gray-500 hover:text-blue-500 font-normal mb-5 underline"
              placeholder={undefined}
            >
              See details
            </Typography>
          </a>

          <div className="flex items-center gap-4">
            {images?.map((image, index) => (
              <div key={index} className="flex items-center gap-4">
                <Avatar
                  variant="rounded"
                  src={image}
                  alt="spotify"
                  size="sm"
                  className={`cursor-pointer ${
                    active === index ? "opacity-100" : "opacity-50"
                  }`}
                  placeholder={undefined}
                  onClick={() => setActive(index)}
                  onMouseEnter={handleHoverStart}
                  onMouseLeave={handleHoverEnd}
                />
                {index + 1 !== images?.length && (
                  <div className="w-[1px] h-[36px] bg-blue-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg w-full sm:w-[32rem] shrink-0">
          {images[active] && (
            <Image
              width={768}
              height={768}
              alt="projects image"
              src={images[active]}
              className="h-max rounded-lg w-max object-cover"
              onMouseEnter={handleHoverStart}
              onMouseLeave={handleHoverEnd}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default ProjectCard;
