import { Typography } from "@material-tailwind/react";

interface FooterProps {
  userInfo?: any;
}

const CURRENT_YEAR = new Date().getFullYear();

export function Footer({ userInfo }: FooterProps) {
  const links = [
    { name: "Home", href: "#home" },
    { name: "Projects", href: "#projects" },
    { name: "Skills", href: "#skills" },
    { name: "Contact", href: "#contact" },
  ];

  const gitHubUrl = userInfo?.gitHubUrl;
  const linkedInUrl = userInfo?.linkedInUrl;
  const name = userInfo?.name || "";
  const description = userInfo?.description || "";
  const hasSocials = !!(gitHubUrl || linkedInUrl);

  return (
    <footer className="mt-28 px-6 pb-12 relative overflow-hidden bg-slate-50/20">
      {/* Top border with gradient center highlight */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200/80 to-transparent mb-16" />

      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 items-start">
          {/* Brand/Bio Column */}
          <div className="md:col-span-6 space-y-4">
            {name && (
              <Typography
                variant="h5"
                className="text-slate-900 font-extrabold font-heading text-lg tracking-tight"
                placeholder={undefined}
              >
                {name}
              </Typography>
            )}
            {description && (
              <Typography
                className="text-slate-500 font-sans text-sm leading-relaxed max-w-sm font-normal"
                placeholder={undefined}
              >
                {description}
              </Typography>
            )}

            {/* Live Status Indicator Capsule */}
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50/50 w-fit px-3.5 py-1.5 rounded-full border border-indigo-100/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Available for new projects
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 md:col-start-8 space-y-4">
            <Typography
              className="text-xs font-bold text-slate-400 uppercase tracking-widest"
              placeholder={undefined}
            >
              Site Links
            </Typography>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors duration-150"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect/Socials Column */}
          {hasSocials && (
            <div className="md:col-span-2 space-y-4">
              <Typography
                className="text-xs font-bold text-slate-400 uppercase tracking-widest"
                placeholder={undefined}
              >
                Connect
              </Typography>
              <ul className="space-y-3">
                {gitHubUrl && (
                  <li>
                    <a
                      href={gitHubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors duration-150 block"
                    >
                      GitHub
                    </a>
                  </li>
                )}
                {linkedInUrl && (
                  <li>
                    <a
                      href={linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors duration-150 block"
                    >
                      LinkedIn
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Credits Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100/80 pt-8 text-slate-400 text-xs">
          <Typography
            className="text-xs text-slate-400 font-medium font-sans"
            placeholder={undefined}
          >
            &copy; {CURRENT_YEAR} {name}. All rights reserved.
          </Typography>
          <Typography
            className="text-xs text-slate-400 font-normal font-sans"
            placeholder={undefined}
          >
            Built with Next.js & Tailwind CSS
          </Typography>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
