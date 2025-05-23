/* global chrome, React, ReactDOM */
const { useState } = React;

function App () {
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

    async function exportPdf() {
        const container = document.getElementById('resumeContainer');
    // 1) Render HTML to canvas
        const canvas = await html2canvas(container, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
    // 2) Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = (canvas.height * pageW) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH);
    // 3) Trigger download
        pdf.save('resume.pdf');
    }

  async function build () {
    console.log("in popup.js build");
    setError('');
    setLoading(true);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      setError('No active tab.');
      setLoading(false);
      return;
    }

    // Ask content script for page text
    chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_TEXT' }, (resp) => {
      if (chrome.runtime.lastError) {
        console.log("hello world", chrome.runtime.lastError);
        setError('Cannot access page – refresh and try again.');
        setLoading(false);
        return;
      }

      const pageText = resp.text.slice(0, 8000); // quick token cap
      chrome.runtime.sendMessage({ type: 'BUILD_RESUME', text: pageText }, (ans) => {
        if (ans?.error) {
             setError(ans.error);
        } else {
            setResume(ans.resume);
        }
      });
    });
  }

  return (
        React.createElement('div', null,
      React.createElement('button', { onClick: build, disabled: loading }, loading ? 'Building…' : 'Build Resume'),
      React.createElement(
      'button',
        { onClick: exportPdf, disabled: !resume },
      'Export as PDF'
    ),
      error && React.createElement('p', { style: { color: 'red' } }, error),
    //   resume  && React.createElement('pre', null, resume)
        resume && React.createElement('div', {
        id: 'resumeContainer',
    style: {
        border: '1px solid #ccc',
        padding: '0.5rem',
        marginTop: '1rem',
        maxHeight: '400px',
        overflowY: 'auto'
      },
      dangerouslySetInnerHTML: { __html: resume }
    })
    )
   );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));