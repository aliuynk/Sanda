import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const envFile = path.join(repoRoot, '.env');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/with-root-env.mjs <command> [args...]');
  process.exit(1);
}

const env = {
  ...readEnvFile(envFile),
  ...process.env,
};

const child = spawn(args[0], args.slice(1), {
  cwd: repoRoot,
  env,
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(`Failed to start ${args[0]}: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  return readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) return acc;

      const [, key, rawValue] = match;
      acc[key] = parseEnvValue(rawValue);
      return acc;
    }, {});
}

function parseEnvValue(rawValue) {
  const value = rawValue.trim();
  if (!value) return '';

  if (value.startsWith('"') || value.startsWith("'")) {
    const quote = value[0];
    let parsed = '';

    for (let index = 1; index < value.length; index += 1) {
      const char = value[index];
      const prev = value[index - 1];

      if (char === quote && prev !== '\\') {
        return parsed
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\\\/g, '\\');
      }

      parsed += char;
    }

    return parsed;
  }

  const commentIndex = value.indexOf(' #');
  return commentIndex === -1 ? value : value.slice(0, commentIndex).trim();
}
