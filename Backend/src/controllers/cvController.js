const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const PDFDocument = require('pdfkit');
const Resume = require('../models/Resume');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/async');

// Use PDFKit by default for reliable, package-free PDF generation
// LaTeX can cause package installation prompts and interrupt user experience
let latexAvailable = false;
logger.info('ℹ️ Using PDFKit for PDF generation (no LaTeX dependencies required)');

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
    // Log the skills received to debug
    logger.info('Received skills from frontend:', JSON.stringify(user.skills, null, 2));

    // 1) Load template
    const templatePath = path.join(__dirname, '../../cv-generator/template_modern.tex');
    
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
      EXP1_TECH: user.experience?.[0]?.technologies || "",
      EXP1_BULLET1: user.experience?.[0]?.description?.split('\n')?.[0]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[0]?.bullets?.[0] || "",
      EXP1_BULLET2: user.experience?.[0]?.description?.split('\n')?.[1]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[0]?.bullets?.[1] || "",
      EXP1_BULLET3: user.experience?.[0]?.description?.split('\n')?.[2]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[0]?.bullets?.[2] || "",

      // Experience 2
      EXP2_TITLE: user.experience?.[1]?.role || user.experience?.[1]?.title || "",
      EXP2_COMPANY: user.experience?.[1]?.company || "",
      EXP2_LOCATION: user.experience?.[1]?.location || "",
      EXP2_START: user.experience?.[1]?.startDate || user.experience?.[1]?.start || "",
      EXP2_END: user.experience?.[1]?.endDate || user.experience?.[1]?.end || "",
      EXP2_TECH: user.experience?.[1]?.technologies || "",
      EXP2_BULLET1: user.experience?.[1]?.description?.split('\n')?.[0]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[1]?.bullets?.[0] || "",
      EXP2_BULLET2: user.experience?.[1]?.description?.split('\n')?.[1]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[1]?.bullets?.[1] || "",
      EXP2_BULLET3: user.experience?.[1]?.description?.split('\n')?.[2]?.replace(/^[•\-\*]\s*/, '') || user.experience?.[1]?.bullets?.[2] || "",

      // Experience 3
      EXP3_TITLE: user.experience?.[2]?.role || user.experience?.[2]?.title || "",
      EXP3_COMPANY: user.experience?.[2]?.company || "",
      EXP3_LOCATION: user.experience?.[2]?.location || "",
      EXP3_START: user.experience?.[2]?.startDate || user.experience?.[2]?.start || "",
      EXP3_END: user.experience?.[2]?.endDate || user.experience?.[2]?.end || "",
      EXP3_TECH: user.experience?.[2]?.technologies || "",
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
      EDU1_GRADUATION: user.education?.[0]?.graduationYear || user.education?.[0]?.graduationDate || "",
      EDU1_GPA: user.education?.[0]?.gpa || "",
      
      // Education 2
      EDU2_DEGREE: user.education?.[1]?.degree || "",
      EDU2_FIELD: user.education?.[1]?.field || "",
      EDU2_INSTITUTION: user.education?.[1]?.school || user.education?.[1]?.institution || "",
      EDU2_LOCATION: user.education?.[1]?.location || "",
      EDU2_START: user.education?.[1]?.start || "",
      EDU2_END: user.education?.[1]?.graduationDate || user.education?.[1]?.end || "",
      EDU2_GPA: user.education?.[1]?.gpa || "",

      // Technical Skills - use user's actual categories, not intelligent reorganization
      // Build skills section from user's actual skill categories
      TECH_LANGUAGES: Array.isArray(user.skills) && user.skills.length > 0
        ? user.skills.map(skillGroup => 
            `${skillGroup.category}: ${(skillGroup.items || []).filter(item => item && item.trim()).join(', ')}`
          ).filter(line => line.split(': ')[1].trim().length > 0).join('\\\\\n')
        : "",
      TECH_AI_ML: "",
      TECH_FRAMEWORKS: "",
      TECH_DATABASES: "",
      TECH_TOOLS: "",

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
      PROJECT1_DATE: user.projects?.[0]?.date || "",
      PROJECT1_GITHUB: user.projects?.[0]?.githubUrl || user.projects?.[0]?.github || "",
      PROJECT2_NAME: user.projects?.[1]?.name || "",
      PROJECT2_TECH: user.projects?.[1]?.technologies || user.projects?.[1]?.tech || "",
      PROJECT2_DESCRIPTION: user.projects?.[1]?.description || "",
      PROJECT2_DATE: user.projects?.[1]?.date || "",
      PROJECT2_GITHUB: user.projects?.[1]?.githubUrl || user.projects?.[1]?.github || "",

      // LinkedIn and GitHub
      USER_LINKEDIN: user.linkedin || "",
      USER_GITHUB: user.github || "",

      // Languages
      USER_LANGUAGES: Array.isArray(user.languages) 
        ? user.languages.filter(lang => lang.language || lang.name).map(lang => `${lang.language || lang.name}${lang.proficiency ? ` (${lang.proficiency})` : ''}`).join(" • ")
        : (user.languages || "").toString(),

      // References
      REF1_NAME: user.references?.[0]?.name || "",
      REF1_POSITION: user.references?.[0]?.position || "",
      REF1_COMPANY: user.references?.[0]?.company || "",
      REF1_EMAIL: user.references?.[0]?.email || "",
      REF1_PHONE: user.references?.[0]?.phone || "",
      REF2_NAME: user.references?.[1]?.name || "",
      REF2_POSITION: user.references?.[1]?.position || "",
      REF2_COMPANY: user.references?.[1]?.company || "",
      REF2_EMAIL: user.references?.[1]?.email || "",
      REF2_PHONE: user.references?.[1]?.phone || "",
      REF3_NAME: user.references?.[2]?.name || "",
      REF3_POSITION: user.references?.[2]?.position || "",
      REF3_COMPANY: user.references?.[2]?.company || "",
      REF3_EMAIL: user.references?.[2]?.email || "",
      REF3_PHONE: user.references?.[2]?.phone || "",
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

    // 4) Use PDFKit for reliable, instant PDF generation (no package dependencies)
    generatePDFWithPDFKit(user, outDir, pdfFileName, texFilePath, res);

  } catch (err) {
    logger.error('CV Generation error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error during CV generation'
    });
  }
});

