import { calculateScaling } from '../calculateScaling';

describe('pdf scaling calculation', () => {
  describe('device scaling is greater or equal to 1', () => {
    it('shoud return a scaling of 1 when the width ratio is below 1', () => {
      const result = calculateScaling(1.8, 5, 10);
      expect(result).toEqual(1);
    });

    it('should return the scaling if the width ratio is above 1', () => {
      const result = calculateScaling(1.8, 12, 10);
      expect(result).toEqual(0.46296296296296297);
    });
  });

  describe('device scaling is less than 1', () => {
    it('should return a ratio based on the device scaling', () => {
      const result = calculateScaling(0.7, 12, 10);
      expect(result).toEqual(0.5833333333333334);
    });

    it('should return the same scaling for device pixel ratios below .5', () => {
      let result = calculateScaling(0.4, 12, 10);
      expect(result).toEqual(0.4166666666666667);

      result = calculateScaling(0.2, 12, 10);
      expect(result).toEqual(0.4166666666666667);
    });
  });
});
