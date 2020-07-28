module.exports = {
  "preset": "jest-puppeteer",
  testPathIgnorePatterns: ['/node_modules/', 'dist'],
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
}