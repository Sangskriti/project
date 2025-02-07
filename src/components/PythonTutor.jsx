import { useState, useEffect } from "react";
import axios from "axios";
import "./PythonTutor.css";

export default function PythonTutor() {
  const [apiKey, setApiKey] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: "Hello! I'm your Python tutor. Ask me anything!" },
  ]);

  useEffect(() => {
    // Load the API key from environment variables (for development purposes)
    const storedApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Optionally, fallback to localStorage for persistence across sessions
      const storedApiKeyFromStorage = localStorage.getItem("openai_api_key");
      if (storedApiKeyFromStorage) {
        setApiKey(storedApiKeyFromStorage);
      }
    }
  }, []);
  

  const handleApiKeyChange = (e) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem("openai_api_key", key);
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      alert("Please enter a message.");
      return;
    }
    if (!apiKey) {
      alert("Please enter your OpenAI API key.");
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [...messages, userMessage],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botMessage = response.data.choices[0].message;
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      alert("Error communicating with AI. Check your API key.");
    }
  };

  return (
    <div className="container">
      <h1>AI Python Tutor</h1>
      <div className="api-input">
        <label>OpenAI API Key:</label>
        <input
          type="password"
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder="Enter API key"
        />
      </div>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role === "user" ? "user" : "bot"}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your Python tutor..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
