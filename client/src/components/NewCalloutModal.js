import React, { useState } from "react";
import { X, AlertCircle, Clock } from "lucide-react";

const NewCalloutModal = ({ isOpen, onClose, onSubmit, teams }) => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    gridReference: "",
    description: "",
    weather: "",
    startTime: new Date().toISOString().slice(0, 16), // ISO string for datetime-local
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        location: "",
        gridReference: "",
        description: "",
        weather: "",
        startTime: new Date().toISOString().slice(0, 16),
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Validate grid reference format if provided
    if (
      formData.gridReference &&
      !formData.gridReference.match(/^[A-Z]{2}\s*\d{3,5}\s*\d{3,5}$/)
    ) {
      newErrors.gridReference =
        "Invalid grid reference format (e.g., SD 1355 8546 or SD 12345 67890)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      startTime: formData.startTime,
    });

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

  const setNow = () => {
    const now = new Date();
    // Format as yyyy-MM-ddTHH:mm for datetime-local
    const pad = (n) => n.toString().padStart(2, '0');
    const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setFormData((prev) => ({ ...prev, startTime: formatted }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New MRT Call Out</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Callout Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., Missing Walker - Last Seen at Church, Whicham Valley"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.location ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., Black Combe Summit"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Grid Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grid Reference
            </label>
            <input
              type="text"
              name="gridReference"
              value={formData.gridReference}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.gridReference ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., SD 2945 7895"
            />
            {errors.gridReference && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.gridReference}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              UK Ordnance Survey grid reference format (2 letters, 6-10 digits)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Brief description of the incident..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Weather */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weather Conditions
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="weather"
                value={formData.weather}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Clear, 15°C, light winds"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, weather: 'Wind W 25-35 mph, Showers likely, Temp at 500m 12°C, Cloud base 800m and rising' }))}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
              >
                Fetch Weather
              </button>
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Start Time
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <button
                type="button"
                onClick={setNow}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Now
              </button>
            </div>
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
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Create Callout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCalloutModal;
