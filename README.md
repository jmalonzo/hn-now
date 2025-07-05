# 🗞️ Hacker News CLI Browser

An interactive terminal-based UI for browsing Hacker News stories. Navigate through top stories, new posts, Ask HN, Show HN, and job listings with an intuitive text interface.

## ✨ Features

- **Interactive Story Browser**: Navigate through stories with arrow keys and selection
- **Multiple Story Types**: Browse top, new, best stories, Ask HN, Show HN, and jobs
- **Smart Actions**: Open articles and comments in your browser
- **Beautiful Display**: Colored output with scores, comment counts, and metadata
- **Configurable**: Adjust the number of stories to fetch (1-100)
- **Fast Loading**: Concurrent API requests with loading indicators
- **URL Handling**: Automatic browser opening and URL copying

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g hn-now
```

### Local Development

```bash
git clone https://github.com/jmalonzo/hn-now.git
cd hn-now
npm install
npm run build
npm start
```

## 📖 Usage

### Interactive Mode (Default)

Simply run the command to start the interactive browser:

```bash
hn-now
```

### Legacy CLI Mode

For backwards compatibility, you can still use the original CLI format:

```bash
hn-now top [limit]    # Top stories
hn-now new [limit]    # New stories
hn-now best [limit]   # Best stories
hn-now ask [limit]    # Ask HN stories
hn-now show [limit]   # Show HN stories
hn-now job [limit]    # Job postings
```

## 🎯 Interactive Features

### Main Menu

- **🔥 Top Stories** - Most popular current stories
- **🆕 New Stories** - Latest submissions
- **⭐ Best Stories** - Highest quality stories
- **❓ Ask HN** - Community questions and discussions
- **🎯 Show HN** - Community projects and creations
- **💼 Jobs** - Job postings
- **⚙️ Settings** - Configure fetch limits and preferences

### Story Actions

For each story, you can:

- **🔗 Open Article** - Opens the story URL in your default browser
- **💬 Open Comments** - Opens the Hacker News discussion page
- **📋 Copy URLs** - Copy article or comment URLs to clipboard

### Story Information Display

Each story shows:

- **Title** - Story headline
- **Score** - Upvote count (▲ 123)
- **Comments** - Discussion count (💬 45)
- **Author** - Username (@author)
- **Time** - Relative time (2h ago)
- **Domain** - Source website (for external links)

## ⚙️ Configuration

### Settings Menu

Access via the main menu to configure:

- **Story Limit** - Number of stories to fetch (1-100, default: 30)

### Environment Variables

- `HN_BROWSER` - Override default browser for opening links
- `HN_LIMIT` - Default story limit

## 🔧 Requirements

- **Node.js** 16.0.0 or higher
- **npm** or **yarn**
- **Terminal** with color support (most modern terminals)

## 🌐 API Endpoints

This tool uses the official Hacker News Firebase API:

- Base URL: `https://hacker-news.firebaseio.com/v0/`
- **Top Stories**: `/topstories.json`
- **New Stories**: `/newstories.json`
- **Best Stories**: `/beststories.json`
- **Ask HN**: `/askstories.json`
- **Show HN**: `/showstories.json`
- **Jobs**: `/jobstories.json`
- **Item Details**: `/item/{id}.json`

All endpoints are up-to-date and actively maintained by Y Combinator.

## 🎨 Screenshots

```
🗞️  Hacker News CLI Browser

? What would you like to browse?
❯ 🔥 Top Stories
  🆕 New Stories
  ⭐ Best Stories
  ❓ Ask HN
  🎯 Show HN
  💼 Jobs
  ────────────────
  ⚙️  Settings
  ❌ Exit
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

### v2.1.0

- 🚀 Updated dependencies and TypeScript support
- ✨ Moved from CommonJS to ESM

### v2.0.0

- ✨ Complete rewrite with interactive terminal UI
- 🎨 Modern, colorful interface with intuitive navigation
- 🔗 Browser integration for opening articles and comments
- ⚙️ Configurable settings and preferences
- 🚀 Updated dependencies and TypeScript support
- 📱 Better error handling and loading states

### v1.x.x

- Basic CLI output format
- Simple story fetching

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Y Combinator** - For the excellent Hacker News API
- **Hacker News Community** - For the great content and discussions
- **Open Source Contributors** - For the amazing Node.js ecosystem

---

**Happy browsing!** 🚀 If you find this tool useful, please consider giving it a ⭐ on GitHub!
