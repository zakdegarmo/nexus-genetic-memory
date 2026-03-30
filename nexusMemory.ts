import * as fs from 'fs';
import * as path from 'path';
import { FRACTAL_GENOME, getFractalAddress } from './fractalGenome.js';

interface MemoryItem {
    id: string;
    ts: number;
    content: string;
    origin: 'who' | 'what' | 'where' | 'when' | 'why' | 'how' | 'general';
    address?: string; // 8-digit rune sequence
    index?: number;   // Calculated absolute index
    vector: number[];
    tags: string[];
    needsEmbedding?: boolean;
}

interface MemoryCore {
    interactions: MemoryItem[];
    metadata: Record<string, any>;
}

export class NexusMemory {
    private storagePath: string;
    private memory: MemoryCore = { interactions: [], metadata: {} };

    constructor(storagePath: string) {
        this.storagePath = storagePath;
        this.load();
    }

    private load() {
        if (fs.existsSync(this.storagePath)) {
            try {
                this.memory = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
            } catch (e) {
                console.error("[NexusMemory] Load failed, starting fresh.");
            }
        }
    }

    /**
     * Scans content for keywords defined in the Fractal Genome.
     * Returns a list of tags in the format "Pillar:Matrix:Glyph"
     */
    private scanGenome(content: string): string[] {
        const tags: Set<string> = new Set();
        const lowerContent = content.toLowerCase();

        for (const [pillar, matrices] of Object.entries(FRACTAL_GENOME)) {
            for (const [matrix, glyphs] of Object.entries(matrices)) {
                for (const glyph of glyphs) {
                    if (content.toLowerCase().includes(glyph.toLowerCase())) {
                        tags.add(`${pillar}:${matrix}`);
                        tags.add(glyph);
                    }
                }
            }
        }
        return Array.from(tags);
    }

    public save() {
        const dir = path.dirname(this.storagePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.storagePath, JSON.stringify(this.memory, null, 2));
    }

    public addInteraction(content: string, vector: number[], origin: MemoryItem['origin'] = 'general', tags: string[] = [], address?: string) {
        // Auto-tag based on Genome
        const genomeTags = this.scanGenome(content);
        const combinedTags = Array.from(new Set([...tags, ...genomeTags]));

        const item: MemoryItem = {
            id: Math.random().toString(36).substring(7),
            ts: Date.now(),
            content,
            origin,
            address,
            index: address ? getFractalAddress(address) : undefined,
            vector,
            tags: combinedTags
        };
        this.memory.interactions.push(item);
        this.save();
    }

    public query(queryVector: number[], limit: number = 5): MemoryItem[] {
        const scored = this.memory.interactions.map(item => ({
            item,
            score: this.cosineSimilarity(queryVector, item.vector)
        }));

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(s => s.item);
    }

    public async scrub(ollama: any) {
        let count = 0;
        for (const item of this.memory.interactions) {
            // Check if vector is missing, all zeros, or marked for re-embedding
            const isMock = item.vector.every(v => v === 0) || item.needsEmbedding;
            if (isMock) {
                console.error(`[NexusMemory] Scrubbing semantic gap for: ${item.id} (${item.tags[0] || 'No Tag'})`);
                try {
                    const realVector = await ollama.getEmbedding(item.content);
                    item.vector = realVector;
                    delete item.needsEmbedding;
                    count++;
                } catch (e) {
                    console.error(`[NexusMemory] Failed to scrub ${item.id}`);
                }
            }
        }
        if (count > 0) {
            console.error(`[NexusMemory] Successfully realized ${count} semantic patterns.`);
            this.save();
        }
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (vecA.length !== vecB.length) return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
