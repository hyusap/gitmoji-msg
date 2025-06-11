import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { gitmojis } from './gitmojis.js';
import { GitChangeAnalysis } from './git.js';

const CommitSuggestionSchema = z.object({
  gitmoji: z.string().describe('The gitmoji emoji character (e.g., "🎨")'),
  gitmojiCode: z.string().describe('The gitmoji code (e.g., ":art:")'),
  scope: z.string().optional().describe('Optional scope in parentheses (e.g., "api", "ui", "auth") - no parentheses included'),
  message: z.string().describe('Brief explanation of the change (just the message part, no emoji or scope)'),
  description: z.string().describe('Concise technical description - only if substantial changes warrant explanation'),
  confidence: z.number().min(0).max(100).describe('Confidence score 0-100'),
});

const CommitSuggestionsSchema = z.object({
  suggestions: z.array(CommitSuggestionSchema).min(1).max(3).describe('1-3 ranked commit message suggestions'),
});

export type CommitSuggestion = z.infer<typeof CommitSuggestionSchema>;
export type CommitSuggestions = z.infer<typeof CommitSuggestionsSchema>;

export interface AIConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  apiKey?: string;
}

export class AICommitGenerator {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async generateCommitSuggestions(analysis: GitChangeAnalysis): Promise<CommitSuggestions> {
    const gitmojiContext = this.buildGitmojiContext();
    const prompt = this.buildAnalysisPrompt(analysis, gitmojiContext);

    try {
      const result = await generateObject({
        model: this.getModel(),
        prompt,
        schema: CommitSuggestionsSchema,
        temperature: 0.3,
      });

      return result.object;
    } catch (error) {
      throw new Error(`AI generation failed: ${error}`);
    }
  }

  private getModel() {
    switch (this.config.provider) {
      case 'openai':
        return openai(this.config.model || 'gpt-4o-mini');
      default:
        throw new Error(`Unsupported AI provider: ${this.config.provider}`);
    }
  }

  private buildGitmojiContext(): string {
    return gitmojis
      .map(g => `${g.emoji} ${g.code}: ${g.description}`)
      .join('\\n');
  }

  private buildAnalysisPrompt(analysis: GitChangeAnalysis, gitmojiContext: string): string {
    return `You are an expert at creating conventional commit messages using gitmojis. 

AVAILABLE GITMOJIS:
${gitmojiContext}

FILES CHANGED: ${analysis.filePaths.join(', ')}
FILE TYPES: ${analysis.fileTypes.join(', ')}

GIT DIFF:
${analysis.diff}

INSTRUCTIONS:
1. Analyze the git diff and select the most appropriate gitmoji
2. Break down the commit message into separate components:
   - gitmoji: The emoji character
   - gitmojiCode: The :code: version
   - scope: Optional scope without parentheses (e.g., "api", "ui", "auth") - only if clearly applicable
   - message: Brief explanation (lowercase, no period, specific action)
3. Message requirements:
   - Be concise and specific about what changed
   - Start with verb (add, fix, update, remove, refactor)
   - No emoji, no scope, no fluff
   - Examples: "add user authentication", "fix memory leak in parser", "update API endpoints"
4. Description requirements:
   - Only include if changes are substantial/complex
   - Be information-dense, no marketing speak
   - Focus on technical details: what changed, why, impact
   - Keep short if changes are simple
   - Examples: "Replaces deprecated crypto.createHash with Node 18+ webcrypto API"
5. Scope guidelines:
   - Only use if change is clearly bounded to a specific area
   - Use common terms: api, ui, auth, db, config, cli, docs
   - Leave empty for general/mixed changes
6. Assign confidence based on gitmoji appropriateness

Generate commit message suggestions now:`;
  }
}