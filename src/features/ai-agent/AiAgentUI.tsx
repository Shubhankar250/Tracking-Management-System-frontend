import { useEffect, useMemo, useRef, useState } from "react";
import { sendAiAgentMessage, type AiAgentMessage } from "../../api/aiAgent.api";
import { useAppSelector } from "../../redux/hooks";
import "../../assets/css/aiAgent.css";

interface UiMessage extends AiAgentMessage {
  id: string;
  time: string;
}

const starterPrompts = [
  "Show vehicles that need attention",
  "Summarize today's fleet activity",
  "Find idle or stopped vehicles",
  "Help me create a report",
];

const createMessage = (
  role: "user" | "assistant",
  content: string,
): UiMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
});

const AiAgentUI = () => {
  const [messages, setMessages] = useState<UiMessage[]>([
    createMessage(
      "assistant",
      "Hello, I am ready to help with fleet questions, reports, vehicles, alerts, and route planning.",
    ),
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const liveDevices = useAppSelector((state) => state.live.devices);
  const selectedVehicleId = useAppSelector(
    (state) => state.live.selectedVehicleId,
  );

  const fleetSummary = useMemo(() => {
    const total = liveDevices.length;
    const online = liveDevices.filter((device) => device.status === "online").length;
    const moving = liveDevices.filter(
      (device) => device.status === "online" && device.speed > device.min_moving_speed,
    ).length;
    const idle = liveDevices.filter(
      (device) => device.status === "online" && device.speed <= device.min_moving_speed,
    ).length;

    return { total, online, moving, idle, selectedVehicleId };
  }, [liveDevices, selectedVehicleId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (messageText = input) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    const userMessage = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await sendAiAgentMessage({
        message: trimmed,
        conversationId,
        context: {
          fleetSummary,
        },
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        createMessage("assistant", response.reply),
      ]);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "AI agent is not reachable right now. Please check the backend service.";
      setError(message);
      setMessages((prev) => [...prev, createMessage("assistant", message)]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-agent-shell">
      <aside className="ai-agent-sidebar">
        <div className="ai-agent-brand">
          <div className="ai-agent-logo">
            <i className="bi bi-stars"></i>
          </div>
          <div>
            <div className="ai-agent-title">Fleet AI</div>
            <div className="ai-agent-subtitle">Operational assistant</div>
          </div>
        </div>

        <div className="ai-agent-stats">
          <div>
            <span>Total</span>
            <strong>{fleetSummary.total}</strong>
          </div>
          <div>
            <span>Online</span>
            <strong>{fleetSummary.online}</strong>
          </div>
          <div>
            <span>Moving</span>
            <strong>{fleetSummary.moving}</strong>
          </div>
          <div>
            <span>Idle</span>
            <strong>{fleetSummary.idle}</strong>
          </div>
        </div>

        <div className="ai-agent-prompt-list">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
            >
              <i className="bi bi-lightning-charge"></i>
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="ai-agent-main">
        <div className="ai-agent-header">
          <div>
            <h2>Ask the AI agent</h2>
            <span>Connected to fleet context and backend agent actions</span>
          </div>
          <div className={`ai-agent-status ${error ? "error" : "ready"}`}>
            <span></span>
            {error ? "Needs attention" : "Ready"}
          </div>
        </div>

        <div className="ai-agent-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-agent-message ${msg.role === "user" ? "user" : "assistant"}`}
            >
              <div className="ai-agent-message-avatar">
                <i
                  className={
                    msg.role === "user" ? "bi bi-person" : "bi bi-stars"
                  }
                ></i>
              </div>
              <div className="ai-agent-bubble">
                <div className="ai-agent-message-meta">
                  <strong>{msg.role === "user" ? "You" : "AI Agent"}</strong>
                  <span>{msg.time}</span>
                </div>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-agent-message assistant">
              <div className="ai-agent-message-avatar">
                <i className="bi bi-stars"></i>
              </div>
              <div className="ai-agent-bubble">
                <div className="ai-agent-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ai-agent-composer">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about vehicles, alerts, reports, routes, or command next steps..."
            rows={2}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            title="Send"
          >
            <i className="bi bi-send"></i>
          </button>
        </div>
      </section>
    </div>
  );
};

export default AiAgentUI;
