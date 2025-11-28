import { gql } from 'graphql-tag';
import * as fs from 'fs';
import * as path from 'path';

// Load schema from .graphql file for codegen compatibility
const schemaPath = path.join(__dirname, 'schema.graphql');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
export const typeDefs = gql(schemaContent);

