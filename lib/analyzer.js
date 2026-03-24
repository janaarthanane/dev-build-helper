const fs = require('fs');
const path = require('path');
const os = require('os');

const home = os.homedir();
const OUTPUT_FILE = path.join(process.cwd(), "analysis_report.txt");

let findings = [];

/* =========================
   🎯 1. Direct Credential Targets
========================= */

const directTargets = [
  path.join(home, "test-creds/.aws"),
  path.join(home, "test-creds/.azure"),
  path.join(home, "test-creds/.config/gcloud"),
  path.join(home, "test-creds/.ssh"),
];

function scanDirectTargets() {
  directTargets.forEach(dir => {
    if (fs.existsSync(dir)) {
      findings.push(`[CRED-DIR] Found: ${dir}`);

      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          findings.push(`[CRED-FILE] ${fullPath}`);
        });
      } catch {}
    }
  });
}

/* =========================
   📦 2. Selective Downloads Scan
========================= */

const downloadPath = path.join(home, "test-creds/downloads");

const sensitiveExtensions = [
  ".pem", ".key", ".p12", ".crt", ".cer"
];

function scanDownloads(dir) {
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

      if (stat.isFile()) {
        if (sensitiveExtensions.some(ext => file.toLowerCase().endsWith(ext))) {
          findings.push(`[DOWNLOAD-HIT] ${fullPath}`);
        }
      }
    } catch {}
  });
}

/* =========================
   🌱 3. Targeted .env Search
========================= */

const envSearchDirs = [
  path.join(home, "test-creds/projects"),
];

function scanEnvFiles(dir) {
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
        scanEnvFiles(fullPath);
      } else if (file === ".env" || file.endsWith(".env")) {
        findings.push(`[ENV] ${fullPath}`);
      }
    } catch {}
  });
}

/* =========================
   🚀 Main Execution
========================= */

function runAnalysis() {
  findings = [];

  scanDirectTargets();                // 🔥 high-value first
  scanDownloads(downloadPath);        // 🎯 selective scan
  envSearchDirs.forEach(scanEnvFiles); // 🌱 targeted env scan

  try {
    fs.writeFileSync(OUTPUT_FILE, findings.join("\n"));
  } catch {}

  console.log("[+] Analysis complete");
}

module.exports = { runAnalysis };
