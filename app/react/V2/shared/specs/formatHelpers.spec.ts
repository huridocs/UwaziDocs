import { formatBytes } from '../formatHelpers';

describe('Formatting helpers', () => {
  describe('bytes formatter', () => {
    it.each`
      bytes        | result
      ${3382316}   | ${'3.23 MB'}
      ${45819944}  | ${'43.7 MB'}
      ${275289508} | ${'262.54 MB'}
    `('should return a formatted date', ({ bytes, result }) => {
      expect(formatBytes(bytes)).toEqual(result);
    });
  });
});
