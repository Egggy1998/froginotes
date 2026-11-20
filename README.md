<div align="center">

<img src="icon.png" alt="FrogiNotes" width="96">

# FrogiNotes

**A calm place for your thoughts.** Pastel desktop sticky notes for Windows — always on top, local-first, no account, no cloud.

[Website](https://froginotes.pages.dev) · [Download](#install) · [Features](#features)

</div>

---

## Why another notes app?

Windows Sticky Notes hasn't changed in a decade. It can't do a colour palette that doesn't hurt your eyes, it can't stay above your IDE without stealing focus, and it definitely can't keep your notes when the app decides to reset.

FrogiNotes is the version I wanted: small, soft, fast, and it lives on your desktop instead of in a browser tab.

## Features

- **Pastel palette** — hand-tuned colours that stay readable at 6am and 1am
- **Always on top** — pin any note above other windows
- **Local-first** — notes are files on your machine, not rows in someone's database
- **Frameless & lightweight** — no title bar clutter, ~90 MB installed
- **Keyboard-first** — open, write, close. No wizard, no onboarding tour
- **Multi-note** — colour-coded, resizable, remembers position between sessions

## Install

Grab the latest Windows installer from **[Releases](../../releases)** — `FrogiNotes-Setup-<version>-x64.exe`.

The installer is unsigned (code signing certificates cost more than this app makes), so Windows SmartScreen will show a warning. Click **More info → Run anyway**.

macOS build exists in the source tree but is not distributed.

## Tech

| Layer | Choice | Why |
|---|---|---|
| Shell | Electron | Native window control, tray, always-on-top — the web alone can't do this |
| UI | React + TypeScript + Vite | Fast HMR, type safety on note state |
| State | Zustand stores | No boilerplate, no context hell |
| Storage | Local filesystem | Your notes survive uninstalls, backups, and my mistakes |
| Web build | Cloudflare Pages | Landing page + docs at near-zero cost |

## Development

```bash
bun install
bun run dev            # Vite dev server (browser)
bun run electron:start # Electron shell
bun run setup:win      # Build Windows NSIS installer
```

## Privacy

FrogiNotes has no telemetry, no analytics, and no network calls for note storage. The only outbound request is the update check.

---

<div align="center">
<sub>Built for people who think in small windows.</sub>
</div>
