/**
 * This file is refactored into TypeScript based on
 * https://github.com/preactjs/wmr/blob/main/packages/wmr/src/lib/rollup-plugin-container.js
 */

/**
https://github.com/preactjs/wmr/blob/master/LICENSE

MIT License

Copyright (c) 2020 The Preact Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import fs from "fs";
import { resolve, join } from "path";
import { Plugin } from "../plugin";
import {
  InputOptions,
  MinimalPluginContext,
  OutputOptions,
  ModuleInfo,
  NormalizedInputOptions,
  ChangeEvent,
  PartialResolvedId,
  ResolvedId,
  PluginContext as RollupPluginContext,
  LoadResult,
  SourceDescription,
  EmittedFile,
  SourceMap,
  RollupError,
} from "rollup";
import * as acorn from "acorn";
import acornClassFields from "acorn-class-fields";
import acornNumericSeparator from "acorn-numeric-separator";
import acornStaticClassFeatures from "acorn-static-class-features";
import { RawSourceMap } from "@ampproject/remapping/dist/types/types";
import { combineSourcemaps } from "../utils";
import MagicString from "magic-string";
import { FSWatcher } from "chokidar";
import {
  createDebugger,
  ensureWatchedFile,
  generateCodeFrame,
  isExternalUrl,
  normalizePath,
  numberToPos,
  prettifyUrl,
  timeFrom,
} from "../utils";
import { FS_PREFIX } from "../constants";
import chalk from "chalk";
import { ResolvedConfig } from "../config";
// import { buildErrorMessage } from './middlewares/error'

export interface PluginContainerOptions {
  cwd?: string;
  output?: OutputOptions;
  modules?: Map<string, { info: ModuleInfo }>;
  writeFile?: (name: string, source: string | Uint8Array) => void;
}

export interface PluginContainer {
  options: InputOptions;
  buildStart(options: InputOptions): Promise<void>;
  // watchChange(id: string, event?: ChangeEvent): void;
  resolveId(
    id: string,
    importer?: string,
    skip?: Set<Plugin>,
    ssr?: boolean
  ): Promise<PartialResolvedId | null>;
  transform(
    code: string,
    id: string,
    inMap?: SourceDescription["map"],
    ssr?: boolean
  ): Promise<SourceDescription | null>;
  load(id: string, ssr?: boolean): Promise<LoadResult | null>;
  // close(): Promise<void>;
}

type PluginContext = Omit<
  RollupPluginContext,
  // not documented
  | "cache"
  // deprecated
  | "emitAsset"
  | "emitChunk"
  | "getAssetFileName"
  | "getChunkFileName"
  | "isExternal"
  | "moduleIds"
  | "resolveId"
>;

export let parser = acorn.Parser.extend(
  acornClassFields,
  acornStaticClassFeatures,
  acornNumericSeparator
);

// 挨个执行 plugins 的 buildStart、resolveId、transform、load
export async function createPluginContainer(
  { plugins, logger, root, build: { rollupOptions } }: ResolvedConfig,
  watcher?: FSWatcher
): Promise<PluginContainer> {
  const isDebug = process.env.DEBUG;

  const seenResolves: Record<string, true | undefined> = {};
  const debugResolve = createDebugger("vite:resolve");
  const debugPluginResolve = createDebugger("vite:plugin-resolve", {
    onlyWhenFocused: "vite:plugin",
  });
  const debugPluginTransform = createDebugger("vite:plugin-transform", {
    onlyWhenFocused: "vite:plugin",
  });

  // ---------------------------------------------------------------------------

  const MODULES = new Map();
  const watchFiles = new Set<string>();

  // get rollup version
  const rollupPkgPath = resolve(
    require.resolve("rollup"),
    "../../package.json"
  );
  const minimalContext: MinimalPluginContext = {
    meta: {
      rollupVersion: JSON.parse(fs.readFileSync(rollupPkgPath, "utf-8"))
        .version,
      watchMode: true,
    },
  };

  // we should create a new context for each async hook pipeline so that the
  // active plugin in that pipeline can be tracked in a concurrency-safe manner.
  // using a class to make creating new contexts more efficient
  class Context implements PluginContext {
    meta = minimalContext.meta;
    ssr = false;
    _activePlugin: Plugin | null;
    _activeId: string | null = null;
    _activeCode: string | null = null;
    _resolveSkips?: Set<Plugin>;

    constructor(initialPlugin?: Plugin) {
      this._activePlugin = initialPlugin || null;
    }

    parse(code: string, opts: any = {}) {
      return parser.parse(code, {
        sourceType: "module",
        ecmaVersion: 2020,
        locations: true,
        ...opts,
      });
    }

    async resolve(
      id: string,
      importer?: string,
      options?: { skipSelf?: boolean }
    ) {
      let skips: Set<Plugin> | undefined;
      if (options?.skipSelf && this._activePlugin) {
        skips = new Set(this._resolveSkips);
        skips.add(this._activePlugin);
      }
      let out = await container.resolveId(id, importer, skips, this.ssr);
      if (typeof out === "string") out = { id: out };
      return out as ResolvedId | null;
    }

    getModuleInfo(id: string) {
      let mod = MODULES.get(id);
      if (mod) return mod.info;
      mod = {
        /** @type {import('rollup').ModuleInfo} */
        // @ts-ignore-next
        info: {},
      };
      MODULES.set(id, mod);
      return mod.info;
    }

    getModuleIds() {
      return MODULES.keys();
    }

    addWatchFile(id: string) {
      watchFiles.add(id);
      if (watcher) ensureWatchedFile(watcher, id, root);
    }

    getWatchFiles() {
      return [...watchFiles];
    }

    emitFile(assetOrFile: EmittedFile) {
      console.log(`emitFile`, this._activePlugin!.name);
      return "";
    }

    setAssetSource() {
      console.log(`setAssetSource`, this._activePlugin!.name);
    }

    getFileName() {
      console.log(`getFileName`, this._activePlugin!.name);
      return "";
    }

    warn(e) {
      console.log("...warn", e);
    }
    error(e): never {
      console.log("...error", e);
      throw e;
    }
  }

  class TransformContext extends Context {
    filename: string;
    originalCode: string;
    originalSourcemap: SourceMap | null = null;
    sourcemapChain: NonNullable<SourceDescription["map"]>[] = [];
    combinedMap: SourceMap | null = null;

    constructor(filename: string, code: string, inMap?: SourceMap | string) {
      super();
      this.filename = filename;
      this.originalCode = code;
      if (inMap) {
        this.sourcemapChain.push(inMap);
      }
    }

    _getCombinedSourcemap(createIfNull = false) {
      let combinedMap = this.combinedMap;
      for (let m of this.sourcemapChain) {
        if (typeof m === "string") m = JSON.parse(m);
        if (!("version" in (m as SourceMap))) {
          // empty, nullified source map
          combinedMap = this.combinedMap = null;
          this.sourcemapChain.length = 0;
          break;
        }
        if (!combinedMap) {
          combinedMap = m as SourceMap;
        } else {
          combinedMap = combineSourcemaps(this.filename, [
            {
              ...(m as RawSourceMap),
              sourcesContent: combinedMap.sourcesContent,
            },
            combinedMap as RawSourceMap,
          ]) as SourceMap;
        }
      }
      if (!combinedMap) {
        return createIfNull
          ? new MagicString(this.originalCode).generateMap({
              includeContent: true,
              hires: true,
              source: this.filename,
            })
          : null;
      }
      if (combinedMap !== this.combinedMap) {
        this.combinedMap = combinedMap;
        this.sourcemapChain.length = 0;
      }
      return this.combinedMap;
    }

    getCombinedSourcemap() {
      return this._getCombinedSourcemap(true) as SourceMap;
    }
  }

  let closed = false;

  const container = {
    options: await (async () => {
      let options = rollupOptions;
      for (const plugin of plugins) {
        if (!plugin.options) continue;
        options =
          (await plugin.options.call(minimalContext, options)) || options;
      }
      if (options.acornInjectPlugins) {
        parser = acorn.Parser.extend(
          ...[
            acornClassFields,
            acornStaticClassFeatures,
            acornNumericSeparator,
          ].concat(options.acornInjectPlugins)
        );
      }
      return {
        acorn,
        acornInjectPlugins: [],
        ...options,
      };
    })(),

    async buildStart() {
      await Promise.all(
        plugins.map(plugin => {
          if (plugin.buildStart) {
            return plugin.buildStart.call(
              // 目前只有 Asset 这个插件有 buildStart
              new Context(plugin) as any,
              container.options as NormalizedInputOptions
            );
          }
        })
      );
    },

    async resolveId(rawId, importer = join(root, "index.html"), skips, ssr) {
      const ctx = new Context();
      ctx.ssr = !!ssr;
      ctx._resolveSkips = skips;
      const resolveStart = isDebug ? Date.now() : 0;

      let id: string | null = null;
      const partial: Partial<PartialResolvedId> = {};
      for (const plugin of plugins) {
        if (!plugin.resolveId) continue;
        if (skips?.has(plugin)) continue;

        ctx._activePlugin = plugin;

        const pluginResolveStart = isDebug ? Date.now() : 0;
        const result = await plugin.resolveId.call(
          ctx as any,
          rawId,
          importer,
          {},
          ssr
        );
        if (!result) continue;

        if (typeof result === "string") {
          id = result;
        } else {
          id = result.id;
          Object.assign(partial, result);
        }

        isDebug &&
          debugPluginResolve(
            timeFrom(pluginResolveStart),
            plugin.name,
            prettifyUrl(id, root)
          );

        // resolveId() is hookFirst - first non-null result is returned.
        break;
      }

      if (isDebug && rawId !== id && !rawId.startsWith(FS_PREFIX)) {
        const key = rawId + id;
        // avoid spamming
        if (!seenResolves[key]) {
          seenResolves[key] = true;
          debugResolve(
            `${timeFrom(resolveStart)} ${chalk.cyan(rawId)} -> ${chalk.dim(id)}`
          );
        }
      }

      if (id) {
        partial.id = isExternalUrl(id) ? id : normalizePath(id);
        return partial as PartialResolvedId;
      } else {
        return null;
      }
    },

    async load(id, ssr) {
      const ctx = new Context();
      ctx.ssr = !!ssr;
      for (const plugin of plugins) {
        if (!plugin.load) continue;
        ctx._activePlugin = plugin;
        const result = await plugin.load.call(ctx as any, id, ssr);
        if (result != null) {
          return result;
        }
      }
      return null;
    },

    async transform(code, id, inMap, ssr) {
      const ctx = new TransformContext(id, code, inMap as SourceMap);
      ctx.ssr = !!ssr;
      for (const plugin of plugins) {
        if (!plugin.transform) continue;
        ctx._activePlugin = plugin;
        ctx._activeId = id;
        ctx._activeCode = code;
        const start = isDebug ? Date.now() : 0;
        let result;
        try {
          result = await plugin.transform.call(ctx as any, code, id, ssr);
        } catch (e) {
          ctx.error(e);
        }
        if (!result) continue;
        isDebug &&
          debugPluginTransform(
            timeFrom(start),
            plugin.name,
            prettifyUrl(id, root)
          );
        if (typeof result === "object") {
          code = result.code || "";
          if (result.map) ctx.sourcemapChain.push(result.map);
        } else {
          code = result;
        }
      }
      return {
        code,
        map: ctx._getCombinedSourcemap(),
      };
    },
  };

  return container;
}
