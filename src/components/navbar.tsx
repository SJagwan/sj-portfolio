import React from "react";
import {
  Navbar as MTNavbar,
  Collapse,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import {
  RectangleStackIcon,
  UserCircleIcon,
  XMarkIcon,
  Bars3Icon,
  CommandLineIcon,
} from "@heroicons/react/24/solid";

const NAV_MENU = [
  {
    name: "Projects",
    icon: RectangleStackIcon,
    href: "#projects",
    id: "projects",
  },
  {
    name: "Skills",
    icon: CommandLineIcon,
    href: "#skills",
    id: "skills",
  },
  {
    name: "Contact",
    icon: UserCircleIcon,
    href: "#contact",
    id: "contact",
  },
];

interface NavItemProps {
  children: React.ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ children, href, active, onClick }: NavItemProps) {
  return (
    <li>
      <Typography
        as="a"
        href={href || "#"}
        variant="paragraph"
        onClick={onClick}
        className={`flex items-center gap-2 font-semibold transition-all duration-300 px-4 py-2 rounded-full ${
          active
            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
        placeholder={undefined}
      >
        {children}
      </Typography>
    </li>
  );
}

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("home");
  const [scrollProgress, setScrollProgress] = React.useState(0);

  const handleOpen = () => setOpen((cur) => !cur);
  const handleClose = () => setOpen(false);

  React.useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpen(false);
    window.addEventListener("resize", handleResize);

    const handleScroll = () => {
      // Track active section scrollspy
      const sections = ["home", "projects", "skills", "contact"];
      const scrollPosition = window.scrollY + 120; // offset for nav height

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }

      // Track scroll progress bar
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full">
      <MTNavbar
        shadow={false}
        fullWidth
        className="border-0 bg-white/70 backdrop-blur-md border-b border-slate-100/50 py-3 transition-all duration-300 relative"
        placeholder={undefined}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          <a href="#home">
            <Typography
              className="text-xl font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors font-heading"
              placeholder={undefined}
            >
              SJ
            </Typography>
          </a>

          <ul className="ml-10 hidden items-center gap-4 lg:flex">
            {NAV_MENU.map(({ name, icon: Icon, href, id }) => (
              <NavItem key={name} href={href} active={activeSection === id}>
                <Icon className="h-4 w-4" />
                {name}
              </NavItem>
            ))}
          </ul>
          <IconButton
            variant="text"
            color="gray"
            onClick={handleOpen}
            className="ml-auto inline-block lg:hidden rounded-full hover:bg-slate-100"
            placeholder={undefined}
          >
            {open ? (
              <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-slate-800" />
            ) : (
              <Bars3Icon strokeWidth={2.5} className="h-5 w-5 text-slate-800" />
            )}
          </IconButton>
        </div>
        <Collapse open={open}>
          <div className="container mx-auto mt-4 border-t border-slate-100 px-4 pt-4">
            <ul className="flex flex-col gap-2">
              {NAV_MENU.map(({ name, icon: Icon, href, id }) => (
                <NavItem key={name} href={href} active={activeSection === id} onClick={handleClose}>
                  <Icon className="h-4 w-4" />
                  {name}
                </NavItem>
              ))}
            </ul>
          </div>
        </Collapse>
      </MTNavbar>

      {/* Thin Horizontal Scroll Progress Bar */}
      <div
        className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 to-violet-600 origin-left transition-transform duration-75 ease-out z-50"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />
    </div>
  );
}

export default Navbar;




