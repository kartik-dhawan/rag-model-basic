import OpenAI from 'openai';
import { DocumentChunk, VectorStore } from '../../types';
import { OPENAI_MODELS, EMBEDDING_CONFIG } from '../../constants';

/**
 * Creates a connection to OpenAI's API using the API key from environment variables.
 * This connection is used to send text to OpenAI and get back numerical representations
 * that capture the meaning of the text.
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
}

/**
 * Converts text chunks into numerical vectors (embeddings) that represent their meaning.
 * These vectors allow us to do math-based searches - similar meanings will have
 * similar numbers. Processes chunks in batches to avoid overwhelming the API and
 * adds small delays between batches to stay within rate limits.
 *
 * @param chunks - Array of text chunks to convert
 * @param openai - The OpenAI client connection
 * @returns Array of numerical vectors, one for each chunk
 */
export async function generateEmbeddings(
  chunks: DocumentChunk[],
  openai: OpenAI
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < chunks.length; i += EMBEDDING_CONFIG.BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_CONFIG.BATCH_SIZE);
    const texts = batch.map((chunk) => chunk.content);

    try {
      const response = await openai.embeddings.create({
        model: OPENAI_MODELS.EMBEDDING,
        input: texts,
      });

      const batchEmbeddings = response.data.map((item) => item.embedding);
      embeddings.push(...batchEmbeddings);

      if (i + EMBEDDING_CONFIG.BATCH_SIZE < chunks.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, EMBEDDING_CONFIG.BATCH_DELAY_MS)
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to generate embeddings: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  return embeddings;
}

/**
 * Takes text chunks and creates a searchable store by converting each chunk
 * into a vector. The resulting store pairs each chunk with its vector so we
 * can quickly find similar chunks later.
 *
 * @param chunks - Text chunks to convert into a searchable format
 * @returns Object containing both the chunks and their vector representations
 */
export async function createVectorStore(
  chunks: DocumentChunk[]
): Promise<VectorStore> {
  const openai = getOpenAIClient();
  const embeddings = await generateEmbeddings(chunks, openai);

  return {
    chunks,
    embeddings,
  };
}

/**
 * Converts a single question into a vector so we can compare it against
 * all the document chunks to find the most relevant ones.
 *
 * @param query - The user's question as a string
 * @returns A numerical vector representing the question's meaning
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const openai = getOpenAIClient();

  try {
    const response = await openai.embeddings.create({
      model: OPENAI_MODELS.EMBEDDING,
      input: query,
    });

    return response.data[0].embedding;
  } catch (error) {
    throw new Error(
      `Failed to generate query embedding: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
