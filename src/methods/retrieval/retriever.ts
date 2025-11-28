import { DocumentChunk, VectorStore } from '../../types';
import { generateQueryEmbedding } from '../preprocessing/vectorizer';
import { RETRIEVAL_CONFIG } from '../../constants';

/**
 * Calculates how similar two vectors are using cosine similarity.
 * This measures the angle between vectors - similar meanings will point
 * in similar directions, giving a score between -1 and 1 where 1 means
 * identical and 0 means unrelated.
 *
 * @param vecA - First vector to compare
 * @param vecB - Second vector to compare
 * @returns Similarity score between -1 and 1
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Takes a user's question and finds the most relevant document chunks by comparing
 * the question's vector against all stored chunk vectors. Returns the top matches
 * sorted by how similar they are to the question.
 *
 * @param query - The user's question
 * @param vectorStore - All the document chunks and their vectors
 * @param topK - How many top results to return (default 5)
 * @returns Array of the most relevant document chunks
 */
export async function retrieveRelevantChunks(
  query: string,
  vectorStore: VectorStore,
  topK: number = RETRIEVAL_CONFIG.DEFAULT_TOP_K
): Promise<DocumentChunk[]> {
  const queryEmbedding = await generateQueryEmbedding(query);

  const similarities = vectorStore.embeddings.map((embedding, index) => ({
    chunk: vectorStore.chunks[index],
    similarity: cosineSimilarity(queryEmbedding, embedding),
  }));

  const topChunks = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map((item) => item.chunk);

  return topChunks;
}
