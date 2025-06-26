import React, { useState } from "react";
import { X, Users, Truck, AlertCircle } from "lucide-react";

const AddTeamModal = ({
  isOpen,
  onClose,
  onSubmit,
  availableVehicles,
  callouts,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Vehicle",
    vehicleId: "",
    calloutId: "",
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        type: "Vehicle",
        vehicleId: "",
        calloutId: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Team name is required";
    }

    if (formData.type === "Vehicle" && !formData.vehicleId) {
      newErrors.vehicleId = "Please select a vehicle for Vehicle teams";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const getTeamNameSuggestion = () => {
    const teamLetters = [
      "Alpha",
      "Bravo",
      "Charlie",
      "Delta",
      "Echo",
      "Foxtrot",
    ];
    const usedLetters = []; // You might want to pass existing teams to check this

    for (const letter of teamLetters) {
      if (!usedLetters.includes(letter)) {
        return formData.type === "Vehicle"
          ? `${letter} Vehicle Team`
          : `${letter} Hill Team`;
      }
    }
    return formData.type === "Vehicle" ? "Vehicle Team" : "Hill Team";
  };

  const handleAutoFill = () => {
    setFormData((prev) => ({
      ...prev,
      name: getTeamNameSuggestion(),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Team</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Team Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    type: "Vehicle",
                    vehicleId: "",
                  }))
                }
                className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  formData.type === "Vehicle"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Truck className="w-6 h-6" />
                <span className="text-sm font-medium">Vehicle Team</span>
                <span className="text-xs text-gray-600 text-center">
                  Base operations with assigned vehicle
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    type: "Hill",
                    vehicleId: "",
                  }))
                }
                className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  formData.type === "Hill"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Hill Team</span>
                <span className="text-xs text-gray-600 text-center">
                  Field operations team
                </span>
              </button>
            </div>
          </div>

          {/* Team Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Team Name *
              </label>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Auto-fill
              </button>
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., Alpha Vehicle Team"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Vehicle Selection (only for Vehicle teams) */}
          {formData.type === "Vehicle" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Vehicle *
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.vehicleId ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select a vehicle...</option>
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.callsign} - {vehicle.vehicleType} (Fuel:{" "}
                    {vehicle.fuelLevel}%)
                  </option>
                ))}
              </select>
              {errors.vehicleId && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.vehicleId}
                </p>
              )}
              {availableVehicles.length === 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  No vehicles available. All vehicles are already assigned to
                  teams.
                </p>
              )}
            </div>
          )}

          {/* Optional Callout Assignment */}
          {callouts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deploy to Callout (Optional)
              </label>
              <select
                name="calloutId"
                value={formData.calloutId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">No immediate deployment</option>
                {callouts
                  .filter((c) => c.status === "Active")
                  .map((callout) => (
                    <option key={callout.id} value={callout.id}>
                      {callout.title} - {callout.location}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Team will be created and optionally deployed to selected callout
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Team Colors
            </h4>
            <p className="text-xs text-blue-800">
              Teams are automatically assigned colors based on their name
              (Alpha=Red, Bravo=Yellow, Charlie=Green, etc.)
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                formData.type === "Vehicle" && availableVehicles.length === 0
              }
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;
