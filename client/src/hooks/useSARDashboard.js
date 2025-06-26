import { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { deployTeamsAndResources } from '../models/deployedModel';

export function useSARDashboard() {
  // State
  const [resources, setResources] = useState([]);
  const [callouts, setCallouts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filter, setFilter] = useState({ type: 'All', status: 'All', team: 'All' });
  const [showNewResourceModal, setShowNewResourceModal] = useState(false);
  const [showNewCalloutModal, setShowNewCalloutModal] = useState(false);
  const [viewMode, setViewMode] = useState('callouts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [showAssignVehicleModal, setShowAssignVehicleModal] = useState(false);
  const [vehicleToAssign, setVehicleToAssign] = useState(null);
  const [selectedCalloutId, setSelectedCalloutId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [resourcesData, calloutsData, teamsData] = await Promise.all([
          api.fetchResources(),
          api.fetchCallouts(),
          api.fetchTeams(),
        ]);
        setResources(resourcesData);
        setCallouts(calloutsData);
        setTeams(teamsData);
      } catch (err) {
        setError('Failed to load data. Make sure the backend server is running.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter resources for available pool
  const availableResources = resources.filter((resource) => {
    const matchesFilter =
      (filter.type === 'All' || resource.type === filter.type) &&
      (filter.status === 'All' || resource.status === filter.status);
    if (viewMode === 'teams') {
      return matchesFilter && !resource.team;
    }
    return matchesFilter;
  });

  // Get resources assigned to a specific team
  const getTeamResources = (teamName) => {
    return resources.filter((r) => r.team === teamName);
  };

  // Drag and drop handlers
  const handleDragStart = (e, resource) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(resource));
  };
  const handleDragOver = (e) => { e.preventDefault(); };

  // Handle drop on team board
  const handleTeamDrop = async (e, teamId) => {
    e.preventDefault();
    const resourceData = JSON.parse(e.dataTransfer.getData('text/plain'));
    try {
      await api.assignToTeam(teamId, resourceData.id);
      let resourcesData = await api.fetchResources();
      // If equipment or medical pack, set status to 'in use'
      if (["Equipment", "Medical Packs"].includes(resourceData.type)) {
        resourcesData = resourcesData.map(r =>
          r.id === resourceData.id ? { ...r, status: 'in use' } : r
        );
      }
      setResources(resourcesData);
      setSuccessMessage(`${resourceData.name} assigned to team`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to assign to team');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle drop on callout
  const handleCalloutDrop = async (e, calloutId) => {
    e.preventDefault();
    const resourceData = JSON.parse(e.dataTransfer.getData('text/plain'));
    try {
      const result = await api.assignResource(calloutId, resourceData.id);
      setCallouts((prev) => prev.map((callout) => callout.id === calloutId ? result.callout : callout));
      setResources((prev) => prev.map((resource) => resource.id === resourceData.id ? result.resource : resource));
      setSuccessMessage('Resource assigned successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to assign resource');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Remove from team
  const handleRemoveFromTeam = async (teamId, resourceId) => {
    try {
      const result = await api.unassignFromTeam(teamId, resourceId);
      let updatedResource = result.resource;
      // If equipment or medical pack, set status to 'Available'
      if (["Equipment", "Medical Packs"].includes(updatedResource.type)) {
        updatedResource = { ...updatedResource, status: 'Available' };
      }
      setResources((prev) => prev.map((resource) => resource.id === resourceId ? updatedResource : resource));
      setSuccessMessage('Resource removed from team');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to remove from team');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Remove from callout
  const handleRemoveFromCallout = async (calloutId, resourceId) => {
    try {
      const result = await api.unassignResource(calloutId, resourceId);
      setCallouts((prev) => prev.map((callout) => callout.id === calloutId ? result.callout : callout));
      setResources((prev) => prev.map((resource) => resource.id === resourceId ? result.resource : resource));
      setSuccessMessage('Resource unassigned successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to remove resource');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Create new resource
  const handleCreateResource = async (resourceData) => {
    try {
      const newResource = await api.createResource(resourceData);
      setResources((prev) => [...prev, newResource]);
      setSuccessMessage('Resource added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to create resource');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle new callout creation
  const handleCreateCallout = async (calloutData) => {
    try {
      const newCallout = await api.createCallout(calloutData);
      setCallouts((prev) => [...prev, newCallout]);
      setSuccessMessage('Callout created successfully');
      setViewMode('callouts');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to create callout');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Teams within callouts
  const handleCreateTeamInCallout = async (calloutId, teamData) => {
    try {
      const newTeam = await api.createTeamInCallout(calloutId, teamData);
      setCallouts((prev) => prev.map((callout) => callout.id === calloutId ? { ...callout, teams: [...(callout.teams || []), newTeam] } : callout));
      setTeams((prev) => [...prev, newTeam]);
      setSuccessMessage(`${teamData.name} created successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to create team');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteTeamFromCallout = async (calloutId, teamId) => {
    try {
      await api.deleteTeamFromCallout(calloutId, teamId);
      setCallouts((prev) => prev.map((callout) => callout.id === calloutId ? { ...callout, teams: (callout.teams || []).filter((t) => t.id !== teamId) } : callout));
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      const resourcesData = await api.fetchResources();
      setResources(resourcesData);
      setSuccessMessage('Team deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete team');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleAssignToTeamInCallout = async (calloutId, teamId, resourceId) => {
    try {
      await api.assignToTeamInCallout(calloutId, teamId, resourceId);
      let resourcesData = await api.fetchResources();
      const resource = resourcesData.find(r => r.id === resourceId);
      // If equipment or medical pack, set status to 'in use'
      if (resource && ["Equipment", "Medical Packs"].includes(resource.type)) {
        resourcesData = resourcesData.map(r =>
          r.id === resourceId ? { ...r, status: 'in use' } : r
        );
      }
      setResources(resourcesData);
      const calloutsData = await api.fetchCallouts();
      setCallouts(calloutsData);
      setSuccessMessage('Resource assigned to team successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to assign to team');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUnassignFromTeamInCallout = async (calloutId, teamId, resourceId) => {
    try {
      const result = await api.unassignFromTeamInCallout(calloutId, teamId, resourceId);
      let updatedResource = result.resource;
      // If equipment or medical pack, set status to 'Available'
      if (["Equipment", "Medical Packs"].includes(updatedResource.type)) {
        updatedResource = { ...updatedResource, status: 'Available' };
      }
      setResources((prev) => prev.map((resource) => resource.id === resourceId ? updatedResource : resource));
      setCallouts((prev) => prev.map((callout) => callout.id === calloutId ? result.callout : callout));
      setSuccessMessage('Resource removed from team successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to remove from team');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Deploy all teams/resources for all active callouts
  const handleDeployAll = async () => {
    setDeploying(true);
    try {
      const [updatedCallouts, updatedTeams, updatedResources] = await Promise.all([
        api.fetchCallouts(),
        api.fetchTeams(),
        api.fetchResources(),
      ]);
      const { deployedTeams, deployedResources } = deployTeamsAndResources(
        updatedCallouts,
        updatedTeams,
        updatedResources
      );
      setCallouts(updatedCallouts);
      setTeams(deployedTeams);
      setResources(deployedResources);
      setSuccessMessage('All teams and resources deployed!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to deploy teams/resources');
    } finally {
      setDeploying(false);
      setShowDeployConfirm(false);
    }
  };

  // Delete team
  const handleDeleteTeam = async (teamId) => {
    try {
      await api.deleteTeam(teamId);
      // Fetch latest teams, resources, and callouts to ensure full sync
      const [teamsData, resourcesData, calloutsData] = await Promise.all([
        api.fetchTeams(),
        api.fetchResources(),
        api.fetchCallouts(),
      ]);
      setTeams(teamsData);
      setResources(resourcesData);
      setCallouts(calloutsData);
      setSuccessMessage('Team deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete team');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Delete callout
  const handleDeleteCallout = async (calloutId) => {
    try {
      // Fetch the callout to get its teams and assigned resources
      const callout = callouts.find(c => c.id === calloutId);
      if (callout) {
        // Unassign all resources from teams in this callout
        if (callout.teams && callout.teams.length > 0) {
          for (const team of callout.teams) {
            if (team.assignedResources && team.assignedResources.length > 0) {
              for (const resourceId of team.assignedResources) {
                await api.unassignFromTeamInCallout(calloutId, team.id, resourceId);
              }
            }
            // Delete the team
            await api.deleteTeamFromCallout(calloutId, team.id);
          }
        }
        // Unassign all resources assigned directly to the callout (not in teams)
        if (callout.assignedResources && callout.assignedResources.length > 0) {
          for (const resourceId of callout.assignedResources) {
            await api.unassignResource(calloutId, resourceId);
          }
        }
      }
      // Delete the callout itself
      await fetch(`/api/callouts/${calloutId}`, { method: 'DELETE' });
      // Refresh callouts, teams, and resources from backend
      let [calloutsData, teamsData, resourcesData] = await Promise.all([
        api.fetchCallouts(),
        api.fetchTeams(),
        api.fetchResources(),
      ]);
      // If no callouts left, delete all teams and reset all resources
      if (calloutsData.length === 0) {
        // Delete all teams
        for (const team of teamsData) {
          await api.deleteTeam(team.id);
        }
        // Fetch teams and resources again after deletion
        teamsData = await api.fetchTeams();
        // Reset all resources to available and unassigned
        resourcesData = resourcesData.map(r => ({ ...r, team: undefined, status: 'Available' }));
        setTeams([]);
        setResources(resourcesData);
      } else {
        setTeams(teamsData);
        setResources(resourcesData);
      }
      setCallouts(calloutsData);
      setSuccessMessage('Callout deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete callout');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Rename team
  const handleRenameTeam = async (teamId, newName, location, gridReference) => {
    try {
      await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, location, gridReference }),
      });
      const oldName = teams.find(t => t.id === teamId).name;
      setTeams((prev) => prev.map((t) => t.id === teamId ? { ...t, name: newName, location, gridReference } : t));
      setCallouts((prev) => prev.map((callout) => callout.teams ? { ...callout, teams: callout.teams.map((t) => t.id === teamId ? { ...t, name: newName, location, gridReference } : t) } : callout));
      setResources((prev) => prev.map((r) => r.team === oldName ? { ...r, team: newName } : r));
      setSuccessMessage('Team updated');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError('Failed to update team');
      setTimeout(() => setError(null), 4000);
    }
  };

  // Merge all teams in a callout into the first team
  const handleMergeTeams = async (calloutId, firstTeamId, resourceIds, allTeamIds) => {
    try {
      const response = await fetch(`/api/callouts/${calloutId}/merge-teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstTeamId, resourceIds, allTeamIds }),
      });
      if (!response.ok) throw new Error('Failed to merge teams');
      // Refresh state from backend
      const [calloutsData, teamsData, resourcesData] = await Promise.all([
        api.fetchCallouts(),
        api.fetchTeams(),
        api.fetchResources(),
      ]);
      setCallouts(calloutsData);
      setTeams(teamsData);
      setResources(resourcesData);
      setSuccessMessage('Teams merged successfully');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError('Failed to merge teams');
      setTimeout(() => setError(null), 4000);
    }
  };

  // Handler for ResourceCard button
  const handleAssignToCalloutTeam = (vehicle) => {
    setVehicleToAssign(vehicle);
    setShowAssignVehicleModal(true);
    setSelectedCalloutId('');
    setSelectedTeamId('');
  };

  // Assign vehicle to callout/team
  const handleConfirmAssignVehicle = async () => {
    if (!selectedCalloutId || !selectedTeamId || !vehicleToAssign) return;
    try {
      const callout = callouts.find(c => c.id === selectedCalloutId);
      if (!callout.assignedResources?.includes(vehicleToAssign.id)) {
        await api.assignResource(selectedCalloutId, vehicleToAssign.id);
      }
      await api.assignToTeamInCallout(selectedCalloutId, selectedTeamId, vehicleToAssign.id);
      const [resourcesData, calloutsData] = await Promise.all([
        api.fetchResources(),
        api.fetchCallouts(),
      ]);
      setResources(resourcesData);
      setCallouts(calloutsData);
      setShowAssignVehicleModal(false);
      setVehicleToAssign(null);
      setSuccessMessage('Vehicle assigned to callout/team');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to assign vehicle to callout/team');
      setTimeout(() => setError(null), 4000);
    }
  };

  // Rename callout
  const handleRenameCallout = async (calloutId, newTitle) => {
    try {
      await fetch(`/api/callouts/${calloutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      setCallouts((prev) => prev.map((c) => c.id === calloutId ? { ...c, title: newTitle } : c));
      setSuccessMessage('Callout name updated');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError('Failed to rename callout');
      setTimeout(() => setError(null), 4000);
    }
  };

  // Compute deployed teams/resources reactively
  const { deployedTeams, deployedResources } = useMemo(() => {
    return deployTeamsAndResources(callouts, teams, resources);
  }, [callouts, teams, resources]);

  // Move resource between teams on the Board view
  const handleMoveResourceOnBoard = async (resourceId, destTeamId) => {
    try {
      await api.assignToTeam(destTeamId, resourceId);
      const resourcesData = await api.fetchResources();
      setResources(resourcesData);
      setSuccessMessage('Resource moved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to move resource');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Create a new global team (not tied to a callout)
  const handleCreateTeam = async (teamData) => {
    try {
      await api.createTeam(teamData);
      const teamsData = await api.fetchTeams();
      setTeams(teamsData);
      setSuccessMessage(`${teamData.name} created successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to create team');
      setTimeout(() => setError(null), 5000);
    }
  };

  return {
    resources,
    setResources,
    callouts,
    setCallouts,
    teams,
    setTeams,
    deployedTeams,
    deployedResources,
    filter,
    setFilter,
    showNewResourceModal,
    setShowNewResourceModal,
    showNewCalloutModal,
    setShowNewCalloutModal,
    viewMode,
    setViewMode,
    loading,
    setLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    showDeployConfirm,
    setShowDeployConfirm,
    deploying,
    setDeploying,
    showAssignVehicleModal,
    setShowAssignVehicleModal,
    vehicleToAssign,
    setVehicleToAssign,
    selectedCalloutId,
    setSelectedCalloutId,
    selectedTeamId,
    setSelectedTeamId,
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
    handleDeployAll,
    handleDeleteTeam,
    handleDeleteCallout,
    handleRenameTeam,
    handleMergeTeams,
    handleAssignToCalloutTeam,
    handleConfirmAssignVehicle,
    handleRenameCallout,
    handleMoveResourceOnBoard,
    handleCreateTeam,
  };
} 