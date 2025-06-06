import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

const TestServer = ({openTestServer, onTestServerClose}) => {
const [logs, setLogs] = useState<string[]>([]);


useEffect(() => {
    if (openTestServer) {
        socket = io("http://localhost:9001"); // Your backend server

        socket.on("connect", () => {
            addLog("Connected to test server");
        });

        socket.on("stats", (data) => {
            if (data.log) addLog(data.log);
            });

        socket.on("data", (data) => {
        if (data.log) addLog(data.log);
        });


        socket.on("disconnect", () => {
            addLog("🔌 Disconnected from server");
        });

        return () => {
            socket.disconnect();
        };
    }
}, [openTestServer]);

const addLog = (message: string) => {
setLogs((prev) => [...prev, message]);
};
    if(!openTestServer) return null
    else{
        return(
            <div>
                <div className="testserver">
                    TEST SERVER:
                    127.0.0.1:9000
                </div>
                
                <div className="log-box2">
                    <div className="log-text">
                        {logs.length > 0 ? (
                        logs.slice(-40).map((log, index) => (
                            <div key={index} className="py-1">
                            {`$ ${log}`}
                            </div>
                        ))
                    ) : (
                    <div className="italic text-gray-500">{">"} Connecting to test server</div>
                    )}
                    </div>
                </div>
            </div>
        )
    }
}

export default TestServer;