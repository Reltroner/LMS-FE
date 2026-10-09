import "@contentlayer/utils/effect/Tracing/Enable";

import {
  generateDotpkg,
  getConfig,
  logGenerateInfo,
  runMain,
  validateTsconfig,
} from "contentlayer/core";
import { pipe, T } from "@contentlayer/utils/effect";

import { compileManifest } from "./phase3b-catalog.mjs";

async function main() {
  const expected = compileManifest(process.cwd()).manifest.lesson_count;

  // Preserve Contentlayer's BuildCommand pipeline, but bypass its incompatible
  // Clipanion.runExit() result-to-exitCode assignment on Node.js 22.
  const result = await pipe(
    T.gen(function* ($) {
      const config = yield* $(getConfig({}));
      if (!config.source.options.disableImportAliasWarning) {
        yield* $(T.fork(validateTsconfig));
      }
      const info = yield* $(generateDotpkg({ config, verbose: false }));
      yield* $(logGenerateInfo(info));
      return info;
    }),
    runMain({ tracingServiceName: "contentlayer-cli", verbose: false }),
  );

  if (!result || result.documentCount !== expected) {
    throw new Error(
      `Contentlayer generated ${result?.documentCount ?? "no"} documents, expected ${expected}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
