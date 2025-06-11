# 🎨 gitmoji-msg

AI-powered gitmoji commit message generator! Automatically analyze your git changes and generate meaningful commit messages following the [gitmoji](https://gitmoji.dev/) standard.

## ✨ Features

- 🤖 **AI-Powered Analysis**: Uses advanced AI to understand your code changes
- 🎯 **Smart Gitmoji Selection**: Automatically chooses the most appropriate gitmoji
- 📝 **Official Gitmoji Spec**: Follows the [official gitmoji specification](https://gitmoji.dev/) format
- 🔄 **Interactive Mode**: Choose from multiple AI-generated suggestions
- ⚙️ **Configurable**: Support for multiple AI providers (OpenAI, Anthropic)
- 🚀 **Auto-commit**: Optionally commit automatically with generated messages
- 📋 **Gitmoji Browser**: List and search available gitmojis
- 🎨 **Extended Descriptions**: Detailed commit descriptions explaining what, why, and impact

## 🚀 Quick Start (No Installation Required)

Try gitmoji-msg instantly without installing:

```bash
# Using bunx (recommended)
bunx gitmoji-msg

# Using pnpm
pnpm dlx gitmoji-msg

# Using npx
npx gitmoji-msg
```

## 📦 Installation

For regular use, install globally:

```bash
# Using bun (recommended)
bun add -g gitmoji-msg

# Using pnpm
pnpm add -g gitmoji-msg

# Using npm
npm install -g gitmoji-msg
```

## 🚀 Getting Started

1. **Set up your API key** (OpenAI example):

   ```bash
   export OPENAI_API_KEY="your-api-key"
   ```

2. **Generate commit message**:
   ```bash
   gitmoji-msg run
   ```

That's it! The AI will analyze your changes and suggest gitmoji commit messages.

## 📖 Usage

```
USAGE
  $ gitmoji-msg [COMMAND]

COMMANDS
  config    Manage gitmoji-msg configuration settings
  generate  Generate gitmoji commit messages using AI analysis of your staged changes
  help      Display help for gitmoji-msg
  list      List available gitmojis with their descriptions
  plugins   List installed plugins
  run       Add all changes, generate gitmoji commit message, and commit automatically
```

### Basic Commands

```bash
# Add all changes, generate message, and commit automatically
gitmoji-msg run

# Generate commit message for staged changes only (stages nothing if nothing staged)
gitmoji-msg generate

# Manage configuration settings
gitmoji-msg config

# List available gitmojis
gitmoji-msg list

# Display help
gitmoji-msg help
```

### Generate Command Options

```bash
# Generate with specific options
gitmoji-msg generate --scope api --model gpt-4

# Non-interactive mode (use first suggestion)
gitmoji-msg generate --no-interactive

# Auto-commit after generating
gitmoji-msg generate --commit
```

### Run Command Options

```bash
# Full workflow with options
gitmoji-msg run --scope feat --model gpt-4

# Dry run - see what would be committed without committing
gitmoji-msg run --dry-run

# Non-interactive run
gitmoji-msg run --no-interactive
```

### Configuration Management

```bash
# View current configuration
gitmoji-msg config

# Set configuration values
gitmoji-msg config set provider openai
gitmoji-msg config set model gpt-4o-mini
gitmoji-msg config set interactive true
```

### Browse Gitmojis

```bash
# List all gitmojis
gitmoji-msg list

# Search gitmojis by keyword
gitmoji-msg list --search feature
gitmoji-msg list --search bug

# Show gitmoji codes instead of emojis
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

| Option        | Default       | Description                         |
| ------------- | ------------- | ----------------------------------- |
| `provider`    | `openai`      | AI provider (`openai`, `anthropic`) |
| `model`       | `gpt-4o-mini` | AI model to use                     |
| `interactive` | `true`        | Show multiple suggestions           |
| `autoCommit`  | `false`       | Auto-commit generated messages      |
| `scope`       | -             | Default scope for commits           |

## 🎯 How It Works

### Smart Staging Behavior

- **`run` command**: If nothing is staged, stages all changes automatically. If changes are already staged, works only with those staged changes.
- **`generate` command**: Only works with currently staged changes. Won't stage anything automatically.

### Process

1. **Git Analysis**: Analyzes your changes using `git diff`
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
   Title: ✨ (components): add UserProfile with avatar support
   Description: Created a new UserProfile component that displays user information with avatar support and integrated TypeScript type definitions. This component was needed to provide a consistent user interface element across the application. The TypeScript types ensure type safety and improve developer experience by providing proper intellisense and compile-time error checking.
   Reasoning: New feature component was added to the codebase
   Confidence: 95%

🚀 Committing changes...
✅ Changes committed successfully!
📋 Commit: a1b2c3d "✨ (components): add UserProfile with avatar support"
```

### Generate and Commit

```bash
$ gitmoji-msg run
🔍 Analyzing changes...
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
$ gitmoji-msg run
🔍 Analyzing changes...
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
$ gitmoji-msg run --scope docs
🔍 Analyzing changes...
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
