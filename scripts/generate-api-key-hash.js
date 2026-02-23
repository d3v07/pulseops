const bcrypt = require('bcrypt');

// Generate proper API key hash for "demo_key_change_this"
const apiKey = 'demo_key_change_this';
bcrypt.hash(apiKey, 10, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        process.exit(1);
    }
    console.log('API Key Hash:', hash);
    console.log('\nUse this in your seed-demo-data.sql file');
});
