import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export const STORAGE_DIR = path.join(os.homedir(), '.ai-coding-assistant');
export const STORAGE_FILE = path.join(STORAGE_DIR, 'conversations.json');

export function ensureStore(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

export function loadConversations(): Conversation[] {
  ensureStore();

  try {
    const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Conversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  ensureStore();
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(conversations, null, 2), 'utf8');
}

export function appendConversation(prompt: string, response: string): void {
  const conversations = loadConversations();
  const now = new Date().toISOString();

  const last = conversations[0];
  if (last && last.messages.length === 0) {
    last.messages.push({ role: 'user', content: prompt, timestamp: now });
    last.messages.push({ role: 'assistant', content: response, timestamp: now });
    last.updatedAt = now;
    last.title = prompt.slice(0, 40) || 'New chat';
    saveConversations(conversations);
    return;
  }

  const record: Conversation = {
    id: `${Date.now()}`,
    title: prompt.slice(0, 40) || 'New chat',
    createdAt: now,
    updatedAt: now,
    messages: [
      { role: 'user', content: prompt, timestamp: now },
      { role: 'assistant', content: response, timestamp: now },
    ],
  };

  conversations.unshift(record);
  saveConversations(conversations);
}

export function clearConversations(): void {
  saveConversations([]);
}
