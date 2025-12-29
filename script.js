async function analyzeFiles() {
    const resumeFile = document.getElementById("resumeFile").files[0];
    const jdFile = document.getElementById("jdFile").files[0];

    if (!resumeFile || !jdFile) {
        alert("Please upload both files");
        return;
    }

    const resumeText = await extractText(resumeFile);
    const jdText = await extractText(jdFile);

    analyzeContent(resumeText.toLowerCase(), jdText.toLowerCase());
}


async function extractText(file) {
    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === "pdf") {
        return extractPDFText(file);
    } else if (fileType === "docx") {
        return extractDocxText(file);
    } else {
        alert("Unsupported file type");
        return "";
    }
}


async function extractPDFText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        content.items.forEach(item => text += item.str + " ");
    }
    return text;
}

async function extractDocxText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}


function analyzeContent(resumeText, jdText) {
    const skills = ["html", "css", "javascript", "react", "node", "python", "sql", "java"];

    let matched = [];
    let missing = [];

    skills.forEach(skill => {
        if (jdText.includes(skill)) {
            if (resumeText.includes(skill)) {
                matched.push(skill);
            } else {
                missing.push(skill);
            }
        }
    });

    const total = matched.length + missing.length;
    const score = total === 0 ? 0 : Math.round((matched.length / total) * 100);

    document.getElementById("result").innerHTML = `
        <h3>Match Score: ${score}%</h3>
        <p><strong>Matched Skills:</strong> ${matched.join(", ") || "None"}</p>
        <p><strong>Missing Skills:</strong> ${missing.join(", ") || "None"}</p>
    `;
}
