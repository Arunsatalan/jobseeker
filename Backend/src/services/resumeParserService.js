const PDFParser = require('pdf-parse');
const logger = require('../utils/logger');

class ResumeParserService {
  async parseResume(fileBuffer) {
    try {
      const data = await PDFParser(fileBuffer);

      const resume = {
        rawText: data.text,
        pages: data.numpages,
        skills: this.extractSkills(data.text),
        experience: this.extractExperience(data.text),
        education: this.extractEducation(data.text),
        email: this.extractEmail(data.text),
        phone: this.extractPhone(data.text),
      };

      logger.info('Resume parsed successfully');
      return resume;
    } catch (error) {
      logger.error(`Failed to parse resume: ${error.message}`);
      throw error;
    }
  }

  extractSkills(text) {
    // Extract common technical skills
    const skills = [];
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue',
      'Node.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
      'Machine Learning', 'Data Analysis', 'SQL', 'Git', 'REST APIs',
    ];

    skillKeywords.forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });

    return [...new Set(skills)];
  }

  extractExperience(text) {
    // Simple regex to find job titles and companies
    const experiencePattern = /(?:worked|employed|position|role).*?(?:at|for|with)\s+([a-zA-Z\s&.]+)/gi;
    const matches = [...text.matchAll(experiencePattern)];
    return matches.map(m => m[1]?.trim()).filter(Boolean);
  }

  extractEducation(text) {
    const educationPattern = /(?:bachelor|master|phd|degree|diploma|certificate).*?(?:in|from)\s+([a-zA-Z\s]+)/gi;
    const matches = [...text.matchAll(educationPattern)];
    return matches.map(m => m[1]?.trim()).filter(Boolean);
  }

  extractEmail(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailRegex);
    return match ? match[0] : null;
  }

  extractPhone(text) {
    const phoneRegex = /(\+?1?\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : null;
  }
}

module.exports = new ResumeParserService();
