# Ultron — Personal AI Agent (CHAOS Hackathon)

A personal AI agent that reads your inbox, flags what actually matters — assignments,
deadlines, urgent requests — and puts it straight on your calendar, no manual triage.
Built in 5 hours for the CHAOS hackathon's "Jarvis: Personal AI Agent" track.

> Note: "Ultron" is this project's own name/persona. `OpenJarvis` and the `jarvis` CLI
> below are the name of the underlying open-source framework we build on — those
> commands are unchanged, don't rename them.

## What it does

- Pulls unread Gmail via a connected account
- Triages every email in milliseconds using [Laya](https://github.com/NandhaKishorM/laya)
  (category, spam/phishing, urgency, needs-reply, plus custom `is_assignment` /
  `has_deadline` questions) — no LLM call needed for this step
- Flagged emails go to an LLM-driven agent that extracts the deadline details
  (title, date, time) and creates a calendar event, gated behind a one-click approval
- Verifies the event actually landed on the calendar, retries once, and reports
  the reason if it still fails
- Speaks new deadlines out loud as they're added ("New deadline added: ... due ...")
- Runs on a schedule, with a manual "run now" trigger for live demos

## Architecture

- **Base agent:** [OpenJarvis](https://github.com/open-jarvis/OpenJarvis) (Apache-2.0) —
  not vendored into this repo, cloned separately as a dependency (see Setup below)
- **Triage layer:** Laya, wired in via its MCP server (`laya-mcp-server`), feeding
  OpenJarvis's `orchestrator` agent
- **Skills:** optional capabilities pulled from the
  [Hermes Agent](https://github.com/NousResearch/hermes-agent) skill catalog
  (`jarvis skill install hermes:<name>`) — used for extra demo-polish tools only,
  never run as a second live agent
- **This repo** holds the glue: the custom Laya question set, the extraction/calendar/
  verify pipeline code, the demo dashboard panel, the voice (TTS) integration, test
  data, and setup scripts — everything specific to this build, kept separate from
  OpenJarvis's own source so the two projects' licenses never need to mix.
- **`ultron-agent/`:** the personal AI agent setup (memory vault, voice, face, and hands),
  built from the upstream projects listed under [Ultron agent setup](#ultron-agent-setup)

## Demo flow

```
Gmail inbox → Laya triage → flagged? → LLM extracts deadline → calendar write
(approval-gated) → verify on calendar → speak confirmation out loud
```

## Tech stack

Python, OpenJarvis, Laya, React (OpenJarvis's bundled frontend), Gmail/Calendar
connectors via Google OAuth, text-to-speech.

## Landing page

The landing page and step-by-step install guide live in [`site/`](site/) and are hosted at
https://ultron-one-xi.vercel.app. The install guide is at
https://ultron-one-xi.vercel.app/install.html. It is a static site (HTML, CSS, and vanilla JS),
so it needs no build step. To run it locally, open `site/index.html` in a browser.

## Ultron agent setup

The `ultron-agent/` folder contains four components that work together, plus the
installer that connects them:

| Folder | What it is |
|---|---|
| `fullstack-agent/` | Installer and setup guide that ties the pieces together |
| `ai-memory-vault/` | Obsidian vault that gives the agent persistent memory |
| `backtalk/` | Voice loop: hold a key, speak, and the agent answers out loud |
| `ai-visualizer/` | Browser face that shows what the agent is doing |
| `barehands/` | Optional webcam hand-tracking board for moving notes around |

Your own vault, configs, and shortcuts are personal. They are never committed here.

### Requirements

- Windows 10 or 11
- A paid Claude plan (Pro works) and [Claude Code](https://claude.com/claude-code)
- A microphone and speakers (voice), a webcam and Chrome (hands, optional)
- About 3 GB of free disk space (Python packages and speech models)

### Step 1: Install the tools

Open PowerShell and run:

```powershell
winget install --id Git.Git -e
winget install --id Obsidian.Obsidian -e
winget install --id eSpeak-NG.eSpeak-NG -e
irm https://astral.sh/uv/install.ps1 | iex
```

Restart PowerShell after installing so the new tools are on your PATH.

### Step 2: Sign in to Claude Code

Run `claude` in any terminal and choose **Claude account with subscription**. Log in
when the browser opens.

### Step 3: Copy the components into one folder

```powershell
mkdir $HOME\Desktop\my-agent
git clone https://github.com/Ortholm10/Ultron.git $HOME\Desktop\ultron-clone
Copy-Item -Recurse $HOME\Desktop\ultron-clone\ultron-agent\* $HOME\Desktop\my-agent\
```

Then open `my-agent\` in Claude Code and run `claude` from there. The agent's home is
that folder, so its `CLAUDE.md` and memory must live there.

### Step 4: Create your memory vault

1. Open Obsidian, choose **Create new vault**, and name it (for example `Ultron Brain`).
   Put it in your user folder, not in OneDrive or Documents.
2. In Claude Code inside `my-agent\`, say: `read ai-memory-vault\ai-memory-vault.md and set me up`.
   Answer its questions. It builds the vault and writes your `CLAUDE.md`.
3. Keep the vault backed up. It lives only on this computer.

### Step 5: Configure and install the voice

1. Copy `backtalk\backtalk.json.example` to `backtalk\backtalk.json`.
2. Edit it: set `agent_dir` to your `my-agent` folder, `name` to your agent's name,
   `extra_dirs` to your vault folder, and `greeting` to the line you want it to say.
   Choose `mic_mode` (`"ptt"` for push-to-talk, or `"open"` for hands-free) and
   `ptt_key` (the key you hold to talk, for example `right_alt` or `home`).
3. Set `permission_mode` to `"ask"` (asks before acting) or `"bypassPermissions"`.
4. Install the voice's Python environment and speech models (about 1 GB, first run only):

   ```powershell
   cd $HOME\Desktop\my-agent\backtalk
   $uv = "$HOME\.local\bin\uv.exe"
   & $uv venv .venv
   & $uv pip install --python .venv\Scripts\python.exe -e .
   ```

5. If the console shows a `cublas64_12.dll` warning, add `"stt_device": "cpu"` to
   `backtalk.json`. The warning is harmless; this just skips the check.

### Step 6: Configure the face

1. Copy `ai-visualizer\ai-visualizer.json.example` to `ai-visualizer\ai-visualizer.json`.
2. Set `name` to your agent's name, `face` to `board`, `radial`, `rain`, or `neural`, and
   `bus_dir` to the full path of your `backtalk` folder.

### Step 7: Configure the hands (optional)

1. Copy `barehands\barehands.json.example` to `barehands\barehands.json`.
2. Set `name` to your agent's name. Point the `Notes` orb's `path` at your vault folder.
   Leave the `Props` orb's path as `media`.

### Step 8: Create Desktop launchers

Create these three `.bat` files on your Desktop:

- **Chat with <name>.bat**: `cd /d "C:\Users\<you>\Desktop\my-agent"` then `claude`
- **Talk to <name>.bat**: `call "C:\Users\<you>\Desktop\my-agent\fullstack-agent\start.bat" voice`
- **<name> barehands.bat**: `call "C:\Users\<you>\Desktop\my-agent\fullstack-agent\start.bat" hands`

Replace `<you>` with your Windows user name.

### Step 9: Test it

1. Double-click **Talk to <name>**. A console window opens, the voice loads, and the
   face opens in your browser.
2. Hold the talk key you set in `ptt_key`, speak, and release it. The agent answers
   out loud.
3. If nothing happens, click the console window once so it has focus, then try again.

### Optional extras

- **ElevenLabs voice:** create an account and an API key, then set the key as the
  `ELEVENLABS_API_KEY` environment variable. Install ffmpeg with `winget install Gyan.FFmpeg`.
  Set the voice in `backtalk.json`.
- **Chat only:** the **Chat with <name>** launcher works without the voice or face.

### Keep personal files out of git

Never commit these:

- `backtalk\backtalk.json`, `ai-visualizer\ai-visualizer.json`, `barehands\barehands.json`
- `CLAUDE.md` and your vault
- `.venv\`, `barehands\state\`, and `logs\`
- Any API key or token

## Hackathon pipeline setup

These steps set up the Gmail and calendar pipeline for the hackathon.

```bash
# 1. Clone this repo
git clone https://github.com/Ortholm10/Ultron.git
cd Ultron

# 2. Clone OpenJarvis alongside it (not committed here — see .gitignore)
git clone https://github.com/open-jarvis/OpenJarvis.git
cd OpenJarvis && uv sync && cd ..

# 3. Install Laya (checkpoint download is slow — start this early, on good wifi)
pip install "laya[mcp]"

# 4. Run OpenJarvis's own setup against its defaults — nothing custom yet
cd OpenJarvis && ./scripts/quickstart.sh
#   (Windows: this is a bash script. Run it from Git Bash or WSL, not plain
#   PowerShell/cmd. If neither is available, ask your coding agent to read the
#   script and run its steps manually — it's mostly `uv run jarvis init`,
#   starting the API server, and `npm run dev` in frontend/.)

# 5. Connect Gmail + Calendar (one OAuth flow covers Gmail, Calendar and Tasks,
#    despite the "gdrive" name)
jarvis connect gdrive

# 6. Only once the above all works: build this project's own configs/ (Laya
#    question set, orchestrator wiring) and layer it on — see docs/configs.md
#    (added once that step is built, not part of initial setup)
```

Environment variables (API keys, OAuth client IDs) go in a local `.env` file —
never commit it (see `.gitignore`).

## Team

- Rehan Ismail Ahmed — backend pipeline, triage, calendar integration, demo dashboard
- Syed Mohammed Quadri
- Teertha Satish

## Built at

CHAOS Hackathon, 2026 — "Jarvis: Personal AI Agent" track. Project name: **Ultron**.

## License

MIT — see [LICENSE](LICENSE). OpenJarvis (Apache-2.0), Laya, and any Hermes-sourced
skills retain their own upstream licenses; this repo only covers the original code
written for this project.

The `ultron-agent/` components keep their own licenses, as stated in each folder's `LICENSE`:
`fullstack-agent`, `backtalk`, `ai-visualizer`, and `barehands` are GNU AGPL-3.0;
`ai-memory-vault` is Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0).
