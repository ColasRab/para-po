"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { FaRoute } from "react-icons/fa";
import { FaHouse, FaPeopleGroup, FaShop } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import Logo from "./logo";
import AvatarComponent from "./avatar";

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navLinks: NavLink[] = [
  {
    name: "Home",
    href: "/",
    icon: <FaHouse className="h-6 w-6" />,
  },
  {
    name: "Route",
    href: "/route",
    icon: <FaRoute className="h-6 w-6" />,
  },
  {
    name: "Forum",
    href: "/forum",
    icon: <FaPeopleGroup className="h-6 w-6" />,
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    icon: <FaShop className="h-6 w-6" />,
  },
];

const NavBar: React.FC = () => {
  const { status } = useSession();
  return (
    <header className="sticky flex backdrop-blur-2xl justify-center bg-background top-0 left-0 z-50 w-full shadow-sm dark:bg-gray-950 dark:text-gray-50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="md:hidden" size="icon" variant="outline">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>

          <Link className="md:flex items-center gap-2 hidden" href="/">
            <Logo dimension={32} />
            <span className="text-lg font-semibold">Para Po!</span>
          </Link>

          <SheetContent side="left" className="bg-white">
            <div className="flex flex-col justify-between h-full">
              <div className="grid gap-4 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-medium hover:underline flex gap-4 items-center"
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden md:flex items-center gap-4 md:gap-2">
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:underline"
              >
                {link.name}
              </Link>
            ))}
            {status === "authenticated" ? (
              <Link href="/profile">
                <AvatarComponent />
              </Link>
            ) : (
              <Button
                className="w-full items-center"
                size="lg"
                variant="outline"
                onClick={() => signIn("google")}
              >
                <FcGoogle className="h-12 w-12" />
                Signin
              </Button>
            )}
          </nav>
        </div>
        <Link className="flex items-center gap-2 md:hidden" href="/">
          <Logo dimension={32} />
          <span className="text-lg font-semibold">Para Po!</span>
        </Link>
        <div className="flex items-center gap-4 md:hidden">
          {status === "authenticated" ? (
            <Link href="/profile">
              <AvatarComponent />
            </Link>
          ) : (
            <Button
              className="w-full items-center"
              size="lg"
              variant="outline"
              onClick={() => signIn('google')}
            >
              <FcGoogle className="h-12 w-12" />
              Signin
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;

function MenuIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

export function MountainIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
