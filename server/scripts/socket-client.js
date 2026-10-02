import { io } from 'socket.io-client';
import readline from 'readline';

const API = process.env.API_URL || 'http://localhost:5001';

const args = process.argv.slice(2);
const useToken = args[0] === '--token';
const tokenArg = useToken ? args[1] : null;
const [email, password, conversationId] = useToken ? [null, null, args[2]] : args;

if (!useToken && (!email || !password)) {
  console.log('Usage: node scripts/socket-client.js <email> <password> [conversationId]');
  console.log('   or: node scripts/socket-client.js --token <token> [conversationId]');
  process.exit(1);
}

const login = async () => {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

const main = async () => {
  let token = tokenArg;

  if (!useToken) {
    const data = await login();
    token = data.token;
    console.log(`Logged in as ${data.user.username}`);
  }

  const socket = io(API, { auth: { token } });

  socket.on('connect', () => {
    console.log(`Connected (${socket.id}).`);
    if (conversationId) console.log('Type a message and press Enter to send. Ctrl+C to quit.');
  });

  socket.on('connect_error', (err) => console.log('Connection failed:', err.message));
  socket.on('disconnect', (reason) => console.log('Disconnected:', reason));
  socket.on('receive_message', (m) => console.log(`[${m.sender.username}] ${m.content}`));
  socket.on('conversation_created', (c) => console.log(`New conversation: ${c._id} (${c.type})`));

  if (conversationId) {
    const rl = readline.createInterface({ input: process.stdin });

    rl.on('line', (line) => {
      const content = line.trim();
      if (!content) return;

      socket.emit('send_message', { conversationId, content }, (res) => {
        if (!res.ok) console.log('Send failed:', res.error);
      });
    });
  }
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});