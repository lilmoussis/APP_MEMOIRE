# Diafara Moussa Parking Management System - AI Agent Instructions

## Project Overview

This is an IoT-enabled parking management system connecting Arduino hardware with a web/mobile platform for automated vehicle entry/exit tracking, billing, and occupancy monitoring.

**Key Architecture Components:**
- **Hardware Layer**: Arduino Uno + HC-SR04 ultrasonic sensors + ESP8266 WiFi module + servomotor for barrier control
- **Backend**: Node.js server with REST API and WebSocket support
- **Database**: MongoDB or Firebase for centralized data storage
- **Frontend**: Web interface (React suggested based on repo path) + potential mobile app
- **Communication**: Arduino → WiFi (ESP8266) → Node.js server → Database ↔ Web/Mobile interfaces

## Core Domain Model

Refer to `README.md` for complete functional requirements. Key entities:

- **Parking**: Total capacity, available spaces, tariff configuration
- **Vehicle**: Type (moto/voiture/camion), plate number, associated RFID card
- **EntryRecord**: Entry/exit timestamps, duration, calculated billing
- **User**: Super Admin or Gérant (manager) with role-based access
- **Card**: RFID/Badge ID linked to vehicles

## User Roles & Capabilities

1. **Super Administrateur**: Full system control - configure parking capacity, set pricing by vehicle type, manage gérant accounts, view all statistics, generate invoices, manage RFID cards
2. **Gérant**: Day-to-day operations - manual/automatic entry/exit registration, billing generation, view daily statistics and available spaces
3. **Arduino**: Automated vehicle detection via ultrasonic sensors, barrier control, WiFi data transmission to server

## Development Workflow

### Initial Setup (Not Yet Implemented)
When setting up this project for the first time:
1. Create backend structure: `server/`, `models/`, `routes/`, `controllers/`, `config/`
2. Create frontend structure: `client/src/components/`, `client/src/pages/`, `client/src/services/`
3. Initialize Arduino code in `arduino/` directory
4. Set up environment variables for database connection, API keys, Arduino communication

### Expected Build Commands
- Backend: `npm run dev` (nodemon for development) / `npm start` (production)
- Frontend: `npm run dev` (Vite/Create React App) / `npm run build` → `npm run preview`
- Testing: `npm test` (when test suite is added)

### Database Schema Considerations
- **Parkings collection**: `{ capacity: Number, availableSpaces: Number, tariffs: Map<VehicleType, Number> }`
- **Entries collection**: `{ vehicleId, cardId, entryTime, exitTime, duration, amount, status }`
- **Users collection**: `{ username, password (hashed), role, email, phone }`
- **Cards collection**: `{ cardId, vehicleId, isActive }`

## Critical Integration Points

### Arduino ↔ Server Communication
- ESP8266 sends HTTP POST requests to server endpoint (e.g., `/api/parking/entry` or `/api/parking/exit`)
- Server responds with commands to open/close barrier
- Payload format: `{ cardId: String, timestamp: Date, sensorId: String }`

### Real-Time Updates
- Use WebSocket (Socket.io) for live parking occupancy updates to web dashboard
- Events: `parking-update`, `entry-detected`, `exit-detected`, `capacity-alert`

### Automatic Billing Logic
- Calculate duration: `exitTime - entryTime` (in hours, rounded up)
- Retrieve tariff based on vehicle type from parking configuration
- Generate invoice: `amount = duration × tariff[vehicleType]`
- Store in database and provide PDF/Excel export capability

## Project-Specific Conventions

### Naming Patterns (To Be Established)
- **API Routes**: RESTful - `/api/parking`, `/api/entries`, `/api/users`, `/api/cards`, `/api/billing`
- **Components**: PascalCase for React components (`ParkingDashboard.jsx`, `EntryForm.jsx`)
- **Database Models**: Singular PascalCase (`Parking.js`, `Entry.js`, `User.js`)
- **Arduino Functions**: camelCase (`detectVehicle()`, `openBarrier()`, `sendDataToServer()`)

