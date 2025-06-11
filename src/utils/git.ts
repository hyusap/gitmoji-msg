import { simpleGit, SimpleGit, DiffResult } from 'simple-git';

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

  async getStagedChanges(): Promise<DiffResult | null> {
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

  async getLastCommitChanges(): Promise<DiffResult | null> {
    try {
      return await this.git.diff(['HEAD~1', 'HEAD']);
    } catch (error) {
      throw new Error(`Failed to get last commit changes: ${error}`);
    }
  }

  async analyzeChanges(diff?: DiffResult): Promise<GitChangeAnalysis> {
    if (!diff) {
      const stagedDiff = await this.getStagedChanges();
      if (!stagedDiff) {
        throw new Error('No staged changes found. Stage your changes first with `git add`.');
      }
      diff = stagedDiff;
    }

    const files = diff.files || [];
    const filePaths = files.map(f => f.file);
    const fileTypes = this.extractFileTypes(filePaths);
    
    return {
      hasNewFiles: files.some(f => f.insertions > 0 && f.deletions === 0),
      hasDeletedFiles: files.some(f => f.deletions > 0 && f.insertions === 0),
      hasModifiedFiles: files.some(f => f.insertions > 0 && f.deletions > 0),
      fileTypes,
      isBreakingChange: this.detectBreakingChange(diff),
      isFeature: this.detectFeature(diff, filePaths),
      isBugFix: this.detectBugFix(diff),
      isRefactor: this.detectRefactor(diff),
      isDocumentation: this.detectDocumentation(filePaths),
      isTest: this.detectTest(filePaths),
      isConfig: this.detectConfig(filePaths),
      changeDescription: this.generateChangeDescription(files),
      filePaths,
    };
  }

  private extractFileTypes(filePaths: string[]): string[] {
    const extensions = filePaths
      .map(path => path.split('.').pop()?.toLowerCase())
      .filter(Boolean) as string[];
    
    return [...new Set(extensions)];
  }

  private detectBreakingChange(diff: DiffResult): boolean {
    const diffText = diff.summary?.changes?.toString() || '';
    const breakingPatterns = [
      /BREAKING[\s\-_]CHANGE/i,
      /breaking/i,
      /remove.*api/i,
      /delete.*function/i,
    ];
    
    return breakingPatterns.some(pattern => pattern.test(diffText));
  }

  private detectFeature(diff: DiffResult, filePaths: string[]): boolean {
    const diffText = diff.summary?.changes?.toString() || '';
    const hasNewFunctionality = /(\+.*function|\+.*class|\+.*export)/i.test(diffText);
    const hasNewFiles = filePaths.some(path => !path.includes('test') && !path.includes('spec'));
    
    return hasNewFunctionality || hasNewFiles;
  }

  private detectBugFix(diff: DiffResult): boolean {
    const diffText = diff.summary?.changes?.toString() || '';
    const bugPatterns = [
      /fix/i,
      /bug/i,
      /error/i,
      /issue/i,
      /patch/i,
    ];
    
    return bugPatterns.some(pattern => pattern.test(diffText));
  }

  private detectRefactor(diff: DiffResult): boolean {
    const diffText = diff.summary?.changes?.toString() || '';
    const refactorPatterns = [
      /refactor/i,
      /restructure/i,
      /reorganize/i,
      /cleanup/i,
    ];
    
    return refactorPatterns.some(pattern => pattern.test(diffText));
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

  private generateChangeDescription(files: any[]): string {
    const totalInsertions = files.reduce((sum, f) => sum + f.insertions, 0);
    const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);
    const fileCount = files.length;
    
    return `Modified ${fileCount} file${fileCount > 1 ? 's' : ''} with ${totalInsertions} addition${totalInsertions !== 1 ? 's' : ''} and ${totalDeletions} deletion${totalDeletions !== 1 ? 's' : ''}`;
  }
}