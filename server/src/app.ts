import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import { connectDB } from "./config/db.js";
import supportAgentRoutes from "./routes/supportAgent.routes.js"
import dashboardAgentRoutes from "./routes/dashboardAgent.route.js"
import webhookRoutes from "./routes/webhooks.routes.js"

dotenv.config();
const app = express();

app.use(express.json());

app.use(
  cors({
  origin: [ process.env.CORS_ORIGIN || "*" ], 
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
  "Origin",
  "Content-Type",
  "Accept",
  "Authorization",
  "X-Request-With",
  ],
  })
  );

app.use('/api/agents/support',supportAgentRoutes );
app.use('/api/agents/dashboard',dashboardAgentRoutes );
app.use('/api/webhooks',webhookRoutes );


connectDB();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
