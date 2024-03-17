import Image from "next/image";
import { Typography } from "@material-tailwind/react";

const CLIENTS = ["softobotics", "capgemini"];

export function PopularClients() {
  return (
    <section className="py-8 px-8 lg:py-20">
      <div className="container mx-auto grid items-center place-items-center">
        <div className="text-center">
          <Typography
            variant="h5"
            className="mb-4 uppercase !text-gray-500"
            placeholder={undefined}
          >
            Proven Experience
          </Typography>
          <Typography
            variant="h2"
            color="blue-gray"
            className="mb-4"
            placeholder={undefined}
          >
            Trusted by Leading Organizations <br /> to Deliver Results
          </Typography>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          {CLIENTS.map((logo, key) => (
            <Image
              key={key}
              alt={logo}
              width={480}
              height={480}
              src={`/logos/${logo}_logo.png`}
              className="w-40 grayscale opacity-75"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularClients;
