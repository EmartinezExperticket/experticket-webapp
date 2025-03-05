"use client";

import React, { useState, KeyboardEvent, useEffect } from "react";

const ChatbotGeneral: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeBlock, setCodeBlock] = useState<string | null>(null);
  const [translatedCode, setTranslatedCode] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"JavaScript" | "Python" | "CSharp">("JavaScript");
  const [loadingTranslation, setLoadingTranslation] = useState(false); // Nuevo estado

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "User", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat-ai-general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "Chatbot", text: data.reply }]);
      
      // Cuando hay nuevo código, reseteamos idioma a JavaScript y limpiamos traducción previa
      setCodeBlock(data.code);
      setTranslatedCode(null);
      setSelectedLanguage("JavaScript");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (language: "JavaScript" | "Python" | "CSharp") => {
    if (!codeBlock) return;

    setSelectedLanguage(language);
    setLoadingTranslation(true); // Mostrar loader mientras se cambia el lenguaje

    try {
      const response = await fetch("/api/chat-ai-translate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeBlock, targetLanguage: language }),
      });

      const data = await response.json();
      setTranslatedCode(data.code);
    } catch (error) {
      console.error("Error translating code:", error);
    } finally {
      setLoadingTranslation(false); // Ocultar loader al terminar
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = () => {
    const codeToCopy = translatedCode || codeBlock;
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      alert("Código copiado al portapapeles");
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Chat (Izquierda) */}
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="chat-history mt-4 text-black overflow-y-auto" style={{ maxHeight: "400px" }}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === "User" ? "text-right" : ""} py-4 border border-1`}>
                <strong>{msg.sender}: </strong>{msg.text}
              </div>
            ))}
          </div>
          {loading && <p className="text-center">Loading...</p>}
          <textarea
            className="w-full border rounded-md p-2 mt-4 text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
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

      {/* Panel de código (Derecha) */}
      {(codeBlock || translatedCode) && (
        <div className="w-1/3 bg-gray-900 p-4 overflow-y-auto border-l border-gray-700">
          {/* Selector de Lenguaje */}
          <div className="flex space-x-2 mb-2">
            {["JavaScript", "Python", "CSharp"].map((lang) => (
              <button
                key={lang}
                className={`px-2 py-1 rounded ${selectedLanguage === lang ? "bg-green-500" : "bg-gray-700"}`}
                onClick={() => handleLanguageChange(lang as "JavaScript" | "Python" | "CSharp")}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Botón de Copiar */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-300">
              Código Generado ({selectedLanguage}):
            </span>
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 text-white px-2 py-1 text-sm rounded-md"
            >
              Copiar
            </button>
          </div>

          {/* Loader durante traducción */}
          {loadingTranslation ? (
            <p className="text-yellow-400">Cargando {selectedLanguage}...</p>
          ) : (
            <pre className="bg-black p-3 rounded text-green-400 overflow-x-auto text-sm">
              <code>{translatedCode || codeBlock}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotGeneral;
