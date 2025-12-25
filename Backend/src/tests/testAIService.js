/**
 * Test script for AI Service
 * Run with: node src/tests/testAIService.js
 */

require('dotenv').config();
const aiService = require('../services/aiService');

const testProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    experience: [
        'Senior Software Engineer at Tech Corp (3 years)',
        'Full Stack Developer at StartupXYZ (2 years)'
    ],
    education: [
        'BS Computer Science from State University'
    ],
    summary: 'Experienced full-stack developer with 5+ years building scalable web applications'
};

const testJob = {
    title: 'Backend Developer',
    company: 'SpyBoy3 Technologies',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST API', 'Docker'],
    requirements: [
        '3+ years backend development experience',
        'Strong knowledge of Node.js and Express',
        'Experience with MongoDB and database design',
        'Understanding of RESTful API design'
    ],
    description: 'We are looking for a talented backend developer to join our growing team.'
};

async function runTests() {
    console.log('🧪 Testing AI Service Integration\n');
    console.log('='.repeat(60));

    // Test 1: Profile Analysis
    console.log('\n📊 Test 1: Profile Analysis');
    console.log('-'.repeat(60));
    try {
        const analysis = await aiService.analyzeProfileMatch(testProfile, testJob);
        console.log('✅ Success!');
        console.log('Match Percentage:', analysis.matchPercentage + '%');
        console.log('Strengths:', analysis.strengths.length);
        console.log('Improvements:', analysis.improvements.length);
        console.log('Suggested Skills:', analysis.suggestedSkills.join(', '));
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // Test 2: Resume Optimization
    console.log('\n📝 Test 2: Resume Optimization');
    console.log('-'.repeat(60));
    try {
        const optimization = await aiService.optimizeResume(testProfile, testJob);
        console.log('✅ Success!');
        console.log('ATS Score:', optimization.atsScore);
        console.log('Keywords:', optimization.keywordSuggestions?.slice(0, 5).join(', '));
        console.log('Formatting Tips:', optimization.formattingTips?.length || 0);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // Test 3: Cover Letter Generation
    console.log('\n✉️  Test 3: Cover Letter Generation');
    console.log('-'.repeat(60));
    try {
        const coverLetter = await aiService.generateCoverLetter(testProfile, testJob);
        console.log('✅ Success!');
        console.log('Length:', coverLetter.length, 'characters');
        console.log('Preview:', coverLetter.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 Tests Complete!\n');

    // Check API key status
    if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️  WARNING: OPENAI_API_KEY not found in environment');
        console.log('   Tests ran in FALLBACK mode (rule-based)');
        console.log('   Add your API key to .env for full AI features\n');
    } else {
        console.log('✅ OPENAI_API_KEY is configured');
        console.log('   Tests ran with real GPT API\n');
    }
}

// Run tests
runTests().catch(console.error);
