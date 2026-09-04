"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

export function LandingHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (!menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove("menu-open");
  };

  const navLinks = [
    { name: "Overview", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Architecture", href: "/architecture" },
    { name: "NIST Standards", href: "/standards" },
    { name: "Team", href: "/about" },
  ];

  return (
    <>
      {/* Mobile Navigation Overlay & Sheet */}
      <div
        className={`mobile-overlay ${menuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
        style={{ display: menuOpen ? "block" : "none" }}
      />
      <div
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
        style={{ display: menuOpen ? "flex" : "none" }}
      >
        <nav className="mobile-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`mobile-nav-link ${isActive ? "active" : ""}`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        <Link href="/dashboard" className="mobile-sign-in" onClick={closeMenu}>
          Launch Console
        </Link>
      </div>

      {/* Centered Desktop & Mobile Top Header Bar */}
      <div className="public-header-wrapper">
        <header className="header">
          {/* Logo Circle Button */}
          <Link href="/" className="logo-btn" aria-label="Home">
            <div className="w-full h-full flex items-center justify-center text-slate-950 font-black">
              <Shield className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
          </Link>

          {/* White Nav Pill */}
          <nav className="nav-pill" aria-label="Primary Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Dark Launch Console Pill */}
          <Link href="/dashboard" prefetch={true} className="sign-in-btn">
            Launch Console
          </Link>

          {/* Mobile Burger Button */}
          <button
            className={`burger-btn ${menuOpen ? "is-open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className="burger-bar" />
            <span className="burger-bar" />
            <span className="burger-bar" />
          </button>
        </header>
      </div>
    </>
  );
}
