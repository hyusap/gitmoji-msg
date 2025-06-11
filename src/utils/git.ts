import { simpleGit, SimpleGit } from 'simple-git';

export interface GitChangeAnalysis {
  hasNewFiles: boolean;
  hasDeletedFiles: boolean;
  hasModifiedFiles: boolean;
  fileTypes: string[];
  isBreakingChange: boolean;
  isFeature: boolean;
  isBugFix: boolean;
  isRefactor: boolean;
  isDocumentation: boolean;
  isTest: boolean;
  isConfig: boolean;
  changeDescription: string;
  filePaths: string[];
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

    // Parse file paths from diff
    const filePaths = this.extractFilePathsFromDiff(diff);
    const fileTypes = this.extractFileTypes(filePaths);
    
    return {
      hasNewFiles: this.detectNewFiles(diff),
      hasDeletedFiles: this.detectDeletedFiles(diff),
      hasModifiedFiles: this.detectModifiedFiles(diff),
      fileTypes,
      isBreakingChange: this.detectBreakingChange(diff),
      isFeature: this.detectFeature(diff, filePaths),
      isBugFix: this.detectBugFix(diff),
      isRefactor: this.detectRefactor(diff),
      isDocumentation: this.detectDocumentation(filePaths),
      isTest: this.detectTest(filePaths),
      isConfig: this.detectConfig(filePaths),
      changeDescription: this.generateChangeDescription(diff),
      filePaths,
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

  private detectNewFiles(diff: string): boolean {
    return /^\+\+\+.*\/dev\/null/m.test(diff) === false && /^---.*\/dev\/null/m.test(diff);
  }

  private detectDeletedFiles(diff: string): boolean {
    return /^\+\+\+.*\/dev\/null/m.test(diff);
  }

  private detectModifiedFiles(diff: string): boolean {
    return /^@@/m.test(diff);
  }

  private detectBreakingChange(diff: string): boolean {
    const breakingPatterns = [
      /BREAKING[\s\-_]CHANGE/i,
      /breaking/i,
      /remove.*api/i,
      /delete.*function/i,
    ];
    
    return breakingPatterns.some(pattern => pattern.test(diff));
  }

  private detectFeature(diff: string, filePaths: string[]): boolean {
    const hasNewFunctionality = /(\+.*function|\+.*class|\+.*export)/i.test(diff);
    const hasNewFiles = filePaths.some(path => !path.includes('test') && !path.includes('spec'));
    
    return hasNewFunctionality || hasNewFiles;
  }

  private detectBugFix(diff: string): boolean {
    const bugPatterns = [
      /fix/i,
      /bug/i,
      /error/i,
      /issue/i,
      /patch/i,
    ];
    
    return bugPatterns.some(pattern => pattern.test(diff));
  }

  private detectRefactor(diff: string): boolean {
    const refactorPatterns = [
      /refactor/i,
      /restructure/i,
      /reorganize/i,
      /cleanup/i,
    ];
    
    return refactorPatterns.some(pattern => pattern.test(diff));
  }

  private detectDocumentation(filePaths: string[]): boolean {
    const docPatterns = [
      /\.md$/i,
      /readme/i,
      /docs?\//i,
      /changelog/i,
      /\.txt$/i,
    ];
    
    return filePaths.some(path => docPatterns.some(pattern => pattern.test(path)));
  }

  private detectTest(filePaths: string[]): boolean {
    const testPatterns = [
      /\.test\./i,
      /\.spec\./i,
      /test\//i,
      /__tests__\//i,
    ];
    
    return filePaths.some(path => testPatterns.some(pattern => pattern.test(path)));
  }

  private detectConfig(filePaths: string[]): boolean {
    const configPatterns = [
      /config/i,
      /\.json$/i,
      /\.yaml$/i,
      /\.yml$/i,
      /\.toml$/i,
      /\.env/i,
      /package\.json/i,
      /tsconfig/i,
    ];
    
    return filePaths.some(path => configPatterns.some(pattern => pattern.test(path)));
  }

  private generateChangeDescription(diff: string): string {
    const lines = diff.split('\n');
    const additions = lines.filter(line => line.startsWith('+')).length;
    const deletions = lines.filter(line => line.startsWith('-')).length;
    const fileCount = this.extractFilePathsFromDiff(diff).length;
    
    return `Modified ${fileCount} file${fileCount > 1 ? 's' : ''} with ${additions} addition${additions !== 1 ? 's' : ''} and ${deletions} deletion${deletions !== 1 ? 's' : ''}`;
  }
}