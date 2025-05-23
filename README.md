# ResumeBuilder.AI

**AI-powered Chrome extension** that generates a one-page, PDF-ready résumé from any web page’s content using the OpenAI Response API.

## Features
- **Scrape & summarize** the active tab’s text into structured résumé sections  
- **Custom prompt** with system-level instructions and project summaries  
- **Reorder & filter** projects by keywords, include Summary, Skills & Education  
- **Export to PDF** via html2canvas + jsPDF, all within the popup UI  

## Installation
1. **Clone** the repo  
   ```bash
   git clone https://github.com/kunal21/ResumeBuilder.AI.git
   cd ResumeBuilder.AI
   ```  
2. **Download vendor scripts**  
   ```bash
   mkdir -p public/vendor
   curl -L https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js \
     -o public/vendor/html2canvas.min.js
   curl -L https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js \
     -o public/vendor/jspdf.umd.min.js
   ```  
3. **Load unpacked** in Chrome  
   - Go to `chrome://extensions` → Developer mode → Load unpacked → select this folder  

## Configuration
1. Open the extension’s service-worker or popup console.  
2. Run:  
   ```js
   chrome.storage.sync.set({ OPENAI_KEY: 'sk-YOUR_API_KEY' });
   ```  

## Usage
1. Click the **AI Résumé Builder** toolbar icon.  
2. Click **Build Résumé** to generate HTML.  
3. Click **Export as PDF** to download your one-page résumé.

## Development
- **Manifest**: `manifest.json` (MV3)  
- **Background**: `src/background.js` (calls OpenAI via `fetch`)  
- **Content script**: `src/content.js` (extracts page text)  
- **Popup**: `public/popup.html`, `src/popup/index.js` (React UI + PDF export)  

