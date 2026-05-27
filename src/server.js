import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { users } from "./fakeData/fakeUsers.js";
import { router as apiRoutes } from "./routes/index.js";
import { connectDB } from "./config/mongodb.js";
import { connectSupabase } from "./config/supabase.js";
import { limiter } from "./middlewares/rateLimit.js";

const app = express(); 

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5291",
  "http://127.0.0.1:5291",
  "https://week-11-jsd12-fullstack-frontend.vercel.app",
  "https://jsd12-fullstack-frontend.vercel.app",
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Express + Tailwind</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-gray-50 text-gray-800">
      <main class="max-w-2xl mx-auto p-8">
        <div class="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-8">
          <h1 class="text-3xl font-bold tracking-tight text-blue-600">
            Hello Client, I am your Server!
          </h1>
          <p class="mt-3 text-gray-600">
            This page is styled with <span class="font-semibold">Tailwind CSS</span> via CDN.
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <a href="/api/v2/users" class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              GET /users
            </a>
            <span class="text-xs text-gray-500">Try POST/PUT/DELETE with your API client.</span>
          </div>
        </div>
        <footer class="mt-10 text-center text-xs text-gray-400">
          Express server running with Tailwind via CDN
        </footer>
      </main>
    </body>
  </html>`);
});

//centralized error for 404 not found 

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error!",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3002;

await connectDB();
await connectSupabase();

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT} 🟢`);
});
