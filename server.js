const express = require("express");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Import sample data from external file
const {
  allSampleResources,
  sampleCallouts,
} = require("./client/src/components/sampleData.js");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data with imported sample data
let resources = [...allSampleResources];
let callouts = [...sampleCallouts];
let teams = []; // Dynamic teams storage

// API Routes

// Resource endpoints
app.get("/api/resources", (req, res) => {
  try {
    const { type, status, team } = req.query;
    let filteredResources = [...resources];

    if (type)
      filteredResources = filteredResources.filter((r) => r.type === type);
    if (status)
      filteredResources = filteredResources.filter((r) => r.status === status);
    if (team)
      filteredResources = filteredResources.filter((r) => r.team === team);

    res.json(filteredResources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

app.get("/api/resources/:id", (req, res) => {
  try {
    const resource = resources.find((r) => r.id === req.params.id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ error: "Failed to fetch resource" });
  }
});

app.post("/api/resources", (req, res) => {
  try {
    const newResource = {
      id: uuidv4(),
      ...req.body,
      status: req.body.status || "Available",
      team: null,
    };
    resources.push(newResource);
    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ error: "Failed to create resource" });
  }
});

app.put("/api/resources/:id", (req, res) => {
  try {
    const index = resources.findIndex((r) => r.id === req.params.id);
    if (index === -1)
      return res.status(404).json({ error: "Resource not found" });

    resources[index] = { ...resources[index], ...req.body };
    res.json(resources[index]);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ error: "Failed to update resource" });
  }
});

