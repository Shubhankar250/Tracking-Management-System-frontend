import { useState, useEffect, useRef } from "react";
import "../../assets/css/chat.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { tokenService } from "../../api/tokenService";
import axiosClient from "../../api/axiosClient";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  resetUnread,
  setChatOpen
} from "../../slices/chatNotificationSlice";



const ChatUI = () => {


  // ✅ NEW: selected device
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentUser = tokenService.getUsername();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [unreadMap, setUnreadMap] = useState<{ [key: string]: number }>({});
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const statusMap = useAppSelector(
    (state) => state.chatNotification.statusMap
  );
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useAppDispatch();
  const BASE_URL = "https://fleetplus.trackingpath.com";

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await axiosClient.get("/api/chat/unread-by-user");
        setUnreadMap(res.data); // 🔥 {username: count}
      } catch (err) {
        console.error("❌ unread load failed", err);
      }
    };

    loadUnread();
  }, []);
  useEffect(() => {
    const token = tokenService.getAccessToken();

    const client = new Client({
      // webSocketFactory: () => new SockJS("http://localhost:8091/ws-chat"),
      webSocketFactory: () => new SockJS("https://fleetplus.trackingpath.com/ws-chat"),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      onConnect: () => {
        console.log("✅ STOMP connected");
        setIsConnected(true);
      },

      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        setMobileView("list"); // always start with list on mobile
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    setMessages([]);

    const loadChat = async () => {
      try {
        const convRes = await axiosClient.get(
          `/api/chat/conversation/${selectedUserId}`
        );

        const convId = convRes.data;
        setConversationId(convId);

        const historyRes = await axiosClient.get(
          `/api/chat/history/${convId}`
        );

        const formatted = historyRes.data.map((msg: any) => ({
          id: msg.id,
          sender:
            msg.senderUsername === currentUser ? "me" : "other",
          senderUsername: msg.senderUsername,
          text: msg.content,
          messageType: msg.messageType,
          time: new Date(msg.sentAt).toLocaleTimeString(),
        }));

        setMessages(formatted);
      } catch (err) {
        console.error("❌ Chat load failed", err);
      }
    };

    loadChat();
  }, [selectedUserId]);

  useEffect(() => {
    if (!conversationId || !isConnected || !stompClientRef.current) return;

    const client = stompClientRef.current;

    const subscription = client.subscribe(
      `/topic/conversations/${conversationId}`,
      (msg) => {
        const body = JSON.parse(msg.body);

        setMessages((prev) => [
          ...prev,
          {
            id: body.id,
            sender:
              body.senderUsername === currentUser ? "me" : "other",
            senderUsername: body.senderUsername,
            text: body.content,
            messageType: body.messageType,
            time: new Date(body.sentAt).toLocaleTimeString(),
          },
        ]);
      }
    );

    return () => {
      subscription.unsubscribe(); // ✅ VERY IMPORTANT
    };
  }, [conversationId, isConnected]);
  useEffect(() => {
    if (!isConnected || !stompClientRef.current) return;

    const client = stompClientRef.current;

    const sub = client.subscribe("/user/queue/inbox", (msg) => {
      const body = JSON.parse(msg.body);

      console.log("📩 Personal message received", body);

      setMessages((prev) => [
        ...prev,
        {
          id: body.id,
          sender:
            body.senderUsername === currentUser ? "me" : "other",
          senderUsername: body.senderUsername,
          text: body.content,
          messageType: body.messageType,
          time: new Date(body.sentAt).toLocaleTimeString(),
        },
      ]);
    });

    return () => sub.unsubscribe();
  }, [isConnected]);

  const sendMessage = async () => {

    if (!stompClientRef.current || !isConnected) {
      console.error("❌ WebSocket not connected");
      return;
    }

    // ✅ FILE SEND (FIRST PRIORITY)
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("conversationId", conversationId!.toString());
      formData.append(
        "receiverUsername", users.find(u => u.id === selectedUserId && u.type === selectedType)?.username,
      );

      try {
        await axiosClient.post("/api/chat/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setSelectedFile(null); // ✅ reset after send
      } catch (err) {
        console.error("❌ File upload failed", err);
      }

      return; // ⚠️ IMPORTANT (text send na ho)
    }

    // ✅ TEXT SEND
    if (!input.trim()) return;

    stompClientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        conversationId: conversationId,
        receiverUsername: users.find(u => u.id === selectedUserId && u.type === selectedType)?.username,
        content: input,
        messageType: "TEXT",
      }),
    });

    setInput("");
  };
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await axiosClient.get("/api/chat/userslist");
        setUsers(res.data);

        if (res.data.length > 0) {
          setSelectedUserId(res.data[0].id);     // ✅ id correct
          setSelectedType(res.data[0].type);     // ✅ ADD THIS LINE
        }
      } catch (err) {
        console.error("❌ User load failed", err);
      }
    };

    loadUsers();
  }, []);
  const getFileType = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();

    if (!ext) return "file";

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    if (["zip", "rar"].includes(ext)) return "zip";
    if (["txt", "doc", "docx"].includes(ext)) return "doc";

    return "file";
  };
  const imageDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = url.split("/").pop() || "file";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
    }
  };


  const [messages, setMessages] = useState<any[]>([]);

  const [input, setInput] = useState("");
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // 🔥 reset input so same file can be selected again
    e.target.value = "";
  };
  const selectedUser = users.find(
    u => u.id === selectedUserId && u.type === selectedType
  );
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const userList = filteredUsers.filter(u => u.type === "USER");
  const driverList = filteredUsers.filter(u => u.type === "DRIVER");
  const taskList = filteredUsers.filter(u => u.type === "TASK");
  return (
    <div className={`chat-container ${mobileView === "chat" ? "mobile-chat" : "mobile-list"}`}>
      {/* LEFT SIDEBAR */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div className="chat-title">Chats</div>

          <input
            placeholder="Search user, driver, task, admin..."
            className="chat-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="chat-user-list">

          {/* USERS */}
          {userList.length > 0 && (
            <>
              <div className="chat-divider">USERS</div>
              {userList.map((user) => (
                <div
                  key={user.id}
                  className={`chat-user ${user.id === selectedUserId && user.type === selectedType ? "active" : ""
                    }`}
                  onClick={async () => {
                    try {
                      setSelectedUserId(user.id);
                      setSelectedType(user.type);
                      if (window.innerWidth <= 768) {
                        setMobileView("chat"); // 🔥 ADD THIS
                      }
                      const convRes = await axiosClient.get(
                        `/api/chat/conversation/${user.id}`
                      );

                      const convId = convRes.data;
                      setConversationId(convId);

                      await axiosClient.post(`/api/chat/mark-read/${convId}`);

                      setUnreadMap(prev => ({
                        ...prev,
                        [user.username]: 0
                      }));

                      dispatch(resetUnread());
                      dispatch(setChatOpen(true));

                    } catch (err) {
                      console.error("❌ mark-read failed", err);
                    }
                  }}
                >
                  <div className="avatar-wrapper">
                    <div className="avatar">
                      {user.name?.substring(0, 2).toUpperCase()}
                    </div>

                    <span
                      className={`chat-status-dot ${statusMap[user.username] === "ONLINE"
                        ? "online"
                        : statusMap[user.username] === "AWAY"
                          ? "away"
                          : "offline"
                        }`}
                    />
                  </div>

                  <div className="chat-user-info">
                    <div className="chat-user-top">
                      <span className="name">{user.name}</span>

                      {unreadMap[user.username] > 0 && (
                        <span className="chat-badge">
                          {unreadMap[user.username]}
                        </span>
                      )}
                    </div>

                    <span className="role driver">
                      {user?.roleName?.replace("ROLE_", "")}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* DRIVERS */}
          {driverList.length > 0 && (
            <>
              <div className="chat-divider">DRIVERS</div>
              {driverList.map((user) => (
                <div
                  key={user.id}
                  className={`chat-user ${user.id === selectedUserId && user.type === selectedType ? "active" : ""
                    }`}
                  onClick={async () => {
                    try {
                      setSelectedUserId(user.id);
                      setSelectedType(user.type);
                      if (window.innerWidth <= 768) {
                        setMobileView("chat");
                      }

                      const convRes = await axiosClient.get(
                        `/api/chat/conversation/${user.id}`
                      );

                      const convId = convRes.data;
                      setConversationId(convId);

                      await axiosClient.post(`/api/chat/mark-read/${convId}`);

                      setUnreadMap(prev => ({
                        ...prev,
                        [user.username]: 0
                      }));

                      dispatch(resetUnread());
                      dispatch(setChatOpen(true));

                    } catch (err) {
                      console.error("❌ mark-read failed", err);
                    }
                  }}
                >
                  <div className="avatar-wrapper">
                    <div className="avatar">
                      {user.name?.substring(0, 2).toUpperCase()}
                    </div>

                    <span
                      className={`chat-status-dot ${statusMap[user.username] === "ONLINE"
                        ? "online"
                        : statusMap[user.username] === "AWAY"
                          ? "away"
                          : "offline"
                        }`}
                    />
                  </div>

                  <div className="chat-user-info">
                    <div className="chat-user-top">
                      <span className="name">{user.name}</span>

                      {unreadMap[user.username] > 0 && (
                        <span className="chat-badge">
                          {unreadMap[user.username]}
                        </span>
                      )}
                    </div>

                    <span className="role driver">
                      {user?.deviceName}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* TASKS */}
          {taskList.length > 0 && (
            <>
              <div className="chat-divider">TASKS</div>
              {taskList.map((user) => (
                <div
                  key={user.id}
                  className={`chat-user ${user.id === selectedUserId && user.type === selectedType ? "active" : ""
                    }`}
                  onClick={async () => {
                    try {
                      setSelectedUserId(user.id);
                      setSelectedType(user.type);
                      if (window.innerWidth <= 768) {
                        setMobileView("chat");
                      }

                      const convRes = await axiosClient.get(
                        `/api/chat/conversation/${user.id}`
                      );

                      const convId = convRes.data;
                      setConversationId(convId);

                      await axiosClient.post(`/api/chat/mark-read/${convId}`);

                      setUnreadMap(prev => ({
                        ...prev,
                        [user.username]: 0
                      }));

                      dispatch(resetUnread());
                      dispatch(setChatOpen(true));

                    } catch (err) {
                      console.error("❌ mark-read failed", err);
                    }
                  }}
                >
                  <div className="avatar-wrapper">
                    <div className="avatar">
                      {user.name?.substring(0, 2).toUpperCase()}
                    </div>

                    <span
                      className={`chat-status-dot ${statusMap[user.username] === "ONLINE"
                        ? "online"
                        : statusMap[user.username] === "AWAY"
                          ? "away"
                          : "offline"
                        }`}
                    />
                  </div>

                  <div className="chat-user-info">
                    <div className="chat-user-top">
                      <span className="name">{user.name}</span>

                      {unreadMap[user.username] > 0 && (
                        <span className="chat-badge">
                          {unreadMap[user.username]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

        </div>
      </div>

      {/* CHAT AREA */}
      <div className="chat-main">
        <div className="chat-header">
          {/* LEFT */}
          <div className="chat-header-left">
            {mobileView === "chat" && window.innerWidth <= 768 && (
              <button
                className="icon-btn"
                onClick={() => setMobileView("list")}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
            )}
            <div className="avatar-wrapper">
              <div className="avatar">
                {(selectedUser?.name || "NA")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <span
                className={`chat-status-dot ${statusMap[selectedUser?.username] === "ONLINE"
                  ? "online"
                  : statusMap[selectedUser?.username] === "AWAY"
                    ? "away"
                    : "offline"
                  }`}
              />
            </div>

            <div className="chat-header-info">
              <div className="name">
                {selectedUser?.name || "Select User"}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="chat-header-actions">
            <button className="icon-btn">
              <i className="bi bi-telephone"></i>
            </button>
            <button className="icon-btn">
              <i className="bi bi-geo-alt"></i>
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.sender === "me" ? "me" : "other"
                }`}
            >
              <div className="chat-name">
                {msg.sender === "me"
                  ? "You"
                  : msg.senderUsername}
              </div>
              <div className="chat-text">
                {msg.messageType === "FILE" ? (
                  (() => {
                    const fileUrl = BASE_URL + msg.text;
                    const fileType = getFileType(msg.text);
                    const fileName = msg.text.split("/").pop();

                    // ✅ IMAGE
                    if (fileType === "image") {
                      return (
                        <img
                          src={fileUrl}
                          alt="file"
                          style={{ maxWidth: "200px", borderRadius: "10px", cursor: "pointer" }}
                          onClick={() => setPreviewImage(fileUrl)}
                        />
                      );
                    }

                    // ✅ PDF
                    if (fileType === "pdf") {
                      return (
                        <div
                          className="file-box clickable"
                          onClick={() => window.open(fileUrl, "_blank")}
                        >
                          <span>{fileName}</span>
                        </div>
                      );
                    }

                    // ✅ ZIP
                    if (fileType === "zip") {
                      return (
                        <div
                          className="file-box clickable"
                          onClick={() => window.open(fileUrl, "_blank")}
                        >
                          <span>{fileName}</span>
                        </div>
                      );
                    }
                    // ✅ DOC / TXT
                    if (fileType === "doc") {
                      return (
                        <div
                          className="file-box clickable"
                          onClick={() => window.open(fileUrl, "_blank")}
                        >
                          <span>{fileName}</span>
                        </div>
                      );
                    }

                    // ✅ DEFAULT
                    return (
                      <div
                        className="file-box clickable"
                        onClick={() => window.open(fileUrl, "_blank")}
                      >
                        <span>{fileName}</span>
                      </div>
                    );
                  })()
                ) : (
                  msg.text
                )}
              </div>
              <span>{msg.time}</span>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <div className="chat-input-left">
            <button
              className="icon-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="bi bi-paperclip"></i>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

          </div>
          {selectedFile && (
            <div className="file-preview">
              {selectedFile.type.startsWith("image") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  style={{ width: "60px", borderRadius: "8px" }}
                />
              ) : (
                <span>{selectedFile.name}</span>
              )}

              <button
                onClick={() => {
                  setSelectedFile(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // 🔥 FIX
                  }
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
          />

          <button
            className="send-btn"
            onClick={() => {
              console.log("BUTTON CLICKED");   // ✅ MUST PRINT
              sendMessage();
            }}
          >
            <i className="bi bi-send"></i> Send
          </button>
        </div>
      </div>
      {previewImage && (
        <div className="image-preview-modal">

          {/* Overlay */}
          <div
            className="overlay"
            onClick={() => setPreviewImage(null)}
          ></div>

          {/* Content */}
          <div className="preview-content">

            {/* Header (Download + Close) */}
            <div className="preview-header">

              {/* Download */}
              <a
                className="download-btn"
                onClick={() => imageDownload(previewImage)}
              >
                <i className="bi bi-download"></i>
              </a>

              {/* Close */}
              <a
                className="download-btn"
                onClick={() => setPreviewImage(null)}
              >
                <i className="bi bi-x-lg"></i>
              </a>

            </div>

            {/* Image */}
            <img src={previewImage} alt="preview" />

          </div>
        </div>
      )}
    </div>
  );
};

export default ChatUI;