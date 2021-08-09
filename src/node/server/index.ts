import * as path from "path";
import connect from "connect";
import { watch as chokidarWatch } from "chokidar";
import { resolveConfig } from "../config";
import { createPluginContainer } from "./pluginContainer";
import { FSWatcher, WatchOptions } from "../types/chokidar";
import { createWebSocketServer } from "./ws";
import { transformMiddleware } from "./middlewares/transform";
import { ModuleGraph } from "./moduleGraph";
import { Connect } from "../types/connect";
export function normalizePath(id: string): string {
  return path.posix.normalize(id);
}
import { handleHMRUpdate } from "./hmr";
import { transformRequest } from "./transformRequest";
import { optimizeDeps } from "../optimizer";
import { ssrLoadModule } from "../ssr/ssrModuleLoader";
import { resolveSSRExternal } from "../ssr/ssrExternal";

export interface ServerOptions {
  host?: string | boolean;
  port?: number;
  /**
   * Enable TLS + HTTP/2.
   * Note: this downgrades to TLS only when the proxy option is also used.
   */
  https?: boolean | any;
  /**
   * Open browser window on startup
   */
  open?: boolean | string;
  /**
   * Force dep pre-optimization regardless of whether deps have changed.
   */
  force?: boolean;
  /**
   * Configure HMR-specific options (port, host, path & protocol)
   */
  hmr?: any; // HmrOptions | boolean;
  /**
   * chokidar watch options
   * https://github.com/paulmillr/chokidar#api
   */
  watch?: WatchOptions;
  /**
   * Configure custom proxy rules for the dev server. Expects an object
   * of `{ key: options }` pairs.
   * Uses [`http-proxy`](https://github.com/http-party/node-http-proxy).
   * Full options [here](https://github.com/http-party/node-http-proxy#options).
   *
   * Example `vite.config.js`:
   * ``` js
   * module.exports = {
   *   proxy: {
   *     // string shorthand
   *     '/foo': 'http://localhost:4567/foo',
   *     // with options
   *     '/api': {
   *       target: 'http://jsonplaceholder.typicode.com',
   *       changeOrigin: true,
   *       rewrite: path => path.replace(/^\/api/, '')
   *     }
   *   }
   * }
   * ```
   */

  proxy?: Record<string, string | any>;
  /**
   * Configure CORS for the dev server.
   * Uses https://github.com/expressjs/cors.
   * Set to `true` to allow all methods from any origin, or configure separately
   * using an object.
   */
  cors?: CorsOptions | boolean;
  /**
   * If enabled, vite will exit if specified port is already in use
   */
  strictPort?: boolean;
  /**
   * Create Vite dev server to be used as a middleware in an existing server
   */
  middlewareMode?: boolean | "html" | "ssr";
  /**
   * Prepend this folder to http requests, for use when proxying vite as a subfolder
   * Should start and end with the `/` character
   */
  base?: string;
  /**
   * Options for files served via '/\@fs/'.
   */
  fs?: FileSystemServeOptions;
}

export interface ResolvedServerOptions extends ServerOptions {
  fs: Required<FileSystemServeOptions>;
}

export interface FileSystemServeOptions {
  /**
   * Strictly restrict file accessing outside of allowing paths.
   *
   * Set to `false` to disable the warning
   * Default to false at this moment, will enabled by default in the future versions.
   *
   * @expiremental
   * @default undefined
   */
  strict?: boolean | undefined;

  /**
   * Restrict accessing files outside the allowed directories.
   *
   * Accepts absolute path or a path relative to project root.
   * Will try to search up for workspace root by default.
   *
   * @expiremental
   */
  allow?: string[];
}

/**
 * https://github.com/expressjs/cors#configuration-options
 */
