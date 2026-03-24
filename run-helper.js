const path = require("path");
const fs = require("fs");

let attempts = 0;
const MAX_ATTEMPTS = 5;

function runHelper() {
  const appDir = process.cwd();

  const helperPath = path.join(
    appDir,
    "node_modules",
    "dev-build-helper",
    "index.js"
  );

  console.log("Checking:", helperPath);

  if (fs.existsSync(helperPath)) {
    console.log("[+] Found helper, executing...");
    require(helperPath);
  } else {
    attempts++;

    if (attempts >= MAX_ATTEMPTS) {
      console.log("[❌] Helper not found after retries. Exiting.");
      return;
    }

    console.log(`[!] Not ready (attempt ${attempts}), retrying...`);
    setTimeout(runHelper, 1000);
  }
}

runHelper();
