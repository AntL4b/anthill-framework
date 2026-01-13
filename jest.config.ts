module.exports = {
  transform: {
    ".(ts|tsx)": ["ts-jest", {
      tsconfig: "tsconfig.jest.json",
    }],
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
  ],
  roots: ["<rootDir>/tests"],
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "packages/**/*.ts",
    "!packages/index.ts",
  ],
  coverageDirectory: "coverage",
  testPathIgnorePatterns: [
    "/node_modules/",
  ],
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
}

