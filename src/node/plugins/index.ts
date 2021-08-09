import { ResolvedConfig } from "../config";
import { Plugin } from "../plugin";
import aliasPlugin from "@rollup/plugin-alias";
import { resolvePlugin } from "./resolve";
import { esbuildPlugin } from "./esbuild";
import { importAnalysisPlugin } from "./importAnalysis";
// import { assetPlugin } from "./asset";
import { clientInjectionsPlugin } from "./clientInjections";

export async function resolvePlugins(
  config: ResolvedConfig,
  prePlugins: Plugin[],
  normalPlugins: Plugin[],
  postPlugins: Plugin[]
): Promise<Plugin[]> {
  const isBuild = config.command === "build";
  return [
    aliasPlugin({ entries: config.resolve.alias }),
    ...prePlugins,
    resolvePlugin({
      ...config.resolve,
      root: config.root,
      isProduction: config.isProduction,
      isBuild,
      ssrTarget: config.ssr?.target,
      asSrc: true,
    }),
    config.esbuild !== false ? esbuildPlugin(config.esbuild) : null,
    // assetPlugin(config),
    ...(isBuild
      ? []
      : [clientInjectionsPlugin(config), importAnalysisPlugin(config)]),
  ].filter(Boolean) as Plugin[];
}
