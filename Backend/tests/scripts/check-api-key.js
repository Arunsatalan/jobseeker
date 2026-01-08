/**
 * Quick test to check if OpenAI API key is configured
 * Run: node check-api-key.js
 */

require('dotenv').config();

console.log('\n🔍 Checking OpenAI API Configuration...\n');
console.log('='.repeat(50));

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;

if (apiKey) {
    console.log('✅ OPENAI_API_KEY: Found');
    console.log('   Key starts with:', apiKey.substring(0, 10) + '...');
    console.log('   Key length:', apiKey.length, 'characters');
} else {
    console.log('❌ OPENAI_API_KEY: NOT FOUND');
    console.log('   ⚠️  Smart Apply will use FALLBACK mode (dummy data)');
    console.log('   📝 Add your API key to .env file');
}

console.log('');

if (model) {
    console.log('✅ OPENAI_MODEL:', model);
} else {
    console.log('⚠️  OPENAI_MODEL: Not set (will default to gpt-3.5-turbo)');
}

console.log('='.repeat(50));

if (apiKey) {
    console.log('\n✅ Configuration looks good!');
    console.log('   Smart Apply will use REAL GPT analysis\n');
} else {
    console.log('\n❌ Configuration incomplete!');
    console.log('   Follow these steps:');
    console.log('   1. Get API key from https://platform.openai.com/api-keys');
    console.log('   2. Add to Backend/.env:');
    console.log('      OPENAI_API_KEY=sk-your-key-here');
    console.log('   3. Restart backend server');
    console.log('   4. Run this script again to verify\n');
}
