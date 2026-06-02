'use client'
import React from "react";

export default function GPTImageMiniGenerator() {
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const [error, setError] = React.useState("");

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      // Load Puter dynamically because apparently modern web apps
      // enjoy summoning scripts at runtime like tiny digital necromancers.
      if (!window.puter) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://js.puter.com/v2/";
          script.async = true;

          script.onload = resolve;
          script.onerror = reject;

          
          document.body.appendChild(script);
        });
      }

      const img = await window.puter.ai.txt2img(prompt, {
        model: "gpt-image-1-mini",
        quality: "low",
      });

      setImageUrl(img.src);
    } catch (err) {
      console.error(err);
      setError("Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">GPT Image 1 Mini Generator</h1>
          <p className="text-white/60 mt-2">
            Type prompt. Receive pixels. Humanity completed the cave painting arc.
          </p>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your image..."
          className="w-full h-40 rounded-2xl bg-black/40 border border-white/10 p-4 outline-none resize-none"
        />

        <button
          onClick={generateImage}
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-white text-black font-semibold disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {imageUrl && (
          <div className="space-y-4">
            <img
              src={imageUrl}
              alt="Generated"
              className="w-full rounded-3xl border border-white/10"
            />

            <a
              href={imageUrl}
              download
              className="inline-block px-5 py-3 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition"
            >
              Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
