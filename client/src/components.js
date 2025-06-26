// Dynamic Teams Components
import React, { useState } from "react";
import {
  Users,
  Truck,
  Package,
  Heart,
  X,
  MapPin,
  Clock,
  Radio,
  Dog,
  Trash2,
} from "lucide-react";

const skillColors = {
  "Hill Party Leader": "#FBBF24",
  Doctor: "#166534",
  "MRC Casualty Care": "#16A34A",
  "Basic Casualty Care": "#86EFAC",
  "Off-road Driver": "#DC2626",
  "Blue Light Driver": "#2563EB",
  "Search Dog Handler": "#EA580C",
  "Swift Water": "#0891B2",
};

// Skill Badge Component
// Skill Badge Component
const SkillBadge = ({ skill }) => {
  const color = skillColors[skill] || "#6B7280";
  return (
    <div
      className="w-3 h-3 rounded-sm border border-gray-300 mr-1"
      style={{ backgroundColor: color }}
      title={skill}
    />
  );
};

// Team Resource Card (for deploying teams to callouts)
export const TeamResourceCard = ({
  team,
  teamPersonnel,
  onDragStart,
  onClick,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 border-green-200";
      case "Deployed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div
      className={`p-3 bg-white rounded-lg shadow-sm border-2 cursor-move hover:shadow-md transition-shadow ${
        team.status === "Available" ? "border-gray-200" : "border-gray-300"
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, team)}
      onClick={() => onClick(team)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {team.type === "Vehicle" ? (
            <Truck className="w-4 h-4" />
          ) : (
            <Users className="w-4 h-4" />
          )}
          <span className="font-medium text-sm">{team.name}</span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            team.status || "Available"
          )}`}
        >
          {team.status || "Available"}
        </span>
      </div>

      <div className="text-xs text-gray-600 mb-1">Type: {team.type} Team</div>

      <div className="text-xs text-gray-500">
        Personnel: {teamPersonnel.length}
        {team.deployedTo && (
          <span className="ml-2 text-red-600">• Deployed</span>
        )}
      </div>
    </div>
  );
};