// Helper function to generate PDF with PDFKit
function generatePDFWithPDFKit(user, outDir, pdfFileName, texFilePath, res) {
  try {
    const pdfPath = path.join(outDir, pdfFileName);
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);
    
    // ==================== HEADER ====================
    doc.fillColor('black')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(user.name || 'Your Name', { align: 'center' });
    
    doc.moveDown(0.1);
    
    doc.fillColor('black')
       .fontSize(13)
       .font('Helvetica')
       .text(user.jobTitle || 'Professional', { align: 'center' });
    
    doc.moveDown(0.4);
    
    // Contact information - Line 1
    const socialParts = [];
    if (user.linkedin) socialParts.push(user.linkedin);
    if (user.github) socialParts.push(user.github);
    
    if (socialParts.length > 0) {
      doc.fontSize(9)
         .font('Helvetica')
         .text(socialParts.join('    '), { align: 'center' });
    }
    
    doc.moveDown(0.1);
    
    // Contact information - Line 2
    const contactParts = [];
    if (user.email) contactParts.push(user.email);
    if (user.phone) contactParts.push(user.phone);
    
    doc.fillColor('black')
       .fontSize(9)
       .text(contactParts.join('    '), { align: 'center' });
    
    doc.moveDown(0.6);

    // ==================== PROFESSIONAL SUMMARY ====================
    if (user.summary) {
      doc.fillColor('black')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('PROFESSIONAL SUMMARY');
      
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);
      
      doc.fillColor('black')
         .fontSize(9)
         .font('Helvetica')
         .text(user.summary, { align: 'justify', lineGap: 1 });
      
      doc.moveDown(0.4);
    }

    // ==================== TECHNICAL SKILLS ====================
    if (user.skills && Array.isArray(user.skills) && user.skills.length > 0) {
      doc.fillColor('black')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('TECHNICAL SKILLS');

      doc.moveDown(0.2);

      // Display skills using user's actual categories, not intelligent reorganization
      user.skills.forEach(skillGroup => {
        const categoryName = skillGroup.category || 'Skills';
        const skillItems = (skillGroup.items || []).filter(item => item && item.trim());

        if (skillItems.length > 0) {
          doc.fillColor('black')
             .fontSize(9)
             .font('Helvetica-Bold')
             .text(`${categoryName}: `, 50, doc.y, { continued: true })
             .font('Helvetica')
             .text(skillItems.join(', '), { lineGap: 2 });
          doc.moveDown(0.15);
        }
      });

      doc.moveDown(0.3);
    }

    // ==================== EXPERIENCE ====================
    if (user.experience?.length > 0) {
      doc.fillColor('black')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('EXPERIENCE');
      
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);
      
      user.experience.forEach((exp, idx) => {
        if (idx > 0) doc.moveDown(0.3);
        
        // Job title and dates on same line
        const titleY = doc.y;
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(exp.role || exp.title || 'Position', 50, titleY, { continued: false });
        
        // Dates on the right
        const dates = `${exp.startDate || ''} -- ${exp.endDate || 'Ongoing'}`;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(dates, 400, titleY, { align: 'right' });
        
        // Company name (bold)
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(exp.company || '', 50, doc.y, { continued: false });
        
        // Tech stack (italic)
        if (exp.technologies) {
          doc.fontSize(9)
             .font('Helvetica-Oblique')
             .text(`Tech Stack: ${exp.technologies}`, { continued: false });
        }
        
        doc.moveDown(0.15);
        
        // Description bullets
        if (exp.description) {
          const lines = exp.description.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            const cleanLine = line.replace(/^[•\-\*]\s*/, '');
            if (cleanLine) {
              doc.fillColor('black')
                 .fontSize(9)
                 .font('Helvetica')
                 .text(`• ${cleanLine}`, { indent: 0, lineGap: 1 });
            }
          });
        }
      });
      
      doc.moveDown(0.4);
    }

    // ==================== PROJECTS ====================
    if (user.projects?.length > 0) {
      doc.fillColor('black')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('PROJECTS');
      
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);
      
      user.projects.forEach((project, idx) => {
        if (idx > 0) doc.moveDown(0.3);
        
        // Project name and date
        const projectY = doc.y;
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(project.name || 'Project', 50, projectY, { continued: false });
        
        if (project.date) {
          doc.fontSize(10)
             .font('Helvetica-Bold')
             .text(project.date, 400, projectY, { align: 'right' });
        }
        
        // Tech stack
        if (project.technologies) {
          doc.fontSize(9)
             .font('Helvetica-Oblique')
             .text(`Tech Stack: ${project.technologies}`);
        }
        
        doc.moveDown(0.1);
        
        // Description
        if (project.description) {
          const descLines = project.description.split('\n').filter(line => line.trim());
          descLines.forEach(line => {
            const cleanLine = line.replace(/^[•\-\*]\s*/, '');
            if (cleanLine) {
              doc.fontSize(9)
                 .font('Helvetica')
                 .text(`• ${cleanLine}`, { lineGap: 1 });
            }
          });
        }
        
        // GitHub link
        if (project.githubUrl || project.github) {
          doc.moveDown(0.1);
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .text('GitHub: ', { continued: true })
             .font('Helvetica')
             .fillColor('blue')
             .text(project.githubUrl || project.github || '');
          doc.fillColor('black');
        }
      });
      
      doc.moveDown(0.4);
    }

    // ==================== EDUCATION ====================
    if (user.education?.length > 0) {
      doc.fillColor('black')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('EDUCATION');

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);

      user.education.forEach((edu, idx) => {
        if (idx > 0) doc.moveDown(0.3);

        // Institution and location on first line (bold) - aligned with content
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(`${edu.school || edu.institution || ''}, ${edu.location || ''}`, 50);

        doc.moveDown(0.1);

        // Degree and field on second line (italicized, left-aligned)
        const degreeLineY = doc.y;
        doc.fillColor('black')
           .fontSize(9)
           .font('Helvetica-Oblique')
           .text(`${edu.degree || ''} in ${edu.field || ''}`, 50, degreeLineY);

        // Dates right-aligned on the same line as degree
        const dates = `${edu.start || ''} -- ${edu.graduationDate || edu.end || 'Present'}`;
        doc.fontSize(9)
           .font('Helvetica')
           .text(dates, 400, degreeLineY, { align: 'right', width: 145 });

        doc.moveDown(0.15);

        // Expected graduation on its own line (if present)
        if (edu.graduationYear || edu.graduationDate) {
          doc.fontSize(9)
             .font('Helvetica')
            //  .text(`(Expected Graduation: ${edu.graduationYear || edu.graduationDate})`);
        }
      });

      doc.moveDown(0.4);
    }

    // ==================== CERTIFICATIONS ====================
    if (user.certifications?.length > 0) {
      doc.fillColor('black')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('CERTIFICATIONS', 50);
      
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);
      
      user.certifications.forEach(cert => {
        const certY = doc.y;
        doc.fillColor('black')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text(`${cert.title || cert.name || ''} -- ${cert.issuer || ''}`, 50, certY, { continued: false, width: 380 });
        
        if (cert.date) {
          doc.fontSize(9)
             .font('Helvetica')
             .text(cert.date, 430, certY, { align: 'right' });
        }
        doc.moveDown(0.12);
      });
      
      doc.moveDown(0.3);
    }

    // ==================== LANGUAGES ====================
    if (user.languages && Array.isArray(user.languages) && user.languages.length > 0) {
      doc.fillColor('black')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('LANGUAGES',50);
      
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);
      
      const langText = user.languages
        .filter(lang => lang.language || lang.name)
        .map(lang => `${lang.language || lang.name}${lang.proficiency ? ` (${lang.proficiency})` : ''}`)
        .join('\n');
      
      doc.fillColor('black')
         .fontSize(9)
         .font('Helvetica')
         .text(langText);
      
      doc.moveDown(0.4);
    }

    // ==================== REFERENCES ====================
    if (user.references && Array.isArray(user.references) && user.references.length > 0) {
      // Filter out references without names
      const validReferences = user.references.filter(ref => ref.name && ref.name.trim());
      
      if (validReferences.length > 0) {
        doc.fillColor('black')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('REFERENCES',50);

        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.2);

        // Display references in two columns (like minipages in LaTeX)
        const references = validReferences.slice(0, 2); // Limit to 2 references for two-column layout

      if (references.length === 1) {
        // Single reference - center it
        const ref = references[0];
        const startY = doc.y;

        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(ref.name, 50, startY);

        if (ref.position || ref.company) {
          doc.fontSize(9)
             .font('Helvetica-Oblique')
             .text(`${ref.position || ''}${ref.position && ref.company ? ', ' : ''}${ref.company || ''}`, 50, doc.y);
        }

        if (ref.email) {
          doc.fontSize(9)
             .font('Helvetica')
             .text(`Email: ${ref.email}`, 50, doc.y);
        }

        if (ref.phone) {
          doc.fontSize(9)
             .font('Helvetica')
             .text(`Phone: ${ref.phone}`, 50, doc.y);
        }
      } else if (references.length === 2) {
        // Two references side by side
        const leftRef = references[0];
        const rightRef = references[1];
        const startY = doc.y;

        // Left column
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(leftRef.name, 50, startY);

        if (leftRef.position || leftRef.company) {
          doc.fontSize(9)
             .font('Helvetica-Oblique')
             .text(`${leftRef.position || ''}${leftRef.position && leftRef.company ? ', ' : ''}${leftRef.company || ''}`, 50, doc.y);
        }

        if (leftRef.email) {
          doc.fontSize(9)
             .font('Helvetica')
             .text(`Email: ${leftRef.email}`, 50, doc.y);
        }

        if (leftRef.phone) {
          doc.fontSize(9)
             .font('Helvetica')
             .text(`Phone: ${leftRef.phone}`, 50, doc.y);
        }

        // Right column
        const rightX = 300;
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(rightRef.name, rightX, startY);

        if (rightRef.position || rightRef.company) {
          doc.fontSize(9)
             .font('Helvetica-Oblique')
             .text(`${rightRef.position || ''}${rightRef.position && rightRef.company ? ', ' : ''}${rightRef.company || ''}`, rightX, doc.y);
        }

        if (rightRef.email) {
          doc.fontSize(9)
             .font('Helvetica')
             .text(`Email: ${rightRef.email}`, rightX, doc.y);
        }

        if (rightRef.phone) {
          doc.fontSize(9)
             .font('Helvetica')
             .text(`Phone: ${rightRef.phone}`, rightX, doc.y);
        }
      }
      } // Close validReferences.length > 0 check
    }

    doc.end();

    stream.on('finish', () => {
      sendPDFResponse(pdfPath, texFilePath, user, outDir, null, null, res);
    });

    stream.on('error', (err) => {
      logger.error('PDF stream error:', err);
      res.status(500).json({ success: false, error: 'Failed to generate PDF' });
    });
  } catch (err) {
    logger.error('PDFKit generation error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
}

// Helper function to send PDF response
function sendPDFResponse(pdfPath, texFilePath, user, outDir, userId, timestamp, res) {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Content-Disposition", `attachment; filename="${(user.name || 'resume').replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    
    res.send(pdfBuffer);

    // Clean up after sending
    setTimeout(() => {
      try {
        [pdfPath, texFilePath].forEach(f => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });
        if (userId && timestamp) {
          const auxFiles = ['.aux', '.log', '.out'].map(ext => 
            path.join(outDir, `cv_${userId}_${timestamp}${ext}`)
          );
          auxFiles.forEach(f => {
            if (fs.existsSync(f)) fs.unlinkSync(f);
          });
        }
      } catch (e) {
        logger.error('Cleanup error:', e);
      }
    }, 500);
  } catch (err) {
    logger.error('Error sending PDF:', err);
    res.status(500).json({ success: false, error: 'Error sending PDF' });
  }
}

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