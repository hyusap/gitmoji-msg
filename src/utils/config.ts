import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AIConfig } from './ai.js';

export interface AppConfig extends AIConfig {
  interactive: boolean;
  autoCommit: boolean;
  scope?: string;
}

export class ConfigManager {
  private configPath: string;
  private defaultConfig: AppConfig = {
    provider: 'openai',
    model: 'gpt-4o-mini',
    interactive: true,
    autoCommit: false,
  };

  constructor() {
    this.configPath = path.join(os.homedir(), '.gitmoji-msg.json');
  }

  async loadConfig(): Promise<AppConfig> {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        const savedConfig = JSON.parse(configData);
        return { ...this.defaultConfig, ...savedConfig };
      }
    } catch (error) {
      // If config is corrupted, fall back to defaults
      console.warn('Warning: Could not load config, using defaults');
    }
    
    return this.defaultConfig;
  }

  async saveConfig(config: Partial<AppConfig>): Promise<void> {
    try {
      const existingConfig = await this.loadConfig();
      const newConfig = { ...existingConfig, ...config };
      
      fs.writeFileSync(this.configPath, JSON.stringify(newConfig, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  async getApiKey(provider: string): Promise<string | undefined> {
    const config = await this.loadConfig();
    
    // Check config file first, then environment variables
    if (config.apiKey) {
      return config.apiKey;
    }
    
    switch (provider) {
      case 'openai':
        return process.env.OPENAI_API_KEY;
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY;
      default:
        return undefined;
    }
  }

  async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    const config = await this.loadConfig();
    const errors: string[] = [];

    // Check API key availability
    const apiKey = await this.getApiKey(config.provider);
    if (!apiKey) {
      errors.push(`No API key found for ${config.provider}. Set OPENAI_API_KEY environment variable or configure it with 'gitmoji-msg config'.`);
    }

    // Validate provider
    if (!['openai', 'anthropic'].includes(config.provider)) {
      errors.push(`Unsupported AI provider: ${config.provider}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}