// src/llm/vision.ts
import axios from 'axios';

export async function generateVision(prompt: string): Promise<Buffer> {
  const response = await axios.post('http://localhost:8081/generate', 
    { prompt }, 
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(response.data);
}