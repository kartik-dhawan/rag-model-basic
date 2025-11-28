/// <reference types="node" />

import { Answer, VectorStore } from '../types';
import { retrieveRelevantChunks } from '../methods/retrieval/retriever';
import { generateAnswer } from '../methods/generation/answerGenerator';
import { loadAllPDFs } from '../methods/preprocessing/pdfLoader';
import { createVectorStore } from '../methods/preprocessing/vectorizer';
import { chunkDocuments } from '../methods/preprocessing/chunker';
import { CHUNKING_CONFIG, RETRIEVAL_CONFIG } from '../constants';

/**
 * Main service that handles the entire RAG workflow.
 * This class coordinates loading documents, creating searchable vectors, finding relevant
 * information, and generating answers using AI.
 */
export class RAGService {
  private vectorStore: VectorStore | null = null;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Sets up the RAG system by loading PDFs, breaking them into chunks, and converting
   * those chunks into numerical vectors that can be searched. This only runs once
   * and prevents multiple initializations from happening at the same time.
   */
  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.initialized && this.vectorStore) {
      return;
    }

    this.initializationPromise = this._initialize();
    await this.initializationPromise;
    this.initializationPromise = null;
  }

  /**
   * Internal method that does the actual work of setting up the system.
   * First loads all PDF files, then splits them into smaller pieces, and finally
   * converts each piece into a vector that represents its meaning.
   */
  private async _initialize(): Promise<void> {
    try {
      console.log('Loading PDF documents...');
      const documents = await loadAllPDFs();
      console.log(`Loaded ${documents.length} documents`);

      console.log('Breaking documents into chunks...');
      const chunks = chunkDocuments(
        documents,
        CHUNKING_CONFIG.DEFAULT_CHUNK_SIZE,
        CHUNKING_CONFIG.DEFAULT_CHUNK_OVERLAP
      );
      console.log(`Created ${chunks.length} chunks`);

      console.log('Converting chunks into searchable vectors...');
      this.vectorStore = await createVectorStore(chunks);
      console.log(`Generated ${this.vectorStore.embeddings.length} vectors`);

      this.initialized = true;
      console.log('RAG system ready');
    } catch (error) {
      console.error('Failed to initialize RAG system:', error);
      throw error;
    }
  }

  /**
   * Takes a user's question and finds the most relevant information from the loaded
   * documents, then uses AI to generate a complete answer. Also tracks which
   * documents were used to create the answer.
   *
   * @param question - The question the user wants answered
   * @returns An object containing the answer text and list of source documents
   */
  async askQuestion(question: string): Promise<Answer> {
    if (!this.initialized || !this.vectorStore) {
      await this.initialize();
    }

    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      const relevantChunks = await retrieveRelevantChunks(
        question,
        this.vectorStore,
        RETRIEVAL_CONFIG.DEFAULT_TOP_K
      );

      const answer = await generateAnswer(question, relevantChunks);

      const sources = Array.from(
        new Set(relevantChunks.map((chunk) => chunk.source))
      );

      return {
        answer,
        sources,
      };
    } catch (error) {
      throw new Error(
        `Failed to answer question: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
