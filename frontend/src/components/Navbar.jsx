import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import logo from "../assets/logo-C.svg";
import { Link } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "../context/AuthContext";
import UserPhoto from "./common/UserPhoto";

const Navbar = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useAppContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { currentUser } = useAuth();

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

  // Déterminer la route d'accueil en fonction du rôle
  const getHomeRoute = () => {
    if (!currentUser) return "/home";

    switch (currentUser.role) {
      case "patient":
        return "/patient/home";
      case "medecin":
        return "/doctor/home";
      case "admin":
        return "/admin/home";
      default:
        return "/home";
    }
  };

  // Formater le nom selon le rôle
  const displayName = currentUser
    ? currentUser.role === "medecin"
      ? `Dr ${currentUser.nom}`
      : `${currentUser.prenom} ${currentUser.nom}`
    : "Utilisateur";

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

          <Link to={getHomeRoute()} className="flex w-10 h-10">
            <img
              src={logo}
              alt="logo"
              className="w-10 h-10 rounded-full object-cover border"
            />
          </Link>
          <Link to={getHomeRoute()} className="ml-4 hidden sm:block">
            <span className="text-xl font-semibold">
              Carnet de Santé Virtuel
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Menu déroulant de notifications */}
          <NotificationDropdown />

          <div className="relative">
            <button
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              onClick={handleProfileClick}
            >
              <UserPhoto
                user={currentUser}
                size="sm"
                className="border"
                fallbackIcon={
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
                }
              />
              <div className="hidden md:block text-left">
                <span className="block text-sm font-medium">{displayName}</span>
                <span className="block text-xs text-gray-500">
                  {currentUser?.role === "medecin"
                    ? "Médecin"
                    : currentUser?.role === "admin"
                    ? "Administrateur"
                    : "Patient"}
                </span>
              </div>
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
