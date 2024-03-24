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
    <footer className="mt-10 px-8">
      <div className="container mx-auto">
        <div className="mt-16 flex flex-wrap items-center gap-y-4 border-t border-gray-200 py-6 justify-between">
          <Typography
            className="text-center font-normal !text-gray-700"
            placeholder={undefined}
          >
            &copy; {CURRENT_YEAR} Made with{" "}
            <a href="https:www.sjagwan.com" target="_blank">
              SJ.
            </a>
          </Typography>
          <ul className="flex gap-4 md:gap-8  items-center">
            {LINKS.map((link) => (
              <li key={link.name}>
                <Typography
                  as="a"
                  href={link.href}
                  variant="small"
                  className="font-normal text-gray-700 hover:text-gray-900 transition-colors"
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
