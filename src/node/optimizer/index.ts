import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { BuildOptions as EsbuildBuildOptions } from "esbuild";
import { ResolvedConfig } from "../config";
import { createDebugger, lookupFile } from "../utils";

const debug = createDebugger("vite:deps");

export interface DepOptimizationOptions {
  /**
   * By default, Vite will crawl your index.html to detect dependencies that
   * need to be pre-bundled. If build.rollupOptions.input is specified, Vite
   * will crawl those entry points instead.
   *
   * If neither of these fit your needs, you can specify custom entries using
   * this option - the value should be a fast-glob pattern or array of patterns
   * (https://github.com/mrmlnc/fast-glob#basic-syntax) that are relative from
   * vite project root. This will overwrite default entries inference.
   */
  entries?: string | string[];
  /**
   * Force optimize listed dependencies (must be resolvable import paths,
   * cannot be globs).
   */
  include?: string[];
  /**
   * Do not optimize these dependencies (must be resolvable import paths,
   * cannot be globs).
   */
  exclude?: string[];
  /**
   * Options to pass to esbuild during the dep scanning and optimization
   *
   * Certain options are omitted since changing them would not be compatible
   * with Vite's dep optimization.
   *
   * - `external` is also omitted, use Vite's `optimizeDeps.exclude` option
   * - `plugins` are merged with Vite's dep plugin
   * - `keepNames` takes precedence over the deprecated `optimizeDeps.keepNames`
   *
   * https://esbuild.github.io/api
   */
  esbuildOptions?: Omit<
    EsbuildBuildOptions,
    | "bundle"
    | "entryPoints"
    | "external"
    | "write"
    | "watch"
    | "outdir"
    | "outfile"
    | "outbase"
    | "outExtension"
    | "metafile"
  >;
  /**
   * @deprecated use `esbuildOptions.keepNames`
   */
  keepNames?: boolean;
}

export interface DepOptimizationMetadata {
  /**
   * The main hash is determined by user config and dependency lockfiles.
   * This is checked on server startup to avoid unnecessary re-bundles.
   */
  hash: string;
  /**
   * The browser hash is determined by the main hash plus additional dependencies
   * discovered at runtime. This is used to invalidate browser requests to
   * optimized deps.
   */
  browserHash: string;
  optimized: Record<
    string,
    {
      file: string;
      src: string;
      needsInterop: boolean;
    }
  >;
}

export async function optimizeDeps(
  config: ResolvedConfig,
  force = config.server.force,
  asCommand = false,
  newDeps?: Record<string, string>, // missing imports encountered after server has started
  ssr?: boolean
): Promise<DepOptimizationMetadata | null> {
  config = {
    ...config,
    command: "build",
  };

  const { root, logger, cacheDir } = config;
  const log = asCommand ? logger.info : debug;
  const dataPath = path.join(cacheDir, "_metadata.json");
  const mainHash = getDepHash(root, config);
  const data: DepOptimizationMetadata = {
    hash: mainHash,
    browserHash: mainHash,
    optimized: {},
  };

  // 如果配置不改（之前已经预生成，hash 不变），那就不需要重新执行了，直接返回之前的 metaData 即可
  if (!force) {
    let prevData;
    try {
      prevData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    } catch (e) {}
    // hash is consistent, no need to re-bundle
    if (prevData && prevData.hash === data.hash) {
      log("Hash is consistent. Skipping. Use --force to override.");
      return prevData;
    } else {
      console.log(
        "prevData.hash not equal data.hash",
        prevData.hash,
        data.hash
      );
    }
  }
}

const lockfileFormats = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];

function getDepHash(root: string, config: ResolvedConfig): string {
  let content = lookupFile(root, lockfileFormats) || "";
  // also take config into account
  // only a subset of config options that can affect dep optimization
  content += JSON.stringify(
    {
      mode: config.mode,
      root: config.root,
      resolve: config.resolve,
      assetsInclude: config.assetsInclude,
      plugins: config.plugins.map(p => p.name),
      optimizeDeps: {
        include: config.optimizeDeps?.include,
        exclude: config.optimizeDeps?.exclude,
      },
    },
    (_, value) => {
      if (typeof value === "function" || value instanceof RegExp) {
        return value.toString();
      }
      return value;
    }
  );
  return createHash("sha256").update(content).digest("hex").substr(0, 8);
}
