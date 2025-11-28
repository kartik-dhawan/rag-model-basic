/**
 * Constants used throughout the RAG system.
 * Centralizing these values makes it easier to update models and configuration.
 */

export const OPENAI_MODELS = {
  EMBEDDING: 'text-embedding-3-small',
  CHAT: 'gpt-4o-mini',
} as const;

export const EMBEDDING_CONFIG = {
  BATCH_SIZE: 100,
  BATCH_DELAY_MS: 100,
} as const;

export const CHUNKING_CONFIG = {
  DEFAULT_CHUNK_SIZE: 1000,
  DEFAULT_CHUNK_OVERLAP: 200,
} as const;

export const RETRIEVAL_CONFIG = {
  DEFAULT_TOP_K: 5,
} as const;

export const GENERATION_CONFIG = {
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1000,
} as const;
