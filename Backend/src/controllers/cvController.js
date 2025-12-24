const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const asyncHandler = require('../middleware/async');

// Helper: replace @@key@@ with data[key]
function fillTemplate(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`@@${key}@@`, "g");
    // Escape LaTeX special characters
    const escapedValue = value ? value.toString().replace(/[&%$#_{}~^\\]/g, '\\$&') : '';
    result = result.replace(placeholder, escapedValue);
  }
  return result;
}

// @desc    Generate CV/Resume PDF
// @route   POST /api/v1/cv/generate
// @access  Private
exports.generateCV = asyncHandler(async (req, res) => {
  const user = req.body;

  try {
    // 1) Load template
    const templatePath = path.join(__dirname, '../../cv-generator/template_cv.tex');
    
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({
        success: false,
        error: 'CV template not found'
      });
    }

    const template = fs.readFileSync(templatePath, "utf8");

    // 2) Prepare data map (keys must match template placeholders)
    const data = {
      // Personal Info
      USER_FULL_NAME: user.name || user.fullName || "",
      USER_JOB_TITLE: user.jobTitle || "Professional",
      USER_EMAIL: user.email || "",
      USER_PHONE: user.phone || "",
      USER_LOCATION: user.location || "",
      USER_SUMMARY: user.summary || "",
      // Core Competencies removed - using Technical Skills section instead
      USER_SKILLS: "",

      // Soft Skills - separate section for soft skills
      SOFT_SKILLS: Array.isArray(user.skills)
        ? user.skills.find(s => s.category === "Soft Skills")?.items?.filter(item => item && item.trim())?.join(", ") || ""
        : "",

      // Experience 1
      EXP1_TITLE: user.experience?.[0]?.role || user.experience?.[0]?.title || "",
      EXP1_COMPANY: user.experience?.[0]?.company || "",
      EXP1_LOCATION: user.experience?.[0]?.location || "",
      EXP1_START: user.experience?.[0]?.startDate || user.experience?.[0]?.start || "",
      EXP1_END: user.experience?.[0]?.endDate || user.experience?.[0]?.end || "",
      EXP1_BULLET1: user.experience?.[0]?.description?.split('\n')?.[0]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[0]?.bullets?.[0] || "",
      EXP1_BULLET2: user.experience?.[0]?.description?.split('\n')?.[1]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[0]?.bullets?.[1] || "",
      EXP1_BULLET3: user.experience?.[0]?.description?.split('\n')?.[2]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[0]?.bullets?.[2] || "",

      // Experience 2
      EXP2_TITLE: user.experience?.[1]?.role || user.experience?.[1]?.title || "",
      EXP2_COMPANY: user.experience?.[1]?.company || "",
      EXP2_LOCATION: user.experience?.[1]?.location || "",
      EXP2_START: user.experience?.[1]?.startDate || user.experience?.[1]?.start || "",
      EXP2_END: user.experience?.[1]?.endDate || user.experience?.[1]?.end || "",
      EXP2_BULLET1: user.experience?.[1]?.description?.split('\n')?.[0]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[1]?.bullets?.[0] || "",
      EXP2_BULLET2: user.experience?.[1]?.description?.split('\n')?.[1]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[1]?.bullets?.[1] || "",
      EXP2_BULLET3: user.experience?.[1]?.description?.split('\n')?.[2]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[1]?.bullets?.[2] || "",

      // Experience 3
      EXP3_TITLE: user.experience?.[2]?.role || user.experience?.[2]?.title || "",
      EXP3_COMPANY: user.experience?.[2]?.company || "",
      EXP3_LOCATION: user.experience?.[2]?.location || "",
      EXP3_START: user.experience?.[2]?.startDate || user.experience?.[2]?.start || "",
      EXP3_END: user.experience?.[2]?.endDate || user.experience?.[2]?.end || "",
      EXP3_BULLET1: user.experience?.[2]?.description?.split('\n')?.[0]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[2]?.bullets?.[0] || "",
      EXP3_BULLET2: user.experience?.[2]?.description?.split('\n')?.[1]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[2]?.bullets?.[1] || "",
      EXP3_BULLET3: user.experience?.[2]?.description?.split('\n')?.[2]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[2]?.bullets?.[2] || "",

      // Education 1
      EDU1_DEGREE: user.education?.[0]?.degree || "",
      EDU1_FIELD: user.education?.[0]?.field || "",
      EDU1_INSTITUTION: user.education?.[0]?.school || user.education?.[0]?.institution || "",
      EDU1_LOCATION: user.education?.[0]?.location || "",
      EDU1_START: user.education?.[0]?.start || "",
      EDU1_END: user.education?.[0]?.graduationDate || user.education?.[0]?.end || "",
      EDU1_GPA: user.education?.[0]?.gpa || "",

      // Education 2
      EDU2_DEGREE: user.education?.[1]?.degree || "",
      EDU2_FIELD: user.education?.[1]?.field || "",
      EDU2_INSTITUTION: user.education?.[1]?.school || user.education?.[1]?.institution || "",
      EDU2_LOCATION: user.education?.[1]?.location || "",
      EDU2_START: user.education?.[1]?.start || "",
      EDU2_END: user.education?.[1]?.graduationDate || user.education?.[1]?.end || "",
      EDU2_GPA: user.education?.[1]?.gpa || "",

      // Technical Skills - handle both old and new format
      TECH_LANGUAGES: user.technicalSkills?.languages || 
        user.skills?.find(s => s.category === 'Technical')?.items?.join(', ') || 
        user.skills?.flatMap(s => s.category === 'Technical' ? s.items : [])?.join(', ') || "",
      TECH_FRAMEWORKS: user.technicalSkills?.frameworks || "",
      TECH_DATABASES: user.technicalSkills?.databases || "",
      TECH_CLOUD: user.technicalSkills?.cloud || "",
      TECH_TOOLS: user.technicalSkills?.tools || "",

      // Certifications
      CERT1_NAME: user.certifications?.[0]?.title || user.certifications?.[0]?.name || "",
      CERT1_ISSUER: user.certifications?.[0]?.issuer || "",
      CERT1_DATE: user.certifications?.[0]?.date || "",
      CERT2_NAME: user.certifications?.[1]?.title || user.certifications?.[1]?.name || "",
      CERT2_ISSUER: user.certifications?.[1]?.issuer || "",
      CERT2_DATE: user.certifications?.[1]?.date || "",

      // Projects
      PROJECT1_NAME: user.projects?.[0]?.name || "",
      PROJECT1_TECH: user.projects?.[0]?.technologies || user.projects?.[0]?.tech || "",
      PROJECT1_DESCRIPTION: user.projects?.[0]?.description || "",
      PROJECT2_NAME: user.projects?.[1]?.name || "",
      PROJECT2_TECH: user.projects?.[1]?.technologies || user.projects?.[1]?.tech || "",
      PROJECT2_DESCRIPTION: user.projects?.[1]?.description || "",

      // LinkedIn and GitHub
      USER_LINKEDIN: user.linkedin || "",
      USER_GITHUB: user.github || "",

      // Languages
      USER_LANGUAGES: Array.isArray(user.languages) 
        ? user.languages.filter(lang => lang.language || lang.name).map(lang => `${lang.language || lang.name}${lang.proficiency ? ` (${lang.proficiency})` : ''}`).join(" • ")
        : (user.languages || "").toString(),
    };

    const filledTex = fillTemplate(template, data);

    // 3) Write .tex file into generated folder
    const outDir = path.join(__dirname, '../../cv-generator/generated');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const timestamp = Date.now();
    const userId = req.user?.id || 'anonymous';
    const texFileName = `cv_${userId}_${timestamp}.tex`;
    const pdfFileName = `cv_${userId}_${timestamp}.pdf`;
    
    const texFilePath = path.join(outDir, texFileName);
    fs.writeFileSync(texFilePath, filledTex, "utf8");

    // 4) Compile LaTeX -> PDF
    const cmd = `cd "${outDir}" && pdflatex -interaction=nonstopmode "${texFileName}"`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("LaTeX compilation error:", stderr);
        return res.status(500).json({ 
          success: false,
          error: "PDF generation failed. Please ensure LaTeX is installed on the server." 
        });
      }

      const pdfPath = path.join(outDir, pdfFileName);
      if (!fs.existsSync(pdfPath)) {
        return res.status(500).json({ 
          success: false,
          error: "PDF file was not generated successfully" 
        });
      }

      // 5) Send PDF to client
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${user.name || 'resume'}.pdf"`);
      
      const pdfStream = fs.createReadStream(pdfPath);
      pdfStream.pipe(res);

      // Clean up files after sending (optional)
      pdfStream.on('end', () => {
        setTimeout(() => {
          try {
            if (fs.existsSync(texFilePath)) fs.unlinkSync(texFilePath);
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            // Also clean up auxiliary LaTeX files
            const auxPath = path.join(outDir, `cv_${userId}_${timestamp}.aux`);
            const logPath = path.join(outDir, `cv_${userId}_${timestamp}.log`);
            if (fs.existsSync(auxPath)) fs.unlinkSync(auxPath);
            if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        }, 5000); // Clean up after 5 seconds
      });
    });

  } catch (err) {
    console.error('CV Generation error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error during CV generation'
    });
  }
});

// @desc    Get available CV templates
// @route   GET /api/v1/cv/templates
// @access  Private
exports.getTemplates = asyncHandler(async (req, res) => {
  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, ATS-friendly template suitable for most industries',
      preview: '/images/templates/professional-preview.jpg'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with subtle styling',
      preview: '/images/templates/modern-preview.jpg'
    }
  ];

  res.status(200).json({
    success: true,
    count: templates.length,
    data: templates
  });
});

// @desc    Preview CV without generating PDF
// @route   POST /api/v1/cv/preview
// @access  Private
exports.previewCV = asyncHandler(async (req, res) => {
  const user = req.body;

  // Return formatted data for preview
  const previewData = {
    personal: {
      name: user.name || user.fullName || "Your Name",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      linkedin: user.linkedin || "",
      github: user.github || ""
    },
    summary: user.summary || "",
    experience: (user.experience || []).slice(0, 3),
    education: (user.education || []).slice(0, 2),
    skills: user.skills || [],
    certifications: (user.certifications || []).slice(0, 3),
    projects: (user.projects || []).slice(0, 2)
  };

  res.status(200).json({
    success: true,
    data: previewData
  });
});