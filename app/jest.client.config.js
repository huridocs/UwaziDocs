/** @format */

module.exports = {
  name: 'client',
  displayName: 'Client',
  testMatch: ['**/react/**/specs/*spec.(j|t)s?(x)'],
  testPathIgnorePatterns: [],
  setupFilesAfterEnv: ['<rootDir>/setUpJestClient.js'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
