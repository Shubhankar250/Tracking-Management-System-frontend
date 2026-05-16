import axiosClient from "./axiosClient";

export interface AiAgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiAgentRequest {
  message: string;
  conversationId?: string | null;
  context?: Record<string, unknown>;
}

export interface AiAgentResponse {
  reply: string;
  conversationId?: string;
  suggestions?: string[];
}

const normalizeAgentResponse = (data: any): AiAgentResponse => {
  if (typeof data === "string") {
    return { reply: data };
  }

  return {
    reply:
      data?.reply ??
      data?.answer ??
      data?.message ??
      data?.content ??
      "I received your request, but the agent did not return a readable reply.",
    conversationId: data?.conversationId ?? data?.threadId ?? data?.sessionId,
    suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
  };
};

export const sendAiAgentMessage = async (
  payload: AiAgentRequest,
): Promise<AiAgentResponse> => {
  const response = await axiosClient.post("/api/ai-agent/chat", payload);
  return normalizeAgentResponse(response.data);
};
