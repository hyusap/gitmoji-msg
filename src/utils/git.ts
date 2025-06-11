import { simpleGit, SimpleGit } from 'simple-git';

export interface GitChangeAnalysis {
  diff: string;
  filePaths: string[];
  fileTypes: string[];
}

export class GitAnalyzer {
  private git: SimpleGit;

  constructor(baseDir?: string) {
    this.git = simpleGit(baseDir);
  }

  async getStagedChanges(): Promise<string | null> {
    try {
      const status = await this.git.status();
      if (status.staged.length === 0) {
        return null;
      }
      return await this.git.diff(['--staged']);
    } catch (error) {
      throw new Error(`Failed to get staged changes: ${error}`);
    }
  }

  async getLastCommitChanges(): Promise<string | null> {
    try {
      return await this.git.diff(['HEAD~1', 'HEAD']);
    } catch (error) {
      throw new Error(`Failed to get last commit changes: ${error}`);
    }
  }

  async analyzeChanges(diff?: string): Promise<GitChangeAnalysis> {
    if (!diff) {
      const stagedDiff = await this.getStagedChanges();
      if (!stagedDiff) {
        throw new Error('No staged changes found. Stage your changes first with `git add`.');
      }
      diff = stagedDiff;
    }

    const filePaths = this.extractFilePathsFromDiff(diff);
    const fileTypes = this.extractFileTypes(filePaths);
    
    return {
      diff,
      filePaths,
      fileTypes,
    };
  }

  private extractFileTypes(filePaths: string[]): string[] {
    const extensions = filePaths
      .map(path => path.split('.').pop()?.toLowerCase())
      .filter(Boolean) as string[];
    
    return [...new Set(extensions)];
  }

  private extractFilePathsFromDiff(diff: string): string[] {
    const lines = diff.split('\n');
    const filePaths: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('+++') || line.startsWith('---')) {
        const match = line.match(/[+-]{3}\s+(.+)/);
        if (match && match[1] !== '/dev/null') {
          const path = match[1].replace(/^[ab]\//, '');
          if (!filePaths.includes(path)) {
            filePaths.push(path);
          }
        }
      }
    }
    
    return filePaths;
  }
}