"use client";

import Image from "next/image";
import { Typography } from "@material-tailwind/react";

function Hero({ userInfo }: { userInfo: any }) {
  return (
    <header className="bg-white p-8" id="home">
      <div className="container mx-auto grid h-full gap-10 min-h-[60vh] w-full grid-cols-1 items-center lg:grid-cols-2">
        <div className="row-start-2 lg:row-auto">
          <Typography
            variant="h1"
            color="blue-gray"
            className="mb-4 lg:text-5xl !leading-tight text-3xl"
            placeholder={undefined}
          >
            Welcome to my Web <br /> Development Portofolio!
          </Typography>
          <Typography
            variant="lead"
            className="mb-4 !text-gray-500 md:pr-16 xl:pr-28"
            placeholder={undefined}
          >
            {userInfo?.description || " "}
          </Typography>

          <Typography
            variant="small"
            className="font-normal !text-gray-500"
            placeholder={undefined}
          >
            <a
              href={userInfo?.githubUrl}
              target="_blank"
              className="font-medium underline transition-colors"
            >
              GitHub
            </a>
            <a
              href={userInfo?.linkedInUrl}
              target="_blank"
              className="font-medium underline transition-colors"
            >
              LinkedIn
            </a>
          </Typography>
        </div>
        {userInfo?.profileImg && (
          <Image
            width={1024}
            height={1024}
            alt="profile"
            src={userInfo?.profileImg}
            className="h-[32rem] w-full rounded-xl object-contain"
          />
        )}
      </div>
    </header>
  );
}

export default Hero;
