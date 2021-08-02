// @ts-check
const fs = require("fs");
const React = require("react");
const path = require("path");
const express = require("express");
const fast = require("./fast");
// const Document = require("./Document");
// const { renderToString } = require("react-dom/server");

// console.log("...Document", Document);

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const resolve = p => path.resolve(__dirname, p);

  const app = express();

  /**
   * @type {import('vite').ViteDevServer}
   */

  let vite = await require("vite").createServer({
    // await fast.createServer({
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

  // let vite = await require("vite").createServer({
  //   root,
  //   logLevel: isTest ? "error" : "info",
  //   server: {
  //     middlewareMode: "ssr",
  //     watch: {
  //       // During tests we edit the files too fast and sometimes chokidar
  //       // misses change events, so enforce polling for consistency
  //       usePolling: true,
  //       interval: 100,
  //     },
  //   },
  // });
  // console.log("...vite", vite.middlewares, vite);
  // // use vite's connect instance as middleware
  // app.use(vite.middlewares);

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;

      // always read fresh template in dev
      let template = fs.readFileSync(resolve("index.html"), "utf-8");
      console.log("...url, template", url, template);
      template = await vite.transformIndexHtml(url, template);
      let render = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
      console.log("...template2", template);

      const context = {};
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

// for test use
exports.createServer = createServer;
