// components/Navbar.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-brand-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-brand-950 hidden sm:block">
                Readerboard
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/leaderboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/leaderboard')
                    ? 'text-brand-600'
                    : 'text-gray-500 hover:text-brand-950'
                }`}
              >
                Leaderboard
              </Link>

              {session && (
                <>
                  <Link
                    href="/library"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/library')
                        ? 'text-brand-600'
                        : 'text-gray-500 hover:text-brand-950'
                    }`}
                  >
                    My Library
                  </Link>
                  <Link
                    href="/upload"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/upload')
                        ? 'text-brand-600'
                        : 'text-gray-500 hover:text-brand-950'
                    }`}
                  >
                    Upload Book
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors"
                >
                  {session.user?.image ? (
                    <Image
                      width={32}
                      height={32}
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full ring-2 ring-brand-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-400 rounded-full flex items-center justify-center ring-2 ring-brand-200">
                      <span className="text-white text-sm font-semibold">
                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-brand-950">
                      {session.user?.name || 'User'}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-card shadow-soft border border-brand-100 py-2 z-20">
                      <div className="px-4 py-2 border-b border-brand-50">
                        <p className="text-sm font-medium text-brand-950">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>

                      <div className="border-t border-brand-50 my-2" />

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-pill hover:bg-brand-700 transition-colors shadow-glow"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-brand-50"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-brand-100 py-4 space-y-1">
            <Link
              href="/leaderboard"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                isActive('/leaderboard')
                  ? 'bg-brand-100 text-brand-600'
                  : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              Leaderboard
            </Link>

            {session ? (
              <>
                <Link
                  href="/library"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive('/library')
                      ? 'bg-brand-100 text-brand-600'
                      : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  My Library
                </Link>
                <Link
                  href="/upload"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive('/upload')
                      ? 'bg-brand-100 text-brand-600'
                      : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  Upload Book
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive('/profile')
                      ? 'bg-brand-100 text-brand-600'
                      : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  My Profile
                </Link>
                <div className="border-t border-brand-100 my-2" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signIn();
                }}
                className="block w-full text-left px-4 py-2 bg-brand-600 text-white rounded-pill hover:bg-brand-700 text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
