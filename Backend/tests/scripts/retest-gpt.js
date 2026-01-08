require('dotenv').config();
const axios = require('axios');

async function testOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('Testing OpenAI API with key:', apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING');

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Say "GPT IS ACTIVE"' }],
                max_tokens: 10
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ API call successful!');
        console.log('Response:', response.data.choices[0].message.content);
    } catch (error) {
        console.error('❌ API call failed!');
        if (error.response) {
            console.log('Error Code:', error.response.data.error?.code);
            console.log('Error Message:', error.response.data.error?.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testOpenAI();
