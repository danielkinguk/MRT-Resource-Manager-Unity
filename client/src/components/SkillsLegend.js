import React from "react";
import { Info } from "lucide-react";

const SkillsLegend = () => {
  const skillColors = [
    { skill: "Doctor", color: "#166534", description: "Medical professionals" },
    { skill: "MRC Casualty Care", color: "#16a34a", description: "Advanced medical training" },
    { skill: "Basic Casualty Care", color: "#86efac", description: "First aid qualified" },
    { skill: "Swift Water", color: "#06b6d4", description: "Water rescue specialist" },
    { skill: "Hill Party Leader", color: "#fbbf24", description: "Mountain leadership" },
    { skill: "Search Dog Handler", color: "#ea580c", description: "SARDA qualified" },
    { skill: "Blue Light Driver", color: "#6366f1", description: "Emergency response driver" },
    { skill: "Off-road Driver", color: "#dc2626", description: "4x4 driving qualified" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-sm text-gray-900">Skill Color Legend</h3>
      </div>
      <div className="space-y-2">
        {skillColors.map(({ skill, color }) => (
          <div key={skill} className="flex items-center gap-2">
            <span style={{ display: 'inline-block', width: 16, height: 16, background: color, borderRadius: 3, border: '1px solid #ccc', marginRight: 6 }}></span>
            <span className="text-sm text-gray-900 font-medium" style={{ minWidth: 120 }}>{skill}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsLegend;