app.delete("/api/resources/:id", (req, res) => {
  try {
    const index = resources.findIndex((r) => r.id === req.params.id);
    if (index === -1)
      return res.status(404).json({ error: "Resource not found" });

    resources.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

// Callout endpoints
app.get("/api/callouts", (req, res) => {
  try {
    res.json(callouts);
  } catch (error) {
    console.error("Error fetching callouts:", error);
    res.status(500).json({ error: "Failed to fetch callouts" });
  }
});

app.get("/api/callouts/:id", (req, res) => {
  try {
    const callout = callouts.find((c) => c.id === req.params.id);
    if (!callout) return res.status(404).json({ error: "Callout not found" });
    res.json(callout);
  } catch (error) {
    console.error("Error fetching callout:", error);
    res.status(500).json({ error: "Failed to fetch callout" });
  }
});

app.post("/api/callouts", (req, res) => {
  try {
    const newCallout = {
      id: `co-${uuidv4()}`,
      ...req.body,
      status: req.body.status || "Active",
      assignedResources: req.body.assignedResources || [],
      assignedTeams: req.body.assignedTeams || [],
      createdAt: new Date().toISOString(),
    };
    callouts.push(newCallout);
    res.status(201).json(newCallout);
  } catch (error) {
    console.error("Error creating callout:", error);
    res.status(500).json({ error: "Failed to create callout" });
  }
});

app.put("/api/callouts/:id", (req, res) => {
  try {
    const index = callouts.findIndex((c) => c.id === req.params.id);
    if (index === -1)
      return res.status(404).json({ error: "Callout not found" });

    callouts[index] = { ...callouts[index], ...req.body };
    res.json(callouts[index]);
  } catch (error) {
    console.error("Error updating callout:", error);
    res.status(500).json({ error: "Failed to update callout" });
  }
});

// Delete a callout
app.delete("/api/callouts/:id", (req, res) => {
  try {
    const index = callouts.findIndex((c) => c.id === req.params.id);
    if (index === -1)
      return res.status(404).json({ error: "Callout not found" });

    // Remove teams assigned to this callout (global teams array)
    const callout = callouts[index];
    if (callout.teams && Array.isArray(callout.teams)) {
      callout.teams.forEach((team) => {
        // Unassign all resources from this team
        resources = resources.map((resource) => {
          if (resource.team === team.name) {
            return { ...resource, team: null };
          }
          return resource;
        });
        // Remove from global teams array
        const teamIdx = teams.findIndex((t) => t.id === team.id);
        if (teamIdx !== -1) {
          teams.splice(teamIdx, 1);
        }
      });
    }

    callouts.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting callout:", error);
    res.status(500).json({ error: "Failed to delete callout" });
  }
});

// Resource assignment to callouts
app.post("/api/callouts/:id/assign", (req, res) => {
  try {
    const { resourceId } = req.body;
    const calloutIndex = callouts.findIndex((c) => c.id === req.params.id);
    const resourceIndex = resources.findIndex((r) => r.id === resourceId);

    if (calloutIndex === -1)
      return res.status(404).json({ error: "Callout not found" });
    if (resourceIndex === -1)
      return res.status(404).json({ error: "Resource not found" });

    // Add resource to callout if not already assigned
    if (!callouts[calloutIndex].assignedResources.includes(resourceId)) {
      callouts[calloutIndex].assignedResources.push(resourceId);
    }

    // Update resource status
    resources[resourceIndex].status = "In Use";

    res.json({
      callout: callouts[calloutIndex],
      resource: resources[resourceIndex],
    });
  } catch (error) {
    console.error("Error assigning resource to callout:", error);
    res.status(500).json({ error: "Failed to assign resource" });
  }
});

app.post("/api/callouts/:id/unassign", (req, res) => {
  try {
    const { resourceId } = req.body;
    const calloutIndex = callouts.findIndex((c) => c.id === req.params.id);
    const resourceIndex = resources.findIndex((r) => r.id === resourceId);

    if (calloutIndex === -1)
      return res.status(404).json({ error: "Callout not found" });
    if (resourceIndex === -1)
      return res.status(404).json({ error: "Resource not found" });

    // Remove resource from callout
    callouts[calloutIndex].assignedResources = callouts[
      calloutIndex
    ].assignedResources.filter((id) => id !== resourceId);

    // Update resource status
    resources[resourceIndex].status = "Available";

    res.json({
      callout: callouts[calloutIndex],
      resource: resources[resourceIndex],
    });
  } catch (error) {
    console.error("Error unassigning resource from callout:", error);
    res.status(500).json({ error: "Failed to unassign resource" });
  }
});

// Team assignment to callouts
app.post("/api/callouts/:id/assign-team", (req, res) => {
  try {
    const { teamId } = req.body;
    const calloutIndex = callouts.findIndex((c) => c.id === req.params.id);
    const teamIndex = teams.findIndex((t) => t.id === teamId);

    if (calloutIndex === -1)
      return res.status(404).json({ error: "Callout not found" });
    if (teamIndex === -1)
      return res.status(404).json({ error: "Team not found" });

    const team = teams[teamIndex];

    // Add team to callout's assigned teams if not already assigned
    if (!callouts[calloutIndex].assignedTeams) {
      callouts[calloutIndex].assignedTeams = [];
    }

    if (!callouts[calloutIndex].assignedTeams.includes(teamId)) {
      callouts[calloutIndex].assignedTeams.push(teamId);
    }

    // Mark team as deployed
    teams[teamIndex].status = "Deployed";
    teams[teamIndex].deployedTo = req.params.id;

    // Mark all team resources as deployed
    team.assignedResources.forEach((resourceId) => {
      const resourceIndex = resources.findIndex((r) => r.id === resourceId);
      if (resourceIndex !== -1) {
        resources[resourceIndex].status = "Deployed";
      }
    });

    res.json({
      callout: callouts[calloutIndex],
      team: teams[teamIndex],
    });
  } catch (error) {
    console.error("Error assigning team to callout:", error);
    res.status(500).json({ error: "Failed to assign team" });
  }
});

app.post("/api/callouts/:id/unassign-team", (req, res) => {
  try {
    const { teamId } = req.body;
    const calloutIndex = callouts.findIndex((c) => c.id === req.params.id);
    const teamIndex = teams.findIndex((t) => t.id === teamId);

    if (calloutIndex === -1)
      return res.status(404).json({ error: "Callout not found" });
    if (teamIndex === -1)
      return res.status(404).json({ error: "Team not found" });

    const team = teams[teamIndex];

    // Remove team from callout
    if (callouts[calloutIndex].assignedTeams) {
      callouts[calloutIndex].assignedTeams = callouts[
        calloutIndex
      ].assignedTeams.filter((id) => id !== teamId);
    }

    // Mark team as available
    teams[teamIndex].status = "Available";
    teams[teamIndex].deployedTo = null;

    // Mark all team resources as available
    team.assignedResources.forEach((resourceId) => {
      const resourceIndex = resources.findIndex((r) => r.id === resourceId);
      if (resourceIndex !== -1) {
        resources[resourceIndex].status = "Available";
      }
    });

    res.json({
      callout: callouts[calloutIndex],
      team: teams[teamIndex],
    });
  } catch (error) {
    console.error("Error unassigning team from callout:", error);
    res.status(500).json({ error: "Failed to unassign team" });
  }
});

// Teams within callouts endpoints
app.post("/api/callouts/:calloutId/teams", (req, res) => {
  try {
    const { name, type, color } = req.body;
    const calloutIndex = callouts.findIndex((c) => c.id === req.params.calloutId);

    if (calloutIndex === -1)
      return res.status(404).json({ error: "Callout not found" });

    const newTeam = {
      id: uuidv4(),
      name,
      type, // 'Personnel' or 'Vehicle'
      color: color || getTeamColor(name),
      calloutId: req.params.calloutId,
      assignedResources: [],
      status: "Available",
      createdAt: new Date().toISOString(),
    };

    // Initialize teams array if it doesn't exist
    if (!callouts[calloutIndex].teams) {
      callouts[calloutIndex].teams = [];
    }

    callouts[calloutIndex].teams.push(newTeam);
    teams.push(newTeam);
    res.status(201).json(newTeam);
  } catch (error) {
    console.error("Error creating team within callout:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
});

app.delete("/api/callouts/:calloutId/teams/:teamId", (req, res) => {
  try {
    const calloutIndex = callouts.findIndex((c) => c.id === req.params.calloutId);
    if (calloutIndex === -1)
      return res.status(404).json({ error: "Callout not found" });

    const callout = callouts[calloutIndex];
    if (!callout.teams) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamIndex = callout.teams.findIndex((t) => t.id === req.params.teamId);
    if (teamIndex === -1)
      return res.status(404).json({ error: "Team not found" });

    const team = callout.teams[teamIndex];

    // Unassign all resources from this team
    team.assignedResources.forEach((resourceId) => {
      const resourceIndex = resources.findIndex((r) => r.id === resourceId);
      if (resourceIndex !== -1) {
        resources[resourceIndex].team = null;
      }
    });

    // Remove team from callout
    callout.teams.splice(teamIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting team from callout:", error);
    res.status(500).json({ error: "Failed to delete team" });
  }
});

// Resource assignment to teams within callouts
app.post("/api/callouts/:calloutId/teams/:teamId/assign", (req, res) => {
  try {
    const { resourceId } = req.body;
    const calloutIndex = callouts.findIndex((c) => c.id === req.params.calloutId);
    
    if (calloutIndex === -1)
      return res.status(404).json({ error: "Callout not found" });

    const callout = callouts[calloutIndex];
    if (!callout.teams) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamIndex = callout.teams.findIndex((t) => t.id === req.params.teamId);
    if (teamIndex === -1)
      return res.status(404).json({ error: "Team not found" });

    const resourceIndex = resources.findIndex((r) => r.id === resourceId);
    if (resourceIndex === -1)
      return res.status(404).json({ error: "Resource not found" });

    const team = callout.teams[teamIndex];

    // Add resource to team if not already assigned
    if (!team.assignedResources.includes(resourceId)) {
      callout.teams[teamIndex].assignedResources.push(resourceId);
    }

    // Update resource team assignment
    resources[resourceIndex].team = team.name;

    // Ensure resource is assigned to callout
    if (!callout.assignedResources) {
      callout.assignedResources = [];
    }
    if (!callout.assignedResources.includes(resourceId)) {
      callout.assignedResources.push(resourceId);
    }

    res.json({
      team: callout.teams[teamIndex],
      resource: resources[resourceIndex],
      callout: callout,
    });
  } catch (error) {
    console.error("Error assigning resource to team within callout:", error);
    res.status(500).json({ error: "Failed to assign resource to team" });
  }
});

app.post("/api/callouts/:calloutId/teams/:teamId/unassign", (req, res) => {
  try {
    const { resourceId } = req.body;
    const calloutIndex = callouts.findIndex((c) => c.id === req.params.calloutId);
    
    if (calloutIndex === -1)
      return res.status(404).json({ error: "Callout not found" });

    const callout = callouts[calloutIndex];
    if (!callout.teams) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamIndex = callout.teams.findIndex((t) => t.id === req.params.teamId);
    if (teamIndex === -1)
      return res.status(404).json({ error: "Team not found" });

    const resourceIndex = resources.findIndex((r) => r.id === resourceId);
    if (resourceIndex === -1)
      return res.status(404).json({ error: "Resource not found" });

    // Remove resource from team
    callout.teams[teamIndex].assignedResources = callout.teams[
      teamIndex
    ].assignedResources.filter((id) => id !== resourceId);

    // Update resource team assignment
    resources[resourceIndex].team = null;

    res.json({
      team: callout.teams[teamIndex],
      resource: resources[resourceIndex],
      callout: callout,
    });
  } catch (error) {
    console.error("Error unassigning resource from team within callout:", error);
    res.status(500).json({ error: "Failed to unassign resource from team" });
  }
});

// Teams endpoints
app.get("/api/teams", (req, res) => {
  try {
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

app.post("/api/teams", (req, res) => {
  try {
    const { name, type, calloutId, vehicleId, color } = req.body;

    const newTeam = {
      id: uuidv4(),
      name,
      type, // 'Vehicle' or 'Hill'
      calloutId: calloutId || null,
      vehicleId: vehicleId || null,
      color: color || getTeamColor(name),
      assignedResources: [],
      status: "Available", // Available, Deployed
      deployedTo: null, // Callout ID when deployed
      createdAt: new Date().toISOString(),
    };

    // If it's a vehicle team, assign the vehicle to the team
    if (type === "Vehicle" && vehicleId) {
      const vehicleIndex = resources.findIndex((r) => r.id === vehicleId);
      if (vehicleIndex !== -1) {
        resources[vehicleIndex].team = name;
        newTeam.assignedResources.push(vehicleId);
      }
    }

    teams.push(newTeam);
    res.status(201).json(newTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
});

app.delete("/api/teams/:id", (req, res) => {
  try {
    const teamIndex = teams.findIndex((t) => t.id === req.params.id);
    if (teamIndex === -1)
      return res.status(404).json({ error: "Team not found" });

    const team = teams[teamIndex];

    // Unassign all resources from this team
    resources = resources.map((resource) => {
      if (resource.team === team.name) {
        return { ...resource, team: null };
      }
      return resource;
    });

    teams.splice(teamIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ error: "Failed to delete team" });
  }
});

// Resource assignment to teams
app.post("/api/teams/:teamId/assign", (req, res) => {
  try {
    const { resourceId } = req.body;
    const teamIndex = teams.findIndex((t) => t.id === req.params.teamId);
    const resourceIndex = resources.findIndex((r) => r.id === resourceId);

    if (teamIndex === -1)
      return res.status(404).json({ error: "Team not found" });
    if (resourceIndex === -1)
      return res.status(404).json({ error: "Resource not found" });

    const team = teams[teamIndex];

    // Add resource to team if not already assigned
    if (!team.assignedResources.includes(resourceId)) {
      teams[teamIndex].assignedResources.push(resourceId);
    }

    // Update resource team assignment
    resources[resourceIndex].team = team.name;

    res.json({
      team: teams[teamIndex],
      resource: resources[resourceIndex],
    });
  } catch (error) {
    console.error("Error assigning resource to team:", error);
    res.status(500).json({ error: "Failed to assign resource to team" });
  }
});

app.post("/api/teams/:teamId/unassign", (req, res) => {
  try {
    const { resourceId } = req.body;
    const teamIndex = teams.findIndex((t) => t.id === req.params.teamId);
    const resourceIndex = resources.findIndex((r) => r.id === resourceId);

    if (teamIndex === -1)
      return res.status(404).json({ error: "Team not found" });
    if (resourceIndex === -1)
      return res.status(404).json({ error: "Resource not found" });

    // Remove resource from team
    teams[teamIndex].assignedResources = teams[
      teamIndex
    ].assignedResources.filter((id) => id !== resourceId);

    // Update resource team assignment
    resources[resourceIndex].team = null;

    res.json({
      team: teams[teamIndex],
      resource: resources[resourceIndex],
    });
  } catch (error) {
    console.error("Error unassigning resource from team:", error);
    res.status(500).json({ error: "Failed to unassign resource from team" });
  }
});

// Get available vehicles for team creation
app.get("/api/available-vehicles", (req, res) => {
  try {
    const availableVehicleResources = resources.filter(
      (r) => r.type === "Vehicles" && !r.team
    );
    res.json(availableVehicleResources);
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    res.status(500).json({ error: "Failed to fetch available vehicles" });
  }
});

// Get teams that can be assigned to callouts (have personnel and are available)
app.get("/api/deployable-teams", (req, res) => {
  try {
    const deployableTeams = teams.filter((team) => {
      const teamPersonnel = resources.filter(
        (r) => r.team === team.name && r.type === "Personnel"
      );
      return (
        teamPersonnel.length > 0 &&
        (!team.status || team.status === "Available")
      );
    });
    res.json(deployableTeams);
  } catch (error) {
    console.error("Error fetching deployable teams:", error);
    res.status(500).json({ error: "Failed to fetch deployable teams" });
  }
});

// Helper function to assign team colors
function getTeamColor(teamName) {
  const colorMap = {
    Alpha: "#DC2626", // Red
    Bravo: "#EAB308", // Yellow
    Charlie: "#10B981", // Green
    Delta: "#8B5CF6", // Purple
    Echo: "#EA580C", // Orange
    Foxtrot: "#0891B2", // Cyan
  };

  // Extract team letter (Alpha, Bravo, etc.)
  const teamLetter = teamName.split(" ")[0];
  return colorMap[teamLetter] || "#6B7280"; // Default gray
}

// Health check
app.get("/health", (req, res) => {
  try {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ error: "Health check failed" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Update a team (rename)
app.put("/api/teams/:id", (req, res) => {
  try {
    const teamIndex = teams.findIndex((t) => t.id === req.params.id);
    if (teamIndex === -1)
      return res.status(404).json({ error: "Team not found" });

    const oldName = teams[teamIndex].name;
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Invalid team name" });
    }
    teams[teamIndex].name = name.trim();

    // Update resources assigned to this team
    resources = resources.map((resource) =>
      resource.team === oldName ? { ...resource, team: name.trim() } : resource
    );

    res.json(teams[teamIndex]);
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Failed to update team" });
  }
});

// Merge teams in a callout
app.post("/api/callouts/:id/merge-teams", (req, res) => {
  try {
    const { firstTeamId, resourceIds, allTeamIds } = req.body;
    const calloutIndex = callouts.findIndex((c) => c.id === req.params.id);
    if (calloutIndex === -1) return res.status(404).json({ error: "Callout not found" });
    let callout = callouts[calloutIndex];
    if (!callout.teams || !Array.isArray(callout.teams)) return res.status(400).json({ error: "No teams to merge" });
    // Find the first team
    const firstTeam = callout.teams.find((t) => t.id === firstTeamId);
    if (!firstTeam) return res.status(404).json({ error: "First team not found" });
    // Merge all resources into first team
    const mergedTeam = { ...firstTeam, assignedResources: resourceIds };
    // Update callout's teams: keep only the merged team
    callout.teams = [mergedTeam];
    // Remove all but the first team from global teams array
    teams = teams.filter((t) => !allTeamIds.includes(t.id) || t.id === firstTeamId).map((t) => t.id === firstTeamId ? mergedTeam : t);
    // Update resources' team property to the merged team's name
    resources = resources.map((r) => resourceIds.includes(r.id) ? { ...r, team: mergedTeam.name } : r);
    // Save updated callout
    callouts[calloutIndex] = callout;
    res.json({ callout, team: mergedTeam });
  } catch (error) {
    console.error("Error merging teams:", error);
    res.status(500).json({ error: "Failed to merge teams" });
  }
});

app.listen(PORT, () => {
  console.log(`SAR Full-Stack Server running on port ${PORT}`);
  console.log("Available API endpoints:");
  console.log("  Resources: GET/POST/PUT/DELETE /api/resources");
  console.log("  Callouts: GET/POST/PUT /api/callouts");
  console.log("  Callout Assignment: POST /api/callouts/:id/assign");
  console.log("  Team Deployment: POST /api/callouts/:id/assign-team");
  console.log("  Teams: GET/POST/DELETE /api/teams");
  console.log("  Team Assignment: POST /api/teams/:id/assign");
  console.log("  Available Vehicles: GET /api/available-vehicles");
  console.log("  Deployable Teams: GET /api/deployable-teams");
});
