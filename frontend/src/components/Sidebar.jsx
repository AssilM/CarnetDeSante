import React from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useLocation } from "react-router-dom";
import { HiHome } from "react-icons/hi";
import {
  MdMedicalServices,
  MdEventNote,
  MdDescription,
  MdAddCircle,
  MdDashboard,
  MdPeople,
  MdSettings,
  MdNotifications,
  MdMessage,
} from "react-icons/md";
import { BsCalendar2Week } from "react-icons/bs";
import {
  FaSyringe,
  FaHome,
  FaUserMd,
  FaFileMedical,
  FaCog,
  FaCalendarAlt,
  FaCalendarPlus,
  FaUserCog,
  FaChartBar,
} from "react-icons/fa";

const Sidebar = () => {
  const {
    isDoctor,
    isAdmin,
    isMobileMenuOpen,
    isSidebarExpanded,
    setIsSidebarExpanded,
    setIsMobileMenuOpen,
  } = useAppContext();
  const location = useLocation();

  const patientMenuItems = [
    {
      icon: <HiHome className="text-2xl" />,
      label: "Accueil",
      path: "/patient/home",
    },
    {
      icon: <FaUserMd className="text-2xl" />,
      label: "Profil médical",
      path: "/medical-profile",
    },
    {
      icon: <FaCalendarAlt className="text-2xl" />,
      label: "Rendez-vous",
      path: "/appointments",
    },
    {
      icon: <FaFileMedical className="text-2xl" />,
      label: "Documents",
      path: "/documents",
    },
    {
      icon: <FaSyringe className="text-2xl" />,
      label: "Vaccination",
      path: "/vaccination",
    },
    {
      icon: <FaCalendarPlus className="text-2xl" />,
      label: "Prendre RDV",
      path: "/book-appointment",
    },
    {
      icon: <MdMessage className="text-2xl" />,
      label: "Messagerie",
      path: "/messagerie",
    },
    {
      icon: <MdNotifications className="text-2xl" />,
      label: "Notifications",
      path: "/notifications",
    },
    {
      icon: <FaCog className="text-2xl" />,
      label: "Paramètres",
      path: "/settings",
    },
  ];

  const doctorMenuItems = [
    {
      icon: <HiHome className="text-2xl" />,
      label: "Accueil",
      path: "/doctor/home",
    },
    {
      icon: <MdPeople className="text-2xl" />,
      label: "Patients",
      path: "/doctor/patient",
    },
    {
      icon: <FaCalendarAlt className="text-2xl" />,
      label: "Agenda",
      path: "/doctor/agenda",
    },
    {
      icon: <BsCalendar2Week className="text-2xl" />,
      label: "Disponibilités",
      path: "/doctor/availability",
    },
    {
      icon: <MdMessage className="text-2xl" />,
      label: "Messagerie",
      path: "/messagerie",
    },
    {
      icon: <MdNotifications className="text-2xl" />,
      label: "Notifications",
      path: "/notifications",
    },
    {
      icon: <FaCog className="text-2xl" />,
      label: "Paramètres",
      path: "/settings",
    },
  ];

  const adminMenuItems = [
    {
      icon: <HiHome className="text-2xl" />,
      label: "Accueil",
      path: "/admin/home",
    },
    {
      icon: <FaUserCog className="text-2xl" />,
      label: "Utilisateurs",
      path: "/admin/users",
    },
    {
      icon: <FaChartBar className="text-2xl" />,
      label: "Statistiques",
      path: "/admin/stats",
    },
    {
      icon: <MdSettings className="text-2xl" />,
      label: "Configuration",
      path: "/admin/settings",
    },
  ];

  // Sélectionner le menu approprié selon le rôle
  let menuItems;
  if (isDoctor) {
    menuItems = doctorMenuItems;
  } else if (isAdmin) {
    menuItems = adminMenuItems;
  } else {
    menuItems = patientMenuItems;
  }

  const isActive = (path) => {
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
                    className={`whitespace-nowrap transition-opacity duration-300 ml-3
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
                  <span className="whitespace-nowrap ml-3">{item.label}</span>
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
