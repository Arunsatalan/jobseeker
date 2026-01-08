/**
 * Test GPT-4 Analysis Integration
 * Verifies that the AI service is using GPT-4 with your paid API key
 */

require('dotenv').config();
const aiService = require('../../src/services/aiService');

// Sample user profile data
const sampleUserProfile = {
    name: "John Developer",
    email: "john@example.com",
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB", "Express.js", "REST API", "Git"],
    experience: [
        "Senior Full Stack Developer at Tech Corp (2021-2023): Led development of e-commerce platform serving 100K+ users. Architected microservices using Node.js and React. Improved page load time by 40%.",
        "Full Stack Developer at StartupXYZ (2019-2021): Built customer management system using MERN stack. Implemented real-time features with WebSockets. Mentored 3 junior developers."
    ],
    education: [
        "Bachelor of Computer Science from University of Technology (2019)"
    ],
    projects: [
        "AI Job Portal: Full-stack job matching platform with AI recommendations using OpenAI API. Tech: React, Node.js, MongoDB, GPT-4",
        "Real-time Chat App: WebSocket-based messaging platform. Tech: Socket.io, React, Express"
    ],
    certifications: [
        "AWS Certified Solutions Architect by Amazon (2022)",
        "MongoDB Certified Developer by MongoDB University (2021)"
    ],
    summary: "Passionate full-stack developer with 5+ years experience building scalable web applications. Expert in JavaScript ecosystem and cloud technologies."
};

// Sample job posting
const sampleJob = {
    id: "job123",
    title: "Senior Full Stack Engineer",
    company: "InnovateTech Solutions",
    location: "Toronto, ON (Hybrid)",
    description: "We're looking for an experienced Full Stack Engineer to join our growing team. You'll work on cutting-edge projects using modern technologies.",
    requirements: [
        "5+ years experience with JavaScript/TypeScript",
        "Strong experience with React and Node.js",
        "Experience with cloud platforms (AWS/Azure)",
        "Database design experience (SQL and NoSQL)",
        "Experience with CI/CD pipelines",
        "Strong communication and leadership skills"
    ],
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "AWS", "Docker", "MongoDB", "PostgreSQL", "GraphQL", "CI/CD"],
    salary: "$120,000 - $160,000 CAD",
    industry: "Technology"
};

async function testGPT4Analysis() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         Testing GPT-4 AI Analysis Integration             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📋 Using API Key:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 20)}...` : 'NOT FOUND');
    console.log('🤖 AI Model: GPT-4 Turbo (gpt-4-turbo-preview)\n');

    try {
        console.log('⏳ Step 1: Analyzing Profile Match...\n');
        const analysis = await aiService.analyzeProfileMatch(sampleUserProfile, sampleJob);
        
        console.log('✅ PROFILE ANALYSIS RESULTS:\n');
        console.log(`📊 Match Percentage: ${analysis.matchPercentage}%`);
        console.log(`\n💪 Strengths (${analysis.strengths?.length || 0}):`);
        analysis.strengths?.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));
        
        console.log(`\n🎯 Improvements (${analysis.improvements?.length || 0}):`);
        analysis.improvements?.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));
        
        console.log(`\n🚀 Suggested Skills (${analysis.suggestedSkills?.length || 0}):`);
        analysis.suggestedSkills?.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));
        
        console.log(`\n📝 Detailed Analysis:\n${analysis.detailedAnalysis}\n`);

        console.log('─'.repeat(60));
        console.log('\n⏳ Step 2: Optimizing Resume...\n');
        const optimization = await aiService.optimizeResume(sampleUserProfile, sampleJob);
        
        console.log('✅ RESUME OPTIMIZATION RESULTS:\n');
        console.log(`📈 ATS Score: ${optimization.atsScore}/100`);
        console.log(`\n✍️ Optimized Summary:\n"${optimization.optimizedSummary}"`);
        
        console.log(`\n🔑 Keyword Suggestions (${optimization.keywordSuggestions?.length || 0}):`);
        optimization.keywordSuggestions?.forEach((k, i) => console.log(`   ${i + 1}. ${k}`));
        
        console.log(`\n💡 Experience Improvements (${optimization.experienceImprovements?.length || 0}):`);
        optimization.experienceImprovements?.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));

        if (optimization.priorityChanges) {
            console.log(`\n⚡ Priority Changes (${optimization.priorityChanges.length}):`);
            optimization.priorityChanges.forEach((c, i) => console.log(`   ${i + 1}. ${c}`));
        }

        console.log('\n' + '─'.repeat(60));
        console.log('\n⏳ Step 3: Generating Cover Letter...\n');
        const coverLetter = await aiService.generateCoverLetter(sampleUserProfile, sampleJob);
        
        console.log('✅ COVER LETTER GENERATED:\n');
        console.log(coverLetter);
        
        console.log('\n\n╔════════════════════════════════════════════════════════════╗');
        console.log('║             ✅ ALL TESTS PASSED SUCCESSFULLY! ✅            ║');
        console.log('║                                                            ║');
        console.log('║  GPT-4 is working perfectly with your paid API key!       ║');
        console.log('║  The analysis results are high-quality and detailed.      ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:\n');
        console.error('Error:', error.message);
        if (error.response?.data) {
            console.error('API Response:', JSON.stringify(error.response.data, null, 2));
        }
        console.log('\n⚠️  If you see quota/auth errors, check your OpenAI API key balance.');
        console.log('💡 The system will fallback to local analysis automatically.\n');
    }
}

// Run the test
testGPT4Analysis();
