// Sample vehicle data for MRT platform
// CommonJS format for Node.js compatibility

const sampleVehicles = [
  {
    id: "dm1",
    name: "DM1",
    type: "Vehicles",
    status: "Available",
    capacity: 5,
    equipment: ["Stretcher", "Medical Kit", "Ropes", "Search Equipment"],
    team: null,
    location: "Base Station",
    callsign: "DM1",
    fuelLevel: 95,
    capabilities: ["Off-road", "Casualty Evacuation", "Equipment Transport"],
    vehicleType: "Land Rover Defender",
  },
  {
    id: "dm2",
    name: "DM2",
    type: "Vehicles",
    status: "Available",
    capacity: 5,
    equipment: ["Advanced Medical Kit", "Communication Equipment", "Lighting"],
    team: null,
    location: "Base Station",
    callsign: "DM2",
    fuelLevel: 87,
    capabilities: [
      "Personnel Transport",
      "Blue Light Response",
      "Off-road Access",
    ],
    vehicleType: "Land Rover Defender",
  },
  {
    id: "dm3",
    name: "DM3",
    type: "Vehicles",
    status: "Available",
    capacity: 8,
    equipment: ["Technical Rescue Kit", "Rope Equipment", "GPS Units"],
    team: null,
    location: "Base Station",
    callsign: "DM3",
    fuelLevel: 78,
    capabilities: ["Personnel Transport", "Blue Light Response", "Command"],
    vehicleType: "Minibus Thingy",
  },
];

module.exports = { sampleVehicles };