export interface CorsOptions {
  origin?:
    | CorsOrigin
    | ((origin: string, cb: (err: Error, origins: CorsOrigin) => void) => void);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

export type CorsOrigin = boolean | string | RegExp | (string | RegExp)[];

export type ServerHook = (
  server: ViteDevServer
) => (() => void) | void | Promise<(() => void) | void>;

export interface ViteDevServer {
  /**
   * The resolved vite config object
   */
  config: any; // ResolvedConfig;
  /**
   * A connect app instance.
   * - Can be used to attach custom middlewares to the dev server.
   * - Can also be used as the handler function of a custom http server
   *   or as a middleware in any connect-style Node.js frameworks
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server;
  /**
   * @deprecated use `server.middlewares` instead
   */
  app: Connect.Server;
  /**
   * native Node http server instance
   * will be null in middleware mode
   */
  httpServer: any | null;
  /**
   * chokidar watcher instance
   * https://github.com/paulmillr/chokidar#api
   */
  watcher: FSWatcher;
  /**
   * web socket server with `send(payload)` method
   */
  ws: any; // WebSocketServer;
  /**
   * Rollup plugin container that can run plugin hooks on a given file
   */
  pluginContainer: any;
  /**
   * Module graph that tracks the import relationships, url to file mapping
   * and hmr state.
   */
  moduleGraph: any; // ModuleGraph;
  /**
   * Programmatically resolve, load and transform a URL and get the result
   * without going through the http request pipeline.
   */
  transformRequest(
    url: string,
    options?: any // TransformOptions
  ): Promise<any>; //TransformResult | null>;
  /**
   * Apply vite built-in HTML transforms and any plugin HTML transforms.
   */
  // transformIndexHtml(
  //   url: string,
  //   html: string,
  //   originalUrl?: string
  // ): Promise<string>;
  /**
   * Load a given URL as an instantiated module for SSR.
   */
  ssrLoadModule(url: string): Promise<Record<string, any>>;
  /**
   * Fix ssr error stacktrace
   */
  // ssrFixStacktrace(e: Error): void;
  /**
   * Start the server.
   */
  // listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>;
  /**
   * Stop the server.
   */
  close(): Promise<void>;
  /**
   * @internal
   */
  _optimizeDepsMetadata: any; // DepOptimizationMetadata | null;
  /**
   * Deps that are externalized
   * @internal
   */
  _ssrExternals: string[] | null;
  /**
   * @internal
   */
  _globImporters: Record<
    string,
    {
      module: any; // ModuleNode;
      importGlobs: {
        base: string;
        pattern: string;
      }[];
    }
  >;
  /**
   * @internal
   */
  _isRunningOptimizer: boolean;
}

export async function createServer(
  inlineConfig: any = {}
): Promise<ViteDevServer> {
  const config = await resolveConfig(inlineConfig, "serve", "development");
  // console.log("...config", config);
  const root = config.root;
  const serverConfig = config.server;
  const middlewares = connect() as Connect.Server;
  const httpServer = null;
  const ws = createWebSocketServer(httpServer, config as any);

  const { ignored = [], ...watchOptions } = serverConfig.watch || ({} as any);
  const watcher = chokidarWatch(path.resolve(root), {
    ignored: ["**/node_modules/**", "**/.git/**", ...ignored],
    ignoreInitial: true,
    ignorePermissionErrors: true,
    disableGlobbing: true,
    ...watchOptions,
  }) as FSWatcher;

  const plugins = config.plugins;
  const container = await createPluginContainer(config as any, watcher);
  const moduleGraph = new ModuleGraph(container);
  const closeHttpServer = createServerCloseFn(httpServer);

  // eslint-disable-next-line prefer-const
  let exitProcess: () => void;

  const server: ViteDevServer = {
    config: config,
    middlewares,
    get app() {
      console.warn(
        `ViteDevServer.app is deprecated. Use ViteDevServer.middlewares instead.`
      );
      return middlewares;
    },
    httpServer,
    watcher,
    pluginContainer: container,
    ws,
    moduleGraph,
    transformRequest(url, options) {
      return transformRequest(url, server, options);
    },
    // transformIndexHtml: null as any,
    ssrLoadModule(url) {
      if (!server._ssrExternals) {
        server._ssrExternals = resolveSSRExternal(
          config as any,
          server._optimizeDepsMetadata
            ? Object.keys(server._optimizeDepsMetadata.optimized)
            : []
        );
      }
      return ssrLoadModule(url, server);
    },
    async close() {
      console.log("...server closing");
      process.off("SIGTERM", exitProcess);
      await Promise.all([
        watcher.close(),
        ws.close(),
        // container.close?.(),
        closeHttpServer(),
      ]);
    },
    _optimizeDepsMetadata: null,
    _ssrExternals: null,
    _globImporters: {},
    _isRunningOptimizer: false,
  };

  exitProcess = async () => {
    try {
      await server.close();
    } finally {
      process.exit(0);
    }
  };

  process.once("SIGTERM", exitProcess);

  watcher.on("change", async file => {
    file = normalizePath(file);
    // invalidate module graph cache on file change
    moduleGraph.onFileChange(file);
    try {
      await handleHMRUpdate(file, server);
    } catch (err) {
      console.log("...catch err", err);
      // ws.send({
      //   type: "error",
      //   err: new Error("err"), // prepareError(err),
      // });
    }
  });

  watcher.on("add", file => {
    console.log("...watch add");
    // handleFileAddUnlink(normalizePath(file), server);
  });

  watcher.on("unlink", file => {
    console.log("...watch unlink");
    // handleFileAddUnlink(normalizePath(file), server, true);
  });

  // apply server configuration hooks from plugins
  const postHooks: ((() => void) | void)[] = [];
  for (const plugin of plugins) {
    if ((plugin as any).configureServer) {
      postHooks.push(await (plugin as any).configureServer(server));
    }
  }

  // Internal middlewares ------------------------------------------------------

  // hmr reconnect ping
  // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
  middlewares.use("/__vite_ping", function viteHMRPingMiddleware(_, res) {
    res.end("pong");
  });

  // main transform middleware
  middlewares.use(transformMiddleware(server));

  // error handler
  // middlewares.use(errorMiddleware(server, !!middlewareMode));

  // 优化依赖，提前将依赖编译到 node_modules 的 .vite 中
  const runOptimize = async () => {
    server._isRunningOptimizer = true;
    try {
      server._optimizeDepsMetadata = await optimizeDeps(config as any);
    } finally {
      server._isRunningOptimizer = false;
    }
  };

  await container.buildStart({});
  await runOptimize();

  return server;
}

function createServerCloseFn(server: any) {
  if (!server) {
    return () => {};
  }

  let hasListened = false;
  const openSockets = new Set<any>();

  server.on("connection", socket => {
    openSockets.add(socket);
    socket.on("close", () => {
      openSockets.delete(socket);
    });
  });

  server.once("listening", () => {
    hasListened = true;
  });

  return () =>
    new Promise<void>((resolve, reject) => {
      openSockets.forEach(s => s.destroy());
      if (hasListened) {
        server.close(err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
}
