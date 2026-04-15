# Hardware Team Convex Onboarding Guide

Welcome to the AI-JEEP fleet tracking system backend setup. This guide will help you set up your own personal development sandbox so you can test your Raspberry Pi Python scripts against a safe, isolated copy of our production data.

---

## Introduction: Understanding Our Convex Architecture

Convex is our real-time backend that handles all database operations, authentication, and API endpoints for the AI-JEEP fleet tracking system.

**Important Architecture Concept:**
- **Production Database**: This is our live system running at `ai-jeep.convex.cloud` where real vehicle data flows in from our deployed edge nodes.
- **Dev Sandbox**: This is your personal, isolated development environment. When you run `npx convex dev`, Convex automatically creates a clone of the production schema (database tables and structure) just for you. Any data you write or test here stays in your sandbox and does not affect production.

This isolation allows you to experiment freely without worrying about breaking the live fleet tracking system.

---

## Prerequisites

Before starting, make sure you have the following installed on your laptop:

| Tool | Purpose | Check Version |
|------|---------|---------------|
| **Node.js** | JavaScript runtime for Convex CLI | `node --version` (v18+) |
| **npm** | Package manager (comes with Node.js) | `npm --version` |
| **Git** | Version control for cloning the repo | `git --version` |
| **VS Code** | Recommended code editor | `code --version` |

---

## Step 1: Get the Code

1. Open your terminal or PowerShell.
2. Navigate to your desired working directory.
3. Clone the repository:

```bash
git clone https://github.com/your-org/ai-jeep.git
```

4. Navigate into the web directory:

```bash
cd ai-jeep/web
```

5. Install the project dependencies:

```bash
npm install
```

This may take a minute. You'll see a success message when complete.

---

## Step 2: Start the Sandbox

1. While still in the `web` directory, start your personal Convex dev environment:

```bash
npx convex dev
```

2. **First-time setup**: You will be prompted to log in via your browser. Choose your preferred authentication method (GitHub or email).

3. **Automatic schema cloning**: Convex will automatically detect the production schema and create a clone of all database tables for your personal sandbox. You'll see messages in the terminal indicating the schema is being set up.

4. Once complete, your terminal will display your **Dev Deployment URL** (something like `https://your-name--ai-jeep.convex.site`).

> **Tip**: Keep this terminal window open while developing. Stop it with `Ctrl+C` when done.

---

## Step 3: Finding the Dev URL

There are two ways to find your personal Dev HTTP Webhook URL:

### Option A: Terminal Output

Look at the output when you run `npx convex dev`. It will display a URL in this format:

```
🔗 Linked to: https://your-name--ai-jeep.convex.site
```

This is your Dev URL. Copy it for use in your Python scripts.

### Option B: Convex Dashboard

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. You should see your personal dev deployment listed (typically shows as `your-name--ai-jeep`).
3. Click on it and navigate to **Settings** → **HTTP Actions** to find your webhook URL.

---

## Step 4: The Golden Rule (Environment Variables)

**This is the most important step.**

When running your Python edge node scripts locally or on the Raspberry Pi during testing, you **MUST** replace the Production URL with your Dev URL.

### Example Environment Variable

In your Python scripts, instead of:

```python
CONVEX_URL = "https://ai-jeep.convex.cloud"
```

Use your personal Dev URL:

```python
CONVEX_URL = "https://your-name--ai-jeep.convex.site"
```

### How to Set It

Create a `.env` file in your Python project directory:

```bash
CONVEX_URL=https://your-name--ai-jeep.convex.site
```

Or export it in your terminal before running your script:

```bash
# Windows (PowerShell)
$env:CONVEX_URL="https://your-name--ai-jeep.convex.site"

# macOS / Linux
export CONVEX_URL="https://your-name--ai-jeep.convex.site"
```

> **Never commit your `.env` file to GitHub.** Add it to `.gitignore` if it's not already there.

---

## Step 5: Writing Backend Code

If you need to add new HTTP actions, database columns, or custom business logic, you'll work in the `convex/` folder.

### Key Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Defines all database tables and schemas |
| `convex/fleet.ts` | Fleet-related functions (vehicles, GPS data) |
| `convex/users.ts` | User authentication and management |
| `convex/http.ts` | HTTP endpoints for your Python scripts to call |

### Adding New Functions

1. Open any file in the `convex/` folder.
2. Add your new function following the existing patterns.
3. Changes are automatically synced when you run `npx convex dev`.

---

## Step 6: Pushing Changes

Once your hardware syncs perfectly with your Dev sandbox and you've tested everything:

1. **Commit your code to GitHub**:

```bash
git add .
git commit -m "Add fleet tracking endpoint for sensor X"
git push origin main
```

2. **Notify the web lead**: Let me know that your changes are ready. I will review and deploy them to the Production database.

> **Note**: You do **not** need to deploy to production yourself. The web lead handles all production deployments to ensure everything stays stable.

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Start dev environment | `npx convex dev` |
| Find your Dev URL | In terminal output or Convex Dashboard |
| Stop dev environment | `Ctrl+C` |
| Push changes to production | Commit to GitHub and notify web lead |

---

## Troubleshooting

**Q: I can't log in to Convex**
- Run `npx convex logout` first, then try `npx convex dev` again.

**Q: My Python requests are failing**
- Verify your `.env` file has the correct Dev URL (not the production URL).
- Make sure `npx convex dev` is running.

**Q: I don't see my data in the dashboard**
- You're likely looking at the production dashboard. Go to [dashboard.convex.dev](https://dashboard.convex.dev) to see your personal dev deployment.

**Q: I broke something**
- No worries! Your sandbox is isolated. Just restart with `npx convex dev` to get a fresh clone.

---

Need help? Reach out to the web lead (sakin dave bahahhahaha taenamo).
