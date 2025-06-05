import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import './App.css';
import Header from "./Header";

let socket: Socket;

export default function TcpTesterApp() {
  const [server, setServer] = useState("");
  const [duration, setDuration] = useState("30");
  const [logs, setLogs] = useState<string[]>([]);
  const [totalPackets, setTotalPackets] = useState(0);
  const [connected, setConnected] = useState(false);
  const staticData = getUserData();
  const [testServer, setTestServer] = useState(false);

  useEffect(() => {
    socket = io("http://localhost:3000"); // Your backend server

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("stats", (data) => {
      if (data.log) addLog(data.log);
      if (typeof data.totalPackets === "number") {
        setTotalPackets(data.totalPackets);
      }
    });

    socket.on("attackEnd", () => {
      addLog("🚫 Test finished");
    });

    socket.on("disconnect", () => {
      addLog("🔌 Disconnected from server");
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const handleStartTest = () => {
    if (!server || !duration) {
      addLog("⚠️ Please provide both server and duration.");
      return;
    }

    socket.emit("startAttack", {
      target: server,
      duration: parseInt(duration, 10),
      packetDelay: 1000,
      attackMethod: "tcp_flood",
    });

    addLog(`🚀 Started test on ${server} for ${duration}s`);
  };

  return (
    <div className="App">
      <Header host={staticData?.hostName ?? ''}/>
      <div className="max-w-xl mx-auto p-6 space-y-6">
        {/* Input Fields */}
        <div className="inputs">
          <input
            type="text"
            placeholder="Server (e.g. 192.168.0.1:80)"
            className="input"
            value={server}
            onChange={(e) => setServer(e.target.value)}
          />
          <input
            type="number"
            placeholder="Duration (seconds)"
            className="duration-input"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            max="120"
          />
          <button
            onClick={handleStartTest}
            disabled={!connected}
            className="start-button"
          >
            {connected ? "Start Test" : "Connecting..."}
          </button>
        </div>

        {/* Logs Section */}
        <div className="log-box">
          <div className="log-text">
            {logs.length > 0 ? (
              logs.slice(-10).map((log, index) => (
                <div key={index} className="py-1">
                  {`> ${log}`}
                </div>
              ))
            ) : (
              <div className="italic text-gray-500">{">"} Waiting for Miku's power...</div>
            )}
          </div>
        </div>

        {/* Packet Count */}
        <div className="packets">
          Total Packets Sent: <strong>{totalPackets}</strong>
        </div>
      </div>
    </div>
  );
}

function getUserData() {
  const [userData, getUserData] = useState<StaticData | null>(null);

  useEffect(() => {
    (async () => {
      getUserData(await window.electron.getStaticData())
    })();
  },[]);

  return userData
}