// Main sample data file for SAR platform
// Imports and re-exports all sample data from separate files
// CommonJS format for Node.js compatibility

const { samplePersonnel } = require("./samplePersonnel");
const { sampleVehicles } = require("./sampleVehicles");
const { sampleEquipment } = require("./sampleEquipment");
const { sampleMedicalPacks } = require("./sampleMedicalPacks");
const { sampleCallouts } = require("./sampleCallouts");

// All resources combined (for backward compatibility)
const allSampleResources = [
  ...samplePersonnel,
  ...sampleVehicles,
  ...sampleEquipment,
  ...sampleMedicalPacks,
];

// CommonJS exports
module.exports = {
  samplePersonnel,
  sampleVehicles,
  sampleEquipment,
  sampleMedicalPacks,
  sampleCallouts,
  allSampleResources,
};
