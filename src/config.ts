import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export type ModelProvider = 'openai' | 'ollama' | 'custom';

export interface AIConfig {
  provider: ModelProvider;
  baseUrl: string;
  apiKey?: string;
  model: string;
  temperature: number;
}

export const DEFAULT_CONFIG: AIConfig = {
  provider: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.2,
};

export function getConfigPath(): string {
  const dir = path.join(os.homedir(), '.ai-coding-assistant');
  return path.join(dir, 'config.json');
}

export function loadConfig(): AIConfig {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<AIConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: AIConfig): void {
  const configDir = path.dirname(getConfigPath());
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf8');
}
