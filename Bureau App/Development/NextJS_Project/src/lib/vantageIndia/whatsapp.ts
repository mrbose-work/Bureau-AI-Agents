// Vantage India WhatsApp bot — logs into the office number's WhatsApp Web
// session via Baileys and only acts within the configured Vantage India
// group. Auth session persists in .baileys_auth (gitignored) so you only
// scan the QR code once.
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  WASocket,
  proto,
} from 'baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.resolve(process.cwd(), '.baileys_auth');

export interface IncomingReport {
  senderPhone: string; // digits only, no @s.whatsapp.net suffix
  senderName: string | null;
  text: string;
  timestamp: number;
}

export interface WhatsAppBotOptions {
  groupId?: string; // set once known; if unset, bot only logs group IDs it sees
  onGroupMessage?: (msg: IncomingReport) => void | Promise<void>;
}

let sockInstance: WASocket | null = null;

export async function startWhatsAppBot(opts: WhatsAppBotOptions = {}) {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // we handle QR display ourselves via connection.update
  });
  sockInstance = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // eslint-disable-next-line no-console
      console.log('\n=== NEW QR CODE GENERATED ===\n');
      import('qrcode').then(({ default: qrcode }) => {
        const qrPath = path.resolve(process.cwd(), '.whatsapp-qr.png');
        qrcode.toFile(qrPath, qr, { width: 400 }, (err) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to write QR image:', err);
          } else {
            // eslint-disable-next-line no-console
            console.log(`QR image written to ${qrPath}`);
          }
        });
      });
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      // eslint-disable-next-line no-console
      console.log('Connection closed. Reconnecting:', shouldReconnect, 'statusCode:', statusCode);
      if (shouldReconnect) {
        startWhatsAppBot(opts);
      }
    } else if (connection === 'open') {
      // eslint-disable-next-line no-console
      console.log('✅ WhatsApp connected.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;
      const jid = msg.key.remoteJid ?? '';
      if (!jid.endsWith('@g.us')) continue; // groups only

      // Log any group we haven't been told about yet, to help identify the ID.
      if (!opts.groupId) {
        // eslint-disable-next-line no-console
        console.log(`[unmapped group message] groupId=${jid}`);
        continue;
      }
      if (jid !== opts.groupId) continue;

      const text = extractText(msg.message);
      if (!text) continue;

      // fromMe messages (Mr. Bose's own check-ins etc., sent from this same
      // office number) have no `participant` field — fall back to our own
      // registered JID so his messages get attributed correctly, not to the group.
      const senderJid = msg.key.fromMe ? sock.user?.id : msg.key.participant ?? jid;
      const senderPhone = (senderJid ?? jid).split(':')[0].split('@')[0];

      const report: IncomingReport = {
        senderPhone,
        senderName: msg.key.fromMe ? sock.user?.name ?? 'Mr. Bose' : msg.pushName ?? null,
        text,
        timestamp: Number(msg.messageTimestamp ?? Date.now() / 1000) * 1000,
      };

      await opts.onGroupMessage?.(report);
    }
  });

  return sock;
}

function extractText(message: proto.IMessage): string | null {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    null
  );
}

export async function sendGroupMessage(groupId: string, text: string) {
  if (!sockInstance) throw new Error('WhatsApp socket not started yet.');
  await sockInstance.sendMessage(groupId, { text });
}

export async function listJoinedGroups() {
  if (!sockInstance) throw new Error('WhatsApp socket not started yet.');
  const groups = await sockInstance.groupFetchAllParticipating();
  return Object.values(groups).map((g) => ({ id: g.id, subject: g.subject }));
}
