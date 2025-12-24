# CV Generator Setup Instructions

## Prerequisites

### 1. LaTeX Installation
The CV generator requires LaTeX to be installed on your system to compile PDF files.

#### Windows (using MiKTeX)
1. Download MiKTeX from: https://miktex.org/download
2. Run the installer and follow the setup wizard
3. During installation, select "Install missing packages automatically: Yes"
4. After installation, add MiKTeX to your system PATH (usually done automatically)

#### Alternative: Using TeX Live
1. Download TeX Live from: https://www.tug.org/texlive/
2. Follow the installation instructions for your platform

#### macOS
```bash
# Using Homebrew
brew install --cask mactex

# Or using MacPorts
sudo port install texlive-latex
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-fonts-extra texlive-latex-extra
```

### 2. Verify LaTeX Installation
Open a terminal/command prompt and run:
```bash
pdflatex --version
```

You should see version information if LaTeX is properly installed.

## Backend Integration

The CV generator has been integrated into the main backend server with the following endpoints:

- **POST** `/api/v1/cv/generate` - Generate and download PDF
- **POST** `/api/v1/cv/preview` - Preview CV data without generating PDF
- **GET** `/api/v1/cv/templates` - Get available templates

## File Structure

```
Backend/
├── src/
│   ├── controllers/
│   │   └── cvController.js     # CV generation logic
│   └── routes/
│       └── cvRoutes.js         # CV API routes
└── cv-generator/
    ├── template_cv.tex         # LaTeX template
    └── generated/              # Temporary PDF files (auto-cleaned)
```

## Frontend Integration

The ResumeBuilder component now includes:
- **Download PDF** button that calls the backend API
- PDF generation progress indicator
- Error handling for failed PDF generation

## Testing the Integration

1. Start the backend server:
```bash
cd Backend
npm run dev
```

2. Start the frontend:
```bash
cd Frontend
npm run dev
```

3. Navigate to the resume builder and click "Download PDF"

## Troubleshooting

### Common Issues

1. **"LaTeX compilation failed"**
   - Ensure LaTeX is installed and `pdflatex` is in your PATH
   - Check that all required LaTeX packages are installed

2. **"PDF not generated"**
   - Check server logs for LaTeX compilation errors
   - Verify the `cv-generator/generated` directory exists and is writable

3. **"Template not found"**
   - Ensure `template_cv.tex` exists in the `cv-generator` directory
   - Check file permissions

### Debug Mode

Set `NODE_ENV=development` to see detailed error logs for PDF generation.

## Customization

### Adding New Templates

1. Create a new `.tex` file in `cv-generator/`
2. Update the `getTemplates` function in `cvController.js`
3. Add template selection logic in the frontend

### Modifying the LaTeX Template

Edit `cv-generator/template_cv.tex` to customize the PDF layout and styling.

## Security Considerations

- PDF files are automatically cleaned up after 5 seconds
- All user input is sanitized before LaTeX compilation
- Authentication is required for all CV endpoints