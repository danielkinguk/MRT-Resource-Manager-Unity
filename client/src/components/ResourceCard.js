import React from "react";
import { User, Truck, Package, Heart, Radio, Phone } from "lucide-react";

const ResourceCard = ({ resource, onDragStart, onClick }) => {
  const getIcon = () => {
    switch (resource.type) {
      case "Personnel":
        return <User className="w-4 h-4" />;
      case "Vehicles":
        return <Truck className="w-4 h-4" />;
      case "Equipment":
        return <Package className="w-4 h-4" />;
      case "Medical Packs":
        return <Heart className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (resource.status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "In Use":
        return "bg-yellow-100 text-yellow-800";
      case "Deployed":
        return "bg-red-100 text-red-800";
      case "Maintenance":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSkillColor = (skill) => {
    const skillColors = {
      Doctor: "#166534",
      "MRC Casualty Care": "#16a34a",
      "Basic Casualty Care": "#86efac",
      "Swift Water": "#06b6d4",
      "Hill Party Leader": "#fbbf24",
      "Search Dog Handler": "#ea580c",
      "Blue Light Driver": "#6366f1",
      "Off-road Driver": "#dc2626",
      "Radio Operator": "#bbb",
      Navigation: "#bbb",
    };
    return skillColors[skill] || "#bbb";
  };

  // Check if resource is a leader/deputy
  const isLeader = resource.skills && resource.skills.includes("Leader/Deputy");
  
  // Filter out Leader/Deputy from skills to display as boxes
  const displaySkills = resource.skills ? resource.skills.filter(skill => skill !== "Leader/Deputy") : [];

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
      draggable
      onDragStart={(e) => onDragStart(e, resource)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className={`font-medium text-sm flex items-center gap-1 ${isLeader ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
            {resource.name || resource.callsign}
            {resource.type === "Personnel" && displaySkills && displaySkills.length > 0 && (
              <span style={{ display: "flex", gap: 2, marginLeft: 6 }}>
                {displaySkills.map((skill) => (
                  <span
                    key={skill}
                    title={skill}
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      background: getSkillColor(skill),
                      borderRadius: 2,
                      border: "1px solid #ccc",
                    }}
                  />
                ))}
              </span>
            )}
          </h3>
        </div>

        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
        >
          {resource.type === "Personnel" && resource.status === "Available" ? "SARCALL A" : resource.status}
        </span>
      </div>

      {/* Personnel specific info */}
      {resource.type === "Personnel" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Radio className="w-3 h-3" />
            <span>{resource.callsign}</span>
          </div>

          {resource.contact && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{resource.contact}</span>
            </div>
          )}

          {resource.dogName && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Dog:</span> {resource.dogName}
            </div>
          )}
        </div>
      )}

      {/* Vehicle specific info */}
      {resource.type === "Vehicles" && (
        <>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Type:</span> {resource.vehicleType}
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-medium">Capacity:</span> {resource.capacity}{" "}
              personnel
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-medium">Fuel:</span> {resource.fuelLevel}%
            </div>

            {resource.capabilities && resource.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {resource.capabilities.slice(0, 2).map((capability, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800"
                  >
                    {capability}
                  </span>
                ))}
                {resource.capabilities.length > 2 && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    +{resource.capabilities.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Equipment specific info */}
      {(resource.type === "Equipment" || resource.type === "Medical Packs") && (
        <div className="space-y-1">
          {resource.condition && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Condition:</span>{" "}
              {resource.condition}
            </div>
          )}

          {resource.lastMaintenance && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Last Maintenance:</span>{" "}
              {resource.lastMaintenance}
            </div>
          )}

          {resource.expiry && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Expiry:</span> {resource.expiry}
            </div>
          )}

          {resource.certificationLevel && (
            <div className="text-xs">
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                {resource.certificationLevel}
              </span>
            </div>
          )}

          {resource.contents && resource.contents.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Contents:</span>{" "}
              {resource.contents.slice(0, 2).join(", ")}
              {resource.contents.length > 2 &&
                ` +${resource.contents.length - 2} more`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
