// Test bcrypt hash verification
const bcrypt = require('bcrypt');

const apiKey = 'demo_key_change_this';
const hash = '$2b$10$NQbr7kAR4n9lQ1/JwS0jn.sEhYgR4Pi5VejnFudNV/LNpk9DIHSOy';

console.log('Testing API Key:', apiKey);
console.log('Against Hash:', hash);

bcrypt.compare(apiKey, hash, (err, result) => {
    if (err) {
        console.error('Error:', err);
        process.exit(1);
    }
    console.log('Match Result:', result);
    console.log(result ? '✓ Hash matches!' : '✗ Hash does NOT match');
    process.exit(result ? 0 : 1);
});
