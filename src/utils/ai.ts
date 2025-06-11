import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { gitmojis } from 'gitmojis';
import { GitChangeAnalysis } from './git.js';

const CommitSuggestionSchema = z.object({
  gitmoji: z.string().describe('The gitmoji emoji character (e.g., "🎨")'),
  gitmojiCode: z.string().describe('The gitmoji code (e.g., ":art:")'),
  message: z.string().describe('The commit message description'),
  reasoning: z.string().describe('Brief explanation for why this gitmoji was chosen'),
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
        return openai(this.config.model || 'gpt-4o-mini', {
          apiKey: this.config.apiKey || process.env.OPENAI_API_KEY,
        });
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

GIT CHANGE ANALYSIS:
- Files changed: ${analysis.filePaths.join(', ')}
- File types: ${analysis.fileTypes.join(', ')}
- Change description: ${analysis.changeDescription}
- Has new files: ${analysis.hasNewFiles}
- Has deleted files: ${analysis.hasDeletedFiles}
- Has modified files: ${analysis.hasModifiedFiles}
- Is feature: ${analysis.isFeature}
- Is bug fix: ${analysis.isBugFix}
- Is refactor: ${analysis.isRefactor}
- Is documentation: ${analysis.isDocumentation}
- Is test: ${analysis.isTest}
- Is config: ${analysis.isConfig}
- Is breaking change: ${analysis.isBreakingChange}

INSTRUCTIONS:
1. Analyze the git changes and select the most appropriate gitmoji(s)
2. Create 1-3 commit message suggestions ranked by relevance
3. Messages should be concise but descriptive (50-72 characters ideal)
4. Use conventional commit format when appropriate: type(scope): description
5. Consider the primary purpose of the changes when selecting gitmojis
6. Provide reasoning for your gitmoji selection
7. Assign confidence scores based on how well the gitmoji matches the changes

Generate commit message suggestions now:`;
  }
}