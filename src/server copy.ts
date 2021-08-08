// @ts-check
import fs from "fs";
// import * as React from "react";
// import * as path from "path";
import express from "express";
import * as theVite from "vite";
const viteCreateServer = theVite.createServer;
// import { createServer as viteCreateServer } from "./node/server";
// import * as theVite from "./vite/node/server";
import path from "path";

// // As Abel said, ES Modules in Node >= 14 no longer have require by default.
// import { createRequire } from "module";

// import entryClient from "./entry-client.static";
// const require = createRequire(import.meta.url);
// const entryClient = require("./entry-client.static");
// console.log("...entryClient", entryClient, entryClient.render);

// const __dirname = path.resolve();

// import fast from "./viteServer";
// const Document = require("./Document");
// const { renderToString } = require("react-dom/server");

// console.log("...Document", Document);

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const resolve = p => path.resolve(__dirname, p);

  const app = express();

  // let vite = await fast.createServer({
  let vite = await viteCreateServer({
    //
    root,
    logLevel: isTest ? "error" : "info",
    server: {
      middlewareMode: "ssr",
      watch: {
        // During tests we edit the files too fast and sometimes chokidar
        // misses change events, so enforce polling for consistency
        usePolling: true,
        interval: 100,
      },
    },
  });

  console.log("...vite", vite.middlewares, vite);
  // // use vite's connect instance as middleware
  // app.use(vite.middlewares);

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;
      console.log("...get url:", url);

      // always read fresh template in dev
      let template = fs.readFileSync(resolve("../index.html"), "utf-8");
      template = await vite.transformIndexHtml(url, template);
      // let template = fs.readFileSync(resolve("../template.html"), "utf-8");
      let render = (await vite.ssrLoadModule("src/entry-server.jsx")).render;

      const context = {} as any;

      const appHtml = render(url, context);

      if (context.url) {
        // Somewhere a `<Redirect>` was rendered
        return res.redirect(301, context.url);
      }

      // let Page = require(`./src/pages/About`).default;
      // const body = renderToString(
      //   React.createElement(Document, { children: React.createElement(Page) })
      // );

      const html = template.replace(`<!--app-html-->`, appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      // !isProd && vite.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app };
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log("http://localhost:3000");
    })
  );
}
