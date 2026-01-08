const axios = require('axios');

async function testSkillsPDF() {
  try {
    console.log('Testing PDF generation with skills...');

    // First register a test user
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.${Date.now()}@example.com`,
      phone: '123-456-7890',
      city: 'Toronto',
      province: 'ON',
      password: 'Password123!'
    };

    console.log('Registering test user...');
    const registerRes = await axios.post('http://localhost:5000/api/v1/auth/register/job-seeker', testUser);
    console.log('✅ User registered');

    // Login to get token
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginRes.data.data.token;
    console.log('✅ User logged in, got token');

    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      city: 'Toronto',
      province: 'ON',
      summary: 'Experienced software developer',
      skills: [
        { category: 'Technical', items: ['java', 'python', 'javascript'] },
        { category: 'Soft Skills', items: ['Data Analysis', 'Data Structures & Algorithms'] },
        { category: 'framework', items: ['bootstap'] },
        { category: 'databases', items: ['MySQL', 'PostgreSQL', 'MongoDB'] },
        { category: 'version control', items: ['Git', 'GitHub'] }
      ],
      experience: [{
        title: 'Software Developer',
        company: 'Tech Corp',
        start: '2020-01-01',
        end: 'Present',
        tech: 'JavaScript, React',
        bullets: ['Developed web applications', 'Collaborated with team', 'Improved performance']
      }],
      education: [{
        degree: 'Bachelor of Science',
        school: 'University of Toronto',
        start: '2016-09-01',
        graduationDate: '2020-05-01',
        gpa: '3.8'
      }],
      references: [
        {
          name: 'Jane Smith',
          position: 'Manager',
          company: 'Tech Corp',
          email: 'jane.smith@techcorp.com',
          phone: '123-456-7891'
        }
      ]
    };

    console.log('Generating PDF...');
    const response = await axios.post('http://localhost:5000/api/v1/cv/generate', testData, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ PDF generated successfully!');
    console.log(`Response size: ${response.data.length} bytes`);

  } catch (error) {
    console.error('❌ PDF generation failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testSkillsPDF();