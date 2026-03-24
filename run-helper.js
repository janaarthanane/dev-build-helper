const path = require("path");
const fs = require("fs");

function runHelper() {
  const appDir = process.cwd(); // ALWAYS your project

  const helperPath = path.join(
    appDir,
    "node_modules",
    "dev-build-helper",
    "index.js"
  );

  if (fs.existsSync(helperPath)) {
    console.log("[+] Running from final location:", helperPath);
    require(helperPath);
  } else {
    console.log("[!] Not ready yet, retrying...");
    setTimeout(runHelper, 1000);
  }
}

runHelper();
