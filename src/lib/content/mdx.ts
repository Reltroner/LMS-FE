import type { ComponentType } from "react";
import * as jsxRuntime from "react/jsx-runtime";

type MDXContentProps = {
  components?: Record<string, unknown>;
};

type MDXModule = {
  default: ComponentType<MDXContentProps>;
};

const componentCache = new Map<string, ComponentType<MDXContentProps>>();

export function getMDXComponent(code: string) {
  const cachedComponent = componentCache.get(code);

  if (cachedComponent) {
    return cachedComponent;
  }

  const getModule = new Function("_jsx_runtime", code);
  const mdxModule = getModule(jsxRuntime) as MDXModule;

  componentCache.set(code, mdxModule.default);

  return mdxModule.default;
}
