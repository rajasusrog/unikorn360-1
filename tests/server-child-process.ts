process.env.NODE_ENV = 'test';
import http from 'http';
import { app, setSupabaseAdmin } from '../server.js';
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const port = parseInt(args[0], 10);
const dbBridgeUrl = args[1];

if (!port || !dbBridgeUrl) {
  console.error('Usage: tsx tests/server-child-process.ts <port> <dbBridgeUrl>');
  process.exit(1);
}

// Independent Supabase client for this server process connected to the disposable database bridge
const client = createClient(dbBridgeUrl, 'sb_secret_test_key_123', {
  auth: { persistSession: false, autoRefreshToken: false }
});
setSupabaseAdmin(client);

// Use the ACTUAL application Express app from server.ts
const server = http.createServer(app);

server.listen(port, '127.0.0.1', () => {
  console.log(`CHILD_SERVER_READY pid=${process.pid} port=${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
