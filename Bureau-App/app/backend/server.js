// The Bureau — Backend Server
// Node.js + Express.js
// Phase 1 Build Target

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'The Bureau is operational', version: '1.0.0' });
});

// TODO Phase 1 Routes:
// POST /api/benjamin  — Claude API chat
// GET  /api/inbox     — Gmail + WhatsApp messages
// GET  /api/clients   — Notion Clients DB
// GET  /api/projects  — Notion Projects DB
// GET  /api/finance   — Notion Finance DB
// POST /api/invoice   — Create invoice in Notion
// POST /api/task      — Create task in Notion
// GET  /api/briefing  — Morning briefing generation

app.listen(PORT, () => {
  console.log(`The Bureau backend running on port ${PORT}`);
});
