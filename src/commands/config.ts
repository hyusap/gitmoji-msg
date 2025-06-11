import { Args, Command, Flags } from '@oclif/core';
import inquirer from 'inquirer';

import { AppConfig, ConfigManager } from '../utils/config.js';

export default class Config extends Command {
  static override args = {
    key: Args.string({
      description: 'configuration key to get/set',
      options: ['provider', 'model', 'interactive', 'autoCommit'],
    }),
    value: Args.string({
      description: 'configuration value to set',
    }),
  };
static override description = 'Manage gitmoji-msg configuration settings';
static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> provider openai',
    '<%= config.bin %> <%= command.id %> model gpt-4',
    '<%= config.bin %> <%= command.id %> --interactive',
    '<%= config.bin %> <%= command.id %> --reset',
  ];
static override flags = {
    interactive: Flags.boolean({
      char: 'i',
      default: false,
      description: 'configure settings interactively',
    }),
    list: Flags.boolean({
      char: 'l',
      default: false,
      description: 'list current configuration',
    }),
    reset: Flags.boolean({
      char: 'r',
      default: false,
      description: 'reset configuration to defaults',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Config);
    const configManager = new ConfigManager();

    try {
      if (flags.reset) {
        await this.resetConfig(configManager);
      } else if (flags.interactive) {
        await this.interactiveConfig(configManager);
      } else if (flags.list || (!args.key && !args.value)) {
        await this.listConfig(configManager);
      } else if (args.key && args.value) {
        await this.setConfig(configManager, args.key, args.value);
      } else if (args.key) {
        await this.getConfig(configManager, args.key);
      }
    } catch (error) {
      this.error(`Configuration error: ${error}`);
    }
  }

  private async getConfig(configManager: ConfigManager, key: string): Promise<void> {
    const config = await configManager.loadConfig();
    const value = (config as unknown as Record<string, unknown>)[key];
    
    if (value === undefined) {
      this.error(`Configuration key '${key}' not found`);
    } else {
      this.log(`${key}: ${value}`);
    }
  }

  private async interactiveConfig(configManager: ConfigManager): Promise<void> {
    const currentConfig = await configManager.loadConfig();

    const questions = [
      {
        choices: ['openai', 'anthropic'],
        default: currentConfig.provider,
        message: 'AI Provider:',
        name: 'provider',
        type: 'list',
      },
      {
        default: currentConfig.model,
        message: 'AI Model:',
        name: 'model',
        type: 'input',
      },
      {
        default: currentConfig.interactive,
        message: 'Enable interactive mode by default?',
        name: 'interactive',
        type: 'confirm',
      },
      {
        default: currentConfig.autoCommit,
        message: 'Auto-commit generated messages?',
        name: 'autoCommit',
        type: 'confirm',
      },
      {
        default: currentConfig.scope || '',
        message: 'Default scope (optional):',
        name: 'scope',
        type: 'input',
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answers = await inquirer.prompt(questions as any);
    
    // Clean up empty scope
    if (!answers.scope) {
      delete answers.scope;
    }

    await configManager.saveConfig(answers);
    this.log('✅ Configuration updated successfully!');
  }

  private async listConfig(configManager: ConfigManager): Promise<void> {
    const config = await configManager.loadConfig();
    
    this.log('📋 Current Configuration:');
    this.log(`   Provider: ${config.provider}`);
    this.log(`   Model: ${config.model}`);
    this.log(`   Interactive: ${config.interactive}`);
    this.log(`   Auto-commit: ${config.autoCommit}`);
    if (config.scope) {
      this.log(`   Default scope: ${config.scope}`);
    }

    // Check API key status
    const apiKey = await configManager.getApiKey(config.provider);
    this.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Not set'}`);

    this.log('\n💡 Tip: Use --interactive to change settings or set individual values:');
    this.log('   gitmoji-msg config provider openai');
  }

  private async resetConfig(configManager: ConfigManager): Promise<void> {
    const { confirm } = await inquirer.prompt([{
      default: false,
      message: 'Are you sure you want to reset all configuration to defaults?',
      name: 'confirm',
      type: 'confirm',
    }]);

    if (confirm) {
      // Save empty config to reset to defaults
      await configManager.saveConfig({
        autoCommit: false,
        interactive: true,
        model: 'gpt-4o-mini',
        provider: 'openai',
      });
      this.log('✅ Configuration reset to defaults');
    } else {
      this.log('❌ Reset cancelled');
    }
  }

  private async setConfig(configManager: ConfigManager, key: string, value: string): Promise<void> {
    const updates: Partial<AppConfig> = {};
    
    switch (key) {
      case 'autoCommit': {
        updates.autoCommit = value.toLowerCase() === 'true';
        break;
      }

      case 'interactive': {
        updates.interactive = value.toLowerCase() === 'true';
        break;
      }

      case 'model': {
        updates.model = value;
        break;
      }

      case 'provider': {
        if (!['anthropic', 'openai'].includes(value)) {
          this.error(`Invalid provider '${value}'. Must be: openai, anthropic`);
        }

        updates.provider = value as 'openai' | 'anthropic';
        break;
      }

      default: {
        this.error(`Unknown configuration key '${key}'`);
      }
    }

    await configManager.saveConfig(updates);
    this.log(`✅ Set ${key} to ${value}`);
  }
}
