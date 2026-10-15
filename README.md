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

## Demo flow

```
Gmail inbox → Laya triage → flagged? → LLM extracts deadline → calendar write
(approval-gated) → verify on calendar → speak confirmation out loud
```

## Tech stack

Python, OpenJarvis, Laya, React (OpenJarvis's bundled frontend), Gmail/Calendar
connectors via Google OAuth, text-to-speech.

## Setup

```bash
# 1. Clone this repo
git clone <this-repo-url>
cd ultron

# 2. Clone OpenJarvis alongside it (not committed here — see .gitignore)
git clone https://github.com/open-jarvis/OpenJarvis.git
cd OpenJarvis && uv sync && cd ..

# 3. Install Laya
pip install "laya[mcp]"

# 4. Copy this repo's configs/ over the OpenJarvis agent config, then
./OpenJarvis/scripts/quickstart.sh

# 5. Connect Gmail + Calendar
cd OpenJarvis && jarvis connect gdrive
```

Environment variables (API keys, OAuth client IDs) go in a local `.env` file —
never commit it (see `.gitignore`).

## Team

- Rehan Ismail Ahmed — backend pipeline, triage, calendar integration, demo dashboard
- [Teammate name] — voice integration (text-to-speech), demo presentation

## Built at

CHAOS Hackathon, 2026 — "Jarvis: Personal AI Agent" track. Project name: **Ultron**.

## License

MIT — see [LICENSE](LICENSE). OpenJarvis (Apache-2.0), Laya, and any Hermes-sourced
skills retain their own upstream licenses; this repo only covers the original code
written for this project.
