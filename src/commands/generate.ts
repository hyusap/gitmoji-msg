import { Command, Flags } from '@oclif/core';
import { GitAnalyzer } from '../utils/git.js';
import { AICommitGenerator, CommitSuggestion } from '../utils/ai.js';
import { ConfigManager } from '../utils/config.js';
import { simpleGit } from 'simple-git';
import inquirer from 'inquirer';

export default class Generate extends Command {
  static override description = 'Generate gitmoji commit messages using AI analysis of your staged changes';
  
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --commit',
    '<%= config.bin %> <%= command.id %> --no-interactive',
    '<%= config.bin %> <%= command.id %> --scope api',
  ];

  static override flags = {
    commit: Flags.boolean({
      char: 'c',
      description: 'automatically commit with the generated message',
      default: false,
    }),
    interactive: Flags.boolean({
      char: 'i',
      description: 'enable interactive mode to choose from multiple suggestions',
      default: true,
      allowNo: true,
    }),
    scope: Flags.string({
      char: 's',
      description: 'add scope to commit message (e.g., "api", "ui")',
    }),
    provider: Flags.string({
      char: 'p',
      description: 'AI provider to use (openai, anthropic)',
      options: ['openai', 'anthropic'],
    }),
    model: Flags.string({
      char: 'm',
      description: 'AI model to use',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Generate);

    try {
      // Load configuration
      const configManager = new ConfigManager();
      const config = await configManager.loadConfig();
      
      // Override config with command flags
      if (flags.provider) config.provider = flags.provider as any;
      if (flags.model) config.model = flags.model;
      if (flags.scope) config.scope = flags.scope;
      config.interactive = flags.interactive;
      config.autoCommit = flags.commit;

      // Validate configuration
      const validation = await configManager.validateConfig();
      if (!validation.valid) {
        this.error(`Configuration error:\\n${validation.errors.join('\\n')}`);
      }

      // Analyze git changes
      this.log('🔍 Analyzing staged changes...');
      const gitAnalyzer = new GitAnalyzer();
      const analysis = await gitAnalyzer.analyzeChanges();

      if (analysis.filePaths.length === 0) {
        this.error('No staged changes found. Stage your changes first with `git add`.');
      }

      this.log(`📊 Found changes in ${analysis.filePaths.length} file(s): ${analysis.fileTypes.join(', ')}`);

      // Generate AI suggestions
      this.log('🤖 Generating gitmoji suggestions...');
      const aiGenerator = new AICommitGenerator(config);
      const suggestions = await aiGenerator.generateCommitSuggestions(analysis);

      // Handle interactive vs non-interactive mode
      let selectedSuggestion = suggestions.suggestions[0]; // Default to first suggestion

      if (config.interactive && suggestions.suggestions.length > 1) {
        const choices = suggestions.suggestions.map((s, index) => ({
          name: `${s.gitmoji} ${this.formatCommitMessage(s.message, config.scope)} (${s.confidence}% confidence)\n    📝 ${s.description}`,
          value: index,
          short: s.message,
        }));

        const { selectedIndex } = await inquirer.prompt([{
          type: 'list',
          name: 'selectedIndex',
          message: '🎨 Choose your commit message:',
          choices,
        }]);

        selectedSuggestion = suggestions.suggestions[selectedIndex];
      }

      // Display selected suggestion
      const finalMessage = this.formatCommitMessage(selectedSuggestion.message, config.scope);
      const fullCommitMessage = this.formatFullCommitMessage(selectedSuggestion, config.scope);

      this.log('\\n✨ Generated commit message:');
      this.log(`   Title: ${selectedSuggestion.gitmoji} ${finalMessage}`);
      this.log(`   Description: ${selectedSuggestion.description}`);
      this.log(`   Reasoning: ${selectedSuggestion.reasoning}`);
      this.log(`   Confidence: ${selectedSuggestion.confidence}%`);

      // Handle auto-commit
      if (config.autoCommit) {
        const git = simpleGit();
        await git.commit(fullCommitMessage);
        this.log('\\n✅ Changes committed successfully!');
      } else {
        this.log('\\n💡 To commit with this message, run:');
        this.log(`   git commit -m "${selectedSuggestion.gitmoji} ${finalMessage}" -m "${selectedSuggestion.description}"`);
      }

    } catch (error) {
      this.error(`Failed to generate commit message: ${error}`);
    }
  }

  private formatCommitMessage(message: string, scope?: string): string {
    // If scope is provided via command line, override any existing scope
    if (scope) {
      // Remove existing scope if present
      const messageWithoutScope = message.replace(/^\([^)]+\):?\s*/, '');
      
      // Add new scope
      if (messageWithoutScope.startsWith(':')) {
        return `(${scope})${messageWithoutScope}`;
      } else {
        return `(${scope}): ${messageWithoutScope}`;
      }
    }
    return message;
  }

  private formatFullCommitMessage(suggestion: CommitSuggestion, scope?: string): string {
    const title = `${suggestion.gitmoji} ${this.formatCommitMessage(suggestion.message, scope)}`;
    return `${title}\n\n${suggestion.description}`;
  }
}
