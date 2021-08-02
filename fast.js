async function createServer(inlineConfig = {}) {
  // const config = await resolveConfig(inlineConfig, 'serve', 'development');
  // const root = config.root;
  // const serverConfig = config.server;
  // const httpsOptions = await resolveHttpsConfig(config);
  // let { middlewareMode } = serverConfig;
  // if (middlewareMode === true) {
  //     middlewareMode = 'ssr';
  // }
  // const middlewares = connect();
  // const httpServer = middlewareMode
  //     ? null
  //     : await resolveHttpServer(serverConfig, middlewares, httpsOptions);
  // const ws = createWebSocketServer(httpServer, config, httpsOptions);
  // const { ignored = [], ...watchOptions } = serverConfig.watch || {};
  // const watcher = chokidar.watch(path__default.resolve(root), {
  //     ignored: ['**/node_modules/**', '**/.git/**', ...ignored],
  //     ignoreInitial: true,
  //     ignorePermissionErrors: true,
  //     disableGlobbing: true,
  //     ...watchOptions
  // });
  // const plugins = config.plugins;
  // const container = await createPluginContainer(config, watcher);
  // const moduleGraph = new ModuleGraph(container);
  // const closeHttpServer = createServerCloseFn(httpServer);
  // // eslint-disable-next-line prefer-const
  // let exitProcess;
  // const server = {
  //     config: config,
  //     middlewares,
  //     get app() {
  //         config.logger.warn(`ViteDevServer.app is deprecated. Use ViteDevServer.middlewares instead.`);
  //         return middlewares;
  //     },
  //     httpServer,
  //     watcher,
  //     pluginContainer: container,
  //     ws,
  //     moduleGraph,
  //     transformWithEsbuild,
  //     transformRequest(url, options) {
  //         return transformRequest(url, server, options);
  //     },
  //     transformIndexHtml: null,
  //     ssrLoadModule(url) {
  //         if (!server._ssrExternals) {
  //             server._ssrExternals = resolveSSRExternal(config, server._optimizeDepsMetadata
  //                 ? Object.keys(server._optimizeDepsMetadata.optimized)
  //                 : []);
  //         }
  //         return ssrLoadModule(url, server);
  //     },
  //     ssrFixStacktrace(e) {
  //         if (e.stack) {
  //             const stacktrace = ssrRewriteStacktrace(e.stack, moduleGraph);
  //             rebindErrorStacktrace(e, stacktrace);
  //         }
  //     },
  //     listen(port, isRestart) {
  //         return startServer(server, port, isRestart);
  //     },
  //     async close() {
  //         process.off('SIGTERM', exitProcess);
  //         if (!middlewareMode && process.env.CI !== 'true') {
  //             process.stdin.off('end', exitProcess);
  //         }
  //         await Promise.all([
  //             watcher.close(),
  //             ws.close(),
  //             container.close(),
  //             closeHttpServer()
  //         ]);
  //     },
  //     _optimizeDepsMetadata: null,
  //     _ssrExternals: null,
  //     _globImporters: {},
  //     _isRunningOptimizer: false,
  //     _registerMissingImport: null,
  //     _pendingReload: null
  // };
  // server.transformIndexHtml = createDevHtmlTransformFn(server);
  // exitProcess = async () => {
  //     try {
  //         await server.close();
  //     }
  //     finally {
  //         process.exit(0);
  //     }
  // };
  // process.once('SIGTERM', exitProcess);
  // if (!middlewareMode && process.env.CI !== 'true') {
  //     process.stdin.on('end', exitProcess);
  // }
  // watcher.on('change', async (file) => {
  //     file = normalizePath$4(file);
  //     // invalidate module graph cache on file change
  //     moduleGraph.onFileChange(file);
  //     if (serverConfig.hmr !== false) {
  //         try {
  //             await handleHMRUpdate(file, server);
  //         }
  //         catch (err) {
  //             ws.send({
  //                 type: 'error',
  //                 err: prepareError(err)
  //             });
  //         }
  //     }
  // });
  // watcher.on('add', (file) => {
  //     handleFileAddUnlink(normalizePath$4(file), server);
  // });
  // watcher.on('unlink', (file) => {
  //     handleFileAddUnlink(normalizePath$4(file), server, true);
  // });
  // // apply server configuration hooks from plugins
  // const postHooks = [];
  // for (const plugin of plugins) {
  //     if (plugin.configureServer) {
  //         postHooks.push(await plugin.configureServer(server));
  //     }
  // }
  // // Internal middlewares ------------------------------------------------------
  // // request timer
  // if (process.env.DEBUG) {
  //     middlewares.use(timeMiddleware(root));
  // }
  // // cors (enabled by default)
  // const { cors } = serverConfig;
  // if (cors !== false) {
  //     middlewares.use(corsMiddleware(typeof cors === 'boolean' ? {} : cors));
  // }
  // // proxy
  // const { proxy } = serverConfig;
  // if (proxy) {
  //     middlewares.use(proxyMiddleware(httpServer, config));
  // }
  // // base
  // if (config.base !== '/') {
  //     middlewares.use(baseMiddleware(server));
  // }
  // // open in editor support
  // middlewares.use('/__open-in-editor', launchEditorMiddleware());
  // // hmr reconnect ping
  // // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
  // middlewares.use('/__vite_ping', function viteHMRPingMiddleware(_, res) {
  //     res.end('pong');
  // });
  // //decode request url
  // middlewares.use(decodeURIMiddleware());
  // // serve static files under /public
  // // this applies before the transform middleware so that these files are served
  // // as-is without transforms.
  // if (config.publicDir) {
  //     middlewares.use(servePublicMiddleware(config.publicDir));
  // }
  // // main transform middleware
  // middlewares.use(transformMiddleware(server));
  // // serve static files
  // middlewares.use(serveRawFsMiddleware(server));
  // middlewares.use(serveStaticMiddleware(root, config));
  // // spa fallback
  // if (!middlewareMode || middlewareMode === 'html') {
  //     middlewares.use(history({
  //         logger: createDebugger('vite:spa-fallback'),
  //         // support /dir/ without explicit index.html
  //         rewrites: [
  //             {
  //                 from: /\/$/,
  //                 to({ parsedUrl }) {
  //                     const rewritten = parsedUrl.pathname + 'index.html';
  //                     if (fs__default.existsSync(path__default.join(root, rewritten))) {
  //                         return rewritten;
  //                     }
  //                     else {
  //                         return `/index.html`;
  //                     }
  //                 }
  //             }
  //         ]
  //     }));
  // }
  // // run post config hooks
  // // This is applied before the html middleware so that user middleware can
  // // serve custom content instead of index.html.
  // postHooks.forEach((fn) => fn && fn());
  // if (!middlewareMode || middlewareMode === 'html') {
  //     // transform index.html
  //     middlewares.use(indexHtmlMiddleware(server));
  //     // handle 404s
  //     // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
  //     middlewares.use(function vite404Middleware(_, res) {
  //         res.statusCode = 404;
  //         res.end();
  //     });
  // }
  // // error handler
  // middlewares.use(errorMiddleware(server, !!middlewareMode));
  // const runOptimize = async () => {
  //     if (config.cacheDir) {
  //         server._isRunningOptimizer = true;
  //         try {
  //             server._optimizeDepsMetadata = await optimizeDeps(config);
  //         }
  //         finally {
  //             server._isRunningOptimizer = false;
  //         }
  //         server._registerMissingImport = createMissingImporterRegisterFn(server);
  //     }
  // };
  // if (!middlewareMode && httpServer) {
  //     // overwrite listen to run optimizer before server start
  //     const listen = httpServer.listen.bind(httpServer);
  //     httpServer.listen = (async (port, ...args) => {
  //         try {
  //             await container.buildStart({});
  //             await runOptimize();
  //         }
  //         catch (e) {
  //             httpServer.emit('error', e);
  //             return;
  //         }
  //         return listen(port, ...args);
  //     });
  //     httpServer.once('listening', () => {
  //         // update actual port since this may be different from initial value
  //         serverConfig.port = httpServer.address().port;
  //     });
  // }
  // else {
  //     await container.buildStart({});
  //     await runOptimize();
  // }
  // return server;
}

//    function ssrLoadModule(url) {
//       if (!server._ssrExternals) {
//           server._ssrExternals = resolveSSRExternal(config, server._optimizeDepsMetadata
//               ? Object.keys(server._optimizeDepsMetadata.optimized)
//               : []);
//       }
//       return ssrLoadModule(url, server);
//   },

module.exports = {
  createServer,
};
