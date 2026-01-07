import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MCP_URL = import.meta.env.VITE_MCP_URL ||"https://amirhashmi017-mcp-server-and-langgraph-agent.hf.space/";

const getAuthToken = () => {
  return localStorage.getItem("token") || null;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const mcp = axios.create({
  baseURL: MCP_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export class McpRpcError extends Error {
  constructor(message, { code, data } = {}) {
    super(message);
    this.name = "McpRpcError";
    this.code = code;
    this.data = data;
  }
}

const tryParseJson = (text) => {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Only attempt JSON parse for obvious JSON payloads.
  const first = trimmed[0];
  if (first !== "{" && first !== "[") return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const unwrapMcpToolResult = (result) => {
  // Many MCP servers return: { content: [{type:'text', text:'{...json...}'}], isError: boolean }
  if (!result || typeof result !== "object") return result;

  const content = Array.isArray(result.content) ? result.content : null;
  if (!content) return result;

  const text = content
    .filter((c) => c && typeof c === "object" && c.type === "text")
    .map((c) => (typeof c.text === "string" ? c.text : ""))
    .join("\n")
    .trim();

  const parsed = tryParseJson(text);
  const payload = parsed ?? (text || result);

  if (result.isError) {
    const message =
      (parsed && (parsed.error || parsed.message)) ||
      (typeof payload === "string" ? payload : "MCP tool error");
    throw new McpRpcError(String(message), { data: payload });
  }

  if (parsed && typeof parsed === "object" && parsed.error) {
    throw new McpRpcError(String(parsed.error), { data: parsed });
  }

  return payload;
};

export const mcpToolsCall = async (toolName, toolArgs = {}, options = {}) => {
  const token = options.token || getAuthToken();
  const id = options.id ?? 1;

  const payload = {
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: toolName,
      arguments: {
        ...(token ? { token } : {}),
        ...toolArgs,
      },
    },
    id,
  };

  try {
    const { data } = await mcp.post("", payload);
    if (data?.error) {
      throw new McpRpcError(data.error?.message || "MCP RPC error", {
        code: data.error?.code,
        data: data.error?.data,
      });
    }
    return unwrapMcpToolResult(data?.result);
  } catch (err) {
    if (err instanceof McpRpcError) throw err;
    const message =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to call MCP tool";
    throw new McpRpcError(message, {
      code: err?.response?.data?.error?.code,
      data: err?.response?.data,
    });
  }
};

// ---- Kickstart proposal API (MCP tools) ----

export const kickstartGenerateProposalFromText = async (
  { report_text },
  options
) => {
  return mcpToolsCall(
    "kickstart_generate_proposal_from_text",
    { report_text },
    options
  );
};

export const kickstartCreateProposal = async (proposal, options) => {
  return mcpToolsCall("kickstart_create_proposal", { ...proposal }, options);
};

export const kickstartGetProposals = async (options) => {
  return mcpToolsCall("kickstart_get_proposals", {}, options);
};

export const kickstartGetProposal = async ({ proposal_id }, options) => {
  return mcpToolsCall("kickstart_get_proposal", { proposal_id }, options);
};

export const kickstartUpdateProposal = async (
  { proposal_id, ...updates },
  options
) => {
  return mcpToolsCall(
    "kickstart_update_proposal",
    { proposal_id, ...updates },
    options
  );
};

export const kickstartDeleteProposal = async ({ proposal_id }, options) => {
  return mcpToolsCall("kickstart_delete_proposal", { proposal_id }, options);
};

export const kickstartGenerateProposalAi = async (
  { proposal_id, prompt, sections },
  options
) => {
  return mcpToolsCall(
    "kickstart_generate_proposal_ai",
    { proposal_id, prompt, sections },
    options
  );
};

export const kickstartEditProposalAi = async (
  { proposal_id, edit_instructions, section, content },
  options
) => {
  return mcpToolsCall(
    "kickstart_edit_proposal_ai",
    { proposal_id, edit_instructions, section, content },
    options
  );
};

export default api;
