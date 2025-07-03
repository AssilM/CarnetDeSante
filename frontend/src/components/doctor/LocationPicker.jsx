import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaLocationArrow, FaMap } from "react-icons/fa";

/**
 * Composant de sélection de localisation avec minicarte
 * Adapté pour Lomé, Togo et le contexte africain
 */
const LocationPicker = ({ 
  onLocationChange, 
  initialLocation = null,
  initialAddress = "",
  className = "" 
}) => {
  const [position, setPosition] = useState(
    initialLocation || { lat: 6.1319, lng: 1.2228 } // Coordonnées de Lomé par défaut
  );
  const [address, setAddress] = useState(initialAddress);
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Lomé");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialiser la carte
  useEffect(() => {
    if (typeof window !== 'undefined' && window.L) {
      initializeMap();
    } else {
      // Charger Leaflet si pas déjà chargé
      loadLeaflet();
    }
  }, []);

  const loadLeaflet = () => {
    // Charger Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Charger Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      initializeMap();
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    // Créer la carte centrée sur Lomé
    const map = window.L.map(mapRef.current).setView([position.lat, position.lng], 13);

    // Ajouter les tuiles OpenStreetMap
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Ajouter un marqueur
    const marker = window.L.marker([position.lat, position.lng], {
      draggable: true
    }).addTo(map);

    markerRef.current = marker;

    // Gérer le déplacement du marqueur
    marker.on('dragend', function(e) {
      const newPos = e.target.getLatLng();
      setPosition({ lat: newPos.lat, lng: newPos.lng });
      updateLocationInfo(newPos.lat, newPos.lng);
    });

    // Gérer le clic sur la carte
    map.on('click', function(e) {
      const newPos = e.latlng;
      marker.setLatLng(newPos);
      setPosition({ lat: newPos.lat, lng: newPos.lng });
      updateLocationInfo(newPos.lat, newPos.lng);
    });
  };

  // Mettre à jour les informations de localisation
  const updateLocationInfo = (lat, lng) => {
    const newLocation = {
      latitude: lat,
      longitude: lng,
      address: `${description}, ${city}`,
      description: description,
      city: city
    };
    
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  };

  // Obtenir la position actuelle
  const getCurrentLocation = () => {
    setIsLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par ce navigateur");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setPosition({ lat: latitude, lng: longitude });
          
          // Mettre à jour la carte et le marqueur
          if (markerRef.current && mapRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
            mapRef.current.setView([latitude, longitude], 15);
          }
          
          updateLocationInfo(latitude, longitude);
        } catch (err) {

        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        let errorMessage = "Impossible d'obtenir votre position actuelle";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Accès à la géolocalisation refusé";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position non disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai de géolocalisation dépassé";
            break;
          default:
            errorMessage = "Erreur de géolocalisation inconnue";
            break;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Gérer les changements d'adresse
  const handleAddressChange = () => {
    const fullAddress = `${description}, ${city}`;
    setAddress(fullAddress);
    updateLocationInfo(position.lat, position.lng);
  };

  useEffect(() => {
    handleAddressChange();
  }, [description, city, position]);

return (
    <div className={`space-y-4 ${className}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-primary" />
                Localisation du cabinet médical
            </h3>

            {/* Champs d'adresse */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ville *
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Entrez le nom de votre ville"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description/Quartier *
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ex: Quartier Bè, près du marché central"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Bouton géolocalisation */}
            <div className="mb-4">
                <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <FaLocationArrow className="mr-2" />
                    {isLoading ? "Localisation..." : "Utiliser ma position actuelle"}
                </button>
                
                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
            </div>

            {/* Minicarte */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 flex items-center">
                    <FaMap className="mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                        Positionnez votre cabinet sur la carte
                    </span>
                </div>
                <div 
                    ref={mapRef} 
                    className="h-64 w-full bg-gray-100"
                    style={{ minHeight: '256px' }}
                >
                    {!window?.L && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <FaMap className="mx-auto text-4xl text-gray-400 mb-2" />
                                <p className="text-gray-500">Chargement de la carte...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                    <strong>Instructions :</strong> Cliquez sur la carte ou faites glisser le marqueur pour ajuster votre position. 
                    Vous pouvez aussi utiliser le bouton "Utiliser ma position actuelle" pour une localisation automatique.
                </p>
            </div>
        </div>
    </div>
);
};

export default LocationPicker;
