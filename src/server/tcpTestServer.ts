import express from "express";
import { createServer } from "http";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { Worker } from "worker_threads";
import { loadProxies } from "./loading.js";
import { filterProxies } from "./util.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __prod = process.env.NODE_ENV === "production";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: __prod ? "" : "http://localhost:5123",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

const proxies = loadProxies();

console.log("Proxies loaded:", proxies.length);

app.use(express.static(join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.emit("stats", {
    pps: 0,
    bots: proxies.length,
    totalPackets: 0,
    log: "successfully connected to backend",
  });

  socket.on("startTest", (params) => {
    const { target, duration, attackMethod, sillyMessage } = params;
    const filteredProxies = filterProxies(proxies, attackMethod);
    const attackWorkerFile = "./tcpWorkers.js";

    if (!attackWorkerFile) {
      socket.emit("stats", {
        log: `Unsupported attack type: ${attackMethod}`,
      });
      return;
    }

    socket.emit("stats", {
      log: `Using ${filteredProxies.length} filtered proxies to perform attack.`,
      bots: filteredProxies.length,
    });

    const worker = new Worker(join(__dirname, attackWorkerFile), {
      workerData: {
        target,
        proxies: filteredProxies,
        duration,
        sillyMessage,
      },
    });

    worker.on("message", (message) => socket.emit("stats", message));

    worker.on("error", (error) => {
      console.error(`Worker error: ${error.message}`);
      socket.emit("stats", { log: `Worker error: ${error.message}` });
    });

    worker.on("exit", (code) => {
      console.log(`Worker exited with code ${code}`);
      socket.emit("testEnd");
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (socket as any)["worker"] = worker;
  });

  socket.on("stopTest", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worker = (socket as any)["worker"];
    if (worker) {
      worker.terminate();
      socket.emit("testEnd");
    }
  });

  socket.on("disconnect", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worker = (socket as any)["worker"];
    if (worker) {
      worker.terminate();
    }
    console.log("Client disconnected");
  });
});

const PORT = parseInt(process.env.PORT || "3000");
httpServer.listen(PORT, () => {
  if (__prod) {
    console.log(
      `(Production Mode) Client and server is running under http://localhost:${PORT}`
    );
  } else {
    console.log(`Server is running under development port ${PORT}`);
  }
});