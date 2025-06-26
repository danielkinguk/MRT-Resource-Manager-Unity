import React, { useState } from "react";
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import { sarA, sarL, sarN } from "./sampleSARCALL";

function formatDuration(startTime) {
  if (!startTime) return "";
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffH > 0 ? diffH + 'h ' : ''}${diffM}m`;
}

const COLORS = ["#2563eb", "#22c55e", "#f59e42", "#ef4444", "#a21caf"];

const DeployedDashboard = ({ teams, callouts, resources, onRenameCallout, onRenameTeam }) => {
  // Debug logging
  console.log("[DeployedDashboard] teams:", teams);
  console.log("[DeployedDashboard] callouts:", callouts);
  console.log("[DeployedDashboard] resources:", resources);
  // Only deployed teams
  const deployedTeams = teams.filter((t) => t.status === "Deployed");
  console.log("[DeployedDashboard] deployedTeams:", deployedTeams);
  // Resource summary by type
  const resourceTypes = ["Personnel", "Vehicles", "Equipment", "Medical Packs"];
  const resourceSummary = resourceTypes.map((type) => {
    const all = resources.filter((r) => r.type === type);
    const inUse = all.filter((r) => r.status === "In Use" || r.status === "Deployed");
    return { type, total: all.length, inUse: inUse.length, available: all.length - inUse.length };
  });
  console.log("[DeployedDashboard] resourceSummary:", resourceSummary);

  // Pie chart data for overall resource status
  const statusCounts = resources.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { Available: 0, "In Use": 0, Deployed: 0, Maintenance: 0 }
  );
  const pieData = [
    { name: "Available", value: statusCounts["Available"] },
    { name: "In Use", value: statusCounts["In Use"] },
    { name: "Deployed", value: statusCounts["Deployed"] },
    { name: "Maintenance", value: statusCounts["Maintenance"] },
  ];

  // Track which callout is being edited and the new title
  const [editingCalloutId, setEditingCalloutId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  // Track which team is being edited and the new name
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");

  // PDF Export Handler
  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text("SAR Deployed Dashboard Report", 10, y);
    y += 10;
    doc.setFontSize(12);
    callouts.filter(callout => deployedTeams.some(t => t.deployedTo === callout.id)).forEach(callout => {
      doc.text(`Callout: ${callout.title}`, 10, y);
      y += 7;
      doc.text(`Location: ${callout.location}`, 10, y);
      y += 7;
      if (callout.weather) {
        doc.text(`Weather: ${callout.weather}`, 10, y);
        y += 7;
      }
      doc.text(`Time since created: ${formatDuration(callout.createdAt)} ago`, 10, y);
      y += 7;
      const teamsForCallout = deployedTeams.filter(t => t.deployedTo === callout.id);
      teamsForCallout.forEach(team => {
        doc.setFontSize(11);
        doc.text(`  Team: ${team.name} (${team.color})`, 12, y);
        y += 6;
        if (team.location) {
          doc.text(`    Location: ${team.location}`, 14, y);
          y += 6;
        }
        doc.text(`    Time since team created: ${formatDuration(team.startTime)} ago`, 14, y);
        y += 6;
        const teamResources = resources.filter(r => r.team === team.name);
        const personnel = teamResources.filter(r => r.type === "Personnel");
        const vehicles = teamResources.filter(r => r.type === "Vehicles");
        const equipment = teamResources.filter(r => r.type === "Equipment");
        const medical = teamResources.filter(r => r.type === "Medical Packs");
        doc.text(`    Personnel: ${personnel.map(p => p.name).join(", ") || "None"}`, 14, y);
        y += 6;
        doc.text(`    Vehicles: ${vehicles.map(v => v.name).join(", ") || "None"}`, 14, y);
        y += 6;
        doc.text(`    Equipment: ${equipment.map(e => e.name).join(", ") || "None"}`, 14, y);
        y += 6;
        doc.text(`    Medical Packs: ${medical.map(m => m.name).join(", ") || "None"}`, 14, y);
        y += 8;
        doc.setFontSize(12);
      });
      y += 4;
    });
    // Resource Utilization Summary
    y += 4;
    doc.setFontSize(14);
    doc.text("Resource Utilization Summary", 10, y);
    y += 8;
    resourceSummary.forEach(r => {
      doc.setFontSize(11);
      doc.text(`${r.type}: In Use: ${r.inUse}, Available: ${r.available}, Total: ${r.total}`, 12, y);
      y += 6;
    });
    doc.save("SAR_Deployed_Report.pdf");
  };

  return (
    <div className="space-y-8">
      {/* SARCALL Response at top */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow mb-4 w-full">
        <h2 className="text-lg font-bold text-yellow-800 mb-2">SARCALL Response</h2>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded font-semibold">SAR A</span>
            <span className="text-lg font-bold">{sarA}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded font-semibold">SAR L</span>
            <span className="text-lg font-bold">{sarL}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded font-semibold">SAR N</span>
            <span className="text-lg font-bold">{sarN}</span>
          </div>
        </div>
      </div>
      {/* Active Deployments */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Active Deployments</h2>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow h-fit"
          >
            Export PDF
          </button>
        </div>
        {/* Group deployed teams by callout */}
        {callouts.filter(callout => deployedTeams.some(t => t.deployedTo === callout.id)).map(callout => {
          const teamsForCallout = deployedTeams.filter(t => t.deployedTo === callout.id);
          const isEditing = editingCalloutId === callout.id;
          const totalPersonnel = teamsForCallout.reduce((sum, team) => {
            const teamResources = resources.filter(r => r.team === team.name);
            return sum + teamResources.filter(r => r.type === "Personnel").length;
          }, 0);
          return (
            <div key={callout.id} className="mb-8 mt-0">
              <div className="p-4 rounded-xl border-2 border-gray-400 border-dashed bg-gray-50 flex flex-col gap-6">
                {/* Callout-level info at the top of the box */}
                <div>
                  {isEditing ? (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (newTitle.trim() && newTitle !== callout.title) {
                          onRenameCallout(callout.id, newTitle.trim());
                        }
                        setEditingCalloutId(null);
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        className="text-lg font-semibold border border-gray-300 rounded px-2 py-1"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        autoFocus
                        style={{ fontSize: '1.265rem' }}
                      />
                      <button type="submit" className="text-green-600 font-bold">Save</button>
                      <button type="button" className="text-gray-500" onClick={() => { setEditingCalloutId(null); setNewTitle(""); }}>Cancel</button>
                    </form>
                  ) : (
                    <span
                      className="block font-semibold text-red-700 text-lg cursor-pointer hover:underline"
                      onClick={() => { setEditingCalloutId(callout.id); setNewTitle(callout.title); }}
                      title="Click to edit callout name"
                      style={{ fontSize: '1.265rem' }}
                    >
                      {callout.title}
                    </span>
                  )}
                  <span className="block text-xs text-gray-600 mb-2" style={{ fontSize: '0.92rem' }}>{callout.location}</span>
                  {/* Description */}
                  {callout.description && (
                    <span className="block text-xs text-gray-700 mb-2" style={{ fontSize: '0.92rem' }}>{callout.description}</span>
                  )}
                  {/* Personnel assigned */}
                  <span className="block text-xs text-gray-500 mb-2" style={{ fontSize: '0.92rem' }}>Personnel assigned: {totalPersonnel}</span>
                  {/* Time since callout created */}
                  <span className="block text-xs text-gray-500 mb-2" style={{ fontSize: '0.92rem' }}>Time since callout created: {formatDuration(callout.createdAt)} ago</span>
                  {/* Weather display */}
                  {callout.weather && (
                    <span className="block text-xs text-blue-700 mb-2" style={{ fontSize: '0.92rem' }}>Weather: {callout.weather}</span>
                  )}
                </div>
                {/* Teams section below callout info */}
                <div className="flex flex-wrap gap-6">
                  {teamsForCallout.map((team) => {
                    const teamResources = resources.filter((r) => r.team === team.name);
                    const personnel = teamResources.filter((r) => r.type === "Personnel");
                    const vehicles = teamResources.filter((r) => r.type === "Vehicles");
                    const equipment = teamResources.filter((r) => r.type === "Equipment");
                    const medical = teamResources.filter((r) => r.type === "Medical Packs");
                    return (
                      <div key={team.id} className="rounded-lg border shadow p-4 bg-white min-w-[260px] flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></span>
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
                                className="text-lg font-semibold border border-gray-300 rounded px-2 py-1"
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                autoFocus
                              />
                              <button type="submit" className="text-green-600 font-bold">Save</button>
                              <button type="button" className="text-gray-500" onClick={() => { setEditingTeamId(null); setNewTeamName(team.name); }}>Cancel</button>
                            </form>
                          ) : (
                            <span
                              className="font-bold text-lg cursor-pointer hover:underline"
                              onClick={() => { setEditingTeamId(team.id); setNewTeamName(team.name); }}
                              title="Click to edit team name"
                            >
                              {team.name}
                            </span>
                          )}
                          <span className="ml-auto text-xs text-gray-500">Time since team created {formatDuration(callout.startTime)} ago</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Personnel:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {personnel.map((p) => (
                              <span key={p.id} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                {p.name.split(" ")[0][0]}. {p.name.split(" ")[1]}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Vehicle:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {vehicles.length === 0 ? <span className="text-gray-400">None</span> : vehicles.map((v) => (
                              <span key={v.id} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">{v.name}</span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Equipment:</span>
                          <span className="ml-2 text-orange-700">{equipment.length > 0 ? `${equipment.length} items` : "None"}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Medical Packs:</span>
                          <span className="ml-2 text-blue-700">{medical.length > 0 ? `${medical.length} items` : "None"}</span>
                        </div>
                        {/* Editable Team Location */}
                        <div className="mt-2">
                          <span className="font-semibold">Location:</span>{' '}
                          {editingTeamId === team.id + '-location' ? (
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                const gridRefPattern = /^[A-Z]{2}\s*\d{3,5}\s*\d{3,5}$/i;
                                const value = newTeamName.trim();
                                let update = {};
                                if (gridRefPattern.test(value)) {
                                  update = { location: value, gridReference: value };
                                } else {
                                  update = { location: value, gridReference: undefined };
                                }
                                if ((value && value !== (team.location || '')) || (update.gridReference !== team.gridReference)) {
                                  if (typeof onRenameTeam === 'function') {
                                    onRenameTeam(team.id, team.name, update.location, update.gridReference);
                                  } else {
                                    team.location = update.location;
                                    team.gridReference = update.gridReference;
                                  }
                                }
                                setEditingTeamId(null);
                              }}
                              className="inline-flex items-center gap-2"
                            >
                              <input
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                autoFocus
                              />
                            </form>
                          ) : (
                            <span
                              className="ml-2 text-gray-700 cursor-pointer hover:underline"
                              onClick={() => { setEditingTeamId(team.id + '-location'); setNewTeamName(team.location || ''); }}
                              title="Click to edit team location"
                            >
                              {team.location || <span className="text-gray-400">(Set location)</span>}
                              {team.gridReference && team.gridReference !== team.location && (
                                <span className="ml-2 text-xs text-blue-700 font-mono">[{team.gridReference}]</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Utilization and Status Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Resource Utilization</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RBarChart data={resourceSummary} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="type" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="inUse" fill="#2563eb" name="In Use" />
              <Bar dataKey="available" fill="#22c55e" name="Available" />
            </RBarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Overall Resource Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RPieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </RPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Status Details */}
      <div>
        <h3 className="font-semibold mb-2">Resource Status Details</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {resourceSummary.map((r) => (
            <div key={r.type} className="border rounded-lg p-4 text-center bg-white">
              <h4 className="font-semibold text-lg mb-2">{r.type}</h4>
              <div className="text-sm mb-1">In Use: <span className="font-bold text-blue-700">{r.inUse}</span></div>
              <div className="text-sm mb-1">Available: <span className="font-bold text-green-700">{r.available}</span></div>
              <div className="text-sm mb-1">Total: <span className="font-bold">{r.total}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${r.total > 0 ? (r.inUse / r.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeployedDashboard; 