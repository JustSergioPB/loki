#!/usr/bin/env node

const { execSync } = require("child_process");

const getCurrentBranch = () => {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
};

const validateBranchName = (branchName) => {
  const pattern = /^(feature|bugfix|hotfix|release)\/[A-Z]+-\d+(-[a-z0-9-]+)?$/;
  return pattern.test(branchName);
};

const branchName = getCurrentBranch();

if (!validateBranchName(branchName)) {
  console.error(
    "Branch name must follow pattern: /-",
    "\nExample: feature/PROJ-123-add-new-feature"
  );
  process.exit(1);
}
