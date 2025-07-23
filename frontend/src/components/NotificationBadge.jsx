import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getUnreadCount,
  checkNewNotifications,
} from "../services/api/notificationService";
import { MdNotifications, MdNotificationsActive } from "react-icons/md";

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  // Charger le compteur initial
  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error(
        "Erreur lors du chargement du compteur de notifications:",
        error
      );
    }
  };

  // Polling pour vérifier les nouvelles notifications
  const startPolling = () => {
    if (isPolling) return;

    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await checkNewNotifications();
        if (response.hasNewNotifications) {
          setUnreadCount(response.count || 0);
        }
      } catch (error) {
        console.error("Erreur lors du polling des notifications:", error);
      }
    }, 5000); // Vérifier toutes les 5 secondes

    // Nettoyer l'interval au démontage
    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  };

  // Charger les données au montage
  useEffect(() => {
    loadUnreadCount();
    const cleanup = startPolling();

    return cleanup;
  }, []);

  return (
    <Link
      to="/notifications"
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
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBadge;
