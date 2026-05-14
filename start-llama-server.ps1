# Start local llama.cpp server with the GGUF model
# This script runs llama-server.exe with the model.gguf file

$llamaCppPath = ".\llm\llama-cpp"
$modelPath = ".\llm\models\model.gguf"
$serverExe = "$llamaCppPath\llama-server.exe"

# Check if llama-server.exe exists
if (-not (Test-Path $serverExe)) {
    Write-Host "ERROR: llama-server.exe not found at $serverExe" -ForegroundColor Red
    exit 1
}

# Check if model.gguf exists
if (-not (Test-Path $modelPath)) {
    Write-Host "ERROR: model.gguf not found at $modelPath" -ForegroundColor Red
    exit 1
}

Write-Host "Starting llama.cpp server..." -ForegroundColor Green
Write-Host "Model: $modelPath" -ForegroundColor Cyan
Write-Host "Server will listen on: http://localhost:8000" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Green

# Start the server
# -m: model path
# -ngl: number of layers to offload to GPU (0 = CPU only, 40+ = GPU)
# -n: maximum number of tokens to generate
# -t: number of threads
# --port: port to listen on
# --host: host to bind to
# --api-key: API key for OpenAI compatibility (set to dummy for no auth)
& $serverExe `
    -m "$modelPath" `
    -ngl 0 `
    -n 2048 `
    -t 8 `
    --port 8000 `
    --host 0.0.0.0 `
    --api-key "dummy"

Write-Host "Server stopped" -ForegroundColor Yellow
