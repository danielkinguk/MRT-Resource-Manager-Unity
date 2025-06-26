import React, { useState } from "react";
import { 
  MapPin, 
  Clock, 
  User, 
  X, 
  Users, 
  Truck, 
  Trash2, 
  Package, 
  Heart, 
  Plus,
  RadioIcon
} from "lucide-react";
import { SkillsLegend } from "./index";

const CalloutTeamBoard = ({
  callout,
  resources,
  onDrop,
  onDragOver,
  onRemoveResource,
  onDeleteTeam,
  onCreateTeam,
  onAssignToTeam,
  onUnassignFromTeam,
  onDeleteCallout,
  onMergeTeams,
  onRenameCallout,
  onRenameTeam,
}) => {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    name: "",
    type: "Personnel",
    color: "#3B82F6"
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMergeConfirm, setShowMergeConfirm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(callout.title);
  const [editingGridRef, setEditingGridRef] = useState(false);
  const [newGridRef, setNewGridRef] = useState(callout.gridReference || "");
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");

  // Get assigned resources for this callout
  const assignedResources = resources.filter((r) =>
    callout.assignedResources?.includes(r.id)
  );

  // Get teams for this callout
  const calloutTeams = callout.teams || [];

  // Get resources assigned to specific teams
  const getTeamResources = (teamName) => {
    const teamResources = resources.filter((r) => r.team === teamName && callout.assignedResources?.includes(r.id));
    // Sort vehicles to the top
    return teamResources.slice().sort((a, b) => {
      const isVehicle = (r) => r.type === "Vehicles" || /^DM\d+$/i.test(r.name);
      return isVehicle(b) - isVehicle(a);
    });
  };

  // Get unassigned resources (assigned to callout but not to any team)
  const unassignedResources = assignedResources.filter((r) => !r.team);

  // Format the created time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m ago`;
    } else {
      return `${diffMins}m ago`;
    }
  };

  const getTeamIcon = (type) => {
    return type === "Vehicle" ? (
      <Truck className="w-5 h-5" />
    ) : (
      <Users className="w-5 h-5" />
    );
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

  const handleCreateTeam = () => {
    if (newTeamData.name.trim()) {
      onCreateTeam(callout.id, newTeamData);
      setNewTeamData({ name: "", type: "Personnel", color: "#3B82F6" });
      setShowCreateTeam(false);
    }
  };

  const handleTeamDrop = async (e, teamId) => {
    e.preventDefault();
    const resourceData = JSON.parse(e.dataTransfer.getData("text/plain"));
    onAssignToTeam(callout.id, teamId, resourceData.id);
  };

  const handleRemoveFromTeam = async (teamId, resourceId) => {
    onUnassignFromTeam(callout.id, teamId, resourceId);
  };

  // Merge all teams into the first team
  const handleMergeTeams = () => {
    setShowMergeConfirm(true);
  };

  const confirmMergeTeams = () => {
    if (calloutTeams.length < 2) return setShowMergeConfirm(false);
    const firstTeam = calloutTeams[0];
    // Gather all resources from all teams (by id, from the actual team objects)
    const allResourceIds = (callout.teams || []).flatMap((team) => team.assignedResources || []);
    const uniqueResourceIds = Array.from(new Set(allResourceIds));
    if (typeof onMergeTeams === 'function') {
      onMergeTeams(callout.id, firstTeam.id, uniqueResourceIds, calloutTeams.map(t => t.id));
    }
    setShowMergeConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Callout Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {editingTitle ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (newTitle.trim() && newTitle !== callout.title && typeof onRenameCallout === 'function') {
                  onRenameCallout(callout.id, newTitle.trim());
                }
                setEditingTitle(false);
              }}
              className="flex items-center gap-2 mb-2"
            >
              <input
                className="text-xl font-semibold text-red-700 border border-gray-300 rounded px-2 py-1"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                autoFocus
              />
              <button type="submit" className="text-green-600 font-bold">Save</button>
              <button type="button" className="text-gray-500" onClick={() => { setEditingTitle(false); setNewTitle(callout.title); }}>Cancel</button>
            </form>
          ) : (
            <h3
              className="text-xl font-semibold text-red-700 mb-2 cursor-pointer hover:underline"
              onClick={() => { setEditingTitle(true); setNewTitle(callout.title); }}
              title="Click to edit callout name"
            >
              {callout.title}
            </h3>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{callout.location}</span>
              {editingGridRef ? (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (newGridRef.trim() && newGridRef !== callout.gridReference && typeof onRenameCallout === 'function') {
                      onRenameCallout(callout.id, undefined, newGridRef.trim());
                    }
                    setEditingGridRef(false);
                  }}
                  className="inline-flex items-center gap-1"
                >
                  <input
                    className="font-mono text-xs border border-gray-300 rounded px-2 py-1"
                    value={newGridRef}
                    onChange={e => setNewGridRef(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="text-green-600 font-bold text-xs">Save</button>
                  <button type="button" className="text-gray-500 text-xs" onClick={() => { setEditingGridRef(false); setNewGridRef(callout.gridReference || ""); }}>Cancel</button>
                </form>
              ) : (
                callout.gridReference && (
                  <span
                    className="font-mono text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer hover:underline"
                    onClick={() => setEditingGridRef(true)}
                    title="Click to edit grid reference"
                  >
                    {callout.gridReference}
                  </span>
                )
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Created {formatTime(callout.createdAt)}</span>
              {callout.estimatedDuration && (
                <span>• Est. {callout.estimatedDuration}h duration</span>
              )}
            </div>

            {callout.incidentCommander && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>IC: {callout.incidentCommander}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              callout.status === "Active"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {callout.status}
          </span>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors mt-2"
            title="Delete Callout"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete Callout Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-red-700">Delete Callout?</h3>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this callout? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDeleteCallout(callout.id); setShowDeleteConfirm(false); }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {callout.description && (
        <div className="mb-6">
          <p className="text-sm text-gray-700">{callout.description}</p>
        </div>
      )}

      {/* Weather */}
      {callout.weather && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Weather:</span> {callout.weather}
          </p>
        </div>
      )}

      {/* Teams Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Teams ({calloutTeams.length})
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateTeam(true)}
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
            >
              Add Team
            </button>
            <button
              onClick={handleMergeTeams}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              disabled={calloutTeams.length < 2}
              title="Merge all teams into the first team"
            >
              Merge Teams
            </button>
          </div>
        </div>

        {/* Create Team Modal */}
        {showCreateTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Team</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeamData.name}
                    onChange={(e) => setNewTeamData({...newTeamData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Type
                  </label>
                  <select
                    value={newTeamData.type}
                    onChange={(e) => setNewTeamData({...newTeamData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Personnel">Personnel</option>
                    <option value="Vehicle">Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Color (click color to change)
                  </label>
                  <input
                    type="color"
                    value={newTeamData.color}
                    onChange={(e) => setNewTeamData({...newTeamData, color: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateTeam(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {calloutTeams.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h5 className="text-lg font-medium text-gray-600 mb-2">
              No Teams Created
            </h5>
            <p className="text-gray-500 mb-4">
              Create teams to organize resources for this callout
            </p>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create First Team
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {calloutTeams.map((team) => {
              const teamResources = getTeamResources(team.name);
              const resourceCounts = {
                Personnel: teamResources.filter((r) => r.type === "Personnel").length,
                Vehicles: teamResources.filter((r) => r.type === "Vehicles").length,
                Equipment: teamResources.filter((r) => r.type === "Equipment").length,
                "Medical Packs": teamResources.filter((r) => r.type === "Medical Packs").length,
              };

              return (
                <div key={team.id} className="bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                  {/* Team Header */}
                  <div
                    className="p-3 border-b-2 border-gray-200"
                    style={{ backgroundColor: team.color + "20" }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Icon + Name/Type + Resource Counter */}
                      <div className="flex items-start gap-2 flex-1">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white mt-1"
                          style={{ backgroundColor: team.color }}
                        >
                          {getTeamIcon(team.type)}
                        </div>
                        <div className="flex flex-col items-start">
                          {editingTeamId === team.id ? (
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                if (newTeamName.trim() && newTeamName !== team.name && typeof onRenameTeam === 'function') {
                                  onRenameTeam(team.id, newTeamName.trim());
                                }
                                setEditingTeamId(null);
                              }}
                              className="flex items-center gap-2"
                            >
                              <input
                                className="text-base font-semibold border border-gray-300 rounded px-2 py-1"
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                autoFocus
                              />
                              <button type="submit" className="text-green-600 font-bold">Save</button>
                              <button type="button" className="text-gray-500" onClick={() => { setEditingTeamId(null); setNewTeamName(team.name); }}>Cancel</button>
                            </form>
                          ) : (
                            <div
                              className="font-bold text-lg cursor-pointer hover:underline leading-tight"
                              onClick={() => { setEditingTeamId(team.id); setNewTeamName(team.name); }}
                              title="Click to edit team name"
                            >
                              {team.name}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-0.5">{team.type} Team</div>
                          <div className="text-xs text-gray-500 mt-1">{teamResources.length} resources</div>
                        </div>
                      </div>
                      {/* Right: Delete button */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDeleteTeam(callout.id, team.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Resource Summary */}
                    <div className="mt-2 flex gap-3">
                      {Object.entries(resourceCounts).map(([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center gap-1 text-xs text-gray-600"
                        >
                          {getResourceIcon(type)}
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Drop Zone */}
                  <div
                    className="p-3 min-h-[120px] bg-gray-50"
                    onDrop={(e) => handleTeamDrop(e, team.id)}
                    onDragOver={onDragOver}
                  >
                    {teamResources.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        <Users className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">Drop resources here</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {teamResources.map((resource) => (
                          <div key={resource.id} className="relative group">
                            <div className="bg-white px-2 py-1 rounded border shadow-sm text-xs">
                              <span>{resource.name || resource.callsign}</span>
                              {resource.type === "Personnel" && (
                                <span className="text-gray-500 ml-1">
                                  ({resource.callsign})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveFromTeam(team.id, resource.id)}
                              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove from team"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unassigned Resources Section */}
      {unassignedResources.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <RadioIcon className="w-5 h-5" />
            Available Personnel ({unassignedResources.length})
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {unassignedResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-1 bg-white px-3 py-2 rounded border shadow-sm"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify(resource))}
                >
                  <span className="text-sm">
                    {resource.name || resource.callsign}
                  </span>
                  {resource.type === "Personnel" && (
                    <span className="text-sm text-gray-500">
                      ({resource.callsign})
                    </span>
                  )}
                  <button
                    onClick={() => onRemoveResource(callout.id, resource.id)}
                    className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Callout Drop Zone for New Resources */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px] bg-gray-50"
        onDrop={(e) => onDrop(e, callout.id)}
        onDragOver={onDragOver}
      >
        <div className="text-center text-gray-500">
          <RadioIcon className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm">Drop personnel not gathered from SARCALL here</p>
        </div>
      </div>

      {/* Resource Summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex gap-4">
          <span>
            Personnel:{" "}
            {assignedResources.filter((r) => r.type === "Personnel").length}
          </span>
          <span>
            Vehicles:{" "}
            {assignedResources.filter((r) => r.type === "Vehicles").length}
          </span>
          <span>
            Equipment:{" "}
            {assignedResources.filter((r) => r.type === "Equipment").length +
              assignedResources.filter((r) => r.type === "Medical Packs")
                .length}
          </span>
        </div>

        <div className="text-xs text-gray-500">ID: {callout.id}</div>
      </div>

      {/* Merge Teams Confirmation Modal */}
      {showMergeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Merge All Teams?</h3>
            <p className="mb-6 text-gray-700">Are you sure you want to merge all teams into the first team? All resources will be moved to the first team and other teams will be removed. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMergeConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmMergeTeams}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalloutTeamBoard; 