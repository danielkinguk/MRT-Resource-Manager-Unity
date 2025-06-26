import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";

// Skill color mapping for color boxes
const SKILL_COLOR_MAP = {
  "Doctor": "#166534",
  "MRC Casualty Care": "#16a34a",
  "Basic Casualty Care": "#86efac",
  "Swift Water": "#06b6d4",
  "Hill Party Leader": "#fbbf24",
  "Search Dog Handler": "#ea580c",
  "Blue Light Driver": "#6366f1",
  "Off-road Driver": "#dc2626",
};

const BoardView = ({ callouts = [], teams = [], resources = [], activeCallout, onMoveResource, onRenameTeam, onCreateTeam, onDeleteTeam, onMergeTeams, onRemoveResource }) => {
  // Transform the data to create teams with their assigned resources
  const transformTeamsData = React.useCallback(() => {
    const teamsWithResources = [];
    const addedTeamIds = new Set();

    // Process teams that are assigned to callouts
    callouts.forEach(callout => {
      if (callout.teams && callout.teams.length > 0) {
        callout.teams.forEach(team => {
          // Get resources assigned to this team
          const teamResources = resources.filter(resource => 
            resource.team === team.name || 
            (resource.calloutId === callout.id && resource.teamId === team.id)
          );

          teamsWithResources.push({
            id: team.id,
            name: team.name,
            color: team.color || getTeamColor(team.name),
            resources: teamResources
          });
          addedTeamIds.add(team.id);
        });
      }
    });

    // Process standalone teams (not in callouts)
    teams.forEach(team => {
      if (addedTeamIds.has(team.id)) return; // Skip if already added
      const teamResources = resources.filter(resource => 
        resource.team === team.name && !resource.calloutId
      );
      teamsWithResources.push({
        id: team.id,
        name: team.name,
        color: team.color || getTeamColor(team.name),
        resources: teamResources
      });
    });

    return teamsWithResources;
  }, [callouts, teams, resources]);

  // Generate a color for teams that don't have one assigned
  const getTeamColor = (teamName) => {
    const colors = [
      "#F44336", // Red
      "#FFEB3B", // Yellow
      "#2196F3", // Blue
      "#4CAF50", // Green
      "#9C27B0", // Purple
      "#FF9800", // Orange
      "#795548", // Brown
      "#607D8B", // Blue Grey
    ];
    
    // Use team name to consistently assign colors
    const index = teamName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const [editingTeamId, setEditingTeamId] = React.useState(null);
  const [editingTeamName, setEditingTeamName] = React.useState("");
  const [showNewTeamModal, setShowNewTeamModal] = React.useState(false);
  const [newTeamName, setNewTeamName] = React.useState("");
  const [newTeamType, setNewTeamType] = React.useState("Personnel");
  const [newTeamColor, setNewTeamColor] = React.useState('#3B82F6');
  const [pendingResource, setPendingResource] = React.useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState(null);

  const boardTeams = transformTeamsData();

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      // Dropped outside any team: prompt to create new team
      let moved;
      if (source.droppableId === "available-resources") {
        moved = availableResources[source.index];
      } else if (source.droppableId === "available-equipment") {
        moved = availableEquipment[source.index];
      } else if (source.droppableId === "available-medical-packs") {
        moved = availableMedicalPacks[source.index];
      } else {
        const sourceTeamIdx = boardTeams.findIndex((t) => t.id === source.droppableId);
        const sourceTeam = boardTeams[sourceTeamIdx];
        moved = sourceTeam.resources[source.index];
      }
      setPendingResource(moved);
      setShowNewTeamModal(true);
      setNewTeamType("Personnel");
      return;
    }
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Handle dropping back to available areas (unassign from team)
    if (
      destination.droppableId === "available-resources" ||
      destination.droppableId === "available-equipment" ||
      destination.droppableId === "available-medical-packs"
    ) {
      // Only unassign if dragged from a team
      if (
        source.droppableId !== destination.droppableId &&
        boardTeams.some((t) => t.id === source.droppableId)
      ) {
        const sourceTeamIdx = boardTeams.findIndex((t) => t.id === source.droppableId);
        const sourceTeam = boardTeams[sourceTeamIdx];
        const moved = sourceTeam.resources[source.index];
        if (moved && onRemoveResource) {
          onRemoveResource(sourceTeam.id, moved.id);
        }
      }
      return;
    }

    let moved;
    let sourceTeamIdx = -1;
    let destTeamIdx = boardTeams.findIndex((t) => t.id === destination.droppableId);
    const destTeam = boardTeams[destTeamIdx];
    let newTeams = [...boardTeams];

    if (source.droppableId === "available-resources") {
      // Dragging from available resources
      moved = availableResources[source.index];
    } else if (source.droppableId === "available-equipment") {
      // Dragging from available equipment
      moved = availableEquipment[source.index];
    } else if (source.droppableId === "available-medical-packs") {
      // Dragging from available medical packs
      moved = availableMedicalPacks[source.index];
    } else {
      // Dragging from a team
      sourceTeamIdx = boardTeams.findIndex((t) => t.id === source.droppableId);
      const sourceTeam = boardTeams[sourceTeamIdx];
      moved = sourceTeam.resources[source.index];
      newTeams[sourceTeamIdx] = { ...sourceTeam, resources: [...sourceTeam.resources] };
    }

    // Add to destination
    destTeam.resources.splice(destination.index, 0, moved);
    newTeams[destTeamIdx] = { ...destTeam, resources: [...destTeam.resources] };

    if (onMoveResource) {
      onMoveResource(moved.id, destTeam.id);
    } else {
      // No need to update boardTeams here, as it's already updated in the onDragEnd function
    }
  };

  const handleEditStart = (team) => {
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
  };

  const handleEditChange = (e) => {
    setEditingTeamName(e.target.value);
  };

  const handleEditSave = (team) => {
    if (editingTeamName.trim() && editingTeamName !== team.name) {
      if (onRenameTeam) onRenameTeam(team.id, editingTeamName.trim());
    }
    setEditingTeamId(null);
    setEditingTeamName("");
  };

  const handleEditKeyDown = (e, team) => {
    if (e.key === "Enter") {
      handleEditSave(team);
    } else if (e.key === "Escape") {
      setEditingTeamId(null);
      setEditingTeamName("");
    }
  };

  // Compute available resources: assigned to active callout, not assigned to any team
  const availableResources = activeCallout
    ? resources.filter(r =>
        !r.team &&
        Array.isArray(activeCallout.assignedResources) &&
        activeCallout.assignedResources.includes(r.id) &&
        ["Personnel", "Vehicles"].includes(r.type)
      )
    : resources.filter(r =>
        !r.team && ["Personnel", "Vehicles"].includes(r.type)
      );

  // Compute available equipment: not assigned to any team
  const availableEquipment = resources.filter(
    r => !r.team && r.type === "Equipment"
  );

  // Compute available medical packs: not assigned to any team
  const availableMedicalPacks = resources.filter(
    r => !r.team && r.type === "Medical Packs"
  );

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      if (typeof onCreateTeam === 'function' && activeCallout && activeCallout.id) {
        // Match Callouts behavior: create team in the active callout
        onCreateTeam(activeCallout.id, {
          name: newTeamName.trim(),
          type: newTeamType,
          color: newTeamColor,
        });
      }
      setShowNewTeamModal(false);
      setNewTeamName("");
      setNewTeamType("Personnel");
      setNewTeamColor('#3B82F6');
      setPendingResource(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Removed DEBUG output */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => setShowNewTeamModal(true)}
          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
          style={{ marginRight: 8 }}
        >
          Add Team
        </button>
        <button
          onClick={() => {
            // Merge Teams logic: only if more than 1 team
            if (typeof onMergeTeams === 'function' && boardTeams.length > 1) {
              const firstTeam = boardTeams[0];
              const allTeamIds = boardTeams.map(t => t.id);
              const allResourceIds = boardTeams.flatMap(t => t.resources.map(r => r.id));
              onMergeTeams(activeCallout.id, firstTeam.id, allResourceIds, allTeamIds);
            }
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
          disabled={boardTeams.length < 2}
          title="Merge all teams into the first team"
        >
          Merge Teams
        </button>
      </div>
      {showNewTeamModal && (
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
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Type
                </label>
                <select
                  value={newTeamType}
                  onChange={e => setNewTeamType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Personnel">Personnel</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Color
                </label>
                <input
                  type="color"
                  value={newTeamColor}
                  onChange={e => setNewTeamColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewTeamModal(false)}
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
      {boardTeams.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px',
          background: '#f5f5f5',
          borderRadius: 10,
          marginTop: 24
        }}>
          <p style={{ fontSize: 18, color: '#666', marginBottom: 16 }}>
            No teams found
          </p>
          <p style={{ color: '#888' }}>
            Create teams in the Callouts or Resources view to see them as magnetic tiles here
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {boardTeams.map((team) => (
              <Droppable droppableId={team.id} key={team.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: team.color + "22",
                      borderRadius: 10,
                      minWidth: 250,
                      padding: 16,
                      boxShadow: "0 2px 8px #0001",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        background: team.color,
                        color: "#fff",
                        borderRadius: 6,
                        padding: "8px 0",
                        textAlign: "center",
                        fontWeight: "bold",
                        marginBottom: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span onClick={() => handleEditStart(team)} style={{ flex: 1 }}>
                        {editingTeamId === team.id ? (
                          <input
                            type="text"
                            value={editingTeamName}
                            onChange={handleEditChange}
                            onBlur={() => handleEditSave(team)}
                            onKeyDown={(e) => handleEditKeyDown(e, team)}
                            autoFocus
                            style={{
                              width: "90%",
                              borderRadius: 4,
                              border: "1px solid #fff",
                              padding: "4px 8px",
                              fontWeight: "bold",
                              fontSize: 16,
                              textAlign: "center",
                              color: "#222",
                              background: "#fff",
                            }}
                          />
                        ) : (
                          team.name
                        )}
                      </span>
                      <button
                        onClick={() => setDeleteConfirmId(team.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          marginLeft: 16,
                          marginRight: 8,
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                        title="Delete Team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Delete confirmation dialog */}
                    {deleteConfirmId === team.id && (
                      <div style={{
                        position: "absolute",
                        top: 40,
                        left: 0,
                        right: 0,
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        boxShadow: "0 2px 8px #0002",
                        zIndex: 10,
                        padding: 16,
                        textAlign: "center"
                      }}>
                        <div style={{ marginBottom: 12 }}>
                          Are you sure you want to delete this team?<br />
                          All resources will be returned to Available Resources.
                        </div>
                        <button
                          onClick={() => {
                            if (typeof onDeleteTeam === 'function') onDeleteTeam(team.id);
                            setDeleteConfirmId(null);
                          }}
                          style={{
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 16px',
                            marginRight: 8,
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{
                            background: '#f3f4f6',
                            color: '#222',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 16px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {team.resources
                      .slice()
                      .sort((a, b) => {
                        // Vehicles first
                        const isVehicle = (r) => r.type === "Vehicles" || /^DM\d+$/i.test(r.name);
                        return isVehicle(b) - isVehicle(a);
                      })
                      .map((resource, idx) => (
                      <Draggable draggableId={resource.id} index={idx} key={resource.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              margin: "6px 0",
                              padding: 10,
                              background:
                                resource.type === "Medical Packs"
                                  ? "#fbcfe8"
                                  : resource.type === "Equipment"
                                  ? team.color
                                  : resource.type === "Vehicles" || /^DM\d+$/i.test(resource.name)
                                  ? "#e0f2fe"
                                  : "#fff",
                              color:
                                resource.type === "Medical Packs"
                                  ? "#be185d"
                                  : resource.type === "Equipment"
                                  ? "#fff"
                                  : resource.type === "Vehicles" || /^DM\d+$/i.test(resource.name)
                                  ? "#0369a1"
                                  : "#222",
                              borderRadius: 5,
                              fontWeight:
                                (["Equipment", "Medical Packs"].includes(resource.type))
                                  ? "bold"
                                  : resource.type === "Vehicles" || /^DM\d+$/i.test(resource.name)
                                  ? "bold"
                                  : "normal",
                              border:
                                resource.type === "Medical Packs"
                                  ? "1px solid #f472b6"
                                  : resource.type === "Equipment"
                                  ? undefined
                                  : resource.type === "Vehicles" || /^DM\d+$/i.test(resource.name)
                                  ? "2px solid #38bdf8"
                                  : undefined,
                              boxShadow: "0 1px 4px #0001",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              ...provided.draggableProps.style,
                            }}
                          >
                            {resource.type === "Medical Packs" && (
                              <span style={{ color: '#dc2626', fontSize: 16, marginRight: 4, display: 'flex', alignItems: 'center' }} title="Medical Pack">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="6" y="2" width="4" height="12" rx="1" fill="#dc2626"/>
                                  <rect x="2" y="6" width="12" height="4" rx="1" fill="#dc2626"/>
                                </svg>
                              </span>
                            )}
                            {resource.type !== "Equipment" && resource.type !== "Medical Packs" && resource.skills && Array.isArray(resource.skills) && resource.skills.length > 0 && (
                              <span style={{ display: "flex", gap: 2, marginRight: 6 }}>
                                {resource.skills.filter(skill => skill !== "Leader/Deputy").map((skill) => (
                                  <span
                                    key={skill}
                                    title={skill}
                                    style={{
                                      display: "inline-block",
                                      width: 12,
                                      height: 12,
                                      background: SKILL_COLOR_MAP[skill] || "#bbb",
                                      borderRadius: 2,
                                      border: "1px solid #ccc",
                                    }}
                                  />
                                ))}
                              </span>
                            )}
                            <span style={{ 
                              color: (resource.type === "Medical Packs") ? "#be185d" : (resource.type === "Equipment") ? "#fff" : (resource.skills && resource.skills.includes("Leader/Deputy") ? "#dc2626" : "inherit"),
                              fontWeight: (resource.type === "Medical Packs") ? "bold" : (resource.type === "Equipment") ? "bold" : (resource.skills && resource.skills.includes("Leader/Deputy") ? "bold" : "normal")
                            }}>
                              {resource.name}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
          {/* Available Resources Box */}
          <Droppable droppableId="available-resources" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  marginTop: 40,
                  background: "#f5f5f5",
                  border: "2px dashed #bbb",
                  borderRadius: 10,
                  padding: 16,
                  minHeight: 70,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                <span style={{ fontWeight: 600, color: "#666", marginRight: 16 }}>
                  Available Personnel
                </span>
                {availableResources.length === 0 ? (
                  <span style={{ color: '#bbb', fontStyle: 'italic' }}>None available</span>
                ) : (
                  availableResources.map((resource, idx) => (
                    <Draggable draggableId={resource.id} index={idx} key={resource.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: "#fff",
                            color: "#222",
                            borderRadius: 5,
                            boxShadow: "0 1px 4px #0001",
                            padding: "8px 12px",
                            fontWeight: 500,
                            minWidth: 120,
                            maxWidth: 160,
                            width: 140,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            border: "1px solid #bbb",
                            ...provided.draggableProps.style,
                          }}
                        >
                          {resource.skills && Array.isArray(resource.skills) && resource.skills.length > 0 && (
                            <span style={{ display: "flex", gap: 2, marginRight: 6 }}>
                              {resource.skills.filter(skill => skill !== "Leader/Deputy").map((skill) => (
                                <span
                                  key={skill}
                                  title={skill}
                                  style={{
                                    display: "inline-block",
                                    width: 12,
                                    height: 12,
                                    background: SKILL_COLOR_MAP[skill] || "#bbb",
                                    borderRadius: 2,
                                    border: "1px solid #ccc",
                                  }}
                                />
                              ))}
                            </span>
                          )}
                          <span
                            title={resource.name}
                            style={{
                              color: resource.skills && resource.skills.includes("Leader/Deputy") ? "#dc2626" : "inherit",
                              fontWeight: resource.skills && resource.skills.includes("Leader/Deputy") ? "bold" : "normal",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {resource.name}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {/* Available Equipment Box */}
          <Droppable droppableId="available-equipment" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  marginTop: 32,
                  background: "#e0f2fe",
                  border: "2px dashed #38bdf8",
                  borderRadius: 10,
                  padding: 16,
                  minHeight: 70,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  marginBottom: 24,
                }}
              >
                <span style={{ fontWeight: 600, color: "#0369a1", fontSize: 14, marginRight: 16 }}>
                  Available Equipment
                </span>
                {availableEquipment.length === 0 ? (
                  <span style={{ color: '#bbb', fontStyle: 'italic' }}>None available</span>
                ) : (
                  availableEquipment.map((resource, idx) => (
                    <Draggable draggableId={resource.id} index={idx} key={resource.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: "#bae6fd",
                            color: "#0369a1",
                            borderRadius: 5,
                            boxShadow: "0 1px 4px #0001",
                            padding: "8px 12px",
                            fontWeight: 500,
                            fontSize: 14,
                            minWidth: 120,
                            maxWidth: 160,
                            width: 140,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            border: "1px solid #38bdf8",
                            marginBottom: 0,
                            cursor: "grab",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <span
                            title={resource.name}
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {resource.name}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {/* Available Medical Packs Box */}
          <Droppable droppableId="available-medical-packs" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  marginTop: 32,
                  background: "#fce7f3",
                  border: "2px dashed #f472b6",
                  borderRadius: 10,
                  padding: 16,
                  minHeight: 70,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  marginBottom: 24,
                }}
              >
                <span style={{ fontWeight: 600, color: "#be185d", fontSize: 14, marginRight: 16 }}>
                  Available Medical Packs
                </span>
                {availableMedicalPacks.length === 0 ? (
                  <span style={{ color: '#bbb', fontStyle: 'italic' }}>None available</span>
                ) : (
                  availableMedicalPacks.map((resource, idx) => (
                    <Draggable draggableId={resource.id} index={idx} key={resource.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: "#fbcfe8",
                            color: "#be185d",
                            borderRadius: 5,
                            boxShadow: "0 1px 4px #0001",
                            padding: "8px 12px",
                            fontWeight: 500,
                            fontSize: 14,
                            minWidth: 120,
                            maxWidth: 160,
                            width: 140,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            border: "1px solid #f472b6",
                            marginBottom: 0,
                            cursor: "grab",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <span style={{ color: '#dc2626', fontSize: 16, marginRight: 4, display: 'flex', alignItems: 'center' }} title="Medical Pack">
                            {/* Red cross SVG icon */}
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="6" y="2" width="4" height="12" rx="1" fill="#dc2626"/>
                              <rect x="2" y="6" width="12" height="4" rx="1" fill="#dc2626"/>
                            </svg>
                          </span>
                          <span
                            title={resource.name}
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {resource.name}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default BoardView; 