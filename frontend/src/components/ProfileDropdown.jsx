import React from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { BiLogOut } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { FaUserMd, FaCalendarAlt, FaFileMedical } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const ProfileDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDoctor, isAdmin } = useAppContext();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  // Liens communs à tous les utilisateurs
  const commonLinks = [
    {
      icon: <FiSettings className="text-xl" />,
      label: "Paramètres",
      onClick: () => {
        navigate("/settings");
        onClose();
      },
      className: "hover:bg-blue-50 hover:text-blue-600",
    },
    {
      icon: <BiLogOut className="text-xl" />,
      label: "Déconnexion",
      onClick: () => {
        logout();
        onClose();
      },
      className: "hover:bg-red-50 hover:text-red-500",
    },
  ];

  // Liens spécifiques aux patients
  const patientLinks = [
    {
      icon: <CgProfile className="text-xl" />,
      label: "Mon profil médical",
      onClick: () => {
        navigate("/medical-profile");
        onClose();
      },
      className: "hover:bg-blue-50 hover:text-blue-600",
    },
  ];

  // Liens spécifiques aux médecins
  const doctorLinks = [
    {
      icon: <FaUserMd className="text-xl" />,
      label: "Mes patients",
      onClick: () => {
        navigate("/patients");
        onClose();
      },
      className: "hover:bg-blue-50 hover:text-blue-600",
    },
    {
      icon: <FaCalendarAlt className="text-xl" />,
      label: "Mon agenda",
      onClick: () => {
        navigate("/agenda");
        onClose();
      },
      className: "hover:bg-blue-50 hover:text-blue-600",
    },
  ];

  // Liens spécifiques aux administrateurs
  const adminLinks = [
    {
      icon: <CgProfile className="text-xl" />,
      label: "Gestion utilisateurs",
      onClick: () => {
        navigate("/admin/users");
        onClose();
      },
      className: "hover:bg-blue-50 hover:text-blue-600",
    },
  ];

  // Sélectionner les liens selon le rôle
  let roleSpecificLinks = patientLinks;
  if (isDoctor) {
    roleSpecificLinks = doctorLinks;
  } else if (isAdmin) {
    roleSpecificLinks = adminLinks;
  }

  // Combiner les liens spécifiques au rôle avec les liens communs
  const links = [...roleSpecificLinks, ...commonLinks];

  return (
    <div className="absolute right-0 mt-2 text-sm w-56 p-4 bg-white border border-gray-300/30 text-gray-500 rounded-md font-medium shadow-lg">
      {currentUser && (
        <div className="mb-3 pb-2 border-b border-gray-200">
          <p className="font-medium text-gray-800">
            {currentUser.role === "medecin"
              ? `Dr ${currentUser.nom}`
              : `${currentUser.prenom} ${currentUser.nom}`}
          </p>
          <p className="text-xs text-gray-500">{currentUser.email}</p>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {links.map((link, index) => (
          <li
            key={index}
            onClick={link.onClick}
            className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded transition ${link.className}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileDropdown;
