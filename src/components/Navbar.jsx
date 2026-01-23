"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { Palette } from "lucide-react";

export default function Navbar() {
  return (
    <header
      className="
        w-[95%]
        md:w-4/5
        xl:w-2/3
        mx-auto rounded-b-xl px-5 py-4
        dark:bg-card bg-card border-b shadow-md
        sticky top-0 z-50
      "
    >
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl flex flex-row items-center gap-3 font-extrabold tracking-tight"
        >
          <Palette />
          ITR Quarterly
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link
            href="/"
            className="text-base font-medium hover:underline underline-offset-4"
          >
            Dashboard
          </Link>
          <Link
            href="/planner"
            className="text-base font-medium hover:underline underline-offset-4"
          >
            Planner
          </Link>
          <Link
            href="/about"
            className="text-base font-medium hover:underline underline-offset-4"
          >
            About
          </Link>
        </nav>

        {/* Desktop ModeToggle */}
        <div className="hidden md:flex">
          <ModeToggle />
        </div>

        {/* Mobile Navigation (Hamburger menu) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open navigation menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-2/3 sm:w-1/3">
              <nav className="flex flex-col items-center gap-8 mt-16">
                <Link
                  href="/"
                  className="text-base font-medium hover:underline"
                >
                  Dashboard
                </Link>
                <Link
                  href="/planner"
                  className="text-base font-medium hover:underline"
                >
                  Planner
                </Link>
                <Link
                  href="/about"
                  className="text-base font-medium hover:underline"
                >
                  About
                </Link>
                <div className="pt-8">
                  <ModeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
