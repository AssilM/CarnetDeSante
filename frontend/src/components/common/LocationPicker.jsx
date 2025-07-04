import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaLocationArrow, FaMap } from "react-icons/fa";

/**
 * Composant de sélection de localisation avec minicarte
 * Adapté pour Lomé, Togo et le contexte africain
 * Version générique utilisable par patients et médecins
 */
const LocationPicker = ({ 
  onLocationChange, 
  initialLocation = null,
  initialAddress = "",
  className = "",
  title = "Localisation",
  userType = "patient" // "patient" ou "medecin"
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

  // Mettre à jour les informations de localisation avec géocodage inverse
  const updateLocationInfo = async (lat, lng) => {
    try {
      // Utiliser l'API de géocodage inverse de Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.display_name || '';
        
        // Extraire la ville à partir de la réponse
        let cityName = '';
        if (data.address) {
          cityName = data.address.city || 
                    data.address.town || 
                    data.address.village || 
                    data.address.municipality || 
                    data.address.county || 
                    'Lomé'; // Valeur par défaut
        }
        
        // Mettre à jour les états
        setCity(cityName);
        setAddress(address);
        
        const newLocation = {
          latitude: lat,
          longitude: lng,
          address: address,
          description: description,
          city: cityName
        };
        
        if (onLocationChange) {
          onLocationChange(newLocation);
        }
      }
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
      // En cas d'erreur, utiliser les valeurs actuelles
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
    if (description && city) {
      const fullAddress = `${description}, ${city}`;
      setAddress(fullAddress);
      
      const newLocation = {
        latitude: position.lat,
        longitude: position.lng,
        address: fullAddress,
        description: description,
        city: city
      };
      
      if (onLocationChange) {
        onLocationChange(newLocation);
      }
    }
  };

  useEffect(() => {
    handleAddressChange();
  }, [description]);

  // Textes adaptés selon le type d'utilisateur
  const getTexts = () => {
    if (userType === "medecin") {
      return {
        title: "Localisation du cabinet médical",
        cityLabel: "Ville *",
        cityPlaceholder: "Entrez le nom de votre ville",
        descriptionLabel: "Description/Quartier *",
        descriptionPlaceholder: "Ex: Quartier Bè, près du marché central",
        mapTitle: "Positionnez votre cabinet sur la carte",
        instructions: "Cliquez sur la carte ou faites glisser le marqueur pour ajuster votre position. Vous pouvez aussi utiliser le bouton \"Utiliser ma position actuelle\" pour une localisation automatique."
      };
    } else {
      return {
        title: title || "Ma localisation",
        cityLabel: "Ville *",
        cityPlaceholder: "Entrez le nom de votre ville",
        descriptionLabel: "Quartier/Description *",
        descriptionPlaceholder: "Ex: Quartier Bè, près de l'école primaire",
        mapTitle: "Positionnez votre adresse sur la carte",
        instructions: "Cliquez sur la carte ou faites glisser le marqueur pour ajuster votre position. Vous pouvez aussi utiliser le bouton \"Utiliser ma position actuelle\" pour une localisation automatique."
      };
    }
  };

  const texts = getTexts();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">

        {/* Champs d'adresse */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {texts.cityLabel}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={texts.cityPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {texts.descriptionLabel}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={texts.descriptionPlaceholder}
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
              {texts.mapTitle}
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
            <strong>Instructions :</strong> {texts.instructions}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
