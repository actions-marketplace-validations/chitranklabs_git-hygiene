'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import { Navbar } from '@chitrank2050/monoline-ui/navbar';

import { ThemeControl } from './theme-control';

const navLinks = [
  { label: 'Sandbox', href: '/#sandbox' },
  { label: 'Why Zero Deps', href: '/#benchmark' },
  { label: 'Integrations', href: '/#integrations' },
  { label: 'Core API', href: '/#core-api' },
  { label: 'Docs', href: '/docs/' },
  { label: 'Changelog', href: '/changelog' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    if (menuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [menuOpen]);

  return (
    <>
      <Navbar sticky glass layout="contained">
        <div className="flex min-w-0 items-center gap-ml-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 text-text no-underline"
            onClick={closeMenu}
          >
            <span className="font-mono text-sm font-bold tracking-tight text-text">
              🌊 git-hygiene
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:contents">
          <Navbar.Nav>
            {navLinks.map(link => (
              <Navbar.Link key={link.href} asChild>
                {link.href.startsWith('/#') ||
                link.href.startsWith('#') ||
                link.href.startsWith('/docs/') ? (
                  <a href={link.href}>{link.label}</a>
                ) : (
                  <Link href={link.href}>{link.label}</Link>
                )}
              </Navbar.Link>
            ))}
          </Navbar.Nav>
        </div>

        <Navbar.Actions>
          <ThemeControl />
          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden flex size-8.5 items-center justify-center rounded-lg border border-border bg-surface text-text hover:border-accent transition-colors cursor-pointer"
          >
            <svg
              className="size-4.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </Navbar.Actions>
      </Navbar>

      {/* Mobile Full-Screen Menu Drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-background flex flex-col justify-between overflow-y-auto overscroll-contain animate-in fade-in duration-150 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Drawer Top Bar with Brand, Theme, and Close (Cross) Button */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
            <Link
              href="/"
              className="font-mono text-sm font-bold tracking-tight text-text"
              onClick={closeMenu}
            >
              🌊 git-hygiene
            </Link>

            <div className="flex items-center gap-2">
              <ThemeControl />
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation List */}
          <div className="flex-1 px-6 py-8">
            <nav className="flex flex-col gap-2 font-mono text-base">
              {navLinks.map(link =>
                link.href.startsWith('/#') ||
                link.href.startsWith('#') ||
                link.href.startsWith('/docs/') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-text hover:bg-surface-2 hover:text-accent transition-colors border border-transparent hover:border-border"
                  >
                    <span>{link.label}</span>
                    <span className="text-text-muted text-xs">→</span>
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-text hover:bg-surface-2 hover:text-accent transition-colors border border-transparent hover:border-border"
                  >
                    <span>{link.label}</span>
                    <span className="text-text-muted text-xs">→</span>
                  </Link>
                ),
              )}
              <a
                href="https://github.com/chitranklabs/git-hygiene"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-text hover:bg-surface-2 hover:text-accent transition-colors border border-transparent hover:border-border mt-2"
              >
                <span>GitHub Repository ↗</span>
                <span className="text-accent text-xs">★ Star</span>
              </a>
            </nav>
          </div>

          {/* Footer Details */}
          <div className="border-t border-border px-6 py-5 flex items-center justify-between font-mono text-2xs text-text-muted">
            <span>git-hygiene · MIT</span>
            <span>Node 24+ Native</span>
          </div>
        </div>
      )}
    </>
  );
}