### Authentication Strategy
- Implement JWT-based authentication for API security
- Separate login endpoints for Super Admin and Gérant
- Protect routes based on role using middleware

### Error Handling
- Arduino: Retry logic for WiFi connection failures, sensor reading validation
- Server: Standardized error responses with status codes, logging for debugging
- Frontend: User-friendly error messages for failed operations

## Statistics & Reporting Requirements

Implement dashboards showing:
- **Occupancy Rate**: Real-time percentage calculation `(capacity - availableSpaces) / capacity × 100`
- **Revenue Tracking**: Daily/monthly/yearly totals from billing records
- **Traffic Patterns**: Entry/exit frequency graphs by time period
- **Export Functionality**: Generate PDF and Excel reports using libraries like `jsPDF`, `xlsx`

## Key Files to Create

- `/server/index.js` - Express server setup, middleware, routes
- `/server/models/` - Mongoose/Firebase schemas
- `/server/controllers/parkingController.js` - Core business logic
- `/server/middleware/auth.js` - JWT verification
- `/client/src/App.jsx` - Main React application
- `/client/src/components/Dashboard.jsx` - Real-time statistics display
- `/client/src/pages/AdminPanel.jsx` - Super admin configuration interface
- `/client/src/services/api.js` - Axios/fetch wrapper for API calls
- `/arduino/parking_system.ino` - Main Arduino sketch
- `/.env.example` - Template for environment variables
- `/package.json` - Dependencies: express, mongoose, socket.io, bcrypt, jsonwebtoken, cors

## Hardware-Specific Considerations

- **Ultrasonic Sensor HC-SR04**: Configure trigger/echo pins, distance threshold for vehicle detection
- **Servomotor**: Calibrate open/close angles (typically 0° closed, 90° open)
- **ESP8266 WiFi**: Store WiFi credentials securely, implement reconnection logic
- **Communication Protocol**: Use JSON over HTTP for simplicity, consider MQTT for production scalability

## Testing Approach (When Implemented)

- **Backend**: Unit tests for billing calculations, integration tests for API endpoints
- **Frontend**: Component tests with React Testing Library, E2E tests with Playwright/Cypress
- **Arduino**: Simulate sensor inputs, verify HTTP request formatting
- **System Integration**: Test full flow from sensor detection → database update → UI refresh

## French Language Context

This project documentation is in French. Maintain French for:
- User-facing text in UI (labels, buttons, messages)
- Database field names can be English for developer convenience
- Comments in code should match team preference (suggest English for broader accessibility)
- API endpoints and function names: English (standard practice)

---

**Current Project State**: Initial planning phase with functional requirements documented in `README.md`. No implementation code exists yet. When implementing, follow the architecture outlined above and reference README.md sections 1-4 for detailed functional specifications.

## Règles de style et réponses de l'agent

- **Interdiction d'utiliser des emojis (icônes)** : Il est strictement interdit d'insérer des emojis ou icônes (p. ex. ⚙️, 🎯) dans le code source, les fichiers de documentation, les messages de commit ou dans les réponses produites par un agent IA travaillant sur ce dépôt. Utilisez toujours du texte clair et descriptif.
- **Interdiction de créer des fichiers Markdown/TXT après une réponse** : Après avoir répondu à une demande (un message de l'utilisateur), l'agent ne doit pas créer de nouveaux fichiers de documentation au format `.md` ou `.txt` comme artefacts immédiats de la réponse. Toute documentation nécessaire doit être incluse dans les fichiers sources pertinents, dans les commentaires de code ou proposée comme patchs précis à appliquer au dépôt (via commits/patches) seulement si l'utilisateur l'approuve.

Ces règles s'appliquent autant au contenu commité dans le dépôt qu'aux réponses textuelles fournies par un agent. Respectez-les strictement pour rester conforme aux conventions de ce projet.
