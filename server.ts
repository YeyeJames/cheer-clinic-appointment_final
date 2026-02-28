import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import path from "path";
import mongoose from "mongoose";

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB Schema
const clinicStateSchema = new mongoose.Schema({
  appointments: { type: Array, default: [] },
  logs: { type: Array, default: [] },
  therapists: { type: Array, default: [] },
  treatments: { type: Array, default: [] },
  frontdesks: { type: Array, default: [] }
}, { timestamps: true });

const ClinicState = mongoose.model("ClinicState", clinicStateSchema);

// Initial data structure
const defaultData = {
  appointments: [],
  logs: [],
  frontdesks: [],
  therapists: [
    { id: 't1', name: '王大明', category: '心理' },
    { id: 't2', name: '李小美', category: '職能' },
    { id: 't3', name: '張老師', category: 'rTMS' }
  ],
  treatments: [
    { id: 'tr1', name: '個別心理諮商', category: '心理', patientPrice: 2000, therapistFee: 1000 },
    { id: 'tr2', name: '兒童職能治療', category: '職能', patientPrice: 1200, therapistFee: 600 },
    { id: 'tr3', name: 'rTMS 療程', category: 'rTMS', patientPrice: 5000, therapistFee: 1500 },
    { id: 'tr4', name: '團體社交訓練', category: '心理', patientPrice: 800, therapistFee: 400, isGroupTherapy: true }
  ]
};

async function startServer() {
  // Connect to MongoDB if URI is provided
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB Atlas");
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  } else {
    console.warn("MONGODB_URI not provided. Data will not persist permanently.");
  }

  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // Load or Initialize Data from DB
  async function getClinicData() {
    if (!MONGODB_URI) return defaultData;
    try {
      let state = await ClinicState.findOne();
      if (!state) {
        state = await ClinicState.create(defaultData);
      }
      return state;
    } catch (err) {
      console.error("Error fetching data from DB:", err);
      return defaultData;
    }
  }

  // Save Data to DB
  async function saveClinicData(data: any) {
    if (!MONGODB_URI) return;
    try {
      await ClinicState.findOneAndUpdate({}, data, { upsert: true });
    } catch (err) {
      console.error("Error saving data to DB:", err);
    }
  }

  // WebSocket connection handling
  wss.on("connection", async (ws) => {
    console.log("Client connected");
    
    // Send initial data to the new client
    const clinicData = await getClinicData();
    ws.send(JSON.stringify({ type: "INIT", data: clinicData }));

    ws.on("message", async (message) => {
      try {
        const payload = JSON.parse(message.toString());
        
        if (payload.type === "UPDATE") {
          console.log("Received update from client");
          const newData = payload.data;
          
          // Broadcast the update to all other clients immediately for responsiveness
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "SYNC", data: newData }));
            }
          });

          // Persist to DB in background
          await saveClinicData(newData);
        }
      } catch (e) {
        console.error("Error processing message:", e);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
