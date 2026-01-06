# Resume Save and View Implementation

## Overview
Implemented a complete resume saving system with Cloudinary storage and a resume viewer interface for employers to view candidate resumes from the database.

## Backend Changes (resumeController.js)

### 1. PDF Generation from Resume Data
- Added `generateResumePDF()` function that:
  - Loads the LaTeX template from `cv-generator/template_cv.tex`
  - Fills template placeholders with resume data
  - Compiles LaTeX to PDF using pdflatex
  - Returns the generated PDF file path

### 2. Cloudinary Upload
- Added `uploadPDFToCloudinary()` function that:
  - Uploads the generated PDF to Cloudinary
  - Stores in `canadajobs/resumes` folder with unique naming
  - Returns the secure URL and public ID for database storage

### 3. Enhanced Save Resume Endpoint
- Updated `saveResumeData` endpoint to:
  - Generate a PDF from the resume data
  - Upload the PDF to Cloudinary automatically
  - Store both the resume data and PDF link in MongoDB
  - Associate resume with user and job application
  - Clean up temporary local files after upload

**Flow:**
```
User saves resume → Generate PDF → Upload to Cloudinary → Save to DB
```

## Frontend Changes (ResumeBuilder.tsx)

### Save Functionality
The resume builder already calls the `/api/v1/resumes/save` endpoint which now:
1. Generates a formatted PDF with all resume data
2. Uploads PDF to Cloudinary for permanent storage
3. Returns Cloudinary URL stored in the resume record

## Frontend Changes (ApplicantTracking.tsx)

### 1. Resume Viewer State
Added state management for:
- `selectedResume`: Currently viewed resume data
- `loadingResume`: Loading state while fetching resume

### 2. Handle View Resume Function
`handleViewResume()` function:
- Fetches all resumes from `/api/v1/resumes` endpoint
- Searches for resume by applicant email or name
- Sets the resume data for display in modal

### 3. Resume Display Modal
- New dialog component displays full resume details
- Shows all resume sections beautifully formatted:
  - Header with contact info
  - Professional summary
  - Experience (with dates and descriptions)
  - Education (degree, field, GPA)
  - Skills (by category)
  - Certifications
  - Languages
  - Projects (with links)

### 4. Updated ApplicantDetails Component
- "View Resume" button now fetches from database instead of opening link
- Button shows loading state while fetching
- Integrates with new ResumeViewer component

## Database Schema (Resume Model)

Resume document now includes:
```javascript
{
  user: ObjectId,           // User ID
  title: String,           // Resume title
  role: String,            // Target job role
  fileUrl: String,         // Cloudinary PDF URL
  publicId: String,        // Cloudinary public ID for management
  parsedData: {
    name: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    summary: String,
    experience: [{...}],
    education: [{...}],
    skills: [{category, items}],
    certifications: [{...}],
    languages: [{...}],
    projects: [{...}]
  },
  isPrimary: Boolean,
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Workflow for Employers

1. **View Applicants**: Employer opens Applicant Tracking dashboard
2. **Select Application**: Clicks "View Profile" on an applicant
3. **Click Resume Button**: Opens a dialog that loads resume from database
4. **View Full Resume**: Displays beautifully formatted resume with:
   - All professional details
   - Clickable links for projects
   - Organized by sections
   - Print-friendly layout

## API Endpoints Used

### Save Resume (JobSeeker)
```
POST /api/v1/resumes/save
Body: Resume data (name, email, experience, education, skills, etc.)
Response: Saved resume with Cloudinary PDF URL
```

### Get Resumes (Employer)
```
GET /api/v1/resumes
Header: Authorization Bearer token
Response: List of all resumes
```

### Get Resume by ID
```
GET /api/v1/resumes/:id
Response: Single resume with full parsed data
```

## Features

✅ Auto-generate PDF from resume data using LaTeX
✅ Store PDF in Cloudinary for reliable CDN delivery
✅ Beautiful resume viewer interface
✅ Fetch resume data from MongoDB
✅ Display formatted resume sections
✅ Search resume by email/name
✅ Responsive design
✅ Loading states
✅ Error handling

## File Storage
- PDFs are stored in Cloudinary (cloud-based)
- Resume data stored in MongoDB
- Temporary local files are cleaned up automatically
- No manual file management needed

## Next Steps (Optional)
- Download resume as PDF from Cloudinary
- Email resume to hiring team
- Generate resume feedback with AI
- Track resume view analytics
- Compare multiple candidates' resumes side-by-side
