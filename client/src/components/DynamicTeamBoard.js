import React, { useState, useEffect } from "react";
import { Users, Truck, Trash2, X, User, Package, Heart } from "lucide-react";
import ResourceCard from "./ResourceCard";

const DynamicTeamBoard = ({
  team,
  assignedResources,
  onDrop,
  onDragOver,
  onRemoveResource,
  onDeleteTeam,
  onRenameTeam,
}) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);

  useEffect(() => {
    setEditName(team.name);
  }, [team.name]);

  const handleNameClick = () => setEditing(true);
  const handleNameChange = (e) => setEditName(e.target.value);
  const handleNameBlur = () => {
    setEditing(false);
    if (editName.trim() && editName !== team.name) {
      onRenameTeam(team.id, editName.trim());
    } else {
      setEditName(team.name);
    }
  };
  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setEditing(false);
      setEditName(team.name);
    }
  };

  const getTeamIcon = () => {
    return team.type === "Vehicle" ? (
      <Truck className="w-5 h-5" />
    ) : (
      <Users className="w-5 h-5" />
    );
  };

  const getStatusColor = () => {
    switch (team.status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Deployed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
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

  // Count resources by type
  const resourceCounts = {
    Personnel: assignedResources.filter((r) => r.type === "Personnel").length,
    Vehicles: assignedResources.filter((r) => r.type === "Vehicles").length,
    Equipment: assignedResources.filter((r) => r.type === "Equipment").length,
    "Medical Packs": assignedResources.filter((r) => r.type === "Medical Packs")
      .length,
  };

  // Sort assignedResources so vehicles are at the top
  const sortedResources = assignedResources.slice().sort((a, b) => {
    const isVehicle = (r) => r.type === "Vehicles" || /^DM\d+$/i.test(r.name);
    return isVehicle(b) - isVehicle(a);
  });

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm">
      {/* Team Header */}
      <div
        className="p-4 border-b-2 border-gray-200"
        style={{ backgroundColor: team.color + "20" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: team.color }}
            >
              {getTeamIcon()}
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {editing ? (
                  <input
                    className="font-semibold text-lg text-gray-900 bg-white border-b border-gray-300 focus:outline-none focus:border-blue-500 px-1"
                    value={editName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={handleNameKeyDown}
                    autoFocus
                    style={{ minWidth: 60 }}
                  />
                ) : (
                  <span
                    className="font-semibold text-lg text-gray-900 cursor-pointer hover:underline"
                    onClick={handleNameClick}
                    title="Click to rename team"
                  >
                    {team.name}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{team.type} Team</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
                >
                  {team.status || "Available"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {assignedResources.length} resources
            </span>
            <button
              onClick={() => onDeleteTeam(team.id)}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Team"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resource Summary */}
        <div className="mt-3 flex gap-4">
          {Object.entries(resourceCounts).map(([type, count]) => (
            <div
              key={type}
              className="flex items-center gap-1 text-sm text-gray-600"
            >
              {getResourceIcon(type)}
              <span>{count}</span>
            </div>
          ))}
        </div>

        {/* Deployment Info */}
        {team.status === "Deployed" && team.deployedTo && (
          <div className="mt-2 text-sm text-red-600">
            <span className="font-medium">Deployed to:</span> {team.deployedTo}
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div
        className="p-4 min-h-[200px] bg-gray-50"
        onDrop={(e) => onDrop(e, team.id)}
        onDragOver={onDragOver}
      >
        {assignedResources.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Drop resources here to assign to {team.name}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Personnel Section */}
            {resourceCounts.Personnel > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Personnel ({resourceCounts.Personnel})
                </h4>
                <div className="grid gap-2">
                  {sortedResources
                    .filter((r) => r.type === "Personnel")
                    .map((resource) => (
                      <div key={resource.id} className="relative group">
                        <ResourceCard
                          resource={resource}
                          onDragStart={() => {}} // Disable drag from team board
                          onClick={() => {}}
                        />
                        <button
                          onClick={() => onRemoveResource(team.id, resource.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from team"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Vehicles Section */}
            {resourceCounts.Vehicles > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Vehicles ({resourceCounts.Vehicles})
                </h4>
                <div className="grid gap-2">
                  {sortedResources
                    .filter((r) => r.type === "Vehicles" || /^DM\d+$/i.test(r.name))
                    .map((resource) => (
                      <div key={resource.id} className="relative group">
                        <ResourceCard
                          resource={resource}
                          onDragStart={() => {}}
                          onClick={() => {}}
                        />
                        <button
                          onClick={() => onRemoveResource(team.id, resource.id)}
                          className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-600 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from team"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Equipment Section */}
            {resourceCounts.Equipment + resourceCounts["Medical Packs"] > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Equipment (
                  {resourceCounts.Equipment + resourceCounts["Medical Packs"]})
                </h4>
                <div className="grid gap-2">
                  {assignedResources
                    .filter(
                      (r) =>
                        r.type === "Equipment" || r.type === "Medical Packs"
                    )
                    .map((resource) => (
                      <div key={resource.id} className="relative group">
                        <ResourceCard
                          resource={resource}
                          onDragStart={() => {}}
                          onClick={() => {}}
                        />
                        <button
                          onClick={() => onRemoveResource(team.id, resource.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from team"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicTeamBoard;
