import Image from "next/image";
import { Typography } from "@material-tailwind/react";
import { ScrollReveal } from "@/components";

interface Company {
  name: string;
  logoUrl?: string;
  Img?: string;
}

interface PopularClientsProps {
  companies?: Company[];
  isLoading?: boolean;
}

export function PopularClients({ companies = [], isLoading }: PopularClientsProps) {
  // If not loading and there are no companies in the document, don't display the section
  if (!isLoading && companies.length === 0) {
    return null;
  }

  return (
    <section className="px-8 py-12">
      <ScrollReveal className="container mx-auto grid items-center place-items-center border-t border-slate-200 pt-16">
        <div className="text-center">
          <Typography
            variant="h5"
            className="mb-4 uppercase text-indigo-600 font-bold tracking-widest text-sm"
            placeholder={undefined}
          >
            Proven Track Record
          </Typography>
          <Typography
            variant="h2"
            className="mb-4 text-3xl md:text-4xl font-extrabold text-slate-900 font-heading"
            placeholder={undefined}
          >
            Collaborating with Trusted Organizations
          </Typography>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-12 mt-8 min-h-[80px]">
          {isLoading ? (
            // Skeleton load placeholders
            <>
              <div className="w-36 h-12 bg-slate-200 rounded animate-pulse" />
              <div className="w-36 h-12 bg-slate-200 rounded animate-pulse" />
            </>
          ) : (
            companies.map((company, key) => (
              <div key={key} className="flex items-center justify-center">
                {company.logoUrl ? (
                  <Image
                    alt={company.name}
                    width={200}
                    height={80}
                    src={company.logoUrl}
                    className="w-36 h-auto grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-300 object-contain"
                  />
                ) : (
                  <Typography className="text-slate-400 font-semibold text-lg" placeholder={undefined}>
                    {company.name}
                  </Typography>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}

export default PopularClients;



