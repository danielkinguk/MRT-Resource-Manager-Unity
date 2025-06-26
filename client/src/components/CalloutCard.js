import React from "react";
import { MapPin, Clock, User, X, Users } from "lucide-react";

const CalloutCard = ({
  callout,
  resources,
  onDrop,
  onDragOver,
  onRemoveResource,
}) => {
  // Get assigned resources
  const assignedResources = resources.filter((r) =>
    callout.assignedResources?.includes(r.id)
  );

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {callout.title}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{callout.location}</span>
              {callout.gridReference && (
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {callout.gridReference}
                </span>
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

        <div className="text-right">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              callout.status === "Active"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {callout.status}
          </span>
        </div>
      </div>

      {/* Description */}
      {callout.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-700">{callout.description}</p>
        </div>
      )}

      {/* Weather */}
      {callout.weather && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Weather:</span> {callout.weather}
          </p>
        </div>
      )}

      {/* Drop Zone for Resources */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 min-h-[100px] bg-gray-50"
        onDrop={(e) => onDrop(e, callout.id)}
        onDragOver={onDragOver}
      >
        <div className="text-center text-gray-500 mb-3">
          <Users className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm">Drop resources here to assign to callout</p>
        </div>

        {/* Assigned Resources */}
        {assignedResources.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Assigned Resources ({assignedResources.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {assignedResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-1 bg-white px-2 py-1 rounded border shadow-sm"
                >
                  <span className="text-xs">
                    {resource.name || resource.callsign}
                  </span>
                  {resource.type === "Personnel" && (
                    <span className="text-xs text-gray-500">
                      ({resource.callsign})
                    </span>
                  )}
                  <button
                    onClick={() => onRemoveResource(callout.id, resource.id)}
                    className="ml-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resource Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
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
    </div>
  );
};

export default CalloutCard;
