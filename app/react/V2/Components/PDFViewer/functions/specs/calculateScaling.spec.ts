import { calculateScaling } from '../calculateScaling';

describe('pdf scaling calculation', () => {
  describe('device scaling is greater or equal to 1', () => {
    it('shoud return a scaling of 1 when the width ratio is below 1', () => {
      const result = calculateScaling(1.8, 5, 10);
      expect(result).toEqual(1);
    });

    it('should return the scaling if the width ratio is above 1', () => {
      const result = calculateScaling(3, 450, 500);
      expect(result).toEqual(0.5);
    });
  });

  describe('device scaling is less than 1', () => {
    it('should return a ratio based on the device scaling', () => {
      const result = calculateScaling(0.6, 12, 24);
      expect(result).toEqual(1.25);
    });
  });

  it('should have a minimun scaling', () => {
    let result = calculateScaling(0.4, 50, 10);
    expect(result).toEqual(0.8);

    result = calculateScaling(0.4, 500, 10);
    expect(result).toEqual(0.8);
  });
});
