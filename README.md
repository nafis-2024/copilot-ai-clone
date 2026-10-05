# AI Coding Assistant

A simple VS Code extension scaffold for a local-first AI coding assistant.

Features included in this MVP:
- No-account mode by default
- Local conversation storage under the user's home directory
- Chat sidebar in VS Code
- Optional provider configuration for OpenAI-compatible services
- Clear history command

## Project structure

- `src/extension.ts` - extension activation and commands
- `src/sidebar.ts` - chat sidebar webview
- `src/storage.ts` - local conversation persistence
- `src/config.ts` - provider and settings management
- `src/ai/provider.ts` - pluggable AI provider layer

## Quick start

1. Install dependencies:
   npm install
2. Compile the extension:
   npm run compile
3. Launch the extension in VS Code:
   F5

## No-account mode

The extension runs without login. Conversations are stored locally in:

`~/.ai-coding-assistant/conversations.json`

## Optional account/provider mode

You can configure a provider in the future by editing the config file under:

`~/.ai-coding-assistant/config.json`

This scaffold is intentionally simple and ready to extend with real model integrations such as OpenAI, Ollama, or custom local APIs.
