const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Path to store the authentication details
const AUTH_PATH = path.join(__dirname, 'auth_info.json');

// Initialize readline interface for OTP input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to start the WhatsApp bot
async function startBot() {
    // Load or initialize authentication state
    const { state, saveCreds } = useSingleFileAuthState(AUTH_PATH);

    // Create a new WhatsApp connection
    const conn = makeWASocket({
        auth: state,
        printQRInTerminal: true  // Disable QR code printing
    });

    // Event handler for authentication
    conn.ev.on('creds.update', saveCreds);

    // Event handler for new messages
    conn.ev.on('messages.upsert', (m) => {
        console.log('New message received:', m);
        // Handle incoming messages here
    });

    // Prompt user for OTP and proceed with authentication
    rl.question('Please enter the OTP sent to your number: ', async (otp) => {
        try {
            await conn.login({ phoneNumber: '+919992546793', otp }); // Replace with your number
            console.log('Successfully logged in!');
            rl.close();
        } catch (error) {
            console.error('Login failed:', error);
        }
    });
}

// Start the bot
startBot().catch(console.error);
