/// <reference types="node" />

import { RAGService } from '../services/ragService';
import { Resolvers } from '../generated/graphql';

const ragService = new RAGService();

ragService.initialize().catch((error) => {
  console.error('Failed to initialize RAG service on startup:', error);
});

/**
 * GraphQL resolvers that handle incoming queries.
 * The askQuestion resolver takes a question string, validates it,
 * passes it to the RAG service to get an answer, and returns the result.
 */
export const resolvers: Resolvers = {
  Query: {
    askQuestion: async (_parent, args) => {
      try {
        await ragService.initialize();

        if (!args.question || args.question.trim().length === 0) {
          throw new Error('Question cannot be empty');
        }

        const result = await ragService.askQuestion(args.question.trim());
        return {
          __typename: 'Answer',
          answer: result.answer,
          sources: result.sources || null,
        };
      } catch (error) {
        console.error('Error in askQuestion resolver:', error);
        throw new Error(
          `Failed to generate answer: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },
  },
};
