import { DocumentChunk } from '../../types';
import { CHUNKING_CONFIG } from '../../constants';

/**
 * Takes a long piece of text and breaks it into smaller chunks that are easier
 * to work with. Uses paragraph breaks as natural splitting points to keep related
 * ideas together. Each chunk overlaps with the previous one a bit so we don't lose
 * context at the boundaries.
 *
 * @param text - The full text to break apart
 * @param source - The filename this text came from
 * @param chunkSize - Maximum characters per chunk (default 1000)
 * @param chunkOverlap - How many characters to repeat from previous chunk (default 200)
 * @returns Array of text chunks with metadata about where they came from
 */
export function chunkText(
  text: string,
  source: string,
  chunkSize: number = CHUNKING_CONFIG.DEFAULT_CHUNK_SIZE,
  chunkOverlap: number = CHUNKING_CONFIG.DEFAULT_CHUNK_OVERLAP
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphText = paragraph.trim();

    if (
      currentChunk.length + paragraphText.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.trim(),
        source,
        chunkIndex: chunkIndex++,
        metadata: {
          length: currentChunk.length,
        },
      });

      const overlapText = currentChunk.slice(-chunkOverlap);
      currentChunk = overlapText + '\n\n' + paragraphText;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraphText;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      source,
      chunkIndex: chunkIndex++,
      metadata: {
        length: currentChunk.length,
      },
    });
  }

  if (chunks.length === 0 && text.trim().length > 0) {
    chunks.push({
      content: text.trim(),
      source,
      chunkIndex: 0,
      metadata: {
        length: text.length,
      },
    });
  }

  return chunks;
}

/**
 * Processes multiple documents and breaks each one into chunks.
 * Just loops through all the documents and chunks each one separately,
 * then combines all the chunks into a single list.
 *
 * @param documents - Array of documents with their text and source filenames
 * @param chunkSize - Maximum characters per chunk
 * @param chunkOverlap - Characters to overlap between chunks
 * @returns All chunks from all documents combined into one array
 */
export function chunkDocuments(
  documents: Array<{ text: string; source: string }>,
  chunkSize: number = CHUNKING_CONFIG.DEFAULT_CHUNK_SIZE,
  chunkOverlap: number = CHUNKING_CONFIG.DEFAULT_CHUNK_OVERLAP
): DocumentChunk[] {
  const allChunks: DocumentChunk[] = [];

  for (const doc of documents) {
    const chunks = chunkText(doc.text, doc.source, chunkSize, chunkOverlap);
    allChunks.push(...chunks);
  }

  return allChunks;
}
