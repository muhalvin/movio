module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/setupEnv.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  clearMocks: true
};