// Enhanced Resource Card
export const ResourceCard = ({ resource, onDragStart, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case "Personnel":
        return <Users className="w-4 h-4" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Use":
        return "bg-red-100 text-red-800 border-red-200";
      case "On Call":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Maintenance":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div
      className={`p-3 bg-white rounded-lg shadow-sm border-2 cursor-move hover:shadow-md transition-shadow ${
        resource.status === "Available" ? "border-gray-200" : "border-gray-300"
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, resource)}
      onClick={() => onClick(resource)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIcon(resource.type)}
          <span className="font-medium text-sm">{resource.name}</span>
          {resource.dogName && (
            <Dog
              className="w-3 h-3 text-purple-600"
              title={`Dog: ${resource.dogName}`}
            />
          )}
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            resource.status
          )}`}
        >
          {resource.status}
        </span>
      </div>

      {resource.callsign && (
        <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
          <Radio className="w-3 h-3" />
          {resource.callsign}
        </div>
      )}

      {resource.skills && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-gray-500 mr-1">Skills:</span>
          <div className="flex flex-wrap gap-1">
            {resource.skills.map((skill, index) => (
              <SkillBadge key={index} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {resource.capacity && (
        <div className="text-xs text-gray-500">
          Capacity: {resource.capacity} • Fuel: {resource.fuelLevel}%
        </div>
      )}
    </div>
  );
};

// Dynamic Team Board
export const DynamicTeamBoard = ({
  team,
  assignedResources,
  onDrop,
  onDragOver,
  onRemoveResource,
  onDeleteTeam,
}) => {
  const teamPersonnel = assignedResources.filter((r) => r.type === "Personnel");
  const teamVehicle = assignedResources.find((r) => r.type === "Vehicles");

  return (
    <div
      className="p-4 rounded-lg border-2 border-gray-300 bg-gray-50 min-h-[300px] relative"
      onDrop={(e) => onDrop(e, team.id)}
      onDragOver={onDragOver}
    >
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3
            className="font-bold text-lg text-white px-3 py-1 rounded flex items-center gap-2"
            style={{ backgroundColor: team.color }}
          >
            {team.type === "Vehicle" ? (
              <Truck className="w-4 h-4" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {team.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {teamPersonnel.length} personnel
            </span>
            <button
              onClick={() => onDeleteTeam(team.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Delete Team"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-2">
          Type: {team.type} Team
          {team.calloutId && " • Field Team"}
        </div>

        {teamVehicle && (
          <div className="text-sm text-gray-600 mb-2 flex items-center gap-2 bg-blue-50 p-2 rounded">
            <Truck className="w-4 h-4" />
            {teamVehicle.name} - {teamVehicle.vehicleType} • Fuel:{" "}
            {teamVehicle.fuelLevel}%
          </div>
        )}
      </div>

      <div className="border-t pt-3">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Personnel & Equipment
        </h4>

        <div className="space-y-2 min-h-[150px] bg-white/50 rounded p-2 border-2 border-dashed border-gray-300">
          {assignedResources.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-4">
              Drag personnel and equipment here
            </div>
          ) : (
            assignedResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white p-3 rounded border shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {resource.type === "Personnel" ? (
                      <Users className="w-3 h-3" />
                    ) : resource.type === "Vehicles" ? (
                      <Truck className="w-3 h-3" />
                    ) : resource.type === "Equipment" ? (
                      <Package className="w-3 h-3" />
                    ) : (
                      <Heart className="w-3 h-3" />
                    )}
                    <span className="font-medium text-sm">{resource.name}</span>
                    {resource.dogName && (
                      <Dog
                        className="w-3 h-3 text-purple-600"
                        title={`Dog: ${resource.dogName}`}
                      />
                    )}
                    <button
                      onClick={() => onRemoveResource(team.id, resource.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {resource.callsign && (
                  <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    {resource.callsign}
                  </div>
                )}

                {resource.skills && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 mr-1">Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {resource.skills?.map((skill, index) => (
                        <SkillBadge key={index} skill={skill} />
                      ))}
                    </div>
                  </div>
                )}

                {resource.contents && (
                  <div className="text-xs text-gray-500">
                    Contents: {resource.contents.slice(0, 3).join(", ")}
                    {resource.contents.length > 3 && "..."}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Add Team Modal
export const AddTeamModal = ({
  isOpen,
  onClose,
  onSubmit,
  availableVehicles,
  callouts,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Vehicle", // 'Vehicle' or 'Hill'
    calloutId: "",
    vehicleId: "",
  });

  const teamNames = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot"];

  const handleSubmit = (e) => {
    e.preventDefault();

    const teamData = {
      ...formData,
      name:
        formData.type === "Vehicle"
          ? `${formData.name} Team`
          : `${formData.name} Hill Team`,
    };

    onSubmit(teamData);
    setFormData({
      name: "",
      type: "Vehicle",
      calloutId: "",
      vehicleId: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Team</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team Type*</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="Vehicle">Vehicle Team (Base)</option>
              <option value="Hill">Hill Team (Field)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Team Name*</label>
            <select
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Team Name</option>
              {teamNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {formData.type === "Vehicle" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign Vehicle
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vehicleId: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">No Vehicle</option>
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.vehicleType}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.type === "Hill" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                For Callout
              </label>
              <select
                value={formData.calloutId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    calloutId: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">General Field Team</option>
                {callouts.map((callout) => (
                  <option key={callout.id} value={callout.id}>
                    {callout.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Skills Legend Component
export const SkillsLegend = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="font-semibold mb-3">Skill Color Legend</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {Object.entries(skillColors).map(([skill, color]) => (
          <div key={skill} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm border border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span>{skill}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Callout Card
export const CalloutCard = ({
  callout,
  resources,
  onDrop,
  onDragOver,
  onRemoveResource,
}) => {
  const assignedResources = resources.filter((r) =>
    callout.assignedResources?.includes(r.id)
  );

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        callout.priority === "High"
          ? "border-red-500 bg-red-50"
          : callout.priority === "Medium"
          ? "border-yellow-500 bg-yellow-50"
          : "border-green-500 bg-green-50"
      } min-h-[250px]`}
      onDrop={(e) => onDrop(e, callout.id)}
      onDragOver={onDragOver}
    >
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">{callout.title}</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {callout.location}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {callout.startTime}
          </div>
        </div>

        {callout.gridReference && (
          <div className="text-xs text-gray-600 mb-2">
            Grid Ref: {callout.gridReference}
          </div>
        )}

        {callout.weather && (
          <div className="text-xs text-gray-600 mb-2">
            Weather: {callout.weather}
          </div>
        )}

        <p className="text-sm text-gray-700 mb-3">{callout.description}</p>

        <div className="text-xs text-gray-500">
          IC: {callout.incidentCommander} • Status: {callout.status}
        </div>
      </div>

      <div className="border-t pt-3">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Assigned Resources ({assignedResources.length})
        </h4>

        <div className="space-y-2 min-h-[100px] bg-white/50 rounded p-2 border-2 border-dashed border-gray-300">
          {assignedResources.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-2">
              Drag resources here to assign
            </div>
          ) : (
            assignedResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between bg-white p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {resource.type === "Personnel" ? (
                      <Users className="w-3 h-3" />
                    ) : (
                      <Truck className="w-3 h-3" />
                    )}
                    <span className="text-sm">{resource.name}</span>
                    {resource.dogName && (
                      <Dog className="w-3 h-3 text-purple-600" />
                    )}
                  </div>
                  {resource.callsign && (
                    <span className="text-xs text-gray-500">
                      ({resource.callsign})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveResource(callout.id, resource.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// New Resource Modal
export const NewResourceModal = ({ isOpen, onClose, onSubmit, teams }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Personnel",
    status: "Available",
    team: "",
    skills: [],
    contact: "",
    callsign: "",
    dogName: "",
  });

  const handleSkillToggle = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      type: "Personnel",
      status: "Available",
      team: "",
      skills: [],
      contact: "",
      callsign: "",
      dogName: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add SAR Resource</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name*</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Callsign</label>
              <input
                type="text"
                value={formData.callsign}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, callsign: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Alpha-1, DM1, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(skillColors).map((skill) => (
                <label key={skill} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                  />
                  <SkillBadge skill={skill} />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.skills.includes("Search Dog Handler") && (
            <div>
              <label className="block text-sm font-medium mb-1">Dog Name</label>
              <input
                type="text"
                value={formData.dogName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dogName: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Rex, Bella, etc."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Contact</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contact: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="+44-7700-900123"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// New Callout Modal
export const NewCalloutModal = ({ isOpen, onClose, onSubmit, teams }) => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    gridReference: "",
    weather: "",
    incidentCommander: "",
    startTime: new Date().toISOString().slice(0, 16),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const calloutData = {
      ...formData,
      startTime: formData.startTime,
    };
    onSubmit(calloutData);
    setFormData({
      title: "",
      location: "",
      description: "",
      gridReference: "",
      weather: "",
      incidentCommander: "",
      startTime: new Date().toISOString().slice(0, 16),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New SAR Callout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Incident Title*
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Missing Walker - Helvellyn"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Start Time
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, startTime: new Date().toISOString().slice(0, 16) }))}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Now
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Location*
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Helvellyn, Striding Edge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Grid Reference
              </label>
              <input
                type="text"
                name="gridReference"
                value={formData.gridReference}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gridReference: e.target.value,
                  }))
                }
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 border-gray-300`}
                placeholder="e.g., SD 208 856"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full p-2 border border-gray-300 rounded h-20"
              placeholder="Detailed description of the incident..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Create Callout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
