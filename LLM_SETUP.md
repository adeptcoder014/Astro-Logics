# Local LLM Setup Guide

## Project Structure
```
/llm
  ├── llama-cpp/          # Compiled llama.cpp binaries & DLLs
  │   └── llama-server.exe  # Server executable
  ├── models/             # GGUF model files
  │   └── model.gguf      # Quantized model (~5-7GB)
  └── providers/          # LLM provider implementations
      └── provider.ts     # LangChain provider wrapper
```

## Startup Flow

### Step 1: Start llama.cpp Server (Terminal 1)

**PowerShell:**
```powershell
cd D:\Dev\astroLogics
.\start-llama-server.ps1
```

**What this does:**
- Starts `llama-server.exe` with `model.gguf`
- Exposes OpenAI-compatible API on `http://localhost:8000/v1`
- Server listens for HTTP requests

**Output should show:**
```
Starting llama.cpp server...
Model: .\llm\models\model.gguf
Server will listen on: http://localhost:8000
...
srv  : listening on http://0.0.0.0:8000
```

### Step 2: Start Next.js App (Terminal 2)

```powershell
cd D:\Dev\astroLogics
npm run dev
```

**What this does:**
- Starts Next.js dev server on `http://localhost:3000`
- Connects to local llama.cpp on `http://localhost:8000/v1`
- Uses provider chain: local → ollama → openai

## Configuration

### Environment Variables (.env)
```
# Primary: Local llama.cpp
LLM_PROVIDER=local
LLAMA_CPP_URL=http://localhost:8000/v1
LLAMA_CPP_MODEL=local-model
USE_LOCAL_LLM=true

# Fallback: Ollama (if running on port 11434)
OLLAMA_URL=http://localhost:11434/v1
OLLAMA_MODEL=glm-5:cloud

# Fallback: OpenAI (requires API key)
# OPENAI_API_KEY=sk-...
```

## Provider Chain (Automatic Fallback)

The system tries providers in this order:
1. **Local llama.cpp** → `http://localhost:8000/v1`
2. **Ollama** → `http://localhost:11434/v1`
3. **OpenAI** → Uses `OPENAI_API_KEY` environment variable

If local provider is running, it will be used. If it's not available, falls back to next provider.

## llama-server Configuration

### Script Parameters
```powershell
-m "$modelPath"          # Model GGUF file path
-ngl 0                   # Number of GPU layers (0=CPU, 40+=GPU)
-n 2048                  # Max tokens to generate
-t 8                     # Number of CPU threads
--port 8000              # API port
--host 0.0.0.0           # Bind to all interfaces
```

### Modify for GPU Acceleration
Edit `start-llama-server.ps1` and change:
```powershell
-ngl 0          # CPU only (current)
-ngl 33         # GPU acceleration (NVIDIA/AMD)
```

## Troubleshooting

### Server won't start
- Ensure `model.gguf` exists in `/llm/models/`
- Check if port 8000 is already in use
- Verify DLL files are in `/llm/llama-cpp/`

### "Connection refused" error in app
- Confirm llama-server is running (Terminal 1)
- Check port is 8000 (not 8080)
- Try accessing `http://localhost:8000` in browser

### Slow inference
- Increase threads: Change `-t 8` to `-t 16` in script
- Use GPU: Change `-ngl 0` to `-ngl 33`
- Use smaller model: Replace `model.gguf` with smaller variant

### Falls back to Ollama/OpenAI
- Verify llama-server is running
- Check `.env` LLAMA_CPP_URL is correct
- Restart Next.js dev server

## Performance Tips

1. **First inference is slower** (model loading into memory)
2. **CPU inference** takes 10-30 seconds per response
3. **GPU acceleration** reduces to 1-5 seconds (requires CUDA/ROCm)
4. **Smaller models** are faster but less accurate

## API Compatibility

llama-server exposes OpenAI-compatible endpoints:
- `POST /v1/chat/completions` - Chat completions
- `POST /v1/embeddings` - Text embeddings
- `GET /v1/models` - List available models

This allows seamless switching between local and cloud LLMs.

## Next Steps

1. Download/place a GGUF model in `/llm/models/model.gguf`
2. Run `.\start-llama-server.ps1`
3. Verify server is running on port 8000
4. Start Next.js with `npm run dev`
5. Access app at `http://localhost:3000`
