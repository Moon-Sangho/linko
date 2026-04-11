import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

export class GitService {
  constructor(
    private readonly repoDir: string,
    private readonly repoUrl: string,
    private readonly token: string,
  ) {}

  private get auth() {
    return {
      username: 'oauth2',
      password: this.token,
    };
  }

  private onAuth() {
    return this.auth;
  }

  async clone(): Promise<void> {
    await git.clone({
      fs,
      http,
      dir: this.repoDir,
      url: this.repoUrl,
      singleBranch: true,
      depth: 1,
      onAuth: () => this.onAuth(),
    });
  }

  async pull(): Promise<void> {
    await git.pull({
      fs,
      http,
      dir: this.repoDir,
      singleBranch: true,
      author: { name: 'Linko', email: 'linko@app' },
      onAuth: () => this.onAuth(),
    });
  }

  async push(commitMessage: string): Promise<void> {
    await git.push({
      fs,
      http,
      dir: this.repoDir,
      remote: 'origin',
      onAuth: () => this.onAuth(),
    });
    void commitMessage; // already committed before push via addAndCommit
  }

  async addAndCommit(filePath: string, message: string): Promise<void> {
    const relativePath = path.relative(this.repoDir, filePath);
    await git.add({ fs, dir: this.repoDir, filepath: relativePath });
    await git.commit({
      fs,
      dir: this.repoDir,
      message,
      author: { name: 'Linko', email: 'linko@app' },
    });
  }

  static async isRepoCloned(repoDir: string): Promise<boolean> {
    try {
      await git.resolveRef({ fs, dir: repoDir, ref: 'HEAD' });
      return true;
    } catch {
      return false;
    }
  }
}
