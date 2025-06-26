# MRT Resource Management

A full-stack Node.js & React application for managing resources, callouts, and team deployments in search and rescue (SAR) operations.

---

## Languages & Libraries Used

### Languages
- **JavaScript** (ES6+)
- **JSX** (for React components)

### Backend (Root)
- **express** (^4.21.2): REST API server
- **cors** (^2.8.5): CORS middleware
- **path** (^0.12.7): Path utilities
- **proj4** (^2.19.3): Coordinate conversion (map)
- **uuid** (^9.0.1): Unique ID generation
- **@hello-pangea/dnd** (^18.0.1): Drag-and-drop utilities (may be shared with frontend)
- **concurrently** (^7.6.0, dev): Run scripts in parallel
- **nodemon** (^3.1.10, dev): Auto-restart server on changes

### Frontend (client/)
- **react** (^18.3.1): UI library
- **react-dom** (^18.3.1): React DOM rendering
- **react-scripts** (^5.0.1): Build/start/test scripts
- **@hello-pangea/dnd** (^17.0.0): Drag-and-drop for React
- **jspdf** (^3.0.1): PDF export
- **lucide-react** (^0.263.1): Icon set
- **recharts** (^3.0.0): Charting
- **web-vitals** (^3.5.2): Performance metrics

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [File & Directory Structure](#file--directory-structure)
3. [Backend (API) Overview](#backend-api-overview)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Models](#data-models)
6. [Setup & Development](#setup--development)
7. [Additional Notes](#additional-notes)

---

## Project Overview

This application enables SAR teams to:

- Track and manage personnel, vehicles, equipment, and medical packs.
- Create and manage callouts (incidents).
- Assign resources and teams to callouts.
- Visualize deployments on a map and dashboard.
- Simulate deployments and resource status changes.

---

## File & Directory Structure

```text
SAR-Desktop-1.2/
  ├── client/                  # React frontend
  │   ├── public/              # Static HTML template
  │   └── src/                 # Main React source code
  │       ├── api.js           # API utility functions
  │       ├── App.js           # Main React app
  │       ├── MapView.js       # Map visualization
  │       ├── components/      # UI components & sample data
  │       ├── hooks/           # Custom React hooks
  │       ├── models/          # Data model logic
  │       ├── index.js         # React entry point
  │       └── index.css        # Global styles
  ├── index.js                 # Root bootstrap (console log)
  ├── server.js                # Express backend entry-point
  ├── package.json             # Project dependencies/scripts
  └── README.md                # Project documentation
```

### Notable Files & Directories

- **client/src/components/**: All major UI components (cards, boards, modals, legends) and sample data modules.
- **client/src/components/sampleSARCALL.js**: Exports sample SARCALL response values (sarA, sarL, sarN) for dashboard display.
- **client/src/hooks/useSARDashboard.js**: Centralized state management and business logic for the dashboard. Now includes logic to fully reset all teams and resources when the last callout is deleted.
- **client/src/MapView.js**: Map visualization, now uses proj4 for accurate OSGB36 to WGS84 grid reference conversion.
- **client/src/models/deployedModel.js**: Functions for deployment logic and selectors.
- **server.js**: Express server, REST API, and in-memory data store.

### Components Directory: client/src/components/

This directory contains all major UI components and sample data modules for the SAR dashboard. Below is a description of each file and its function:

#### UI Components
- **BoardView.jsx**: Kanban-style board for managing teams and resources. Supports drag-and-drop, team creation, renaming, and resource assignment.
- **CalloutCard.js**: Card component displaying callout (incident) details, assigned resources, and assignment controls.
- **CalloutTeamBoard.jsx**: Board for managing teams and resources within a specific callout. Supports team/resource assignment, renaming, merging, and more.
- **DeployedDashboard.js**: Dashboard for visualizing deployed teams and resources, including charts and PDF export of deployment summaries.
- **DynamicTeamBoard.js**: Interactive board for managing a single team and its assigned resources, with support for renaming and resource removal.
- **ResourceCard.js**: Card component for displaying resource details (personnel, vehicles, equipment, medical packs) and assignment controls.
- **SkillsLegend.js**: Visual legend explaining the color coding for resource skills.
- **AddTeamModal.js**: Modal dialog for creating a new team, with auto-fill suggestions and validation.
- **NewCalloutModal.js**: Modal dialog for creating a new callout (incident), with validation for required fields.
- **NewResourceModal.js**: Modal dialog for creating a new resource (personnel, vehicle, equipment, or medical pack), with dynamic form fields and validation.
- **index.js**: Barrel file exporting all main components for easy import elsewhere in the app.

#### Sample Data Modules
- **sampleData.js**: Aggregates and re-exports all sample data arrays for personnel, vehicles, equipment, medical packs, and callouts. Used for initializing the backend's in-memory data.
- **samplePersonnel.js**: Array of sample personnel objects, each with name, skills, contact info, and status.
- **sampleVehicles.js**: Array of sample vehicle objects, each with type, capacity, equipment, and status.
- **sampleEquipment.js**: Array of sample equipment objects, each with name, type, and status.
- **sampleMedicalPacks.js**: Array of sample medical pack objects, each with contents, expiry, and certification level.
- **sampleCallouts.js**: Array of sample callout (incident) objects. (Empty by default.)
- **sampleSARCALL.js**: Exports static SARCALL response values (sarA, sarL, sarN) for use in the deployed dashboard.

---

## Backend (API) Overview

The backend is a Node.js Express server (see `server.js`) that exposes a RESTful API under `/api`. It uses in-memory data (from sample files) and supports the following endpoints:

### Resource Endpoints

- `GET /api/resources` — List all resources (filterable by type, status, team)
- `GET /api/resources/:id` — Get a specific resource
- `POST /api/resources` — Create a new resource
- `PUT /api/resources/:id` — Update a resource
- `DELETE /api/resources/:id` — Delete a resource

### Callout Endpoints

- `GET /api/callouts` — List all callouts
- `GET /api/callouts/:id` — Get a specific callout
- `POST /api/callouts` — Create a new callout
- `PUT /api/callouts/:id` — Update a callout
- `DELETE /api/callouts/:id` — Delete a callout

### Assignment & Team Endpoints

- `POST /api/callouts/:id/assign` — Assign resource to callout
- `POST /api/callouts/:id/unassign` — Unassign resource from callout
- `POST /api/teams` — Create a team
- `DELETE /api/teams/:id` — Delete a team
- `POST /api/teams/:teamId/assign` — Assign resource to team
- `POST /api/teams/:teamId/unassign` — Unassign resource from team
- `GET /api/available-vehicles` — List available vehicles
- `GET /api/deployable-teams` — List teams ready for deployment

### API Usage

All API calls are made via the `client/src/api.js` utility, which wraps `fetch` and returns JSON.

---

## Frontend Architecture

### Main App

- **App.js**: Handles routing, view switching (callouts, board, deployed, map), and renders the main dashboard UI.
- **useSARDashboard.js**: Central hook for state, data fetching, and all business logic (assignments, creation, deletion, drag-and-drop, etc).

### Components

- **ResourceCard**: Displays resource details and assignment controls.
- **CalloutCard**: Shows callout details and assignment UI.
- **DynamicTeamBoard**: Interactive board for managing teams.
- **CalloutTeamBoard**: Board for managing teams and resources within a callout.
- **BoardView**: Kanban-style board for teams and resources.
- **DeployedDashboard**: Shows deployed teams/resources.
- **SkillsLegend**: Visual legend for resource skills.
- **AddTeamModal, NewResourceModal, NewCalloutModal**: Modals for creating new entities.

### Data & Models

- **sampleData.js**: Aggregates all sample resource/callout arrays.
- **samplePersonnel.js, sampleVehicles.js, sampleEquipment.js, sampleMedicalPacks.js**: Mock data for each resource type.
- **deployedModel.js**: Functions for deployment logic (e.g., marking teams/resources as deployed).

---

## Data Models

### Resource (Personnel, Vehicle, Equipment, MedicalPack)

```js
{
  id: string,
  name: string,
  type: "Personnel" | "Vehicle" | "Equipment" | "MedicalPack",
  status: "Available" | "Assigned" | "Deployed" | "In Use",
  skills: string[],
  team: string | null,
  // ...type-specific fields (see sample files)
}
```

### Callout

```js
{
  id: string,
  title: string,
  location: string,
  status: "Active" | "Closed",
  assignedResources: string[],
  assignedTeams: string[],
  createdAt: string,
  // ...other fields
}
```

### Team

```js
{
  id: string,
  name: string,
  color: string,
  status: "Available" | "Deployed",
  // ...other fields
}
```

---

## Setup & Development

### Prerequisites

- Node.js (v14+ recommended)
- npm

### Install & Run

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install-client

# Start both backend and frontend (concurrently)
npm start
```

- Backend runs on `localhost:3001`
- Frontend runs on `localhost:3000` (proxy to backend)

### Development Scripts

- `npm run dev` — Start backend with nodemon and frontend in watch mode
- `npm run build` — Build React app for production

---

## Additional Notes

- **Data Persistence**: All data is in-memory (sample data). No database is used by default.

---

## Recent Updates

---
