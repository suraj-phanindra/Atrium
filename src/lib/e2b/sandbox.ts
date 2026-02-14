import { Sandbox } from 'e2b';

export async function createInterviewSandbox(
  challengeFiles: Record<string, string>,
  challengeReadme: string
): Promise<{ sandboxId: string; sandbox: Sandbox }> {
  const sandbox = await Sandbox.create('base', {
    envs: { ANTHROPIC_API_KEY: process.env.CANDIDATE_ANTHROPIC_KEY! },
    timeoutMs: 60 * 60 * 1000,
  });

  // Install Claude Code
  await sandbox.commands.run('npm install -g @anthropic-ai/claude-code', { timeoutMs: 120000 });

  // Create project directory and write challenge files
  await sandbox.commands.run('mkdir -p /home/user/project');
  for (const [path, content] of Object.entries(challengeFiles)) {
    const dir = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';
    if (dir) {
      await sandbox.commands.run(`mkdir -p /home/user/project/${dir}`);
    }
    await sandbox.files.write(`/home/user/project/${path}`, content);
  }
  await sandbox.files.write('/home/user/project/README.md', challengeReadme);

  // Install dependencies if package.json exists
  if (challengeFiles['package.json']) {
    await sandbox.commands.run('cd /home/user/project && npm install', { timeoutMs: 120000 });
  }

  return { sandboxId: sandbox.sandboxId, sandbox };
}
