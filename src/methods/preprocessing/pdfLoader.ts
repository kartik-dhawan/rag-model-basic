import pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Reads a PDF file and extracts all the text content from it.
 * This is the first step in processing documents - we need to get the raw text
 * before we can do anything else with it.
 *
 * @param filePath - The full path to the PDF file on disk
 * @returns The extracted text content as a string
 */
export async function loadPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(
      `Failed to load PDF ${filePath}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Reads a TXT file and extracts all the text content from it.
 *
 * @param filePath - The full path to the TXT file on disk
 * @returns The extracted text content as a string
 */
export async function loadTXT(filePath: string): Promise<string> {
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    return text;
  } catch (error) {
    throw new Error(
      `Failed to load TXT ${filePath}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Scans the docs folder and loads all PDF and TXT files found there.
 * Figures out where the docs folder is relative to where the code is running,
 * then reads each document and extracts its text. Returns a list of documents with
 * their text content and the filename they came from.
 *
 * @param docsPath - Optional custom path to docs folder, otherwise uses default location
 * @returns Array of objects containing the text and source filename for each document
 */
export async function loadAllPDFs(
  docsPath?: string
): Promise<Array<{ text: string; source: string }>> {
  const documents: Array<{ text: string; source: string }> = [];

  let absoluteDocsPath: string;

  if (docsPath) {
    absoluteDocsPath = path.resolve(__dirname, docsPath);
  } else {
    // From src/methods/preprocessing/, go up to rag-model-basic/ and into docs/
    const ragModelBasicRoot = path.resolve(__dirname, '../../../');
    absoluteDocsPath = path.join(ragModelBasicRoot, 'docs');
  }

  try {
    const files = fs.readdirSync(absoluteDocsPath);
    const pdfFiles = files.filter((file) => file.endsWith('.pdf'));
    const txtFiles = files.filter((file) => file.endsWith('.txt'));
    const allFiles = [...pdfFiles, ...txtFiles];

    if (allFiles.length === 0) {
      throw new Error(`No PDF or TXT files found in ${absoluteDocsPath}`);
    }

    for (const file of allFiles) {
      const filePath = path.join(absoluteDocsPath, file);
      let text: string;

      if (file.endsWith('.pdf')) {
        text = await loadPDF(filePath);
      } else if (file.endsWith('.txt')) {
        text = await loadTXT(filePath);
      } else {
        continue; // Skip files that don't match expected extensions
      }

      documents.push({
        text,
        source: file,
      });
    }

    return documents;
  } catch (error) {
    throw new Error(
      `Failed to load documents from ${absoluteDocsPath}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
