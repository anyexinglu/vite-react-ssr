// @ts-check
import fs from "fs";
import express from "express";
// import * as theVite from "vite";
// const viteCreateServer = theVite.createServer;
import { createServer as viteCreateServer } from "./node/server";
import path from "path";

const resolve = p => path.resolve(__dirname, p);

export async function createServer() {
  const app = express();
  let vite = await viteCreateServer({
    root: process.cwd(),
  });

  // console.log("...vite", vite.middlewares, vite);
  app.use(vite.middlewares);

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;
      console.log("...inner use *", url);

      let template = fs.readFileSync(resolve("../template.html"), "utf-8");
      let render = (await vite.ssrLoadModule("src/entry-server.jsx")).render;
      const context = {} as any;
      const appHtml = render(url, context);
      if (context.url) {
        // Somewhere a `<Redirect>` was rendered
        return res.redirect(301, context.url);
      }
      const html = template.replace(`<!--app-html-->`, appHtml);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app };
}

createServer().then(({ app }) =>
  app.listen(4100, () => {
    console.log("http://localhost:4100");
  })
);
