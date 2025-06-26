import React, { useState } from "react";
import { X, User, Truck, Package, Heart, AlertCircle } from "lucide-react";

const NewResourceModal = ({ isOpen, onClose, onSubmit, teams }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Personnel",
    status: "Available",
    // Personnel specific
    callsign: "",
    contact: "",
    skills: [],
    qualifications: [],
    dogName: "",
    // Vehicle specific
    vehicleType: "",
    capacity: "",
    fuelLevel: "",
    capabilities: [],
    // Equipment specific
    contents: [],
    condition: "",
    lastMaintenance: "",
    expiry: "",
    certificationLevel: "",
  });
  const [errors, setErrors] = useState({});

  // Available options
  const skillOptions = [
    "Leader/Deputy",
    "Doctor",
    "MRC Casualty Care",
    "Basic Casualty Care",
    "Technical Rescue",
    "Swift Water",
    "Hill Party Leader",
    "Search Dog Handler",
    "Blue Light Driver",
    "Off-road Driver",
    "Radio Operator",
    "Navigation",
  ];

  const capabilityOptions = [
    "Off-road",
    "Casualty Evacuation",
    "Equipment Transport",
    "Personnel Transport",
    "Mobile Command",
    "Blue Light Response",
    "Technical Rescue",
    "Off-road Access",
  ];

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        type: "Personnel",
        status: "Available",
        callsign: "",
        contact: "",
        skills: [],
        qualifications: [],
        dogName: "",
        vehicleType: "",
        capacity: "",
        fuelLevel: "",
        capabilities: [],
        contents: [],
        condition: "",
        lastMaintenance: "",
        expiry: "",
        certificationLevel: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.type === "Personnel" && !formData.callsign.trim()) {
      newErrors.callsign = "Callsign is required for personnel";
    }

    if (formData.type === "Vehicles") {
      if (!formData.vehicleType.trim()) {
        newErrors.vehicleType = "Vehicle type is required";
      }
      if (!formData.capacity || formData.capacity < 1) {
        newErrors.capacity = "Valid capacity is required";
      }
      if (
        !formData.fuelLevel ||
        formData.fuelLevel < 0 ||
        formData.fuelLevel > 100
      ) {
        newErrors.fuelLevel = "Fuel level must be between 0-100%";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clean up data based on type
    const cleanedData = { ...formData };

    if (formData.type === "Personnel") {
      // Keep only personnel fields
      delete cleanedData.vehicleType;
      delete cleanedData.capacity;
      delete cleanedData.fuelLevel;
      delete cleanedData.capabilities;
      delete cleanedData.contents;
      delete cleanedData.condition;
      delete cleanedData.lastMaintenance;
      delete cleanedData.expiry;
      delete cleanedData.certificationLevel;
    } else if (formData.type === "Vehicles") {
      // Keep only vehicle fields
      delete cleanedData.callsign;
      delete cleanedData.contact;
      delete cleanedData.skills;
      delete cleanedData.qualifications;
      delete cleanedData.dogName;
      delete cleanedData.contents;
      delete cleanedData.condition;
      delete cleanedData.lastMaintenance;
      delete cleanedData.expiry;
      delete cleanedData.certificationLevel;
      cleanedData.capacity = parseInt(cleanedData.capacity);
      cleanedData.fuelLevel = parseInt(cleanedData.fuelLevel);
    } else {
      // Equipment/Medical Packs
      delete cleanedData.callsign;
      delete cleanedData.contact;
      delete cleanedData.skills;
      delete cleanedData.qualifications;
      delete cleanedData.dogName;
      delete cleanedData.vehicleType;
      delete cleanedData.capacity;
      delete cleanedData.fuelLevel;
      delete cleanedData.capabilities;
    }

    onSubmit(cleanedData);
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

  const handleArrayChange = (field, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const getIcon = () => {
    switch (formData.type) {
      case "Personnel":
        return <User className="w-5 h-5" />;
      case "Vehicles":
        return <Truck className="w-5 h-5" />;
      case "Equipment":
        return <Package className="w-5 h-5" />;
      case "Medical Packs":
        return <Heart className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-semibold">Add New Resource</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Resource Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: "Personnel", icon: User, label: "Personnel" },
                { value: "Vehicles", icon: Truck, label: "Vehicles" },
                { value: "Equipment", icon: Package, label: "Equipment" },
                { value: "Medical Packs", icon: Heart, label: "Medical" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                  className={`p-3 border-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    formData.type === value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === "Personnel" ? "Full Name" : "Resource Name"} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder={
                formData.type === "Personnel"
                  ? "e.g., John Smith"
                  : "e.g., Technical Rescue Kit"
              }
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="On Call">On Call</option>
            </select>
          </div>

          {/* Personnel specific fields */}
          {formData.type === "Personnel" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Callsign *
                  </label>
                  <input
                    type="text"
                    name="callsign"
                    value={formData.callsign}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.callsign ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., Alpha-5"
                  />
                  {errors.callsign && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.callsign}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., +44-7700-900123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dog Name (if applicable)
                </label>
                <input
                  type="text"
                  name="dogName"
                  value={formData.dogName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Rex"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {skillOptions.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill)}
                        onChange={(e) =>
                          handleArrayChange("skills", skill, e.target.checked)
                        }
                        className="rounded"
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Vehicle specific fields */}
          {formData.type === "Vehicles" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type *
                  </label>
                  <input
                    type="text"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.vehicleType ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., Land Rover Defender"
                  />
                  {errors.vehicleType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.vehicleType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (personnel) *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.capacity ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., 6"
                  />
                  {errors.capacity && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.capacity}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Level (%) *
                </label>
                <input
                  type="number"
                  name="fuelLevel"
                  value={formData.fuelLevel}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fuelLevel ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 95"
                />
                {errors.fuelLevel && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fuelLevel}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capabilities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {capabilityOptions.map((capability) => (
                    <label
                      key={capability}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.capabilities.includes(capability)}
                        onChange={(e) =>
                          handleArrayChange(
                            "capabilities",
                            capability,
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      <span>{capability}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Equipment/Medical specific fields */}
          {(formData.type === "Equipment" ||
            formData.type === "Medical Packs") && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select condition...</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Maintenance
                  </label>
                  <input
                    type="date"
                    name="lastMaintenance"
                    value={formData.lastMaintenance}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {formData.type === "Medical Packs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certification Level
                    </label>
                    <select
                      name="certificationLevel"
                      value={formData.certificationLevel}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select level...</option>
                      <option value="Basic">Basic</option>
                      <option value="MRC">MRC</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

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
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewResourceModal;
