import * as vscode from 'vscode';
import { AIConfig, loadConfig } from './config';
import { appendConversation, clearConversations, loadConversations } from './storage';
import { AIAssistantProvider } from './ai/provider';

export class AssistantSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aiAssistantSidebar';
  private _view?: vscode.WebviewView;

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this._getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'chat': {
          const prompt = String(message.prompt ?? '').trim();
          if (!prompt) {
            return;
          }

          const config = loadConfig();
          const provider = new AIAssistantProvider(config);
          const result = await provider.generate([{ role: 'user', content: prompt }]);

          appendConversation(prompt, result.text);

          webviewView.webview.postMessage({
            type: 'response',
            value: result.text,
          });
          break;
        }

        case 'clearHistory': {
          clearConversations();
          webviewView.webview.postMessage({
            type: 'history-cleared',
            value: true,
          });
          break;
        }

        case 'loadHistory': {
          const conversations = loadConversations();
          webviewView.webview.postMessage({
            type: 'history',
            value: conversations,
          });
          break;
        }
      }
    });
  }

  public async askDirectly(prompt: string): Promise<string> {
    const config: AIConfig = loadConfig();
    const provider = new AIAssistantProvider(config);
    const result = await provider.generate([{ role: 'user', content: prompt }]);
    appendConversation(prompt, result.text);
    return result.text;
  }

  public clearHistory(): void {
    clearConversations();
    this._view?.webview.postMessage({
      type: 'history-cleared',
      value: true,
    });
  }

  private _getHtml(webview: vscode.Webview): string {
    const nonce = this._getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Coding Assistant</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 12px;
            margin: 0;
          }
          textarea {
            width: 100%;
            min-height: 80px;
            box-sizing: border-box;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            padding: 8px;
            border-radius: 6px;
          }
          button {
            margin-top: 8px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            cursor: pointer;
          }
          #response {
            margin-top: 12px;
            white-space: pre-wrap;
            background: var(--vscode-textCodeBlock-background);
            border-radius: 6px;
            padding: 10px;
            overflow-wrap: anywhere;
          }
          .actions {
            display: flex;
            gap: 8px;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <h3>AI Coding Assistant</h3>
        <textarea id="prompt" placeholder="Ask for code help, fix bugs, explain functions..."></textarea>
        <div class="actions">
          <button id="sendBtn">Send</button>
          <button id="clearBtn">Clear</button>
        </div>
        <div id="response">Ready. No account required.</div>

        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          const promptInput = document.getElementById('prompt');
          const responseBox = document.getElementById('response');

          document.getElementById('sendBtn').addEventListener('click', () => {
            const prompt = promptInput.value.trim();
            if (!prompt) {
              return;
            }

            responseBox.textContent = 'Thinking...';
            vscode.postMessage({
              type: 'chat',
              prompt,
            });
          });

          document.getElementById('clearBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'clearHistory' });
            responseBox.textContent = 'Conversation history cleared.';
            promptInput.value = '';
          });

          window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.type === 'response') {
              responseBox.textContent = message.value;
            }

            if (message.type === 'history-cleared') {
              responseBox.textContent = 'Conversation history cleared.';
            }
          });

          vscode.postMessage({ type: 'loadHistory' });
        </script>
      </body>
      </html>`;
  }

  private _getNonce(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
