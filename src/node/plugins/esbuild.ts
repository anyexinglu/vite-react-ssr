import path from "path";
import { Plugin } from "../plugin";
import { transform, Loader, TransformOptions, TransformResult } from "esbuild";
import { cleanUrl, createDebugger } from "../utils";
import { RawSourceMap } from "@ampproject/remapping/dist/types/types";
import { SourceMap } from "rollup";
import { createFilter } from "@rollup/pluginutils";
import { combineSourcemaps } from "../utils";

const debug = createDebugger("vite:esbuild");

export interface ESBuildOptions extends TransformOptions {
  include?: string | RegExp | string[] | RegExp[];
  exclude?: string | RegExp | string[] | RegExp[];
  jsxInject?: string;
}

export type ESBuildTransformResult = Omit<TransformResult, "map"> & {
  map: SourceMap;
};

async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: TransformOptions,
  inMap?: object
): Promise<ESBuildTransformResult> {
  // if the id ends with a valid ext, use it (e.g. vue blocks)
  // otherwise, cleanup the query before checking the ext
  const ext = path.extname(
    /\.\w+$/.test(filename) ? filename : cleanUrl(filename)
  );

  let loader = ext.slice(1);
  if (loader === "cjs" || loader === "mjs") {
    loader = "js";
  }

  const resolvedOptions = {
    loader: loader as Loader,
    sourcemap: true,
    // ensure source file name contains full query
    sourcefile: filename,
    ...options,
  } as ESBuildOptions;

  delete resolvedOptions.include;
  delete resolvedOptions.exclude;
  delete resolvedOptions.jsxInject;

  try {
    const result = await transform(code, resolvedOptions);
    if (inMap) {
      const nextMap = JSON.parse(result.map);
      nextMap.sourcesContent = [];
      return {
        ...result,
        map: combineSourcemaps(filename, [
          nextMap as RawSourceMap,
          inMap as RawSourceMap,
        ]) as SourceMap,
      };
    } else {
      return {
        ...result,
        map: JSON.parse(result.map),
      };
    }
  } catch (e) {
    debug(`esbuild error with options used: `, resolvedOptions);
    // patch error information
    if (e.errors) {
      e.loc = e.errors[0].location;
    }
    throw e;
  }
}

export function esbuildPlugin(options: ESBuildOptions = {}): Plugin {
  const filter = createFilter(
    options.include || /\.(tsx?|jsx)$/,
    options.exclude || /\.js$/
  );

  return {
    name: "vite:esbuild",
    async transform(code, id) {
      if (filter(id) || filter(cleanUrl(id))) {
        const result = await transformWithEsbuild(code, id, options);
        if (result.warnings.length) {
          result.warnings.forEach(m => {
            console.warn(m, code);
          });
        }
        if (options.jsxInject && /\.(?:j|t)sx\b/.test(id)) {
          result.code = options.jsxInject + ";" + result.code;
        }
        return {
          code: result.code,
          map: result.map,
        };
      }
    },
  };
}
