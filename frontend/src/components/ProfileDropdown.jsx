import React from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { BiLogOut } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";

const ProfileDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 text-sm w-56 p-4 bg-white border border-gray-300/30 text-gray-500 rounded-md font-medium shadow-lg">
      <ul className="flex flex-col gap-2">
        <li
          onClick={() => {
            navigate("/medical-profile");
            onClose();
          }}
          className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <CgProfile className="text-xl" />
          <span>Mon profil médical</span>
        </li>

        <li
          onClick={() => {
            navigate("/settings");
            onClose();
          }}
          className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <FiSettings className="text-xl" />
          <span>Paramètres</span>
        </li>

        <div className="w-full h-px bg-gray-300/50 my-2"></div>

        <li
          onClick={() => {
            // Ajouter la logique de déconnexion ici
            navigate("/login");
            onClose();
          }}
          className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-red-50 hover:text-red-500 transition"
        >
          <BiLogOut className="text-xl" />
          <span>Déconnexion</span>
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdown;
