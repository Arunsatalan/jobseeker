const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files
app.use(express.static(__dirname));

// Helper: replace @@key@@ with data[key]
function fillTemplate(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`@@${key}@@`, "g");
    result = result.replace(placeholder, value || "");
  }
  return result;
}

app.post("/generate-cv", (req, res) => {
  const user = req.body;

  try {
    // 1) Load template
    const templatePath = path.join(__dirname, "template_cv.tex");
    const template = fs.readFileSync(templatePath, "utf8");

    // 2) Prepare data map (keys must match template placeholders)
    const data = {
      // Personal Info
      USER_FULL_NAME: user.fullName || user.name || "",
      USER_JOB_TITLE: user.jobTitle || "",
      USER_EMAIL: user.email || "",
      USER_PHONE: user.phone || "",
      USER_LOCATION: user.location || "",
      USER_LINKEDIN: user.linkedin || "",
      USER_GITHUB: user.github || "",
      USER_SUMMARY: user.summary || "",

      // Skills - core competencies removed, using technical skills section instead
      USER_SKILLS: "",

      // Soft Skills - only soft skills
      SOFT_SKILLS: Array.isArray(user.skills)
        ? user.skills.find(s => s.category === "Soft Skills")?.items?.filter(item => item && item.trim && item.trim().length > 0)?.join(", ") || ""
        : "",

      // Experience 1
      EXP1_TITLE: user.experience?.[0]?.title || "",
      EXP1_COMPANY: user.experience?.[0]?.company || "",
      EXP1_LOCATION: user.experience?.[0]?.location || "",
      EXP1_START: user.experience?.[0]?.start || "",
      EXP1_END: user.experience?.[0]?.end || "",
      EXP1_BULLET1: user.experience?.[0]?.bullets?.[0] || "",
      EXP1_BULLET2: user.experience?.[0]?.bullets?.[1] || "",
      EXP1_BULLET3: user.experience?.[0]?.bullets?.[2] || "",

      // Experience 2
      EXP2_TITLE: user.experience?.[1]?.title || "",
      EXP2_COMPANY: user.experience?.[1]?.company || "",
      EXP2_LOCATION: user.experience?.[1]?.location || "",
      EXP2_START: user.experience?.[1]?.start || "",
      EXP2_END: user.experience?.[1]?.end || "",
      EXP2_BULLET1: user.experience?.[1]?.bullets?.[0] || "",
      EXP2_BULLET2: user.experience?.[1]?.bullets?.[1] || "",
      EXP2_BULLET3: user.experience?.[1]?.bullets?.[2] || "",

      // Experience 3
      EXP3_TITLE: user.experience?.[2]?.title || "",
      EXP3_COMPANY: user.experience?.[2]?.company || "",
      EXP3_LOCATION: user.experience?.[2]?.location || "",
      EXP3_START: user.experience?.[2]?.start || "",
      EXP3_END: user.experience?.[2]?.end || "",
      EXP3_BULLET1: user.experience?.[2]?.bullets?.[0] || "",
      EXP3_BULLET2: user.experience?.[2]?.bullets?.[1] || "",
      EXP3_BULLET3: user.experience?.[2]?.bullets?.[2] || "",

      // Education 1
      EDU1_DEGREE: user.education?.[0]?.degree || "",
      EDU1_FIELD: user.education?.[0]?.field || "",
      EDU1_INSTITUTION: user.education?.[0]?.institution || "",
      EDU1_LOCATION: user.education?.[0]?.location || "",
      EDU1_START: user.education?.[0]?.start || "",
      EDU1_END: user.education?.[0]?.end || "",
      EDU1_GPA: user.education?.[0]?.gpa || "",

      // Education 2
      EDU2_DEGREE: user.education?.[1]?.degree || "",
      EDU2_FIELD: user.education?.[1]?.field || "",
      EDU2_INSTITUTION: user.education?.[1]?.institution || "",
      EDU2_LOCATION: user.education?.[1]?.location || "",
      EDU2_START: user.education?.[1]?.start || "",
      EDU2_END: user.education?.[1]?.end || "",
      EDU2_GPA: user.education?.[1]?.gpa || "",

      // Technical Skills - map from skills categories
      TECH_LANGUAGES: Array.isArray(user.skills) 
        ? user.skills.find(s => s.category === "Technical")?.items?.join(", ") || ""
        : user.technicalSkills?.languages || "",
      TECH_FRAMEWORKS: "",
      TECH_DATABASES: "",
      TECH_CLOUD: "",
      TECH_TOOLS: "",

      // Certifications
      CERT1_NAME: user.certifications?.[0]?.name || "",
      CERT1_ISSUER: user.certifications?.[0]?.issuer || "",
      CERT1_DATE: user.certifications?.[0]?.date || "",
      CERT2_NAME: user.certifications?.[1]?.name || "",
      CERT2_ISSUER: user.certifications?.[1]?.issuer || "",
      CERT2_DATE: user.certifications?.[1]?.date || "",

      // Projects
      PROJECT1_NAME: user.projects?.[0]?.name || "",
      PROJECT1_TECH: user.projects?.[0]?.technologies || "",
      PROJECT1_DESCRIPTION: user.projects?.[0]?.description || "",
      PROJECT2_NAME: user.projects?.[1]?.name || "",
      PROJECT2_TECH: user.projects?.[1]?.technologies || "",
      PROJECT2_DESCRIPTION: user.projects?.[1]?.description || "",
    };

    const filledTex = fillTemplate(template, data);

    // 3) Write .tex file into /generated
    const outDir = path.join(__dirname, "generated");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    const texFilePath = path.join(outDir, "cv.tex");
    fs.writeFileSync(texFilePath, filledTex, "utf8");

    // 4) Compile LaTeX -> PDF
    const cmd = `cd "${outDir}" && pdflatex -interaction=nonstopmode cv.tex`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("LaTeX error:", stderr);
        return res.status(500).json({ error: "LaTeX compilation failed" });
      }

      const pdfPath = path.join(outDir, "cv.pdf");
      if (!fs.existsSync(pdfPath)) {
        return res.status(500).json({ error: "PDF not generated" });
      }

      // 5) Send PDF to client
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="cv.pdf"');
      fs.createReadStream(pdfPath).pipe(res);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
