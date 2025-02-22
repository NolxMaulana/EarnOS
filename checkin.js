const fs = require('fs');
const axios = require('axios');
const cron = require('node-cron');

// Function to read tokens from file
function readTokens() {
    try {
        const content = fs.readFileSync('tokens.txt', 'utf8');
        // Split by new line and remove empty lines
        const tokens = content.split('\n').filter(token => token.trim() !== '');
        if (tokens.length === 0) {
            throw new Error('No tokens found in tokens.txt');
        }
        return tokens;
    } catch (error) {
        console.error('Error reading tokens file:', error);
        process.exit(1);
    }
}

// Function to perform check-in for a single account
async function performCheckIn(token, accountIndex) {
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://api.earnos.com/trpc/streak.checkIn?batch=1',
            headers: {
                'authority': 'api.earnos.com',
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.7',
                'authorization': `Bearer ${token.trim()}`,
                'content-type': 'application/json',
                'origin': 'https://app.earnos.com',
                'referer': 'https://app.earnos.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
            },
            data: {
                "0": {
                    "json": null,
                    "meta": {
                        "values": ["undefined"]
                    }
                }
            }
        });

        if (response.data[0]?.result?.data?.json?.success) {
            console.log(`Account ${accountIndex + 1}: Check-in successful!`, new Date().toISOString());
            return true;
        } else {
            console.log(`Account ${accountIndex + 1}: Check-in failed:`, response.data);
            return false;
        }
    } catch (error) {
        console.error(`Account ${accountIndex + 1}: Error performing check-in:`, error.response?.data || error.message);
        return false;
    }
}

// Function to perform check-in for all accounts
async function performAllCheckIns(tokens) {
    const results = [];
    for (let i = 0; i < tokens.length; i++) {
        console.log(`\nProcessing Account ${i + 1}...`);
        const result = await performCheckIn(tokens[i], i);
        results.push(result);
        
        // Add a small delay between requests to avoid rate limiting
        if (i < tokens.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Log summary
    const successful = results.filter(r => r).length;
    console.log(`\nCheck-in Summary: ${successful}/${tokens.length} accounts successful`);
}

// Main function
async function main() {
    const tokens = readTokens();
    console.log(`Loaded ${tokens.length} accounts`);
    
    // Schedule daily check-in at 00:01 (just after midnight)
    cron.schedule('1 0 * * *', async () => {
        console.log('\nPerforming scheduled check-ins...');
        await performAllCheckIns(tokens);
    });

    // Perform initial check-in when starting the bot
    console.log('\nPerforming initial check-ins...');
    await performAllCheckIns(tokens);
}

// Start the bot
main().catch(console.error);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nBot shutting down...');
    process.exit(0);
});