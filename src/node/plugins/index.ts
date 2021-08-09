import { ResolvedConfig } from "../config";
import { Plugin } from "../plugin";
import aliasPlugin from "@rollup/plugin-alias";
import { resolvePlugin } from "./resolve";
import { esbuildPlugin } from "./esbuild";
import { importAnalysisPlugin } from "./importAnalysis";
import { clientInjectionsPlugin } from "./clientInjections";

export async function resolvePlugins(
  config: ResolvedConfig,
  prePlugins: Plugin[]
): Promise<Plugin[]> {
  const isBuild = config.command === "build";

  return [
    // 专门处理 @vite/client 路径
    aliasPlugin({ entries: config.resolve.alias }),
    // react-refresh
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
    ...(isBuild
      ? []
      : [clientInjectionsPlugin(config), importAnalysisPlugin(config)]),
  ].filter(Boolean) as Plugin[];
}
