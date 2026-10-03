# Lost in Paris

**Learn French by living through it.**

Your phone is dead. Somewhere in Le Marais is the best croissant in Paris. With no maps, no translation app, and no battery, your only tool is your French.

A small, voice-first hackathon game: four AI character encounters, one complete mission, original Paris illustrations, and no accounts, database, or movement engine. The interface is English; the conversations are French. Maison Lumière is fictional.

## Setup

Use **Node.js 20.19+** (22 LTS recommended).

```bash
npm install
cp .env.example .env
```

Put your Google Gemini API key in `.env`:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

```bash
npm run dev
```

Open **http://localhost:5173**. Start the adventure, click **Say bonjour to Camille**, then allow the microphone when prompted. Allow the microphone during connection setup. Click the mic once to start, say your full sentence, then click again to send. Space/Enter also toggles the focused button. Pauses and releasing the mouse do not stop recording; the safety limit is 60 seconds. Subsequent encounters connect automatically once voice has been enabled.

Only localhost or HTTPS supports browser microphone access. Chrome/Edge are recommended; Safari with AudioWorklet support also works. Headphones prevent NPC audio from feeding back into the microphone. Internet access and key access to **`gemini-3.8-live`** are required; the app never silently substitutes another model or fake conversation.

The key stays server-side. `.env` is ignored, and `.env.example` contains only a placeholder. Restart the server after changing the key. The health endpoint, `/api/health`, returns only whether a key is configured, never its value.

```bash
npm test
npm run build
npm start
```

Production runs at **http://localhost:3001** and serves `dist/`. `PORT` can override either local port. This is a local hackathon app, not a public multi-user service.

## Architecture

React + TypeScript, a single small Node HTTP/WebSocket server, Google's official **`@google/genai`** SDK, and esbuild. No external map API, authentication, database, separate text-to-speech service, or deployment framework.

The preferred Vite dependencies were unavailable in the implementation environment's offline package cache, so esbuild handles both development bundling and production builds. Development watches source files; **refresh the browser after edits**. Styling is plain CSS with responsive layouts and reduced-motion support. Google Fonts are optional: Georgia and Arial provide offline fallbacks.

```text
src/
  App.tsx                    Six-state journey and screen composition
  components/                Environment, NPC, mission, voice, hints, transitions
  data/scenes.ts             All four encounters + French configuration
  hooks/useGameState.ts      Idempotent mission state and transitions
  hooks/useGeminiLive.ts     Voice lifecycle, transcripts, playback, recovery
  lib/audio.ts               PCM encoding and sequential audio playback
  lib/microphone.ts          Capture lifecycle + ordered flush acknowledgement
  lib/speechStream.ts        Buffered prefix and silent/short-turn rejection
  types/game.ts              Shared scene and conversation types
server/
  agent.ts                   NPC prompt template, Live config, tool validation
  index.ts                   Secure SDK connection and WebSocket relay
  http.ts                    Public assets and key-free health endpoint
public/
  pcm-capture.js             Browser AudioWorklet microphone capture
  scenes/*.svg               Four original Paris scene illustrations
scripts/build.mjs            Production bundle
```

## How Gemini Live works

The browser connects to `/live` on the same origin. The server chooses the NPC's trusted local configuration and creates a Live session using **`gemini-3.8-live`** with native AUDIO responses. It enables input/output transcription and declares `complete_task`. No API key, system prompt, or arbitrary client-selected model is sent to the browser.

Click-to-start / click-to-send uses `activityStart` / `activityEnd` with automatic activity detection disabled. An **AudioWorklet** captures microphone samples off the UI thread; samples are encoded as mono signed 16-bit little-endian PCM at the actual AudioContext sample rate, reported in the MIME type. Gemini performs its own resampling. A short prefix is buffered so very short clicks and nearly silent recordings are not sent as hallucination-prone turns. The server relays this directly to Gemini. Native 24 kHz PCM responses are decoded and scheduled consecutively with Web Audio, avoiding overlapping chunks. Capture ends only after the AudioWorklet acknowledges that its final chunk was flushed; NPC events cannot stop an active learner recording. Every part in each Live event is processed. There is no browser speech recognition or separate TTS layer.

Each encounter supplies its name, role, objective, local knowledge, semantic success criteria, and beginner French behavior. Grammar and wording need not match the hints. The bakery explicitly requires an order **and a separate “sur place / à emporter” answer**. Léa is open-ended and should finish after three meaningful learner contributions.

When Gemini calls `complete_task`, the server validates the scene ID, `success === true`, and duplicate state. A minimum speech-turn guard prevents completion from a greeting alone, a single bakery order, or fewer than three small-talk speech turns. **Gemini, not that turn counter, judges communicative success.** The server sends the function response back to Gemini. The browser waits for the final response and queued audio, displays feedback, then animates to the next scene. A bounded fallback handles a missing final event. Old sockets, audio queues, capture contexts, streams, and timers are disposed when a scene changes or a connection is retried.

