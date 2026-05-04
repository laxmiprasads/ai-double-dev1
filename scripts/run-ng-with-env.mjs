import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function parseEnvFile(filePath) {
  const values = {};
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function escapeDefineString(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

const envFilePath = join(process.cwd(), '.env');
const fileEnv = existsSync(envFilePath) ? parseEnvFile(envFilePath) : {};
const googleClientId = fileEnv.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
const command = process.argv[2];
const defineSupportedCommands = new Set(['build', 'serve']);

if (!googleClientId) {
  console.error('Missing GOOGLE_CLIENT_ID. Add it to the .env file before running Angular commands.');
  process.exit(1);
}

const ngBinPath = join(process.cwd(), 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const args = [ngBinPath, ...process.argv.slice(2)];

if (defineSupportedCommands.has(command)) {
  args.push(`--define=GOOGLE_CLIENT_ID="${escapeDefineString(googleClientId)}"`);
}

const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    ...fileEnv,
  },
});

process.exit(result.status ?? 1);
