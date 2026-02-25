const authService = require('./services/authService');
require('dotenv').config();

async function test() {
    try {
        console.log('Testing login for kvkgaya@atari.gov.in with Atari@123');
        const result = await authService.login('kvkgaya@atari.gov.in', 'Atari@123');
        console.log('Login Result:', !!result);
    } catch (err) {
        console.error('Login Error:', err.message);
    } finally {
        process.exit(0);
    }
}

test();
