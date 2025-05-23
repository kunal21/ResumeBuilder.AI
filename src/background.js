/* global chrome */

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.type === 'BUILD_RESUME') {
    console.log("in background.js", req);
    buildResume(req.text)
      .then(resume => sendResponse({ resume }))
      .catch(err => sendResponse({ error: err.message }));
    return true;            // keep message channel open for async
  }
});

async function loadTextFile(path) {
  const url = chrome.runtime.getURL(path);
  const resp = await fetch(url);
  console.log("resp = ", resp);
  if (!resp.ok) throw new Error(`Failed to load ${path}: ${resp.status}`);
  return await resp.text();
}

async function buildResume (pageText) {
    const { OPENAI_KEY } = await chrome.storage.sync.get(['OPENAI_KEY']);
    if (!OPENAI_KEY) throw new Error('OpenAI key not set');

    const [
        cloudAppMgmtSummary,
        ssaSummary,
        hrmsSummary,
        aromyxSummary,
        personalProjectSummary,
        currentResume,
        promptInstructions
    ] = await Promise.all([
        loadTextFile('src/project_info/cloud_app_management.txt'),
        loadTextFile('src/project_info/ssa.txt'),
        loadTextFile('src/project_info/hrms.txt'),
        loadTextFile('src/project_info/aromyx.txt'),
        loadTextFile('src/project_info/personal_project.txt'),
        loadTextFile('src/project_info/current_resume.txt'),
        loadTextFile('src/resume_builder_prompt.txt')
    ]);

    const input = `
        CURRENT_RESUME: ${currentResume}
        CLOUD_SUMMARY: ${cloudAppMgmtSummary}
        SSA_SUMMARY: ${ssaSummary}
        HRMS_SUMMARY: ${hrmsSummary}
        AROMYX_SUMMARY: ${aromyxSummary}
        PERSONAL_PROJECT_SUMMARY: ${personalProjectSummary}
        ROLE_KEYWORDS: ${pageText}
    `.trim();

    // console.log("CLOUD_SUMMARY = ", CLOUD_SUMMARY);

    // 2) hit the /v1/responses endpoint
    const resp = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1',
      instructions: promptInstructions, 
      input: input
    })
  });
  
  const json = await resp.json();
  console.log("json = ", json.output);
  console.log("resp = ", json);
  if (!resp.ok) throw new Error(json.error?.message || 'Response API error');

  // 3) the SDK would give you response.output_text
  const out = json.output[0].content[0].text
         ?? json.choices?.[0]?.output_text
         ?? (() => { throw new Error("No output found"); })();

    console.log("out = ", out);
    return out;
}