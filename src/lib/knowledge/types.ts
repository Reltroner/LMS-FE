export type KnowledgeSourceType = "course" | "path" | "lesson";

export type KnowledgeChunk = Readonly<{
  id: string;
  courseSlug: string;
  pathSlug?: string;
  lessonId?: string;
  lessonSlug?: string;
  sectionId?: string;
  sourceType: KnowledgeSourceType;
  title: string;
  heading?: string;
  content: string;
  tags: readonly string[];
  sourceUrl: string;
  visibility: "public";
  contentHash: string;
}>;

export type KnowledgeIndex = Readonly<{
  schemaVersion: 1;
  indexVersion: string;
  visibility: "public";
  courseCount: number;
  lessonCount: number;
  pathCount: number;
  chunkCount: number;
  chunks: readonly KnowledgeChunk[];
}>;

export type RetrievalScope = Readonly<{
  visibility?: "public";
  courseSlug?: string;
  sourceTypes?: readonly KnowledgeSourceType[];
}>;

export type RetrievalQueryInput = Readonly<{
  query: string;
  scope?: RetrievalScope;
  limit?: number;
  minScore?: number;
}>;

export type KnowledgeSearchResult = Readonly<{
  chunkId: string;
  title: string;
  snippet: string;
  content: string;
  sourceUrl: string;
  sourceType: KnowledgeSourceType;
  relevance: number;
  courseSlug: string;
  pathSlug?: string;
  lessonId?: string;
  lessonSlug?: string;
  sectionId?: string;
  heading?: string;
}>;

export type KnowledgeCitation = Readonly<{
  chunkId: string;
  title: string;
  heading?: string;
  sourceUrl: string;
  sourceType: KnowledgeSourceType;
  lessonId?: string;
  snippet: string;
}>;

export type ConversationTurn = Readonly<{
  role: "user" | "assistant";
  content: string;
}>;

export type KnowledgeSearchRequest = Readonly<{
  query: string;
  limit?: number;
  scope?: RetrievalScope;
}>;

export type KnowledgeSearchResponse = Readonly<{
  requestId: string;
  indexVersion: string;
  query: string;
  results: readonly KnowledgeSearchResult[];
}>;

export type KnowledgeAnswerRequest = Readonly<{
  question: string;
  history?: readonly ConversationTurn[];
}>;

export type RetrievalStatus = "grounded" | "no_evidence" | "refused";
export type GenerationStatus = "generated" | "retrieval_only" | "abstained" | "refused" | "unavailable";

export type KnowledgeAnswerResponse = Readonly<{
  requestId: string;
  indexVersion: string;
  question: string;
  answer: string;
  citations: readonly KnowledgeCitation[];
  retrievalStatus: RetrievalStatus;
  generationStatus: GenerationStatus;
  retrievedChunks: readonly KnowledgeSearchResult[];
  error?: string;
}>;

export type ModelGenerationInput = Readonly<{
  question: string;
  systemPrompt: string;
  groundedContext: string;
  retrievedChunks: readonly KnowledgeSearchResult[];
  history: readonly ConversationTurn[];
  signal?: AbortSignal;
}>;

export type ModelGenerationOutput = Readonly<{
  answer: string;
  citedChunkIds?: readonly string[];
  citedUrls?: readonly string[];
}>;

export type KnowledgeModelAdapter = {
  readonly providerName: string;
  generateAnswer(input: ModelGenerationInput): Promise<ModelGenerationOutput>;
};
