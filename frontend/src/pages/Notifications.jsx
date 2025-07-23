import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
} from "../services/api/notificationService";
import { navigateToNotification } from "../services/notificationRedirectService";
import {
  FaBell,
  FaCheck,
  FaTrash,
  FaCheckDouble,
  FaTrashAlt,
  FaFilter,
  FaEye,
} from "react-icons/fa";
import { MdNotifications, MdNotificationsActive } from "react-icons/md";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [showActions, setShowActions] = useState(false);

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(100, 0);
      setNotifications(response.notifications || []);

      const countResponse = await getUnreadCount();
      setUnreadCount(countResponse.count || 0);
    } catch (err) {
      console.error("Erreur lors du chargement des notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadNotifications();
  }, []);

  // Marquer une notification comme lue
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur lors du marquage comme lu:", err);
    }
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur lors du marquage de toutes comme lues:", err);
    }
  };

  // Supprimer une notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      // Mettre à jour le compteur si c'était une notification non lue
      const deletedNotif = notifications.find((n) => n.id === notificationId);
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  // Supprimer toutes les notifications lues
  const handleDeleteReadNotifications = async () => {
    try {
      await deleteReadNotifications();
      setNotifications((prev) => prev.filter((notif) => !notif.is_read));
    } catch (err) {
      console.error(
        "Erreur lors de la suppression des notifications lues:",
        err
      );
    }
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification) => {
    // Marquer comme lue si elle ne l'est pas déjà
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Naviguer vers la page appropriée
    navigateToNotification(notification, navigate);
  };

  // Filtrer les notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.is_read;
    if (filter === "read") return notif.is_read;
    return true;
  });

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

  // Obtenir la couleur selon le type
  const getNotificationColor = (type) => {
    switch (type) {
      case "rendez_vous_creer":
      case "rendez_vous_confirme":
        return "border-l-blue-500 bg-blue-50";
      case "rendez_vous_annule":
        return "border-l-red-500 bg-red-50";
      case "document_medecin_upload":
      case "document_patient_shared":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <MdNotificationsActive className="text-3xl text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Notifications
              </h1>
              <p className="text-gray-600">
                {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue
                {unreadCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Actions en lot */}
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaCheckDouble />
                <span>Tout marquer comme lu</span>
              </button>
            )}

            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-600 hover:text-primary transition-colors"
            >
              <FaFilter />
            </button>
          </div>
        </div>

        {/* Actions avancées */}
        {showActions && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Toutes</option>
                  <option value="unread">Non lues</option>
                  <option value="read">Lues</option>
                </select>
              </div>

              <button
                onClick={handleDeleteReadNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <FaTrashAlt />
                <span>Supprimer les lues</span>
              </button>
            </div>
          </div>
        )}

        {/* Liste des notifications */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <MdNotifications className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {filter === "all"
                  ? "Aucune notification pour le moment"
                  : filter === "unread"
                  ? "Aucune notification non lue"
                  : "Aucune notification lue"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${
                  notification.is_read
                    ? "bg-white border-l-gray-300"
                    : `bg-white border-l-4 ${getNotificationColor(
                        notification.type
                      )}`
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">
                          {notification.titre}
                        </h3>
                        {!notification.is_read && (
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-2">
                        {notification.contenu}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>

                        <div className="flex items-center space-x-2">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-1 text-green-600 hover:text-green-700 transition-colors"
                              title="Marquer comme lu"
                            >
                              <FaCheck />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination simple */}
        {notifications.length >= 100 && (
          <div className="mt-8 text-center">
            <button
              onClick={loadNotifications}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Charger plus
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Notifications;
