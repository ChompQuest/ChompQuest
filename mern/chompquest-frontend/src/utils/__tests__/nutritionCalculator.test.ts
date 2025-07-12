import { 
  calculateRecommendedMetrics, 
  feetInchesToCm, 
  lbsToKg,
  cmToFeetInches,
  kgToLbs 
} from '../nutritionCalculator';

describe('Nutrition Calculator', () => {
  describe('calculateRecommendedMetrics', () => {
    it('should calculate reasonable recommendations for a male', () => {
      const result = calculateRecommendedMetrics('male', 175, 70, 25, 'moderately_active');
      
      expect(result.recommendedCalories).toBeGreaterThan(1500);
      expect(result.recommendedCalories).toBeLessThan(3500);
      expect(result.recommendedWater).toBeGreaterThan(2000);
      expect(result.recommendedProtein).toBeGreaterThan(80);
      expect(result.recommendedCarbs).toBeGreaterThan(150);
      expect(result.recommendedFat).toBeGreaterThan(30);
    });

    it('should calculate reasonable recommendations for a female', () => {
      const result = calculateRecommendedMetrics('female', 165, 60, 30, 'lightly_active');
      
      expect(result.recommendedCalories).toBeGreaterThan(1200);
      expect(result.recommendedCalories).toBeLessThan(3000);
      expect(result.recommendedWater).toBeGreaterThan(1800);
      expect(result.recommendedProtein).toBeGreaterThan(70);
      expect(result.recommendedCarbs).toBeGreaterThan(120);
      expect(result.recommendedFat).toBeGreaterThan(25);
    });

    it('should return higher calories for more active individuals', () => {
      const sedentary = calculateRecommendedMetrics('male', 175, 70, 25, 'sedentary');
      const veryActive = calculateRecommendedMetrics('male', 175, 70, 25, 'very_active');
      
      expect(veryActive.recommendedCalories).toBeGreaterThan(sedentary.recommendedCalories);
    });
  });

  describe('Unit conversions', () => {
    it('should convert feet and inches to cm correctly', () => {
      expect(feetInchesToCm(5, 8)).toBeCloseTo(172.72, 1); // 5'8" = 172.72 cm
      expect(feetInchesToCm(6, 0)).toBeCloseTo(182.88, 1); // 6'0" = 182.88 cm
    });

    it('should convert lbs to kg correctly', () => {
      expect(lbsToKg(150)).toBeCloseTo(68.04, 1); // 150 lbs = 68.04 kg
      expect(lbsToKg(200)).toBeCloseTo(90.72, 1); // 200 lbs = 90.72 kg
    });

    it('should convert cm to feet and inches correctly', () => {
      const result1 = cmToFeetInches(172.72);
      expect(result1.feet).toBe(5);
      expect(result1.inches).toBe(8);

      const result2 = cmToFeetInches(182.88);
      expect(result2.feet).toBe(6);
      expect(result2.inches).toBe(0);
    });

    it('should convert kg to lbs correctly', () => {
      expect(kgToLbs(68.04)).toBeCloseTo(150, 0); // 68.04 kg = 150 lbs
      expect(kgToLbs(90.72)).toBeCloseTo(200, 0); // 90.72 kg = 200 lbs
    });
  });
}); 