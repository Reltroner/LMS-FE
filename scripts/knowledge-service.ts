import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createKnowledgeServiceHandler,
  createServerEnvModelAdapter,
} from "../src/lib/knowledge/service.ts";
import type { KnowledgeIndex } from "../src/lib/knowledge/types.ts";
import { preparePublicContent } from "./prepare-public-content.ts";

export async function startKnowledgeServiceServer(options: {
  root?: string;
  port?: number;
  host?: string;
} = {}) {
  const root = options.root ?? process.cwd();
  const indexPath = path.join(root, ".public-content", "knowledge-index.json");
  if (!fs.existsSync(indexPath)) {
    await preparePublicContent(root);
  }
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8")) as KnowledgeIndex;
  const modelAdapter = createServerEnvModelAdapter(process.env);
  const handler = createKnowledgeServiceHandler({ index, modelAdapter });

  const server = http.createServer(async (req, res) => {
    try {
      const host = req.headers.host ?? "localhost:8787";
      const url = `http://${host}${req.url ?? "/"}`;
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string") headers.set(k, v);
        else if (Array.isArray(v)) headers.set(k, v.join(", "));
      }

      const chunks: Buffer[] = [];
      let totalBytes = 0;
      for await (const chunk of req) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        totalBytes += buf.byteLength;
        if (totalBytes <= 16_384) {
          chunks.push(buf);
        }
      }
      const bodyBuffer = Buffer.concat(chunks);
      const method = req.method ?? "GET";
      const webReq = new Request(url, {
        method,
        headers,
        body: ["GET", "HEAD", "OPTIONS"].includes(method) ? undefined : bodyBuffer,
      });

      const webRes = await handler(webReq);
      res.statusCode = webRes.status;
      webRes.headers.forEach((val, key) => {
        res.setHeader(key, val);
      });
      const text = await webRes.text();
      res.end(text);
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "INTERNAL_ERROR", message: "Unexpected server error" }));
    }
  });

  const port = options.port ?? Number(process.env.RAG_SERVICE_PORT ?? 8787);
  const host = options.host ?? "127.0.0.1";
  await new Promise<void>((resolve) => server.listen(port, host, resolve));
  return { server, port, host, indexVersion: index.indexVersion, providerConfigured: Boolean(modelAdapter) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const info = await startKnowledgeServiceServer();
  console.log(
    `Reltroner Knowledge Service listening at http://${info.host}:${info.port} (index=${info.indexVersion}, llmConfigured=${info.providerConfigured})`,
  );
}
