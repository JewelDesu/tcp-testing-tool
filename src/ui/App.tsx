import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import './App.css';
import Header from "./Header";
import TestServer from "./TestServer";

let socket: Socket;

export default function TcpTesterApp() {
  const [server, setServer] = useState("");
  const [duration, setDuration] = useState("30");
  const [logs, setLogs] = useState<string[]>([]);
  const [totalPackets, setTotalPackets] = useState(0);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const staticData = getUserData();
  const [testServer, setTestServer] = useState(false);
  const [testing, setTesting] = useState(false);

  const toggleTestServer = () => {
    const newValue = !testServer;
    setTestServer(newValue);

    if (newValue) {
      window.electron.startTcpTest('startTcpTest');
      window.electron.resizeWindow('bigger')
    } else {
      window.electron.startTcpTest('stopTcpTest');
      window.electron.resizeWindow('smaller')
    }
  };


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

    socket.on("testEnd", () => {
      addLog("Test finished");
      setTesting(false);
    });

    socket.on("disconnect", () => {
      addLog("Disconnected from server");
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
      addLog("Please provide both server and duration.");
      return;
    }
    setTesting(true);
    socket.emit("startTest", {
      target: server,
      duration: parseInt(duration, 10),
      packetDelay: 1000,
      sillyMessage: message,
      attackMethod: "tcp_flood",
    });

    

    addLog(`Started test on ${server} for ${duration}s`);
  };

  const handleTestStop = () => {
    socket.emit("stopTest");
    setTesting(false);
  }

  return (
    <div className="App">
      <Header host={staticData?.hostName ?? ''} openTest={testServer} onTestToggle={toggleTestServer} onTestClose={() => setTestServer(false)}/>
        <div className='window'>
      <div>
        <div className="inputs">
          <input
            type="text"
            placeholder="Server (e.g. 192.168.0.1:80)"
            className="input"
            value={server}
            onChange={(e) => setServer(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your silly message"
            className="input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          /> 

          <div>
            <label>
              Duration (s)
            </label>
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
              onClick={() => (testing ? handleTestStop() : handleStartTest())}
              disabled={!connected}
              className="start-button"
            >
              {connected ? (testing ? "Stop" : "Start") : "Connecting..."}
            </button>
          </div>

        </div>

        {/* Logs Section */}
        <div className="log-box">
          <div className="log-text">
            {logs.length > 0 ? (
              logs.slice(-40).map((log, index) => (
                <div key={index} className="py-1">
                  {`$ ${log}`}
                </div>
              ))
            ) : (
              <div className="italic text-gray-500">{">"} Connecting to main server</div>
            )}
          </div>
        </div>

        {/* Packet Count */}
        <div className="packets">
          Total Packets Sent: <strong>{totalPackets}</strong>
        </div>
      </div>
      <div>
          <TestServer openTestServer={testServer} />
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