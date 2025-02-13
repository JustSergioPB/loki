module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["app", "pkg", "deps", "ci", "chore"]],
    "scope-empty": [2, "never"],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [2, "always", "lower-case"],
  },
};
