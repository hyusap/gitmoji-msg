import { Command, Flags } from '@oclif/core';
import inquirer from 'inquirer';
import { simpleGit } from 'simple-git';

import { AICommitGenerator, CommitSuggestion } from '../utils/ai.js';
import { ConfigManager } from '../utils/config.js';
import { GitAnalyzer } from '../utils/git.js';

export default class Run extends Command {
  static override description = 'Add all changes, generate gitmoji commit message, and commit automatically';
static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --no-interactive',
    '<%= config.bin %> <%= command.id %> --scope api',
    '<%= config.bin %> <%= command.id %> --model gpt-4',
  ];
static override flags = {
    dry: Flags.boolean({
      char: 'd',
      default: false,
      description: 'dry run - show what would be committed without actually committing',
    }),
    interactive: Flags.boolean({
      allowNo: true,
      char: 'i',
      default: true,
      description: 'enable interactive mode to choose from multiple suggestions',
    }),
    model: Flags.string({
      char: 'm',
      description: 'AI model to use',
    }),
    provider: Flags.string({
      char: 'p',
      description: 'AI provider to use (openai, anthropic)',
      options: ['openai', 'anthropic'],
    }),
    scope: Flags.string({
      char: 's',
      description: 'add scope to commit message (e.g., "api", "ui")',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Run);

    try {
      // Load configuration
      const configManager = new ConfigManager();
      const config = await configManager.loadConfig();
      
      // Override config with command flags
      if (flags.provider) config.provider = flags.provider as 'anthropic' | 'openai';
      if (flags.model) config.model = flags.model;
      if (flags.scope) config.scope = flags.scope;
      config.interactive = flags.interactive;

      // Validate configuration
      const validation = await configManager.validateConfig();
      if (!validation.valid) {
        this.error(`Configuration error:\n${validation.errors.join('\n')}`);
      }

      const git = simpleGit();

      // Check if we're in a git repository
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        this.error('Not a git repository. Initialize git first with `git init`.');
      }

      // Get git status to see what changes exist
      this.log('📋 Checking repository status...');
      const status = await git.status();
      
      if (status.files.length === 0) {
        this.log('✅ No changes detected. Repository is clean.');
        return;
      }

      // Check if there are already staged changes
      const hasStagedChanges = status.staged.length > 0;
      
      if (hasStagedChanges) {
        this.log(`📁 Found ${status.staged.length} staged file(s):`);
        for (const file of status.staged.slice(0, 10)) {
          this.log(`   ✅ ${file}`);
        }
        if (status.staged.length > 10) {
          this.log(`   ... and ${status.staged.length - 10} more files`);
        }
        this.log('🎯 Using existing staged changes');
      } else {
        // Show what will be added
        this.log(`📁 Found ${status.files.length} changed file(s):`);
        for (const file of status.files.slice(0, 10)) { // Show first 10 files
          const indicator = this.getStatusIndicator(file.index, file.working_dir);
          this.log(`   ${indicator} ${file.path}`);
        }
        
        if (status.files.length > 10) {
          this.log(`   ... and ${status.files.length - 10} more files`);
        }

        // Confirm before adding all files (unless dry run)
        if (flags.dry) {
          this.log('🏃 Dry run mode - simulating git add .');
        } else {
          const { confirm } = await inquirer.prompt([{
            default: true,
            message: 'Add all changes and proceed with commit?',
            name: 'confirm',
            type: 'confirm',
          }]);

          if (!confirm) {
            this.log('❌ Operation cancelled');
            return;
          }

          // Add all files
          this.log('➕ Adding all changes...');
          await git.add('.');
        }
      }

      // Analyze changes
      this.log('🔍 Analyzing changes...');
      const gitAnalyzer = new GitAnalyzer();
      
      let analysis;
      if (flags.dry && !hasStagedChanges) {
        // For dry run with no staged changes, analyze working directory changes
        const diff = await git.diff();
        if (!diff) {
          this.error('No changes to analyze');
        }
        analysis = await gitAnalyzer.analyzeChanges(diff);
      } else {
        // Analyze staged changes (either existing or newly added)
        analysis = await gitAnalyzer.analyzeChanges();
      }

      if (analysis.filePaths.length === 0) {
        this.error('No changes found to analyze');
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
          name: `${s.gitmoji} ${this.formatCommitMessage(s, config.scope)} (${s.confidence}% confidence)${s.description ? `\n    📝 ${s.description}` : ''}`,
          short: s.message,
          value: index,
        }));

        const { selectedIndex } = await inquirer.prompt([{
          choices,
          message: '🎨 Choose your commit message:',
          name: 'selectedIndex',
          type: 'list',
        }]);

        selectedSuggestion = suggestions.suggestions[selectedIndex];
      }

      // Display selected suggestion
      const finalMessage = this.formatCommitMessage(selectedSuggestion, config.scope);
      const fullCommitMessage = this.formatFullCommitMessage(selectedSuggestion, config.scope);

      this.log('\n✨ Generated commit message:');
      this.log(`   Title: ${selectedSuggestion.gitmoji} ${finalMessage}`);
      if (selectedSuggestion.description) {
        this.log(`   Description: ${selectedSuggestion.description}`);
      }
      this.log(`   Confidence: ${selectedSuggestion.confidence}%`);

      // Commit the changes
      if (flags.dry) {
        this.log('\n🏃 Dry run mode - would execute:');
        if (selectedSuggestion.description) {
          this.log(`   git commit -m "${selectedSuggestion.gitmoji} ${finalMessage}" -m "${selectedSuggestion.description}"`);
        } else {
          this.log(`   git commit -m "${selectedSuggestion.gitmoji} ${finalMessage}"`);
        }
      } else {
        this.log('\n🚀 Committing changes...');
        await git.commit(fullCommitMessage);
        this.log('✅ Changes committed successfully!');
        
        // Show the commit hash
        const log = await git.log({ maxCount: 1 });
        if (log.latest) {
          this.log(`📋 Commit: ${log.latest.hash.slice(0, 7)} "${selectedSuggestion.gitmoji} ${finalMessage}"`);
        }
      }

    } catch (error) {
      this.error(`Failed to run gitmoji workflow: ${error}`);
    }
  }

  private formatCommitMessage(suggestion: CommitSuggestion, scope?: string): string {
    // Use command line scope if provided, otherwise use AI-suggested scope
    const finalScope = scope || suggestion.scope;
    
    if (finalScope) {
      return `(${finalScope}): ${suggestion.message}`;
    }
    return suggestion.message;
  }

  private formatFullCommitMessage(suggestion: CommitSuggestion, scope?: string): string {
    const title = `${suggestion.gitmoji} ${this.formatCommitMessage(suggestion, scope)}`;
    return suggestion.description ? `${title}\n\n${suggestion.description}` : title;
  }

  private getStatusIndicator(index: string, workingDir: string): string {
    // Git status indicators
    if (index === '?' && workingDir === '?') return '❓'; // Untracked
    if (index === 'A') return '➕'; // Added
    if (index === 'M' || workingDir === 'M') return '📝'; // Modified
    if (index === 'D' || workingDir === 'D') return '🗑️'; // Deleted
    if (index === 'R') return '🚚'; // Renamed
    if (index === 'C') return '📋'; // Copied
    return '📄'; // Default
  }
}
