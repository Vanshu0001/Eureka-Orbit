const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const axios = require('axios');
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

const wikipedia = require('wikipedia');

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.message || message.key.fromMe) return;

        const from = message.key.remoteJid;
        const textMessage = message.message.conversation || message.message.extendedTextMessage?.text;

        if (textMessage && textMessage.startsWith('.question ')) {
            const query = textMessage.replace('.question ', '').trim();
            
            try {
                const page = await wikipedia.page(query);
                const summary = await page.summary();
                
                if (summary.extract) {
                    await sock.sendMessage(from, { text: summary.extract.substring(0, 4000) }); // Sends up to 4000 characters
                } else {
                    await sock.sendMessage(from, { text: "No information found for that query on Wikipedia." });
                }
            } catch (error) {
                console.error(error);
                await sock.sendMessage(from, { text: "Error fetching data. Please try again." });
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('Bot is online!');
        }
    });

    sock.ev.on('creds.update', saveState);
}

startBot();
