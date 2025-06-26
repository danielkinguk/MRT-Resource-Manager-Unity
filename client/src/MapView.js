import React, { useEffect, useRef, useState } from "react";
import { MapPin, Users, Truck, Radio, Eye, EyeOff } from "lucide-react";
import proj4 from "proj4";

// OSGB36 and WGS84 definitions for proj4
const OSGB36 = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs';
const WGS84 = proj4.WGS84;

// Helper: Parse grid reference to easting/northing
function gridRefToEN(gridRef) {
  gridRef = gridRef.replace(/\s+/g, '').toUpperCase();
  if (!/^([A-Z]{2})(\d{6,10})$/.test(gridRef)) return null;
  const letters = gridRef.slice(0, 2);
  const digits = gridRef.slice(2);
  // Letter pair to 100km grid square
  const l1 = letters.charCodeAt(0) - 65;
  const l2 = letters.charCodeAt(1) - 65;
  // Skip I in grid
  const l1adj = l1 > 7 ? l1 - 1 : l1;
  const l2adj = l2 > 7 ? l2 - 1 : l2;
  const e100km = ((l1adj - 2) % 5) * 5 + (l2adj % 5);
  const n100km = (19 - Math.floor(l1adj / 5) * 5) - Math.floor(l2adj / 5);
  // Split digits equally
  const len = digits.length / 2;
  const e = parseInt(digits.slice(0, len).padEnd(5, '0'));
  const n = parseInt(digits.slice(len).padEnd(5, '0'));
  return {
    easting: e100km * 100000 + e,
    northing: n100km * 100000 + n,
  };
}

// UK Ordnance Survey Grid Reference to Lat/Lng conversion (accurate)
const osGridToLatLng = (gridRef) => {
  const en = gridRefToEN(gridRef);
  if (!en) return { lat: 54.2615, lng: -3.2168 }; // Default to Foxfield
  const [lng, lat] = proj4(OSGB36, WGS84, [en.easting, en.northing]);
  return { lat, lng };
};

// Base station and known locations around Foxfield, Cumbria
const baseLocations = {
  "Base Station": {
    lat: 54.2615,
    lng: -3.2168,
    name: "MRT Base Station - Foxfield",
  },
  Helvellyn: { lat: 54.5259, lng: -3.0163, name: "Helvellyn" },
  "Striding Edge": { lat: 54.522, lng: -3.014, name: "Striding Edge" },
  Keswick: { lat: 54.6, lng: -3.134, name: "Keswick" },
  Coniston: { lat: 54.3697, lng: -3.0746, name: "Coniston" },
  Foxfield: { lat: 54.2615, lng: -3.2168, name: "Foxfield" },
};

