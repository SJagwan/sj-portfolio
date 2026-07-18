import { Typography } from "@material-tailwind/react";

const LINKS = [
  {
    name: "Home",
    href: "#home",
  },
  {
    name: "Projects",
    href: "#projects",
  },
];
const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-20 px-6 pb-8">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-y-4 border-t border-slate-200/60 pt-8 justify-between text-slate-500">
          <Typography
            className="text-sm font-medium text-slate-500"
            placeholder={undefined}
          >
            &copy; {CURRENT_YEAR} Made by{" "}
            <a
              href="https://www.sjagwan.com"
              target="_blank"
              className="text-slate-900 font-semibold hover:text-indigo-600 transition-colors duration-200 underline underline-offset-4"
            >
              SJ
            </a>
            .
          </Typography>
          <ul className="flex gap-6 items-center">
            {LINKS.map((link) => (
              <li key={link.name}>
                <Typography
                  as="a"
                  href={link.href}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-200"
                  placeholder={undefined}
                >
                  {link.name}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
