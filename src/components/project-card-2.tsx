import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardBody, Typography, Avatar } from "@material-tailwind/react";

interface ProjectCardProps {
  images: [string];
  title: string;
  description: string;
}

export function ProjectCard2({ images, title, description }: ProjectCardProps) {
  const [active, setActive] = React.useState(+images.length);

  //Auto image changing code.
  const intervalRef = useRef<any>(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive((prevActive) => (prevActive + 1) % +images.length);
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, [images.length]);

  const handleHoverStart = () => {
    clearInterval(intervalRef.current);
  };

  const handleHoverEnd = () => {
    intervalRef.current = setInterval(() => {
      setActive((prevActive) => (prevActive + 1) % +images.length);
    }, 2000);
  };

  return (
    <Card
      color="transparent"
      shadow={false}
      className="py-8 lg:flex-row"
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
            Mobile App Development
          </Typography>
          <Typography
            className="mb-3 w-full lg:w-8/12 font-normal !text-gray-500"
            placeholder={undefined}
          >
            I had the pleasure of working with Lily on a critical web
            development project, and I can confidently say that their expertise
            and professionalism exceeded my expectations.
          </Typography>
          <Typography
            variant="h6"
            color="blue-gray"
            className="mb-0.5"
            placeholder={undefined}
          >
            Michael - Technical Manager
          </Typography>
          <Typography
            variant="small"
            className="font-normal mb-5 !text-gray-500"
            placeholder={undefined}
          >
            Marketing @ APPLE INC.
          </Typography>
          <div className="flex items-center gap-4">
            {images.map((image, index) => (
              <div key={index} className="flex items-center gap-4">
                <Avatar
                  variant="rounded"
                  src={image}
                  alt="spotify"
                  size="sm"
                  className={`cursor-pointer ${
                    active === index + 1 ? "opacity-100" : "opacity-50"
                  }`}
                  placeholder={undefined}
                  onClick={() => setActive(index)}
                  onMouseEnter={handleHoverStart}
                  onMouseLeave={handleHoverEnd}
                />
                {index + 1 !== images.length && (
                  <div className="w-[1px] h-[36px] bg-blue-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="h-[21rem] rounded-lg w-full sm:w-[18rem] shrink-0">
          <Image
            width={768}
            height={768}
            alt="testimonial image"
            src={images[active]}
            className="h-full rounded-lg w-full object-cover"
            onMouseEnter={handleHoverStart}
            onMouseLeave={handleHoverEnd}
          />
        </div>
      </CardBody>
    </Card>
  );
}

export default ProjectCard2;
