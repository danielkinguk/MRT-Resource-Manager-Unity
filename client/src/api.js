// API functions for SAR Dashboard
const API_BASE = "/api";

export const api = {
  async fetchResources() {
    const response = await fetch(`${API_BASE}/resources`);
    return response.json();
  },
  async fetchCallouts() {
    const response = await fetch(`${API_BASE}/callouts`);
    return response.json();
  },
  async fetchTeams() {
    const response = await fetch(`${API_BASE}/teams`);
    return response.json();
  },
  async fetchAvailableVehicles() {
    const response = await fetch(`${API_BASE}/available-vehicles`);
    return response.json();
  },
  async createTeam(teamData) {
    const response = await fetch(`${API_BASE}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });
    return response.json();
  },
  async deleteTeam(teamId) {
    const response = await fetch(`${API_BASE}/teams/${teamId}`, {
      method: "DELETE",
    });
    return response.ok;
  },
  async assignToTeam(teamId, resourceId) {
    const response = await fetch(`${API_BASE}/teams/${teamId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId }),
    });
    return response.json();
  },
  async unassignFromTeam(teamId, resourceId) {
    const response = await fetch(`${API_BASE}/teams/${teamId}/unassign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId }),
    });
    return response.json();
  },
  async createTeamInCallout(calloutId, teamData) {
    const response = await fetch(`${API_BASE}/callouts/${calloutId}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });
    return response.json();
  },
  async deleteTeamFromCallout(calloutId, teamId) {
    const response = await fetch(`${API_BASE}/callouts/${calloutId}/teams/${teamId}`, {
      method: "DELETE",
    });
    return response.ok;
  },
  async assignToTeamInCallout(calloutId, teamId, resourceId) {
    const response = await fetch(`${API_BASE}/callouts/${calloutId}/teams/${teamId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId }),
    });
    return response.json();
  },
  async unassignFromTeamInCallout(calloutId, teamId, resourceId) {
    const response = await fetch(`${API_BASE}/callouts/${calloutId}/teams/${teamId}/unassign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId }),
    });
    return response.json();
  },
  async assignResource(calloutId, resourceId) {
    const response = await fetch(`${API_BASE}/callouts/${calloutId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId }),
    });
    return response.json();
  },
  async unassignResource(calloutId, resourceId) {
    const response = await fetch(`${API_BASE}/callouts/${calloutId}/unassign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId }),
    });
    return response.json();
  },
  async createResource(resource) {
    const response = await fetch(`${API_BASE}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resource),
    });
    return response.json();
  },
  async createCallout(callout) {
    const response = await fetch(`${API_BASE}/callouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(callout),
    });
    return response.json();
  },
  async updateTeamStatus(teamId, status, calloutId) {
    const response = await fetch(`${API_BASE}/teams/${teamId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, calloutId }),
    });
    return response.ok;
  },
  async updateCalloutStatus(calloutId, status) {
    const response = await fetch(`${API_BASE}/callouts/${calloutId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return response.ok;
  },
}; 