import React from "react";
import { AlertCircle, Users, Truck, RadioIcon, Map } from "lucide-react";
import {
  ResourceCard,
  SkillsLegend,
  NewResourceModal,
  NewCalloutModal,
  BoardView,
} from "./components/index.js";
import DynamicTeamBoard from "./components/DynamicTeamBoard";
import CalloutTeamBoard from "./components/CalloutTeamBoard.jsx";
import MapView from "./MapView";
import DeployedDashboard from "./components/DeployedDashboard";
import { useSARDashboard } from "./hooks/useSARDashboard";

// Main Application
const SARDashboard = () => {
  const {
    resources,
    callouts,
    teams,
    filter,
    setFilter,
    showNewResourceModal,
    setShowNewResourceModal,
    showNewCalloutModal,
    setShowNewCalloutModal,
    viewMode,
    setViewMode,
    loading,
    error,
    successMessage,
    availableResources,
    getTeamResources,
    handleDragStart,
    handleDragOver,
    handleTeamDrop,
    handleCalloutDrop,
    handleRemoveFromTeam,
    handleRemoveFromCallout,
    handleCreateResource,
    handleCreateCallout,
    handleCreateTeamInCallout,
    handleDeleteTeamFromCallout,
    handleAssignToTeamInCallout,
    handleUnassignFromTeamInCallout,
    handleDeleteTeam,
    handleDeleteCallout,
    handleRenameTeam,
    handleMergeTeams,
    handleRenameCallout,
    deployedTeams,
    deployedResources,
    handleMoveResourceOnBoard,
  } = useSARDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading MRT Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !resources.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Connection Error
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                MRT Callout Board
              </h1>
              <p className="text-sm text-gray-600">
                Resource Management • D&F Mountain Rescue
              </p>
            </div>

            <div className="flex gap-2">
              {/* Tab‐style buttons: Callouts / Deployed / Board / Map */}
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("callouts")}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                    viewMode === "callouts"
                      ? "bg-white shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  <RadioIcon className="w-4 h-4" />
                  Callouts
                </button>
                <button
                  onClick={() => setViewMode("board")}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                    viewMode === "board"
                      ? "bg-white shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Board
                </button>
                <button
                  onClick={() => setViewMode("deployed")}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                    viewMode === "deployed"
                      ? "bg-white shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  Deployed
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                    viewMode === "map" ? "bg-white shadow-sm" : "text-gray-600"
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === "map" ? (
          // Map View
          <div className="h-[calc(100vh-200px)]">
            <MapView callouts={callouts} teams={teams} resources={resources} />
          </div>
        ) : viewMode === "teams" ? (
          // Resources View
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Remove Available Resources Pool */}
            {/* Keep SkillsLegend visible */}
            <div className="lg:col-span-1">
              <SkillsLegend />
            </div>
            {/* Dynamic Team Boards */}
            <div className="lg:col-span-3">
              <div className="grid gap-4">
                {teams.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Teams Created
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create your first team to start organizing personnel and
                      equipment
                    </p>
                    <button
                      onClick={() => setShowNewCalloutModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
                    >
                      Create MRT Callout
                    </button>
                    <button
                      onClick={() => alert('Populating Callout Information from SARCALL.')}
                      className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 mx-auto text-center text-base font-semibold shadow"
                    >
                      Generate from SARCALL
                    </button>
                  </div>
                ) : (
                  teams.map((team) => (
                    <DynamicTeamBoard
                      key={team.id}
                      team={team}
                      assignedResources={getTeamResources(team.name)}
                      onDrop={handleTeamDrop}
                      onDragOver={handleDragOver}
                      onRemoveResource={handleRemoveFromTeam}
                      onDeleteTeam={handleDeleteTeam}
                      onRenameTeam={handleRenameTeam}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        ) : viewMode === "deployed" ? (
          // Deployed Resources View
          <DeployedDashboard
            teams={deployedTeams}
            callouts={callouts}
            resources={deployedResources}
            onRenameCallout={handleRenameCallout}
            onRenameTeam={handleRenameTeam}
          />
        ) : viewMode === "board" ? (
          // Board View
          <BoardView 
            callouts={callouts}
            teams={teams}
            resources={resources}
            activeCallout={callouts[0]}
            onMoveResource={handleMoveResourceOnBoard}
            onRenameTeam={handleRenameTeam}
            onCreateTeam={handleCreateTeamInCallout}
            onDeleteTeam={(teamId) => {
              const active = callouts[0];
              if (active) handleDeleteTeamFromCallout(active.id, teamId);
            }}
            onMergeTeams={handleMergeTeams}
            onRemoveResource={handleRemoveFromTeam}
          />
        ) : (
          // Callouts View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* All Resources Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">All Resources</h2>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {availableResources.length}
                  </span>
                </div>

                {/* Filters */}
                <div className="space-y-3 mb-4">
                  <select
                    value={filter.type}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="All">All Types</option>
                    <option value="Personnel">Personnel</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Medical Packs">Medical Packs</option>
                  </select>

                  <select
                    value={filter.status}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="All">All Status</option>
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="On Call">On Call</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto flex-1">
                  {availableResources.map((resource) => {
                    // Determine if resource is assigned to a team or callout
                    const isAssigned = !!resource.team || callouts.some(callout => Array.isArray(callout.assignedResources) && callout.assignedResources.includes(resource.id));
                    // Override status if assigned
                    const displayResource = isAssigned && resource.status !== 'In Use'
                      ? { ...resource, status: 'In Use' }
                      : resource;
                    return (
                      <ResourceCard
                        key={resource.id}
                        resource={displayResource}
                        onDragStart={handleDragStart}
                        onClick={() => console.log("Resource clicked:", resource)}
                      />
                    );
                  })}
                </div>
                {/* Skills Legend at the bottom */}
                <div className="mt-6">
                  <SkillsLegend />
                </div>
              </div>
            </div>

            {/* Callouts Panel */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-4">Active Callouts with Teams</h2>
                <div className="grid gap-4">
                  {callouts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <RadioIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No Active Callouts
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Create a new callout to start managing incident response with teams
                      </p>
                      <button
                        onClick={() => setShowNewCalloutModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
                      >
                        Create MRT Callout
                      </button>
                      <button
                        onClick={() => alert('Populating Callout Information from SARCALL.')}
                        className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 mx-auto text-center text-base font-semibold shadow"
                      >
                        Generate from SARCALL
                      </button>
                    </div>
                  ) : (
                    callouts.map((callout) => (
                      <CalloutTeamBoard
                        key={callout.id}
                        callout={callout}
                        resources={resources}
                        onDrop={handleCalloutDrop}
                        onDragOver={handleDragOver}
                        onRemoveResource={handleRemoveFromCallout}
                        onDeleteCallout={handleDeleteCallout}
                        onDeleteTeam={handleDeleteTeamFromCallout}
                        onCreateTeam={handleCreateTeamInCallout}
                        onAssignToTeam={handleAssignToTeamInCallout}
                        onUnassignFromTeam={handleUnassignFromTeamInCallout}
                        onMergeTeams={handleMergeTeams}
                        onRenameCallout={handleRenameCallout}
                        onRenameTeam={handleRenameTeam}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewResourceModal
        isOpen={showNewResourceModal}
        onClose={() => setShowNewResourceModal(false)}
        onSubmit={handleCreateResource}
        teams={teams}
      />

      <NewCalloutModal
        isOpen={showNewCalloutModal}
        onClose={() => setShowNewCalloutModal(false)}
        onSubmit={handleCreateCallout}
        teams={teams}
      />
    </div>
  );
};

export default SARDashboard;
