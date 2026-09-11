# Building the Gender Watch Protocol desktop app

This project is now packaged as an Electron desktop app.

## Prerequisites

Install Node.js (LTS) and npm.

Then, from this folder:

```bash
npm install
```

## Test locally

Build the Vite app and open it as a desktop application:

```bash
npm run electron
```

## Build installers

### Windows

```bash
npm run dist:win
```

Creates a Windows NSIS installer in `release/`.

### macOS

```bash
npm run dist:mac
```

Creates DMG files for Intel and Apple Silicon in `release/`.

For a real macOS release, build/sign/notarize on a Mac. Apple signing credentials are not included in this project.

### Linux

```bash
npm run dist:linux
```

Creates an x64 AppImage and Debian package in `release/`.

The AppImage is convenient for testing on a Linux machine.

## Important: Supabase configuration

The current application uses Supabase through Vite environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The existing `.env` file is used at build time. Do not put a Supabase service-role key or other secret key in this app. The anon/publishable key is designed for client-side use, with database access controlled by Supabase RLS policies.

## Project structure

```text
electron/
  main.cjs          Electron main process
src/                React application
dist/               Vite production build
release/            Electron installers (generated)
```
