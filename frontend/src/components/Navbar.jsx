import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import logo from "../assets/logo-C.svg";
import { Link } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen, isDoctor } = useAppContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = () => setIsProfileOpen(false);

    if (isProfileOpen) {
      document.addEventListener("click", closeDropdown);
    }

    return () => document.removeEventListener("click", closeDropdown);
  }, [isProfileOpen]);

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 h-16 z-50">
      <div className="px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 "
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <Link to="/home" className="flex w-10 h-10">
            <img src={logo} alt="logo" />
          </Link>
          <Link to="/home" className="ml-4 hidden sm:block">
            <span className="text-xl font-semibold">
              Carnet de Santé Virtuel
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              onClick={handleProfileClick}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="hidden md:block">
                {isDoctor ? "Dr Dupont" : "Jean Dupont"}
              </span>
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
