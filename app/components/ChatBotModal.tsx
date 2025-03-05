import React, { useState } from "react";

const ChatBotModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "User", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "Chatbot", text: data.reply }]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 mx-auto"
      >
        Negocia conmigo
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <button
              className="text-gray-500 hover:text-gray-800 text-right w-full flex justify-end"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-xl">&times;</span>
            </button>
            <div
              className="chat-history mt-4 text-black overflow-y-auto"
              style={{ maxHeight: "400px" }} // Límite de altura en píxeles
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === "User" ? "text-right" : ""
                  } py-4 border border-1`}
                >
                  <strong>{msg.sender}: </strong>
                  {msg.text}
                </div>
              ))}
            </div>
            {loading && <p className="text-center">Loading...</p>}
            <textarea
              className="w-full border rounded-md p-2 mt-4 text-black"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotModal;
