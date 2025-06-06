import React from "react";
import { Link, useLocation } from "react-router-dom";

const SettingsSidebar = ({ mobile = false, onItemClick }) => {
  const location = useLocation();
  const currentPath = location.hash;

  const menuItems = [
    {
      label: "Informations de connexion",
      hash: "#connexion",
    },
    {
      label: "Confidentialité",
      hash: "#confidentialite",
    },
    {
      label: "Historique et données",
      hash: "#historique",
    },
    {
      label: "Clôture du profil",
      hash: "#cloture",
    },
  ];

  const handleClick = () => {
    if (mobile && onItemClick) {
      onItemClick();
    }
  };

  return (
    <nav
      className={`${mobile ? "" : "w-64 bg-white rounded-lg shadow-sm"} p-4`}
    >
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li key={item.hash}>
            <Link
              to={`/settings${item.hash}`}
              onClick={handleClick}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                currentPath === item.hash
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-blue-50"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SettingsSidebar;