const MapView = ({ callouts, teams, resources }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [layerVisibility, setLayerVisibility] = useState({
    callouts: true,
    teams: true,
  });
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      // Check if Leaflet is already loaded
      if (window.L) {
        initializeMap();
        return;
      }

      // Load Leaflet CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    };

    loadLeaflet();

    return () => {
      // Cleanup map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map centered on Foxfield, Cumbria
    const map = window.L.map(mapRef.current).setView([54.308, -3.2344], 13);

    // Add OpenStreetMap tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapLoaded(true);
  };

  // Update markers when data changes (not on zoom/move)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Remove any previous event listeners to avoid duplicate handlers
    mapInstanceRef.current.off("moveend zoomend");

    // Only update markers when data changes, not on zoom/move
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    const L = window.L;

    // Process callout markers
    if (layerVisibility.callouts) {
      callouts.forEach((callout) => {
        const coords = callout.gridReference
          ? osGridToLatLng(callout.gridReference)
          : baseLocations[callout.location] || baseLocations["Foxfield"];

        const marker = L.marker([coords.lat, coords.lng], {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div style="
              background-color: #DC2626;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
            ">📻</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        });

        marker.bindPopup(`
          <div>
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${
              callout.title
            }</h3>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${
              callout.location
            }</p>
            ${
              callout.gridReference
                ? `<p style="margin: 4px 0;"><strong>Grid Ref:</strong> ${callout.gridReference}</p>`
                : ""
            }
            <p style="margin: 4px 0;"><strong>IC:</strong> ${
              callout.incidentCommander
            }</p>
            ${
              callout.weather
                ? `<p style="margin: 4px 0;"><strong>Weather:</strong> ${callout.weather}</p>`
                : ""
            }
          </div>
        `);

        marker.on("click", () =>
          setSelectedItem({
            id: callout.id,
            type: "callout",
            coords,
            data: callout,
          })
        );

        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      });
    }

    // Process team markers
    if (layerVisibility.teams) {
      teams
        .filter((team) => team.status === "Deployed")
        .forEach((team) => {
          let coords;
          if (team.gridReference) {
            coords = osGridToLatLng(team.gridReference);
          } else {
            const deployedCallout = callouts.find((c) => c.id === team.deployedTo);
            coords = deployedCallout?.gridReference
              ? osGridToLatLng(deployedCallout.gridReference)
              : { lat: 54.308, lng: -3.2344 };
          }

          const marker = L.marker([coords.lat, coords.lng], {
            icon: L.divIcon({
              className: "custom-marker",
              html: `<div style="
              background-color: ${team.color || "#6B7280"};
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
            ">👥</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            }),
          });

          marker.bindPopup(`
          <div>
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${team.name}</h3>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${
              team.type
            } Team</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${
              team.status
            }</p>
            <p style="margin: 4px 0;"><strong>Resources:</strong> ${
              team.assignedResources?.length || 0
            }</p>
          </div>
        `);

          marker.on("click", () =>
            setSelectedItem({
              id: team.id,
              type: "team",
              coords,
              data: team,
            })
          );

          marker.addTo(mapInstanceRef.current);
          markersRef.current.push(marker);
        });
    }

    // Process vehicle markers
    resources
      .filter((r) => r.type === "Vehicles" && !r.team)
      .forEach((vehicle, index) => {
        // Offset vehicles slightly so they don't overlap
        const offset = index * 0.001;
        const marker = L.marker(
          [
            baseLocations["Base Station"].lat + offset,
            baseLocations["Base Station"].lng + offset,
          ],
          {
            icon: L.divIcon({
              className: "custom-marker",
              html: `<div style="
              background-color: #059669;
              width: 26px;
              height: 26px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
            ">🚐</div>`,
              iconSize: [26, 26],
              iconAnchor: [13, 13],
            }),
          }
        );

        marker.bindPopup(`
          <div>
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${vehicle.callsign}</h3>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${vehicle.vehicleType}</p>
            <p style="margin: 4px 0;"><strong>Capacity:</strong> ${vehicle.capacity} personnel</p>
            <p style="margin: 4px 0;"><strong>Fuel:</strong> ${vehicle.fuelLevel}%</p>
          </div>
        `);

        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      });
  }, [callouts, teams, resources, layerVisibility, mapLoaded]);

  // Center map on new or selected callout
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    // Center on selected callout if any
    if (selectedItem && selectedItem.type === "callout" && selectedItem.coords) {
      mapInstanceRef.current.setView([selectedItem.coords.lat, selectedItem.coords.lng], 15, { animate: true });
      return;
    }
    // If a new callout is added, center on its marker
    if (callouts.length > 0) {
      // Find the most recently created callout with a gridReference
      const sorted = [...callouts].filter(c => c.gridReference).sort((a, b) => new Date(b.createdAt || b.startTime) - new Date(a.createdAt || a.startTime));
      if (sorted.length > 0) {
        const coords = osGridToLatLng(sorted[0].gridReference);
        mapInstanceRef.current.setView([coords.lat, coords.lng], 15, { animate: true });
      }
    }
  }, [callouts, selectedItem, mapLoaded]);

  const formatDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  };

  return (
    <div className="h-full flex">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div
          ref={mapRef}
          className="w-full h-full rounded-lg overflow-hidden"
          style={{ minHeight: "500px" }}
        />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {/* Layer Controls */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
          <h3 className="font-semibold text-sm">Map Layers</h3>

          {Object.entries(layerVisibility).map(([layer, visible]) => (
            <label
              key={layer}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) =>
                  setLayerVisibility((prev) => ({
                    ...prev,
                    [layer]: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="capitalize">
                {layer.replace(/([A-Z])/g, " $1")}
              </span>
              {visible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </label>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
          <h3 className="font-semibold text-sm">Legend</h3>

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
                📻
              </div>
              <span>Active Callout</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                👥
              </div>
              <span>Deployed Team</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                🚐
              </div>
              <span>Vehicle</span>
            </div>
          </div>
        </div>

        {/* Coordinates Display */}
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow text-xs">
          <div>Center: 54.461°N, 3.089°W</div>
          <div>Zoom: Level 11</div>
        </div>
      </div>

      {/* Information Panel */}
      {selectedItem && (
        <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              {selectedItem.type === "callout" && <Radio className="w-5 h-5" />}
              {selectedItem.type === "team" && <Users className="w-5 h-5" />}
              {selectedItem.type === "vehicle" && <Truck className="w-5 h-5" />}
              {selectedItem.type === "base" && <MapPin className="w-5 h-5" />}
              {selectedItem.data.name || selectedItem.data.title || "Details"}
            </h3>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {selectedItem.type === "callout" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <p className="text-sm">{selectedItem.data.location}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Grid Reference
                </label>
                <p className="text-sm font-mono">
                  {selectedItem.data.gridReference}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="text-sm">{selectedItem.data.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Weather
                </label>
                <p className="text-sm">{selectedItem.data.weather}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Incident Commander
                </label>
                <p className="text-sm">{selectedItem.data.incidentCommander}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Distance from Base
                </label>
                <p className="text-sm">
                  {formatDistance(
                    baseLocations["Base Station"].lat,
                    baseLocations["Base Station"].lng,
                    selectedItem.coords.lat,
                    selectedItem.coords.lng
                  )}
                </p>
              </div>

              {selectedItem.data.assignedResources?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Assigned Resources
                  </label>
                  <p className="text-sm">
                    {selectedItem.data.assignedResources.length} resources
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedItem.type === "team" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Team Type
                </label>
                <p className="text-sm">{selectedItem.data.type}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <div
                  className={`inline-block px-2 py-1 rounded text-sm ml-2 ${
                    selectedItem.data.status === "Deployed"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedItem.data.status}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Assigned Resources
                </label>
                <p className="text-sm">
                  {selectedItem.data.assignedResources?.length || 0} resources
                </p>
              </div>

              {selectedItem.data.deployedTo && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Deployed To
                  </label>
                  <p className="text-sm">{selectedItem.data.deployedTo}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapView;
