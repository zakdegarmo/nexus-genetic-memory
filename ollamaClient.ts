import { ollama } from "./ollamaClient.js";
import axios from "axios";

/**
 * Basic Ollama Helper for Semantic Transformation
 */
export const ollama = {
    async getEmbedding(text: string): Promise<number[]> {
        const response = await axios.post("http://localhost:11434/api/embeddings", {
            model: "mxbai-embed-large",
            prompt: text
        });
        return response.data.embedding;
    },
    async summarize(text: string): Promise<string> {
        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "mxbai-embed-large", // Or your preferred chat model
            prompt: `Summarize this interaction fragment for long-term memory: ${text}`,
            stream: false
        });
        return response.data.response;
    }
}