The integration follows Google's [Live API capabilities guide](https://ai.google.dev/gemini-api/docs/live-api/capabilities) and [official JavaScript SDK](https://github.com/googleapis/js-genai). Thinking configuration is deliberately omitted for this model.

## Why it is agentic

This is **not a fixed dialogue tree**. Each character has a role and contextual knowledge, understands free-form speech, chooses its own natural response, reasons about the learner's communicative success, and invokes a function that changes the environment.

```text
learner speech
  → Gemini interprets intent
  → NPC chooses a contextual spoken response
  → Gemini evaluates the objective
  → agent invokes complete_task()
  → environment advances automatically
  → a new contextual agent encounter begins
```

Only the scene sequence is predetermined. You can ask Camille about a good bakery in your own words; Amélie can clarify a missing coffee; Léa can talk about a learner-selected topic. Hints scaffold speech and **never complete a task**.

## The journey

| Scene | NPC | Objective | Completion |
|---|---|---|---|
| `street_recommendation` | Camille | Find a good croissant/bakery | Understandable French recommendation request |
| `street_directions` | Julien | Reach Maison Lumière | Understandable French directions request |
| `bakery_order` | Amélie | One croissant and one coffee | Order both, then answer the follow-up |
| `bakery_smalltalk` | Léa | A little conversation | Three meaningful French learner turns |

`intro → street_recommendation → street_directions → bakery_order → bakery_smalltalk → completed`

Each scene has three hint states: no hint, scrambled word chips, and a useful sentence. Hints reset between encounters. Progress and game state are intentionally in memory; replay resets the journey.

## Demo recovery

- **Missing key:** the conversation panel explains how to configure `.env`.
- **Denied microphone:** enable it in browser site settings and retry.
- **Disconnected Gemini / no response:** a clear error and retry reconnect the current encounter. Retrying begins a fresh NPC conversation; repeat any unfinished request or order.
- **Blocked playback:** use **Enable sound**. Text and mission state remain available.
- **Network interruption:** no crash or automatic task completion.
- **Microphone diagnosis:** in `?dev=true`, the conversation panel shows recorded duration, peak/RMS volume, and server-received duration. After a turn, **Hear my last recording** plays the actual local capture without sending it to Gemini. If it is silent or clipped, check the microphone; if it is clear and server duration matches, the remaining issue is downstream recognition.
- **Development controls:** open **http://localhost:5173/?dev=true** for a small bottom-left panel: mark complete / skip, restart current scene, or reset. Skipping uses the same completion transition as the normal journey. These controls are compiled out of production builds, even with `?dev=true`.

## Verification and remaining live checks

`npm run build` type-checks browser and server code and creates a production bundle. `npm test` checks the full scene sequence, native audio configuration, PCM sample preservation/endianness/clamping, complete utterance streaming and worklet flush ordering, completion safeguards (wrong scene, duplicate, false success, greeting-only, bakery follow-up, small-talk turns), and home routing / health / private-file protection.

The implementation environment prevents opening local listening sockets and starting Chrome. A key was added locally after initial setup, but the attempted external Live WebSocket check could not establish a session from this environment. Therefore a live microphone session, audible Gemini responses, semantic completion accuracy, and the browser visual acceptance test could not be verified here. The code includes the real Live integration; it is not backed by a simulated agent. Run the checklist below with your key before presenting.

1. Start the app; inspect the intro on desktop and mobile; start the adventure.
2. Connect to Camille and allow the microphone. Speak French; confirm an audible French reply and transcript.
3. Click **Need a hint?**, then **Show me the sentence**. Neither click should complete the task.
4. Try “Vous connaissez une bonne boulangerie ?” rather than the hint sentence. Confirm Maison Lumière is recommended and the scene automatically advances.
5. Ask Julien how to reach Maison Lumière. Confirm short directions and arrival at the bakery.
6. Order both items. Confirm Amélie asks **Sur place ou à emporter ?** and stays in the scene until your second answer.
7. Converse freely with Léa for three meaningful French turns. Confirm the completion screen and replay.
8. Disconnect the network mid-conversation; verify the error and retry after restoring it.
9. Deny microphone access, check the message, allow it in site settings, and retry.
10. Verify `?dev=true` recovery controls; verify they are absent with `npm start`.

## Another scenario or language later

Keep the same Live hook, proxy, tool, and UI. Edit `src/data/scenes.ts` to provide new characters, objectives, hints, greetings, voices, location labels, and success criteria. The language configuration feeds the reusable server prompt. Add matching assets under `public/scenes/` and extend the explicit task IDs/sequence if the number of encounters changes. Translate all scenario content and local knowledge together; simply changing a language label is insufficient. Spanish, Italian, and Swedish are visual “coming soon” options only.

SVG illustrations are self-contained and work without image downloads. To replace them with generated photos, update the asset extension in `Environment.tsx` and place corresponding files under `public/scenes/`. The current backgrounds and independently layered NPCs remain fully usable without external imagery.
