import { useState } from "react";

export const useAgendaNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // "week", "month", "day"
  const [showCalendar, setShowCalendar] = useState(false);
  const [expandedDays, setExpandedDays] = useState(new Set());

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
    setShowCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const toggleDayExpansion = (dateStr) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedDays(newExpanded);
  };

  return {
    currentDate,
    viewMode,
    showCalendar,
    expandedDays,
    setViewMode,
    navigateDate,
    handleDateChange,
    toggleCalendar,
    toggleDayExpansion,
  };
};
