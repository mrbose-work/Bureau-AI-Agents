# Vantage India / Benjamin — Staged Project Plan

Goal: build this in stages, cheaply — lean on local Ollama models for routine
work, save Claude usage for judgment calls and actual coding sessions like
this one. Nothing below gets built without discussing it here first.

## Stage 0 — Done, live today
- WhatsApp bot (Baileys) connected on the office number, scoped to the
  Vantage Group only.
- Daily task digest, 9:30am Mon–Sat, pulled from the real Vantage India
  Tasks DB.
- WhatsApp report parsing → Vantage India Daily Reports DB (Notion, in the
  Vault) via local Ollama (qwen2.5:14b).
- Attendance tracking: check-in/check-out messages → Attendance DB, late
  flagged if check-in after 10:00. Absenteeism sweep built but disabled
  (on hold, per Mr. Bose).
- Benjamin's intro message drafted — pending approval before send.

## Stage 1 — Virtual workspace: talk to Benjamin directly (next up)
- A simple chat interface (likely inside the existing Next.js app) where
  Mr. Bose can talk to Benjamin directly and see what he's working on.
- Open question to resolve first thing tomorrow: local model vs Claude for
  this chat, or a hybrid (local model as default, Claude only when a
  reply needs stronger judgment).
- No "virtual office" visuals yet (Munder Difflin idea) — just a working
  chat, text-based, first.

## Stage 2 — Payments & approvals
- New WhatsApp group "Vantage India Payments" — staff send bill/voucher
  photos + vendor/amount.
- Requires a local vision model (recommended: `qwen3-vl:4b`, fits this
  laptop's 16GB RAM without a dedicated GPU) to read the photos.
- New Notion Payments/Expenses DB (Staff, Vendor, Amount, Status, bill
  image attached).
- Director approval: simple Notion status field (Pending → Approved),
  manual for now — no WhatsApp approval-chat logic yet.
- Accountant view = same DB filtered to "Approved."

## Stage 3 — Inventory tracking (deadline: Oct 11 launch)
- Vantage India Inventory DB + Inventory Movement DB already exist in
  Notion — need to design how Benjamin watches/flags errors there.
- Blocked on: billing machine purchase/login access (per the other
  session — vendor sets up director/biller/waiter logins after payment).
  Can still build the Notion-side tracking logic without that access.

## Stage 4 — Obsidian as Benjamin's memory foundation
- Consolidate chat logging into the existing `Vantage India` Obsidian
  vault (`06-Sessions/`) instead of the separate flat `Benjamin_Brain`
  log — one memory, not two.
- Build a one-way sync: Notion → Obsidian (extends existing
  `src/lib/notionLiveSync.ts`), so the vault mirrors Notion automatically
  — never edited by hand, always current.
- Move Benjamin's (and later Bella's) personality out of hardcoded code
  strings into its own file in the vault (e.g. `99-Meta/Benjamin_Persona.md`),
  so any tool reads the same personality — no drift.

## Stage 5 — Director dashboard
- One Notion view/page rolling up inventory, expenses, task delays,
  performance — built once Stages 2–3 have real data flowing into them.

## Stage 6 — Social media / marketing tracking
- Content calendar deadlines, vendor tracking (printing, hoarding),
  metrics — lowest time pressure of everything listed, revisit after the
  above.

## Later / not scoped yet
- Bella — stays as-is (stress-support persona) until Benjamin's workload
  is stable; evolves into his counterpart later.
- "Munder Difflin" virtual office UI — floated idea only, no build.
- Obsidian graph view aesthetics (theme, color-coded nodes) — quick win,
  parked, do whenever there's a free moment.
- Old OnePlus phone / Raspberry Pi as an always-on host — not needed
  right now (no 24/7 requirement yet); revisit only if that requirement
  changes. If it does, a used laptop (16GB+ RAM, SSD, no GPU required) is
  the practical choice, not a repurposed phone.

## Standing rules
- Never send a WhatsApp message without showing the draft first and
  getting explicit approval.
- Local models (Ollama) do the routine/repetitive work; Claude is for
  actual coding sessions and judgment calls — not routine ops tasks.
- One canonical source per type of data: Notion for live business data,
  Obsidian for durable/offline knowledge + memory, GitHub for code +
  backup. No duplicating the same fact in two places by hand.
