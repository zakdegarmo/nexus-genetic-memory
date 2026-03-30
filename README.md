# Nexus: Genetic Memory Server (OSS)

[![Framework: MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)
[![Model: Ollama](https://img.shields.io/badge/Local_AI-Ollama-orange.svg)](https://ollama.ai)

> "A bridge between the ephemeral and the eternal."

Nexus is a **Model Context Protocol (MCP)** server that implements a **Fractal Semantic Genome** for AI agents. It serves as a persistent, self-healing "subconscious" for systems like **MyOS**, **MemOS**, and **MemTensor**.

Unlike standard vector databases, Nexus is built on a **10x10 Matrix of Philosophical Pillars** (Self, Logic, Unity, Thought, etc.), allowing agents to store and retrieve data with deep ontological grounding.

## 🧬 Features

*   **Fractal Semantic Addressing**: Direct mapping of concepts to a symbolic genome.
*   **Self-Healing (Scrubbing)**: Automatically repairs "semantic gaps" by re-vectorizing broken or mock entries using local LLM embeddings.
*   **Historian Ingestion**: Automatically crawls and indexes historical project logs and artifacts from the local environment.
*   **RTX-Accelerated**: Optimized for local GPU inference via **Ollama** (`mxbai-embed-large`).
*   **Persistence**: Secure local storage in the user's AppData/Home directory.

## 🚀 Vision: The MemOS Connection

Nexus is the evolution of the **MemCube** concept. While traditional MemCubes provide structured context blocks, Nexus provides the **Genetic Braid** that links them. It allows an agent to understand not just *what* was done, but *why* it fits into the broader ontological structure of the system.

## 🛠️ Installation

1.  **Requirement**: Install [Ollama](https://ollama.ai) and pull the embedding model:
    ```bash
    ollama pull mxbai-embed-large
    ```

2.  **Clone & Setup**:
    ```bash
    git clone https://github.com/zakde/nexus-genetic-memory.git
    cd nexus-genetic-memory
    npm install
    ```

3.  **Bootstrap Your History**:
    ```bash
    npx tsx ./ingest_conversations.ts
    npx tsx ./ingest_ontology.ts
    ```

4.  **Launch**:
    ```bash
    npx tsx ./index.ts
    ```

## 🧠 The Mitochondrial Genome

The server utilizes a 1110-node ontology XML as its "Ground Truth". Every interaction recorded is automatically tagged with its corresponding Genetic Pillar (Logic, Transcendence, Mastery, etc.), creating a content-addressable memory that feels "alive" to the AI.

---

*Part of the AntiGravity / MyOS ecosystem.*
