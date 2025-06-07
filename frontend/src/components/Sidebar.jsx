import React from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useLocation } from "react-router-dom";
import { HiHome } from "react-icons/hi";
import { MdMedicalServices, MdEventNote, MdDescription } from "react-icons/md";
import { BsCalendar2Week } from "react-icons/bs";
import { FaSyringe } from "react-icons/fa";

const Sidebar = () => {
  const {
    isDoctor,
    isMobileMenuOpen,
    isSidebarExpanded,
    setIsSidebarExpanded,
    setIsMobileMenuOpen,
  } = useAppContext();
  const location = useLocation();

  const patientMenuItems = [
    { icon: <HiHome className="text-2xl" />, label: "Accueil", path: "/" },
    {
      icon: <MdMedicalServices className="text-2xl" />,
      label: "Profil médical",
      path: "/medical-profile",
    },
    {
      icon: <BsCalendar2Week className="text-2xl" />,
      label: "Rendez-vous",
      path: "/rendez-vous",
    },
    {
      icon: <MdDescription className="text-2xl" />,
      label: "Documents",
      path: "/documents",
    },
    {
      icon: <FaSyringe className="text-2xl" />,
      label: "Vaccination",
      path: "/vaccination",
    },
  ];

  const doctorMenuItems = [
    { icon: <HiHome className="text-2xl" />, label: "Accueil", path: "/" },
    {
      icon: <MdMedicalServices className="text-2xl" />,
      label: "Patients",
      path: "/patients",
    },
    {
      icon: <BsCalendar2Week className="text-2xl" />,
      label: "Agenda",
      path: "/agenda",
    },
    {
      icon: <MdDescription className="text-2xl" />,
      label: "Document",
      path: "/document",
    },
  ];

  const menuItems = isDoctor ? doctorMenuItems : patientMenuItems;

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Sidebar pour desktop */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-md transition-all duration-300 hidden md:flex flex-col
          ${isSidebarExpanded ? "w-64" : "w-16"}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <nav className="flex-1 py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-3 rounded-xl transition-colors duration-200
                    ${
                      isActive(item.path)
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-secondary hover:text-primary"
                    }`}
                >
                  <span className="flex items-center justify-center w-8">
                    {item.icon}
                  </span>
                  <span
                    className={`whitespace-nowrap transition-opacity duration-300 
                      ${isSidebarExpanded ? "opacity-100" : "opacity-0"}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Menu mobile avec effet de flou */}
      <div
        className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-30 transition-all duration-300 md:hidden
          ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-md transition-transform duration-300 z-40 md:hidden
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <nav className="flex-1 py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-xl transition-colors duration-200
                    ${
                      isActive(item.path)
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-secondary hover:text-primary"
                    }`}
                >
                  <span className="flex items-center justify-center w-8">
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
