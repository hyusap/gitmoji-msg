# 🎨 gitmoji-msg

AI-powered gitmoji commit message generator! Automatically analyze your git changes and generate meaningful commit messages following the [gitmoji](https://gitmoji.dev/) standard.

## ✨ Features

- 🤖 **AI-Powered Analysis**: Uses advanced AI to understand your code changes
- 🎯 **Smart Gitmoji Selection**: Automatically chooses the most appropriate gitmoji
- 🔄 **Interactive Mode**: Choose from multiple AI-generated suggestions  
- ⚙️ **Configurable**: Support for multiple AI providers (OpenAI, Anthropic)
- 🚀 **Auto-commit**: Optionally commit automatically with generated messages
- 📋 **Gitmoji Browser**: List and search available gitmojis
- 🎨 **Conventional Commits**: Optional scope support for conventional commit format

## 📦 Installation

```bash
npm install -g gitmoji-msg
# or
pnpm add -g gitmoji-msg
```

## 🚀 Quick Start

1. **Set up your API key** (OpenAI example):
   ```bash
   export OPENAI_API_KEY="your-api-key"
   ```

2. **Stage your changes**:
   ```bash
   git add .
   ```

3. **Generate commit message**:
   ```bash
   gitmoji-msg
   ```

That's it! The AI will analyze your changes and suggest gitmoji commit messages.

## 📖 Usage

### Basic Commands

```bash
# Generate commit message (default command)
gitmoji-msg

# Generate and auto-commit
gitmoji-msg --commit

# Non-interactive mode (use first suggestion)
gitmoji-msg --no-interactive

# Add scope to commit message
gitmoji-msg --scope api

# Use specific AI model
gitmoji-msg --model gpt-4
```

### Full Workflow Command

```bash
# Add all changes, generate message, and commit automatically
gitmoji-msg run

# Dry run - see what would be committed without committing
gitmoji-msg run --dry

# Run with scope and non-interactive mode
gitmoji-msg run --scope feat --no-interactive

# Run with custom model
gitmoji-msg run --model gpt-4
```

### Configuration

```bash
# View current configuration
gitmoji-msg config

# Interactive configuration
gitmoji-msg config --interactive

# Set specific values
gitmoji-msg config provider openai
gitmoji-msg config model gpt-4o-mini
gitmoji-msg config interactive true
```

### Browse Gitmojis

```bash
# List all gitmojis
gitmoji-msg list

# Search gitmojis
gitmoji-msg list --search feature
gitmoji-msg list --search bug

# Filter by category
gitmoji-msg list --category feature
gitmoji-msg list --category bug

# Show codes instead of emojis
gitmoji-msg list --codes
```

## ⚙️ Configuration

The tool can be configured via:
1. Environment variables
2. Config file (`~/.gitmoji-msg.json`)
3. Command line flags

### Environment Variables

- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key

### Config Options

| Option | Default | Description |
|--------|---------|-------------|
| `provider` | `openai` | AI provider (`openai`, `anthropic`) |
| `model` | `gpt-4o-mini` | AI model to use |
| `interactive` | `true` | Show multiple suggestions |
| `autoCommit` | `false` | Auto-commit generated messages |
| `scope` | - | Default scope for commits |

## 🎯 How It Works

1. **Git Analysis**: Analyzes your staged changes using `git diff`
2. **Pattern Detection**: Identifies file types, change patterns, and commit intent
3. **AI Processing**: Sends analysis to AI with gitmoji context for intelligent suggestions
4. **Gitmoji Selection**: AI chooses appropriate gitmojis based on change type
5. **Message Generation**: Creates descriptive commit messages following conventions

## 📝 Examples

### Full Workflow (Recommended)
```bash
$ gitmoji-msg run
📋 Checking repository status...
📁 Found 3 changed file(s):
   ➕ src/components/UserProfile.tsx
   📝 src/types/user.ts  
   📝 README.md
Add all changes and proceed with commit? Yes
➕ Adding all changes...
🔍 Analyzing changes...
📊 Found changes in 3 file(s): tsx, ts, md
🤖 Generating gitmoji suggestions...

✨ Generated commit message:
   Title: ✨ add UserProfile component with TypeScript types
   Description: Created a new UserProfile component that displays user information with avatar support and integrated TypeScript type definitions. This component was needed to provide a consistent user interface element across the application. The TypeScript types ensure type safety and improve developer experience by providing proper intellisense and compile-time error checking.
   Reasoning: New feature component was added to the codebase
   Confidence: 95%

🚀 Committing changes...
✅ Changes committed successfully!
📋 Commit: a1b2c3d "✨ add UserProfile component with TypeScript types"
```

### Manual Staging
```bash
$ git add src/components/UserProfile.tsx
$ gitmoji-msg
🔍 Analyzing staged changes...
📊 Found changes in 1 file(s): tsx
🤖 Generating gitmoji suggestions...

✨ Generated commit message:
   Title: ✨ add UserProfile component with avatar support
   Description: Implemented a new UserProfile component that renders user details with customizable avatar display. This component provides a reusable interface element for showing user information consistently across the application.
   Reasoning: New feature component was added to the codebase
   Confidence: 95%
```

### Bug Fix
```bash
$ git add src/utils/validation.ts
$ gitmoji-msg
🔍 Analyzing staged changes...
📊 Found changes in 1 file(s): ts
🤖 Generating gitmoji suggestions...

✨ Generated commit message:
   Title: 🐛 fix email validation regex pattern
   Description: Fixed the email validation regular expression that was incorrectly rejecting valid email addresses with plus signs and underscores. The previous pattern was too restrictive and caused user registration failures. This fix ensures all RFC-compliant email addresses are properly accepted.
   Reasoning: Bug fix for validation logic
   Confidence: 92%
```

### Documentation
```bash
$ git add README.md docs/
$ gitmoji-msg --scope docs
🔍 Analyzing staged changes...
📊 Found changes in 2 file(s): md
🤖 Generating gitmoji suggestions...

✨ Generated commit message:
   Title: 📝(docs): update API documentation and examples
   Description: Updated the API documentation to reflect recent endpoint changes and added comprehensive examples for the new authentication flow. The documentation now includes code samples in multiple languages and clarifies the required headers for secure API access. These updates will help developers integrate with the API more effectively.
   Reasoning: Documentation files were updated
   Confidence: 98%
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`gitmoji-msg --commit`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Gitmoji](https://gitmoji.dev/) for the awesome emoji convention
- [AI SDK](https://ai-sdk.dev/) for the AI integration framework
- [oclif](https://oclif.io/) for the CLI framework