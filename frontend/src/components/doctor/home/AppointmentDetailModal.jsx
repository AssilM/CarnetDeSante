import React from "react";
import { FaTimes } from "react-icons/fa";

const AppointmentDetailModal = ({
  showDetail,
  selectedAppointment,
  onCloseDetail,
  onCancel,
  cancelLoading,
  cancelError,
  formatDateTimeFr,
}) => {
  if (!showDetail || !selectedAppointment) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCloseDetail}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative border border-[#E9ECEF]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-[#6C757D] hover:text-[#343A40]"
          onClick={onCloseDetail}
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-2xl font-semibold text-[#343A40] mb-4">
          Détail du rendez-vous
        </h2>

        <div className="space-y-2 text-[#343A40]">
          <div>
            <span className="font-semibold">Patient :</span>{" "}
            {selectedAppointment.patient.name}
          </div>
          <div>
            <span className="font-semibold">Heure :</span>{" "}
            {selectedAppointment.time}
          </div>
          <div>
            <span className="font-semibold">Motif :</span>{" "}
            {selectedAppointment.title}
          </div>
          <div>
            <span className="font-semibold">Date :</span>{" "}
            {formatDateTimeFr(
              selectedAppointment.dateRaw,
              selectedAppointment.time
            )}
          </div>
        </div>

        {cancelError && (
          <div className="text-red-600 mb-2 mt-2 text-sm">{cancelError}</div>
        )}

        <button
          onClick={onCancel}
          disabled={cancelLoading}
          className="mt-6 px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#2E5BBA] disabled:opacity-50 w-full sm:w-auto"
        >
          {cancelLoading ? "Annulation..." : "Annuler le rendez-vous"}
        </button>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
