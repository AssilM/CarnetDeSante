import React from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaEdit,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";

const AppointmentModals = ({
  showDetail,
  selectedAppointment,
  handleCloseDetail,
  formatDateTimeFr,
  handleCancel,
  cancelLoading,
  showDayDetail,
  selectedDate,
  handleCloseDayDetail,
  getDayAppointments,
  formatDateFr,
  handleShowDetail,
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmé":
        return <FaCheckCircle className="text-green-500" />;
      case "annulé":
        return <FaTimesCircle className="text-red-500" />;
      case "en_attente":
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmé":
        return "bg-green-100 text-green-800 border-green-200";
      case "annulé":
        return "bg-red-100 text-red-800 border-red-200";
      case "en_attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      {/* Modal pour afficher tous les RDV d'un jour */}
      {showDayDetail && selectedDate && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseDayDetail}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl relative border border-[#E9ECEF] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-6 right-6 text-[#6C757D] hover:text-[#343A40]"
              onClick={handleCloseDayDetail}
            >
              <FaTimesCircle size={24} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#343A40] mb-2 text-center">
                Rendez-vous du {formatDateFr(selectedDate)}
              </h2>
              <p className="text-center text-[#6C757D]">
                {getDayAppointments(selectedDate).length} rendez-vous programmés
              </p>
            </div>

            <div className="space-y-4">
              {getDayAppointments(selectedDate).length === 0 ? (
                <div className="text-center py-8 text-[#6C757D]">
                  <FaCalendarAlt className="mx-auto text-4xl text-[#E9ECEF] mb-4" />
                  <p>Aucun rendez-vous ce jour-là</p>
                </div>
              ) : (
                getDayAppointments(selectedDate)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-[#E9ECEF] rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        handleCloseDayDetail();
                        handleShowDetail(appointment);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-[#E8F4FD] rounded-full p-3">
                            <FaUser className="text-[#4A90E2]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#343A40] mb-1">
                              {appointment.patient.name}
                            </h3>
                            <p className="text-[#6C757D] text-sm mb-1">
                              {appointment.title}
                            </p>
                            <div className="flex items-center text-sm text-[#6C757D]">
                              <FaClock className="mr-1" />
                              {appointment.time}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                          <button className="text-[#4A90E2] hover:text-[#2E5BBA] p-2 rounded-lg hover:bg-[#E8F4FD] transition-colors">
                            <FaEye />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de détail */}
      {showDetail && selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseDetail}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative border border-[#E9ECEF]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-6 right-6 text-[#6C757D] hover:text-[#343A40]"
              onClick={handleCloseDetail}
            >
              <FaTimesCircle size={24} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#343A40] mb-4 text-center">
                Détails du rendez-vous
              </h2>
              <div className="flex justify-center">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    selectedAppointment.status
                  )}`}
                >
                  {getStatusIcon(selectedAppointment.status)}
                  <span className="ml-2">{selectedAppointment.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center">
                <FaUser className="text-[#4A90E2] mr-4 text-lg" />
                <div>
                  <p className="font-semibold text-[#343A40] text-lg">
                    Patient
                  </p>
                  <p className="text-[#6C757D]">
                    {selectedAppointment.patient.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <FaCalendarAlt className="text-[#4A90E2] mr-4 text-lg" />
                <div>
                  <p className="font-semibold text-[#343A40] text-lg">
                    Date et heure
                  </p>
                  <p className="text-[#6C757D]">
                    {formatDateTimeFr(
                      selectedAppointment.dateRaw,
                      selectedAppointment.time
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaEdit className="text-[#4A90E2] mr-4 mt-1 text-lg" />
                <div>
                  <p className="font-semibold text-[#343A40] text-lg">Motif</p>
                  <p className="text-[#6C757D]">{selectedAppointment.title}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FaMapMarkerAlt className="text-[#4A90E2] mr-4 text-lg" />
                <div>
                  <p className="font-semibold text-[#343A40] text-lg">Lieu</p>
                  <p className="text-[#6C757D]">
                    {selectedAppointment.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-10">
              <button
                onClick={handleCloseDetail}
                className="px-6 py-3 text-[#6C757D] border border-[#E9ECEF] rounded-xl hover:bg-[#F8F9FA] transition-colors"
              >
                Fermer
              </button>
              {selectedAppointment.status !== "annulé" && (
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="px-6 py-3 bg-[#DC3545] text-white rounded-xl hover:bg-[#C82333] disabled:opacity-50 transition-colors"
                >
                  {cancelLoading ? "Annulation..." : "Annuler le RDV"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentModals;
