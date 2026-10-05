import { AIConfig } from '../config';

export interface MessageLike {
  role: 'user' | 'assistant';
  content: string;
}

export interface CompletionResult {
  text: string;
  provider: string;
  model: string;
}

export class AIAssistantProvider {
  constructor(private config: AIConfig) {}

  public async generate(messages: MessageLike[]): Promise<CompletionResult> {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content ?? 'Hello';

    if (!this.config.apiKey && this.config.provider !== 'custom') {
      return {
        text: `No API key configured for ${this.config.provider}.\n\nThis is a local-first assistant. Use the no-account mode and save chats locally, or set your API key in the configuration file.\n\nPrompt received: ${lastUserMessage}`,
        provider: this.config.provider,
        model: this.config.model,
      };
    }

    const responseText = `Assistant response for: "${lastUserMessage.slice(0, 120)}"\n\nThis scaffold is ready to connect to a real provider such as OpenAI, Ollama, or a custom API.\n\nCurrent provider: ${this.config.provider}\nModel: ${this.config.model}\nBase URL: ${this.config.baseUrl}`;

    return {
      text: responseText,
      provider: this.config.provider,
      model: this.config.model,
    };
  }
}
