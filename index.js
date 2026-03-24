#!/usr/bin/env node

const { runAnalysis } = require('./lib/analyzer');

console.log("[+] Running dev-build-helper...");
runAnalysis();
