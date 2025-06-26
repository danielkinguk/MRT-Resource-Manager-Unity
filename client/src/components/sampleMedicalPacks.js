// Sample medical packs data for MRT platform
// CommonJS format for Node.js compatibility

const sampleMedicalPacks = [
  {
    id: "mrc-kit",
    name: "MRC Medical Kit",
    type: "Medical Packs",
    status: "Available",
    contents: [
      "Advanced Trauma Kit",
      "Oxygen",
      "Medications",
      "Spinal Board",
      "Vacuum Splints",
    ],
    team: null,
    expiry: "2025-12-31",
    certificationLevel: "MRC",
  },
  {
    id: "basic-first-aid",
    name: "Basic First Aid Kit",
    type: "Medical Packs",
    status: "Available",
    contents: [
      "Bandages",
      "Antiseptic",
      "Pain Relief",
      "Triangular Bandages",
      "Burn Gel",
    ],
    team: null,
    expiry: "2026-06-30",
    certificationLevel: "Basic",
  },
];

module.exports = { sampleMedicalPacks };
