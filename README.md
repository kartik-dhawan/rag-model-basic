# RAG GraphQL Service

A Retrieval-Augmented Generation (RAG) system for Question Answering built with GraphQL, TypeScript, and OpenAI. This system enables users to ask questions and retrieve accurate, context-aware answers from AI research papers.

## Features

- **Document Preprocessing**: Loads, chunks, and vectorizes PDF and TXT documents
- **Retrieval System**: Semantic search using cosine similarity on embeddings
- **Answer Generation**: Uses GPT-4o Mini to generate well-formulated answers
- **Source Attribution**: Answers reference the correct sections of research papers
- **GraphQL API**: Clean, type-safe API for querying the RAG system

## Technology Stack

- **GraphQL**: Apollo Server 4
- **TypeScript**: Type-safe development
- **GraphQL Code Generator**: Auto-generates TypeScript types from schema
- **OpenAI API**:
  - GPT-4o Mini for answer generation
  - text-embedding-3-small for embeddings
- **Document Processing**: pdf-parse for extracting text from PDFs

## Project Structure

```
rag-model-basic/
├── docs/                          # PDF research papers
│   ├── 1706.03762v7.pdf
│   ├── 2005.11401v4.pdf
│   └── 2005.14165v4.pdf
├── src/
│   ├── methods/
│   │   ├── preprocessing/
│   │   │   ├── pdfLoader.ts      # PDF loading and text extraction
│   │   │   ├── chunker.ts         # Text chunking with overlap
│   │   │   └── vectorizer.ts      # Embedding generation
│   │   ├── retrieval/
│   │   │   └── retriever.ts       # Semantic search and retrieval
│   │   └── generation/
│   │       └── answerGenerator.ts # LLM-based answer generation
│   ├── services/
│   │   └── ragService.ts          # Main RAG orchestration service
│   ├── schema/
│   │   ├── schema.graphql         # GraphQL schema definition
│   │   └── index.ts              # Schema loader
│   ├── resolvers/
│   │   └── queryResolver.ts       # GraphQL resolvers (type-safe)
│   ├── generated/
│   │   └── graphql.ts            # Generated TypeScript types (auto-generated)
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── server.ts                  # Apollo Server setup
├── codegen.yml                    # GraphQL Code Generator config
├── package.json
├── tsconfig.json
└── README.md
```

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Install dependencies**:

   ```bash
   cd rag-model-basic
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the `rag-model-basic` directory:

   ```env
   PORT=4000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Ensure document files are in the correct location**:
   The PDF files should be in the `docs/` directory inside `rag-model-basic`:

   ```
   rag-model-basic/
   ├── docs/
   │   ├── 1706.03762v7.pdf
   │   ├── 2005.11401v4.pdf
   │   └── 2005.14165v4.pdf
   ├── src/
   └── ...
   ```

   **To test with your own documents**: Simply add PDF files to the `docs/` directory inside the `rag-model-basic` root folder. The system will automatically load all PDF files from this directory when it starts up. After adding new documents, restart the server to process them.

## Usage

### Development Mode

Run the server in development mode with hot reloading:

```bash
npm run dev
```

### Production Mode

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

The server will start on `http://localhost:4000` (or the port specified in your `.env` file).

### GraphQL Playground

Once the server is running, you can access the GraphQL Playground at:

```
http://localhost:4000/graphql
```

### Example Query

```graphql
query {
  askQuestion(
    question: "What are the main components of a RAG model, and how do they interact?"
  ) {
    answer
    sources
  }
}
```

### Testing with Your Own Documents

To test the system with your own documents, simply add PDF files to the `docs/` directory inside the `rag-model-basic` root folder:

```
rag-model-basic/
├── docs/
│   ├── your-document-1.pdf
│   ├── your-document-2.pdf
│   └── ...
```

After adding new documents, restart the server to process them. The system will automatically:

- Load all PDF files from the `docs/` directory
- Process and index them for searching
- Make them available for question answering

**Note**: The system processes all PDF files in the `docs/` directory on startup, so make sure to place only the documents you want to query.

### Sample Questions to Test

1. "What are the main components of a RAG model, and how do they interact?"
2. "What are the two sub-layers in each encoder layer of the Transformer model?"
3. "Explain how positional encoding is implemented in Transformers and why it is necessary."
4. "Describe the concept of multi-head attention in the Transformer architecture. Why is it beneficial?"
5. "What is few-shot learning, and how does GPT-3 implement it during inference?"

## API Reference

### Query: `askQuestion`

Ask a question and get an answer with source attribution.

**Arguments**:

- `question` (String!, required): The question to ask

**Returns**:

- `answer` (String!): The generated answer
- `sources` ([String!]): Array of source document filenames (PDF or TXT) used to generate the answer

**Example Response**:

```json
{
  "data": {
    "askQuestion": {
      "answer": "A RAG model consists of two main components: a retriever and a generator...",
      "sources": ["1706.03762v7.pdf", "2005.11401v4.pdf"]
    }
  }
}
```

## How It Works

1. **Initialization**: On first startup, the system:

   - Loads all PDF files from the `docs/` directory
   - Chunks the documents into smaller pieces (1000 characters with 200 character overlap)
   - Generates embeddings for each chunk using `text-embedding-3-small`
   - Stores everything in memory for fast retrieval

2. **Query Processing**: When a question is asked:
   - Generates an embedding for the question
   - Finds the top 5 most similar document chunks using cosine similarity
   - Passes the question and relevant chunks to GPT-4o Mini
   - Returns the generated answer with source citations

## Cost Optimization

This implementation uses cost-effective models:

- **GPT-4o Mini**: For answer generation (lower cost than GPT-4)
- **text-embedding-3-small**: For embeddings (most cost-effective embedding model)

## Error Handling

The system includes comprehensive error handling:

- Validates OpenAI API key on startup
- Handles PDF loading errors gracefully
- Provides clear error messages for GraphQL queries
- Validates question input (non-empty)

## Health Check

A health check endpoint is available at:

```
GET http://localhost:4000/health
```

## Development

### Type Checking

Run TypeScript type checking without building:

```bash
npm run type-check
```

### GraphQL Code Generation

This project uses GraphQL Code Generator to generate TypeScript types from the GraphQL schema. This ensures type safety between your schema and resolvers.

**Generate types:**

```bash
npm run codegen
```

**Watch mode (regenerates on schema changes):**

```bash
npm run codegen:watch
```

The generated types are located in `src/generated/graphql.ts`. These types are automatically used by the resolvers to ensure type safety.

**Note:** Always run `npm run codegen` after modifying `src/schema/schema.graphql` to regenerate the types.

### Project Structure Notes

- All source code is in `src/`
- Compiled JavaScript goes to `dist/`
- The system uses singleton pattern for the RAG service to avoid re-initialization

## License

This project is part of a gen-ai course assignment.
