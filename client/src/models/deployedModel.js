// deployedModel.js
// Data model for deployment logic and selectors

/**
 * Deploy all teams and their assigned resources for active callouts.
 * Returns new arrays for teams and resources with updated deployment status.
 */
export function deployTeamsAndResources(callouts, teams, resources) {
  // Find all teams assigned to active callouts
  const activeCalloutIds = callouts.filter(c => c.status === 'Active').map(c => c.id);
  const deployedTeams = teams.map(team => {
    // If team is assigned to an active callout, mark as deployed
    const assignedCallout = callouts.find(c => (c.teams || []).some(t => t.id === team.id) && activeCalloutIds.includes(c.id));
    if (assignedCallout) {
      return { ...team, status: 'Deployed', deployedTo: assignedCallout.id };
    }
    return team;
  });
  // Mark resources assigned to deployed teams as 'In Use'
  const deployedTeamNames = deployedTeams.filter(t => t.status === 'Deployed').map(t => t.name);
  const deployedResources = resources.map(resource => {
    if (deployedTeamNames.includes(resource.team)) {
      return { ...resource, status: 'In Use' };
    }
    return resource;
  });
  return { deployedTeams, deployedResources };
}

/**
 * Selector: Get all deployed teams
 */
export function getDeployedTeams(teams) {
  return teams.filter(t => t.status === 'Deployed');
}

/**
 * Selector: Get all resources assigned to deployed teams
 */
export function getDeployedResources(resources, teams) {
  const deployedTeamNames = teams.filter(t => t.status === 'Deployed').map(t => t.name);
  return resources.filter(r => deployedTeamNames.includes(r.team));
} 