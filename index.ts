import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { NexusMemory } from "./nexusMemory.js";
import { ollama } from "./ollamaClient.js";
import * as path from "path";
import * as os from "os";

// Storage path: %USER_HOME%/AppData/Roaming/Antigravity/context_database/memory_core.json
const STORAGE_DIR = path.join(os.homedir(), "AppData", "Roaming", "Antigravity", "context_database");
const STORAGE_FILE = path.join(STORAGE_DIR, "memory_core.json");

const memory = new NexusMemory(STORAGE_FILE);

const server = new Server(
  {
    name: "nexus-context-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool 1: Record Interaction
 * Summarizes and indexes a session fragment.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "record_interaction",
        description: "Summarize and index a session fragment into the long-term memory.",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "The raw text or findings to remember." },
            origin: { type: "string", enum: ["who", "what", "where", "when", "why", "how", "general"], description: "The semantic dimension." },
            address: { type: "string", description: "Optional 8-digit fractal address (runes)." },
            tags: { type: "array", items: { type: "string" }, description: "Optional tags." },
          },
          required: ["content", "origin"],
        },
      },
      {
        name: "query_memory",
        description: "Search long-term memory. Supports semantic string search or specific fractal tags (e.g. 'Logic:Structures').",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Topic, question, tag, or 8-digit address." },
            origin: { type: "string", enum: ["who", "what", "where", "when", "why", "how", "general"], description: "Optional filter by dimension." },
          },
          required: ["query"],
        },
      },
      {
        name: "get_memory_status",
        description: "Check how many memories are currently stored and the top active fractal tags.",
        inputSchema: { type: "object", properties: {} },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "record_interaction") {
      const { content, origin, address, tags = [] } = args as { content: string, origin: any, address?: string, tags?: string[] };

      const summary = await ollama.summarize(content);
      const vector = await ollama.getEmbedding(summary);

      memory.addInteraction(summary, vector, origin, tags, address);

      return {
        content: [{ type: "text", text: `Memory crystallized [${origin}${address ? ` @ ${address}` : ''}].\nSummary: ${summary}` }],
      };
    }

    if (name === "query_memory") {
      const { query, origin } = args as { query: string, origin?: any };

      // 1. Embed the query
      const queryVector = await ollama.getEmbedding(query);

      // 2. Search
      let results = memory.query(queryVector);

      // 3. Filter by origin if provided
      if (origin) {
        results = results.filter(r => r.origin === origin);
      }

      if (results.length === 0) {
        return { content: [{ type: "text", text: "No relevant memories found." }] };
      }

      const formatted = results.map((r, i) => {
        const addrStr = r.address ? ` @ ${r.address} (IDX: ${r.index})` : '';
        return `[REC ${i + 1}] (${new Date(r.ts).toLocaleDateString()}) [${r.origin}${addrStr}]\n${r.content}`;
      }).join("\n\n---\n\n");

      return {
        content: [{ type: "text", text: `Retrieved context:\n\n${formatted}` }],
      };
    }

    if (name === "get_memory_status") {
      const stats = (memory as any).memory.interactions.length;
      const allTags = (memory as any).memory.interactions.flatMap((i: any) => i.tags);
      const tagCounts: Record<string, number> = {};
      allTags.forEach((t: string) => tagCounts[t] = (tagCounts[t] || 0) + 1);

      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => `${tag} (${count})`)
        .join(", ");

      return {
        content: [{
          type: "text",
          text: `Nexus Memory Status:\n- Total Snapshots: ${stats}\n- Active Genome Patterns: ${topTags || "None yet"}`
        }]
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  
  // Semantic Scour: Ensure all ingested library files have real vectors
  console.error("[Nexus] Searching for ontological gaps...");
  await memory.scrub(ollama);
  
  await server.connect(transport);
  console.error("Nexus Context Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
