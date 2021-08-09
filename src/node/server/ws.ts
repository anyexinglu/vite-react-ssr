import chalk from "chalk";
import { Server } from "http";
import WebSocket from "ws";
import { ErrorPayload, HMRPayload } from "../types/hmrPayload";
import { ResolvedConfig } from "..";

export const HMR_HEADER = "vite-hmr";
export interface WebSocketServer {
  send(payload: HMRPayload): void;
  close(): Promise<void>;
}

export function createWebSocketServer(
  server: Server | null,
  config: ResolvedConfig
): WebSocketServer {
  let wss: WebSocket.Server;
  let httpsServer: Server | undefined = undefined;

  const hmr = typeof config.server.hmr === "object" && config.server.hmr;
  const websocketServerOptions: WebSocket.ServerOptions = {};
  const port = (hmr && hmr.port) || 24678;
  // we don't need to serve over https, just let ws handle its own server
  websocketServerOptions.port = port;
  wss = new WebSocket.Server(websocketServerOptions);

  wss.on("connection", socket => {
    socket.send(JSON.stringify({ type: "connected" }));
    if (bufferedError) {
      socket.send(JSON.stringify(bufferedError));
      bufferedError = null;
    }
  });

  wss.on("error", (e: Error & { code: string }) => {
    if (e.code !== "EADDRINUSE") {
      config.logger.error(
        chalk.red(`WebSocket server error:\n${e.stack || e.message}`)
      );
    }
  });

  // On page reloads, if a file fails to compile and returns 500, the server
  // sends the error payload before the client connection is established.
  // If we have no open clients, buffer the error and send it to the next
  // connected client.
  let bufferedError: ErrorPayload | null = null;

  return {
    send(payload: HMRPayload) {
      if (payload.type === "error" && !wss.clients.size) {
        bufferedError = payload;
        return;
      }

      const stringified = JSON.stringify(payload);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(stringified);
        }
      });
    },

    close() {
      return new Promise((resolve, reject) => {
        wss.close(err => {
          if (err) {
            reject(err);
          } else {
            if (httpsServer) {
              httpsServer.close(err => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            } else {
              resolve();
            }
          }
        });
      });
    },
  };
}
