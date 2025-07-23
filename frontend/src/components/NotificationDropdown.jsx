import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getUnreadNotifications,
  markNotificationAsRead,
  getUnreadCount,
} from "../services/api/notificationService";
import { navigateToNotification } from "../services/notificationRedirectService";
import {
  MdNotifications,
  MdNotificationsActive,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { FaBell, FaEye } from "react-icons/fa";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Charger le compteur de notifications non lues
  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error("Erreur lors du chargement du compteur:", error);
    }
  };

  // Charger les notifications non lues
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getUnreadNotifications();
      const recentNotifications = (response.notifications || []).slice(0, 3);
      setNotifications(recentNotifications);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification) => {
    // Marquer comme lue
    handleMarkAsRead(notification.id);

    // Fermer le dropdown
    setIsOpen(false);

    // Naviguer vers la page appropriée
    navigateToNotification(notification, navigate);
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return "À l'instant";
    } else if (diffInMinutes < 60) {
      return `Il y a ${Math.floor(diffInMinutes)}min`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInDays < 2) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  // Obtenir l'icône selon le type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case "rendez_vous_creer":
      case "rendez_vous_confirme":
      case "rendez_vous_annule":
      case "rendez_vous_termine":
        return <FaBell className="text-blue-500" />;
      case "document_medecin_upload":
      case "document_patient_shared":
      case "document_access_revoked":
      case "document_deleted":
        return <FaEye className="text-green-500" />;
      default:
        return <MdNotifications className="text-gray-500" />;
    }
  };

  // Gérer l'ouverture/fermeture du dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Charger les données au montage et polling
  useEffect(() => {
    // Charger le compteur initial
    loadUnreadCount();

    // Polling pour vérifier les nouvelles notifications
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 5000); // Vérifier toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".notification-dropdown")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative notification-dropdown">
      {/* Bouton du badge */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <MdNotificationsActive className="text-2xl text-primary" />
        ) : (
          <MdNotifications className="text-2xl text-gray-600" />
        )}

        {/* Badge avec le nombre de notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        <MdKeyboardArrowDown
          className={`absolute -bottom-1 -right-1 text-xs transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* En-tête */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Notifications
              </h3>
              <span className="text-sm text-gray-500">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MdNotifications className="text-3xl mx-auto mb-2 text-gray-300" />
                <p>Aucune notification non lue</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {notification.titre}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="text-xs text-green-600 hover:text-green-700 transition-colors"
                          title="Marquer comme lu"
                        >
                          ✓
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 mb-2 h-8 overflow-hidden">
                        {notification.contenu.length > 80
                          ? `${notification.contenu.substring(0, 80)}...`
                          : notification.contenu}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pied de page */}
          <div className="px-4 py-3 border-t border-gray-200">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
