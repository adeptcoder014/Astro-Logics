"use client";

import { useState } from "react";
import puter from "@heyputer/puter.js";

export default function PuterAIPage() {
  // LLM State
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Video State
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

const handleChatSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!chatInput.trim()) return;

  setIsChatLoading(true);
  setChatResponse("");

  try {
    const response = await puter.ai.chat(chatInput);
    
    // Check if the response is the object React is complaining about
    if (response && typeof response === 'object' && 'text' in response) {
      setChatResponse((response as any).text); // Extract the string safely
    } else {
      setChatResponse(response.toString()); // Fallback for raw string
    }

  } catch (error) {
    console.error("LLM Error:", error);
    setChatResponse("Failed to generate response. Please try again.");
  } finally {
    setIsChatLoading(false);
  }
};

  // 2. Text-to-Speech (TTS) Handler
  const handlePlayTTS = async () => {
    if (!chatResponse) return;
    setIsSpeaking(true);

    try {
      // puter.ai.txt2speech returns an audio element directly
      const audio: HTMLAudioElement = await puter.ai.txt2speech(chatResponse);
      audio.play();
      audio.onended = () => setIsSpeaking(false);
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(false);
    }
  };

  // 3. Video Generation Handler
  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPrompt.trim()) return;

    setIsVideoLoading(true);
    setVideoSrc(null);

    try {
      // puter.ai.txt2vid returns a video element directly
      // Passing 'true' as the second argument enables test mode (no credit consumption)
      const videoElement: HTMLVideoElement = await puter.ai.txt2vid(videoPrompt, true);
      
      if (videoElement && videoElement.src) {
        setVideoSrc(videoElement.src);
      } else {
        throw new Error("No video source found");
      }
    } catch (error) {
      console.error("Video Gen Error:", error);
      alert("Failed to generate video.");
    } finally {
      setIsVideoLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ color: "#333" }}>Next.js + Puter.js AI Studio</h1>
        <p style={{ color: "#666" }}>Zero-config Text LLM, TTS, and Video Generation</p>
      </header>

      {/* --- SECTION 1: LLM CHAT & TTS --- */}
      <section style={{ background: "#f9f9f9", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <h2 style={{ marginTop: 0 }}>1. AI Text Chat & Voice Reader</h2>
        <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask the LLM anything..."
            style={{ flex: 1, padding: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button 
            type="submit" 
            disabled={isChatLoading}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "4px", border: "none", background: "#0070f3", color: "#fff", cursor: "pointer" }}
          >
            {isChatLoading ? "Thinking..." : "Ask AI"}
          </button>
        </form>

        {chatResponse && (
          <div style={{ background: "#fff", padding: "1rem", borderRadius: "4px", border: "1px solid #eee" }}>
            <p style={{ whiteSpace: "pre-wrap", margin: "0 0 1rem 0" }}>{chatResponse}</p>
            <button
              onClick={handlePlayTTS}
              disabled={isSpeaking}
              style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #0070f3", background: isSpeaking ? "#eee" : "#fff", color: "#0070f3", cursor: "pointer" }}
            >
              {isSpeaking ? "🔊 Speaking..." : "🔊 Read Response Out Loud (TTS)"}
            </button>
          </div>
        )}
      </section>

      {/* --- SECTION 2: VIDEO LLM (TEXT TO VIDEO) --- */}
      <section style={{ background: "#f9f9f9", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <h2 style={{ marginTop: 0 }}>2. AI Text-to-Video Generator</h2>
        <form onSubmit={handleGenerateVideo} style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          <input
            type="text"
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder="A drone shot flying over a calm ocean at sunset..."
            style={{ flex: 1, padding: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button 
            type="submit" 
            disabled={isVideoLoading}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "4px", border: "none", background: "#10b981", color: "#fff", cursor: "pointer" }}
          >
            {isVideoLoading ? "Generating..." : "Generate Video"}
          </button>
        </form>

        {isVideoLoading && <p style={{ color: "#666", fontStyle: "italic" }}>Creating your video chunk by chunk (this may take a minute)...</p>}

        {videoSrc && (
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <video 
              src={videoSrc} 
              controls 
              autoPlay 
              loop 
              style={{ width: "100%", maxHeight: "400px", borderRadius: "6px", background: "#000" }} 
            />
          </div>
        )}
      </section>
    </main>
  );
}