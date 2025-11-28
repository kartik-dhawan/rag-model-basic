export interface DocumentChunk {
  content: string;
  source: string;
  pageNumber?: number;
  chunkIndex: number;
  metadata?: Record<string, any>;
}

export interface QuestionInput {
  question: string;
}

export interface Answer {
  answer: string;
  sources?: string[];
}

export interface VectorStore {
  chunks: DocumentChunk[];
  embeddings: number[][];
}

