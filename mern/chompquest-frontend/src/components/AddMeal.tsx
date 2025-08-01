import React, { useState } from 'react';
import './AddMeal.css';
import type { NutrientData, LoggedMealData } from './types';

interface AddMealProps {
  onClose: () => void;
  onAddMeal: (mealData: LoggedMealData) => void;
}

const AddMeal: React.FC<AddMealProps> = ({ onClose, onAddMeal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState<number | ''>(0);
  const [customProtein, setCustomProtein] = useState<number | ''>(0);
  const [customCarbs, setCustomCarbs] = useState<number | ''>(0);
  const [customFats, setCustomFats] = useState<number | ''>(0);

  const nutrientLookup: { [key: string]: NutrientData } = {
    'Apple (1 medium)': { calories: 95, protein: 0, carbs: 25, fats: 0 },
    'Banana (1 medium)': { calories: 105, protein: 1, carbs: 27, fats: 0 },
    'Orange (1 medium)': { calories: 62, protein: 1, carbs: 15, fats: 0 },
    'Grapes (100g)': { calories: 69, protein: 1, carbs: 18, fats: 0 },
    'Strawberries (100g)': { calories: 32, protein: 1, carbs: 8, fats: 0 },
    'Blueberries (100g)': { calories: 57, protein: 1, carbs: 14, fats: 0 },
    'Raspberries (100g)': { calories: 52, protein: 1, carbs: 12, fats: 1 },
    'Avocado (100g)': { calories: 160, protein: 2, carbs: 9, fats: 15 },
    'Mango (100g)': { calories: 60, protein: 1, carbs: 15, fats: 0 },
    'Pineapple (100g)': { calories: 50, protein: 0, carbs: 13, fats: 0 },
    'Watermelon (100g)': { calories: 30, protein: 1, carbs: 8, fats: 0 },
    'Cantaloupe (100g)': { calories: 34, protein: 1, carbs: 8, fats: 0 },
    'Kiwi (1 medium)': { calories: 61, protein: 1, carbs: 15, fats: 1 },
    'Lemon (1 medium)': { calories: 29, protein: 1, carbs: 9, fats: 0 },
    'Lime (1 medium)': { calories: 20, protein: 0, carbs: 7, fats: 0 },
    'Peach (1 medium)': { calories: 59, protein: 1, carbs: 14, fats: 0 },
    'Pear (1 medium)': { calories: 101, protein: 1, carbs: 27, fats: 0 },
    'Plum (1 medium)': { calories: 30, protein: 0, carbs: 8, fats: 0 },
    'Cherry (100g)': { calories: 50, protein: 1, carbs: 12, fats: 0 },
    'Apricot (1 medium)': { calories: 17, protein: 0, carbs: 4, fats: 0 },
    'Fig (1 medium)': { calories: 37, protein: 0, carbs: 10, fats: 0 },
    'Date (1 medium)': { calories: 20, protein: 0, carbs: 5, fats: 0 },
    'Coconut (100g flesh)': { calories: 354, protein: 3, carbs: 15, fats: 33 },
    'Pomegranate (100g seeds)': { calories: 83, protein: 1, carbs: 19, fats: 1 },
    'Grapefruit (1 medium)': { calories: 52, protein: 1, carbs: 13, fats: 0 },
    'Papaya (100g)': { calories: 43, protein: 0, carbs: 11, fats: 0 },
    'Guava (100g)': { calories: 68, protein: 3, carbs: 14, fats: 1 },
    'Passion Fruit (1 medium)': { calories: 18, protein: 0, carbs: 4, fats: 0 },
    'Persimmon (1 medium)': { calories: 32, protein: 0, carbs: 8, fats: 0 },
    'Nectarine (1 medium)': { calories: 60, protein: 1, carbs: 14, fats: 0 },
    'Lychee (100g)': { calories: 66, protein: 1, carbs: 17, fats: 0 },
    'Star Fruit (1 medium)': { calories: 28, protein: 0, carbs: 6, fats: 0 },
    'Dragon Fruit (100g)': { calories: 60, protein: 1, carbs: 9, fats: 0 },
    'Kumquat (1 medium)': { calories: 13, protein: 0, carbs: 3, fats: 0 },
    'Mulberry (100g)': { calories: 43, protein: 1, carbs: 10, fats: 0 },
    'Elderberry (100g)': { calories: 73, protein: 1, carbs: 18, fats: 0 },
    'Cranberry (100g)': { calories: 46, protein: 0, carbs: 12, fats: 0 },
    'Blackberry (100g)': { calories: 43, protein: 1, carbs: 10, fats: 0 },
    'Currant (Red/Black) (100g)': { calories: 56, protein: 1, carbs: 14, fats: 0 },
    'Gooseberry (100g)': { calories: 44, protein: 1, carbs: 10, fats: 0 },
    'Durian (100g)': { calories: 147, protein: 1, carbs: 27, fats: 5 },
    'Jackfruit (100g)': { calories: 95, protein: 1, carbs: 24, fats: 0 },
    'Longan (100g)': { calories: 60, protein: 1, carbs: 15, fats: 0 },
    'Rambutan (100g)': { calories: 82, protein: 1, carbs: 21, fats: 0 },
    'Soursop (100g)': { calories: 66, protein: 1, carbs: 17, fats: 0 },
    'Acai Berry (100g puree)': { calories: 70, protein: 1, carbs: 4, fats: 5 },
    'Goji Berry (100g dried)': { calories: 349, protein: 14, carbs: 77, fats: 0 },
    'Clementine (1 medium)': { calories: 35, protein: 1, carbs: 9, fats: 0 },
    'Tangerine (1 medium)': { calories: 47, protein: 1, carbs: 12, fats: 0 },
    'Quince (100g)': { calories: 57, protein: 0, carbs: 15, fats: 0 },

    // Vegetables
    'Broccoli (100g)': { calories: 34, protein: 3, carbs: 7, fats: 0 },
    'Spinach (100g)': { calories: 23, protein: 3, carbs: 4, fats: 0 },
    'Carrot (100g)': { calories: 41, protein: 1, carbs: 10, fats: 0 },
    'Tomato (100g)': { calories: 18, protein: 1, carbs: 4, fats: 0 },
    'Cucumber (100g)': { calories: 15, protein: 1, carbs: 4, fats: 0 },
    'Lettuce (Romaine) (100g)': { calories: 17, protein: 1, carbs: 3, fats: 0 },
    'Bell Pepper (Green) (100g)': { calories: 20, protein: 1, carbs: 5, fats: 0 },
    'Bell Pepper (Red) (100g)': { calories: 31, protein: 1, carbs: 6, fats: 0 },
    'Onion (100g)': { calories: 40, protein: 1, carbs: 9, fats: 0 },
    'Garlic (100g)': { calories: 149, protein: 6, carbs: 33, fats: 1 },
    'Potato (100g boiled)': { calories: 87, protein: 2, carbs: 20, fats: 0 },
    'Sweet Potato (100g baked)': { calories: 86, protein: 2, carbs: 20, fats: 0 },
    'Cauliflower (100g)': { calories: 25, protein: 2, carbs: 5, fats: 0 },
    'Cabbage (100g)': { calories: 25, protein: 1, carbs: 6, fats: 0 },
    'Mushroom (White) (100g)': { calories: 22, protein: 3, carbs: 3, fats: 0 },
    'Asparagus (100g)': { calories: 20, protein: 2, carbs: 4, fats: 0 },
    'Zucchini (100g)': { calories: 17, protein: 1, carbs: 3, fats: 0 },
    'Eggplant (100g)': { calories: 25, protein: 1, carbs: 6, fats: 0 },
    'Green Beans (100g)': { calories: 31, protein: 2, carbs: 7, fats: 0 },
    'Corn (100g kernels)': { calories: 86, protein: 3, carbs: 19, fats: 1 },
    'Peas (Green) (100g)': { calories: 81, protein: 5, carbs: 14, fats: 0 },
    'Broccoli Rabe (100g)': { calories: 22, protein: 3, carbs: 4, fats: 0 },
    'Brussels Sprouts (100g)': { calories: 43, protein: 3, carbs: 9, fats: 0 },
    'Artichoke (1 medium)': { calories: 60, protein: 3, carbs: 13, fats: 0 },
    'Celery (100g)': { calories: 16, protein: 1, carbs: 3, fats: 0 },
    'Beets (100g cooked)': { calories: 43, protein: 2, carbs: 10, fats: 0 },
    'Radish (100g)': { calories: 16, protein: 1, carbs: 3, fats: 0 },
    'Scallions (Green Onion) (100g)': { calories: 32, protein: 2, carbs: 7, fats: 0 },
    'Leek (100g)': { calories: 61, protein: 1, carbs: 14, fats: 0 },
    'Ginger (100g)': { calories: 80, protein: 2, carbs: 18, fats: 1 },
    'Turmeric (100g)': { calories: 354, protein: 8, carbs: 65, fats: 10 },
    'Okra (100g)': { calories: 33, protein: 2, carbs: 7, fats: 0 },
    'Kale (100g)': { calories: 49, protein: 4, carbs: 9, fats: 1 },
    'Collard Greens (100g)': { calories: 32, protein: 3, carbs: 6, fats: 1 },
    'Mustard Greens (100g)': { calories: 27, protein: 3, carbs: 5, fats: 0 },
    'Turnip (100g)': { calories: 28, protein: 1, carbs: 6, fats: 0 },
    'Parsnip (100g)': { calories: 75, protein: 1, carbs: 18, fats: 0 },
    'Rutabaga (100g)': { calories: 37, protein: 1, carbs: 9, fats: 0 },
    'Fennel (100g)': { calories: 31, protein: 1, carbs: 7, fats: 0 },
    'Endive (100g)': { calories: 17, protein: 1, carbs: 3, fats: 0 },
    'Arugula (100g)': { calories: 25, protein: 3, carbs: 4, fats: 1 },
    'Watercress (100g)': { calories: 11, protein: 2, carbs: 1, fats: 0 },
    'Bok Choy (100g)': { calories: 13, protein: 1, carbs: 2, fats: 0 },
    'Swiss Chard (100g)': { calories: 19, protein: 2, carbs: 4, fats: 0 },
    'Kohlrabi (100g)': { calories: 27, protein: 2, carbs: 6, fats: 0 },
    'Daikon Radish (100g)': { calories: 18, protein: 1, carbs: 4, fats: 0 },
    'Jicama (100g)': { calories: 38, protein: 1, carbs: 9, fats: 0 },
    'Taro (100g)': { calories: 112, protein: 1, carbs: 26, fats: 0 },
    'Cassava (Yuca) (100g)': { calories: 160, protein: 1, carbs: 38, fats: 0 },
    'Plantain (100g raw)': { calories: 122, protein: 1, carbs: 32, fats: 0 },
    'Pumpkin (100g cooked)': { calories: 26, protein: 1, carbs: 7, fats: 0 },
    'Butternut Squash (100g cooked)': { calories: 45, protein: 1, carbs: 12, fats: 0 },
    'Acorn Squash (100g cooked)': { calories: 40, protein: 1, carbs: 10, fats: 0 },
    'Spaghetti Squash (100g cooked)': { calories: 31, protein: 1, carbs: 7, fats: 0 },
    'Kabocha Squash (100g cooked)': { calories: 34, protein: 1, carbs: 8, fats: 0 },
    'Chayote (100g)': { calories: 19, protein: 1, carbs: 4, fats: 0 },
    'Leeks (100g)': { calories: 61, protein: 1, carbs: 14, fats: 0 },
    'Shallots (100g)': { calories: 72, protein: 2, carbs: 17, fats: 0 },
    'Artichoke Hearts (canned, 100g)': { calories: 31, protein: 2, carbs: 7, fats: 0 },
    'Bamboo Shoots (canned, 100g)': { calories: 20, protein: 2, carbs: 3, fats: 0 },
    'Cactus (Nopales) (100g)': { calories: 16, protein: 1, carbs: 3, fats: 0 },
    'Endive (Belgian) (100g)': { calories: 17, protein: 1, carbs: 3, fats: 0 },
    'Frisee Lettuce (100g)': { calories: 14, protein: 1, carbs: 3, fats: 0 },
    'Dandelion Greens (100g)': { calories: 45, protein: 3, carbs: 9, fats: 1 },
    'Beet Greens (100g)': { calories: 22, protein: 2, carbs: 4, fats: 0 },
    'Kale (Lacinato) (100g)': { calories: 35, protein: 3, carbs: 7, fats: 1 },
    'Okra (cooked, 100g)': { calories: 33, protein: 2, carbs: 7, fats: 0 },
    'Parsley (100g)': { calories: 36, protein: 3, carbs: 6, fats: 1 },
    'Cilantro (100g)': { calories: 23, protein: 2, carbs: 4, fats: 1 },
    'Dill (100g)': { calories: 43, protein: 3, carbs: 7, fats: 1 },
    'Mint (100g)': { calories: 70, protein: 4, carbs: 15, fats: 1 },
    'Rosemary (100g)': { calories: 131, protein: 3, carbs: 21, fats: 6 },
    'Thyme (100g)': { calories: 101, protein: 6, carbs: 24, fats: 2 },
    'Basil (100g)': { calories: 23, protein: 3, carbs: 3, fats: 0 },
    'Sage (100g)': { calories: 315, protein: 11, carbs: 60, fats: 10 },

    // Grains, Pasta & Bread 
    'White Rice (cooked, 100g)': { calories: 130, protein: 3, carbs: 28, fats: 0 },
    'Brown Rice (cooked, 100g)': { calories: 112, protein: 2, carbs: 23, fats: 1 },
    'Quinoa (cooked, 100g)': { calories: 120, protein: 4, carbs: 21, fats: 2 },
    'Oats (rolled, 100g dry)': { calories: 389, protein: 17, carbs: 66, fats: 7 },
    'Whole Wheat Bread (1 slice)': { calories: 82, protein: 4, carbs: 14, fats: 1 },
    'White Bread (1 slice)': { calories: 75, protein: 2, carbs: 14, fats: 1 },
    'Pasta (cooked, 100g)': { calories: 158, protein: 6, carbs: 31, fats: 1 },
    'Whole Wheat Pasta (cooked, 100g)': { calories: 124, protein: 5, carbs: 25, fats: 1 },
    'Couscous (cooked, 100g)': { calories: 112, protein: 4, carbs: 23, fats: 0 },
    'Barley (cooked, 100g)': { calories: 123, protein: 3, carbs: 28, fats: 0 },
    'Rye Bread (1 slice)': { calories: 83, protein: 3, carbs: 16, fats: 1 },
    'Pita Bread (1 medium)': { calories: 165, protein: 6, carbs: 33, fats: 1 },
    'Naan Bread (1 piece)': { calories: 260, protein: 8, carbs: 45, fats: 6 },
    'Corn Tortilla (1 medium)': { calories: 60, protein: 2, carbs: 12, fats: 1 },
    'Flour Tortilla (1 medium)': { calories: 90, protein: 2, carbs: 14, fats: 3 },
    'Bagel (1 medium)': { calories: 250, protein: 10, carbs: 50, fats: 1 },
    'English Muffin (1)': { calories: 130, protein: 5, carbs: 25, fats: 1 },
    'Croissant (1 medium)': { calories: 230, protein: 5, carbs: 25, fats: 12 },
    'Muffin (Blueberry) (1 medium)': { calories: 385, protein: 6, carbs: 55, fats: 15 },
    'Granola (100g)': { calories: 471, protein: 11, carbs: 64, fats: 20 },
    'Cereal (Corn Flakes) (100g)': { calories: 378, protein: 7, carbs: 84, fats: 0 },
    'Cereal (Oatmeal Instant, 1 packet)': { calories: 150, protein: 5, carbs: 27, fats: 2 },
    'Grits (cooked, 100g)': { calories: 64, protein: 1, carbs: 14, fats: 0 },
    'Polenta (cooked, 100g)': { calories: 76, protein: 2, carbs: 15, fats: 0 },
    'Millet (cooked, 100g)': { calories: 119, protein: 4, carbs: 23, fats: 1 },
    'Sorghum (cooked, 100g)': { calories: 113, protein: 3, carbs: 24, fats: 1 },
    'Bulgur (cooked, 100g)': { calories: 83, protein: 3, carbs: 19, fats: 0 },
    'Farro (cooked, 100g)': { calories: 115, protein: 4, carbs: 24, fats: 0 },
    'Spelt (cooked, 100g)': { calories: 127, protein: 5, carbs: 26, fats: 0 },
    'Wild Rice (cooked, 100g)': { calories: 101, protein: 4, carbs: 21, fats: 0 },
    'Basmati Rice (cooked, 100g)': { calories: 130, protein: 3, carbs: 28, fats: 0 },
    'Jasmine Rice (cooked, 100g)': { calories: 130, protein: 3, carbs: 28, fats: 0 },
    'Rice Noodles (cooked, 100g)': { calories: 109, protein: 2, carbs: 25, fats: 0 },
    'Egg Noodles (cooked, 100g)': { calories: 138, protein: 5, carbs: 25, fats: 2 },
    'Sourdough Bread (1 slice)': { calories: 90, protein: 3, carbs: 17, fats: 1 },
    'Ciabatta Bread (100g)': { calories: 270, protein: 9, carbs: 53, fats: 3 },
    'Baguette (100g)': { calories: 265, protein: 9, carbs: 56, fats: 1 },
    'Cereal (Cheerios) (100g)': { calories: 386, protein: 11, carbs: 77, fats: 5 },
    'Cereal (Frosted Flakes) (100g)': { calories: 375, protein: 4, carbs: 90, fats: 0 },
    'Cereal (Rice Krispies) (100g)': { calories: 380, protein: 7, carbs: 87, fats: 0 },

    // Proteins 
    'Chicken Breast (cooked, 100g)': { calories: 165, protein: 31, carbs: 0, fats: 4 },
    'Chicken Thigh (cooked, 100g)': { calories: 209, protein: 26, carbs: 0, fats: 11 },
    'Ground Beef (80/20, cooked, 100g)': { calories: 254, protein: 24, carbs: 0, fats: 17 },
    'Steak (Sirloin, cooked, 100g)': { calories: 200, protein: 29, carbs: 0, fats: 9 },
    'Salmon (cooked, 100g)': { calories: 208, protein: 20, carbs: 0, fats: 13 },
    'Tuna (canned in water, 100g drained)': { calories: 116, protein: 25, carbs: 0, fats: 1 },
    'Eggs (1 large)': { calories: 78, protein: 6, carbs: 1, fats: 5 },
    'Tofu (firm, 100g)': { calories: 76, protein: 8, carbs: 2, fats: 5 },
    'Tempeh (100g)': { calories: 195, protein: 19, carbs: 10, fats: 11 },
    'Lentils (cooked, 100g)': { calories: 116, protein: 9, carbs: 20, fats: 0 },
    'Chickpeas (cooked, 100g)': { calories: 164, protein: 9, carbs: 27, fats: 3 },
    'Black Beans (cooked, 100g)': { calories: 132, protein: 8, carbs: 24, fats: 0 },
    'Kidney Beans (cooked, 100g)': { calories: 127, protein: 9, carbs: 23, fats: 0 },
    'Pork Chop (cooked, 100g)': { calories: 230, protein: 26, carbs: 0, fats: 14 },
    'Turkey Breast (cooked, 100g)': { calories: 135, protein: 30, carbs: 0, fats: 1 },
    'Cod (cooked, 100g)': { calories: 82, protein: 18, carbs: 0, fats: 1 },
    'Shrimp (cooked, 100g)': { calories: 85, protein: 20, carbs: 0, fats: 1 },
    'Tuna Steak (cooked, 100g)': { calories: 184, protein: 30, carbs: 0, fats: 6 },
    'Sardines (canned in oil, 100g)': { calories: 208, protein: 25, carbs: 0, fats: 11 },
    'Mackerel (cooked, 100g)': { calories: 305, protein: 19, carbs: 0, fats: 25 },
    'Ground Turkey (93/7, cooked, 100g)': { calories: 170, protein: 22, carbs: 0, fats: 9 },
    'Lamb Chop (cooked, 100g)': { calories: 270, protein: 25, carbs: 0, fats: 18 },
    'Bacon (cooked, 1 slice)': { calories: 43, protein: 3, carbs: 0, fats: 3 },
    'Sausage (Pork, 1 link)': { calories: 150, protein: 8, carbs: 1, fats: 13 },
    'Ham (deli sliced, 100g)': { calories: 145, protein: 20, carbs: 1, fats: 7 },
    'Deli Turkey (sliced, 100g)': { calories: 110, protein: 22, carbs: 1, fats: 2 },
    'Whey Protein Powder (1 scoop, 30g)': { calories: 120, protein: 25, carbs: 3, fats: 2 },
    'Casein Protein Powder (1 scoop, 30g)': { calories: 110, protein: 24, carbs: 3, fats: 1 },
    'Soy Protein Powder (1 scoop, 30g)': { calories: 110, protein: 25, carbs: 2, fats: 1 },
    'Pea Protein Powder (1 scoop, 30g)': { calories: 120, protein: 24, carbs: 2, fats: 2 },
    'Cottage Cheese (low fat, 100g)': { calories: 72, protein: 12, carbs: 3, fats: 1 },
    'Greek Yogurt (plain, 0% fat, 100g)': { calories: 59, protein: 10, carbs: 4, fats: 0 },
    'Skim Milk (1 cup, 240ml)': { calories: 83, protein: 8, carbs: 12, fats: 0 },
    'Whole Milk (1 cup, 240ml)': { calories: 150, protein: 8, carbs: 12, fats: 8 },
    'Almond Milk (unsweetened, 1 cup, 240ml)': { calories: 30, protein: 1, carbs: 1, fats: 2 },
    'Soy Milk (unsweetened, 1 cup, 240ml)': { calories: 80, protein: 7, carbs: 4, fats: 4 },
    'Oat Milk (unsweetened, 1 cup, 240ml)': { calories: 120, protein: 3, carbs: 16, fats: 5 },
    'Peanut Butter (2 tbsp, 32g)': { calories: 190, protein: 7, carbs: 8, fats: 16 },
    'Almonds (100g)': { calories: 579, protein: 21, carbs: 22, fats: 49 },
    'Walnuts (100g)': { calories: 654, protein: 15, carbs: 14, fats: 65 },
    'Pecans (100g)': { calories: 691, protein: 9, carbs: 14, fats: 72 },
    'Cashews (100g)': { calories: 553, protein: 18, carbs: 30, fats: 44 },
    'Chia Seeds (100g)': { calories: 486, protein: 17, carbs: 42, fats: 31 },
    'Flax Seeds (100g)': { calories: 534, protein: 18, carbs: 29, fats: 42 },
    'Hemp Seeds (100g)': { calories: 553, protein: 30, carbs: 5, fats: 48 },
    'Pumpkin Seeds (100g)': { calories: 574, protein: 24, carbs: 24, fats: 49 },
    'Sunflower Seeds (100g)': { calories: 584, protein: 21, carbs: 20, fats: 51 },
    'Seitan (100g)': { calories: 110, protein: 21, carbs: 6, fats: 1 },
    'Edamame (shelled, cooked, 100g)': { calories: 121, protein: 11, carbs: 10, fats: 5 },
    'Mahi-Mahi (cooked, 100g)': { calories: 93, protein: 20, carbs: 0, fats: 1 },
    'Halibut (cooked, 100g)': { calories: 111, protein: 21, carbs: 0, fats: 2 },
    'Trout (cooked, 100g)': { calories: 170, protein: 24, carbs: 0, fats: 8 },
    'Tilapia (cooked, 100g)': { calories: 128, protein: 26, carbs: 0, fats: 3 },
    'Clams (cooked, 100g)': { calories: 86, protein: 15, carbs: 4, fats: 1 },
    'Oysters (cooked, 100g)': { calories: 81, protein: 9, carbs: 4, fats: 2 },
    'Scallops (cooked, 100g)': { calories: 112, protein: 21, carbs: 6, fats: 1 },
    'Duck Breast (cooked, 100g)': { calories: 337, protein: 20, carbs: 0, fats: 28 },
    'Goose (cooked, 100g)': { calories: 371, protein: 25, carbs: 0, fats: 29 },

    // Dairy & Alternatives
    'Cheddar Cheese (100g)': { calories: 404, protein: 25, carbs: 1, fats: 33 },
    'Mozzarella Cheese (100g)': { calories: 300, protein: 22, carbs: 2, fats: 22 },
    'Parmesan Cheese (100g)': { calories: 431, protein: 38, carbs: 4, fats: 29 },
    'Feta Cheese (100g)': { calories: 265, protein: 14, carbs: 4, fats: 21 },
    'Cream Cheese (100g)': { calories: 342, protein: 6, carbs: 4, fats: 34 },
    'Butter (100g)': { calories: 717, protein: 1, carbs: 0, fats: 81 },
    'Ghee (100g)': { calories: 900, protein: 0, carbs: 0, fats: 100 },
    'Heavy Cream (100ml)': { calories: 345, protein: 2, carbs: 3, fats: 37 },
    'Sour Cream (100g)': { calories: 198, protein: 2, carbs: 4, fats: 19 },
    'Yogurt (plain, full fat, 100g)': { calories: 61, protein: 4, carbs: 5, fats: 3 },
    'Kefir (plain, low fat, 100ml)': { calories: 41, protein: 3, carbs: 5, fats: 1 },
    'Buttermilk (1 cup, 240ml)': { calories: 98, protein: 8, carbs: 12, fats: 2 },
    'Evaporated Milk (100ml)': { calories: 140, protein: 7, carbs: 10, fats: 8 },
    'Condensed Milk (sweetened, 100g)': { calories: 321, protein: 8, carbs: 54, fats: 9 },
    'Ricotta Cheese (part-skim, 100g)': { calories: 138, protein: 11, carbs: 5, fats: 8 },
    'Swiss Cheese (100g)': { calories: 380, protein: 27, carbs: 1, fats: 29 },
    'Provolone Cheese (100g)': { calories: 351, protein: 26, carbs: 2, fats: 26 },
    'Colby Cheese (100g)': { calories: 394, protein: 24, carbs: 2, fats: 32 },
    'Monterey Jack Cheese (100g)': { calories: 373, protein: 25, carbs: 1, fats: 30 },
    'Goat Cheese (soft, 100g)': { calories: 364, protein: 22, carbs: 0, fats: 30 },
    'Blue Cheese (100g)': { calories: 360, protein: 21, carbs: 2, fats: 29 },
    'Vegan Cheese (Cheddar style, 100g)': { calories: 280, protein: 0, carbs: 20, fats: 20 },
    'Vegan Butter (100g)': { calories: 720, protein: 0, carbs: 0, fats: 80 },
    'Coconut Milk (canned, 100ml)': { calories: 230, protein: 2, carbs: 6, fats: 24 },
    'Coconut Cream (canned, 100g)': { calories: 330, protein: 3, carbs: 8, fats: 35 },
    'Rice Milk (unsweetened, 1 cup, 240ml)': { calories: 120, protein: 1, carbs: 23, fats: 2 },
    'Cashew Milk (unsweetened, 1 cup, 240ml)': { calories: 25, protein: 0, carbs: 1, fats: 2 },
    'Hemp Milk (unsweetened, 1 cup, 240ml)': { calories: 60, protein: 3, carbs: 0, fats: 5 },
    'Plain Cultured Almond Milk Yogurt (100g)': { calories: 50, protein: 1, carbs: 8, fats: 2 },
    'Plain Cultured Coconut Milk Yogurt (100g)': { calories: 110, protein: 1, carbs: 10, fats: 7 },

    // Legumes & Pulses 
    'Split Peas (cooked, 100g)': { calories: 118, protein: 8, carbs: 21, fats: 0 },
    'Navy Beans (cooked, 100g)': { calories: 139, protein: 8, carbs: 25, fats: 0 },
    'Pinto Beans (cooked, 100g)': { calories: 143, protein: 9, carbs: 26, fats: 1 },
    'Cannellini Beans (cooked, 100g)': { calories: 126, protein: 8, carbs: 23, fats: 0 },
    'Mung Beans (cooked, 100g)': { calories: 105, protein: 7, carbs: 19, fats: 0 },
    'Lima Beans (cooked, 100g)': { calories: 115, protein: 7, carbs: 21, fats: 0 },
    'Soybeans (cooked, 100g)': { calories: 172, protein: 18, carbs: 10, fats: 9 },
    'Peanuts (100g)': { calories: 567, protein: 26, carbs: 16, fats: 49 },
    'Peanut Flour (100g)': { calories: 320, protein: 50, carbs: 20, fats: 10 },
    'Hummus (100g)': { calories: 166, protein: 8, carbs: 15, fats: 10 },
    'Falafel (1 patty, 30g)': { calories: 57, protein: 3, carbs: 6, fats: 3 },
    'Refried Beans (canned, 100g)': { calories: 106, protein: 5, carbs: 16, fats: 3 },
    'Edamame Pods (cooked, 100g)': { calories: 121, protein: 11, carbs: 10, fats: 5 },
    'Miso Paste (100g)': { calories: 198, protein: 12, carbs: 27, fats: 6 },
    'Natto (100g)': { calories: 212, protein: 19, carbs: 14, fats: 11 },

    // Fats & Oils
    'Olive Oil (1 tbsp, 14g)': { calories: 120, protein: 0, carbs: 0, fats: 14 },
    'Coconut Oil (1 tbsp, 14g)': { calories: 120, protein: 0, carbs: 0, fats: 14 },
    'Avocado Oil (1 tbsp, 14g)': { calories: 124, protein: 0, carbs: 0, fats: 14 },
    'Canola Oil (1 tbsp, 14g)': { calories: 124, protein: 0, carbs: 0, fats: 14 },
    'Vegetable Oil (1 tbsp, 14g)': { calories: 124, protein: 0, carbs: 0, fats: 14 },
    'Flaxseed Oil (1 tbsp, 14g)': { calories: 120, protein: 0, carbs: 0, fats: 14 },
    'Sesame Oil (1 tbsp, 14g)': { calories: 120, protein: 0, carbs: 0, fats: 14 },
    'Mayonnaise (1 tbsp, 15g)': { calories: 94, protein: 0, carbs: 0, fats: 10 },
    'Margarine (1 tbsp, 14g)': { calories: 100, protein: 0, carbs: 0, fats: 11 },
    'Lard (1 tbsp, 13g)': { calories: 115, protein: 0, carbs: 0, fats: 13 },
    'Bacon Fat (1 tbsp, 13g)': { calories: 115, protein: 0, carbs: 0, fats: 13 },
    'Sour Cream (full fat, 1 tbsp, 15g)': { calories: 30, protein: 0, carbs: 1, fats: 3 },
    'Cream Cheese (full fat, 1 tbsp, 15g)': { calories: 50, protein: 1, carbs: 1, fats: 5 },
    'Heavy Cream (1 tbsp, 15ml)': { calories: 50, protein: 0, carbs: 1, fats: 5 },
    'Salad Dressing (Ranch, 2 tbsp, 30ml)': { calories: 130, protein: 0, carbs: 1, fats: 14 },

    // Beverages
    'Coffee (black, 240ml)': { calories: 2, protein: 0, carbs: 0, fats: 0 },
    'Green Tea (unsweetened, 240ml)': { calories: 0, protein: 0, carbs: 0, fats: 0 },
    'Black Tea (unsweetened, 240ml)': { calories: 0, protein: 0, carbs: 0, fats: 0 },
    'Orange Juice (200ml)': { calories: 96, protein: 0, carbs: 24, fats: 0 },
    'Apple Juice (200ml)': { calories: 96, protein: 0, carbs: 24, fats: 0 },
    'Cola (330ml can)': { calories: 140, protein: 0, carbs: 39, fats: 0 },
    'Diet Cola (330ml can)': { calories: 0, protein: 0, carbs: 0, fats: 0 },
    'Milk (2% fat, 1 cup, 240ml)': { calories: 120, protein: 8, carbs: 12, fats: 5 },
    'Soy Milk (sweetened, 1 cup, 240ml)': { calories: 130, protein: 7, carbs: 15, fats: 4 },
    'Almond Milk (sweetened, 1 cup, 240ml)': { calories: 60, protein: 1, carbs: 7, fats: 2 },
    'Beer (lager, 355ml)': { calories: 153, protein: 2, carbs: 13, fats: 0 },
    'Red Wine (150ml)': { calories: 125, protein: 0, carbs: 4, fats: 0 },
    'White Wine (150ml)': { calories: 121, protein: 0, carbs: 4, fats: 0 },
    'Vodka (45ml shot)': { calories: 97, protein: 0, carbs: 0, fats: 0 },
    'Whiskey (45ml shot)': { calories: 105, protein: 0, carbs: 0, fats: 0 },
    'Gin (45ml shot)': { calories: 110, protein: 0, carbs: 0, fats: 0 },
    'Rum (45ml shot)': { calories: 100, protein: 0, carbs: 0, fats: 0 },
    'Seltzer Water (240ml)': { calories: 0, protein: 0, carbs: 0, fats: 0 },
    'Sparkling Water (240ml)': { calories: 0, protein: 0, carbs: 0, fats: 0 },
    'Lemonade (240ml)': { calories: 100, protein: 0, carbs: 26, fats: 0 },
    'Sweet Tea (240ml)': { calories: 90, protein: 0, carbs: 23, fats: 0 },
    'Hot Chocolate (240ml with milk)': { calories: 190, protein: 8, carbs: 28, fats: 8 },
    'Matcha Latte (with milk, 240ml)': { calories: 180, protein: 8, carbs: 20, fats: 8 },
    'Espresso (30ml)': { calories: 1, protein: 0, carbs: 0, fats: 0 },
    'Latte (with milk, 240ml)': { calories: 180, protein: 8, carbs: 15, fats: 9 },
    'Cappuccino (with milk, 240ml)': { calories: 130, protein: 7, carbs: 10, fats: 6 },
    'Iced Coffee (with milk and sugar, 240ml)': { calories: 120, protein: 4, carbs: 20, fats: 3 },
    'Fruit Smoothie (homemade, 240ml)': { calories: 200, protein: 5, carbs: 40, fats: 2 },
    'Vegetable Juice (mixed, 240ml)': { calories: 50, protein: 2, carbs: 11, fats: 0 },
    'Coconut Water (240ml)': { calories: 45, protein: 0, carbs: 11, fats: 0 },

    // Sweets & Snacks 
    'Chocolate Bar (Milk, 100g)': { calories: 535, protein: 8, carbs: 59, fats: 30 },
    'Potato Chips (100g)': { calories: 536, protein: 6, carbs: 53, fats: 35 },
    'Cookies (Chocolate Chip, 100g)': { calories: 480, protein: 5, carbs: 65, fats: 22 },
    'Ice Cream (Vanilla, 100g)': { calories: 207, protein: 4, carbs: 24, fats: 11 },
    'Donut (Glazed, 1 medium)': { calories: 260, protein: 3, carbs: 30, fats: 14 },
    'Brownie (1 medium)': { calories: 416, protein: 4, carbs: 54, fats: 22 },
    'Candy Bar (Snickers, 50g)': { calories: 240, protein: 4, carbs: 31, fats: 12 },
    'Popcorn (air-popped, 100g)': { calories: 387, protein: 13, carbs: 78, fats: 5 },
    'Pretzels (100g)': { calories: 380, protein: 10, carbs: 80, fats: 2 },
    'Granola Bar (1 bar, 40g)': { calories: 180, protein: 3, carbs: 25, fats: 8 },
    'M&Ms (plain, 100g)': { calories: 479, protein: 4, carbs: 71, fats: 20 },
    'Skittles (100g)': { calories: 407, protein: 0, carbs: 91, fats: 4 },
    'Gummy Bears (100g)': { calories: 345, protein: 7, carbs: 79, fats: 0 },
    'Jelly Beans (100g)': { calories: 367, protein: 0, carbs: 91, fats: 0 },
    'Marshmallows (100g)': { calories: 318, protein: 2, carbs: 78, fats: 0 },
    'Doughnut (Jelly-filled, 1 medium)': { calories: 300, protein: 4, carbs: 40, fats: 15 },
    'Apple Pie (1 slice, 120g)': { calories: 300, protein: 3, carbs: 40, fats: 15 },
    'Cheesecake (1 slice, 120g)': { calories: 400, protein: 8, carbs: 35, fats: 25 },
    'Cupcake (1 medium)': { calories: 250, protein: 2, carbs: 35, fats: 10 },
    'Pancake (1 medium, plain)': { calories: 90, protein: 3, carbs: 14, fats: 2 },
    'Waffle (1 medium, plain)': { calories: 200, protein: 5, carbs: 30, fats: 8 },
    'Syrup (Maple, 2 tbsp, 40ml)': { calories: 104, protein: 0, carbs: 27, fats: 0 },
    'Whipped Cream (100g)': { calories: 257, protein: 2, carbs: 9, fats: 24 },
    'Frosting (Chocolate, 100g)': { calories: 400, protein: 1, carbs: 60, fats: 18 },
    'Scone (1 medium)': { calories: 250, protein: 5, carbs: 35, fats: 10 },
    'Biscotti (1 piece)': { calories: 100, protein: 2, carbs: 15, fats: 4 },
    'Macaron (1 piece)': { calories: 70, protein: 1, carbs: 9, fats: 3 },
    'Tiramisu (100g)': { calories: 280, protein: 6, carbs: 30, fats: 15 },
    'Eclair (1 medium)': { calories: 250, protein: 4, carbs: 30, fats: 13 },
    'Gelato (100g)': { calories: 180, protein: 3, carbs: 25, fats: 8 },
    'Sorbet (100g)': { calories: 130, protein: 0, carbs: 33, fats: 0 },
    'Popsicle (1 medium)': { calories: 50, protein: 0, carbs: 13, fats: 0 },
    'Fruit Leather (1 piece)': { calories: 50, protein: 0, carbs: 13, fats: 0 },
    'Fruit Snacks (1 pouch)': { calories: 80, protein: 0, carbs: 20, fats: 0 },
    'Rice Cakes (plain, 1)': { calories: 35, protein: 1, carbs: 7, fats: 0 },

    // Mixed Dishes & Fast Food 
    'Pizza (Pepperoni, 1 slice)': { calories: 300, protein: 12, carbs: 35, fats: 12 },
    'Hamburger (plain, 1 regular)': { calories: 250, protein: 12, carbs: 30, fats: 9 },
    'Cheeseburger (1 regular)': { calories: 300, protein: 15, carbs: 30, fats: 14 },
    'French Fries (medium serving)': { calories: 365, protein: 4, carbs: 48, fats: 17 },
    'Chicken Nuggets (6 pieces)': { calories: 280, protein: 15, carbs: 15, fats: 18 },
    'Taco (Beef, 1 hard shell)': { calories: 180, protein: 9, carbs: 15, fats: 10 },
    'Burrito (Bean & Cheese, 1 medium)': { calories: 400, protein: 15, carbs: 60, fats: 12 },
    'Sushi (California Roll, 6 pieces)': { calories: 255, protein: 9, carbs: 40, fats: 6 },
    'Pasta with Marinara (1 cup)': { calories: 200, protein: 7, carbs: 35, fats: 4 },
    'Lasagna (1 serving)': { calories: 350, protein: 20, carbs: 30, fats: 18 },
    'Macaroni and Cheese (1 cup)': { calories: 310, protein: 12, carbs: 30, fats: 15 },
    'Chicken Stir-fry (1 cup)': { calories: 300, protein: 25, carbs: 20, fats: 15 },
    'Beef and Broccoli (1 cup)': { calories: 350, protein: 25, carbs: 20, fats: 20 },
    'Fried Rice (1 cup)': { calories: 350, protein: 10, carbs: 50, fats: 12 },
    'Spring Roll (Fried, 1)': { calories: 100, protein: 3, carbs: 10, fats: 6 },
    'Egg Roll (1)': { calories: 200, protein: 8, carbs: 20, fats: 10 },
    'Pad Thai (1 serving)': { calories: 500, protein: 20, carbs: 70, fats: 18 },
    'Chicken Caesar Salad (with dressing, 1 serving)': { calories: 450, protein: 35, carbs: 20, fats: 25 },
    'Cobb Salad (with dressing, 1 serving)': { calories: 600, protein: 40, carbs: 15, fats: 40 },
    'Sub Sandwich (Turkey, 6-inch)': { calories: 350, protein: 25, carbs: 40, fats: 10 },
    'Burrito Bowl (Chicken, 1 bowl)': { calories: 600, protein: 40, carbs: 60, fats: 20 },
    'Fish and Chips (1 serving)': { calories: 600, protein: 30, carbs: 50, fats: 30 },
    'Shepherd\'s Pie (1 cup)': { calories: 250, protein: 15, carbs: 20, fats: 12 },
    'Chicken Pot Pie (1 cup)': { calories: 350, protein: 18, carbs: 25, fats: 20 },
    'Chili Con Carne (1 cup)': { calories: 300, protein: 20, carbs: 25, fats: 15 },
    'Meatloaf (100g)': { calories: 200, protein: 15, carbs: 10, fats: 12 },
    'Sloppy Joe (1 sandwich)': { calories: 350, protein: 20, carbs: 30, fats: 15 },
    'Hot Dog (1 regular)': { calories: 290, protein: 10, carbs: 25, fats: 18 },
    'Corn Dog (1)': { calories: 330, protein: 10, carbs: 35, fats: 18 },
    'Tater Tots (100g)': { calories: 170, protein: 3, carbs: 20, fats: 9 },

    // Soups & Stews 
    'Chicken Noodle Soup (1 cup)': { calories: 100, protein: 8, carbs: 10, fats: 3 },
    'Tomato Soup (1 cup)': { calories: 90, protein: 3, carbs: 18, fats: 1 },
    'Lentil Soup (1 cup)': { calories: 180, protein: 10, carbs: 30, fats: 2 },
    'Minestrone Soup (1 cup)': { calories: 150, protein: 6, carbs: 25, fats: 3 },
    'Clam Chowder (1 cup)': { calories: 250, protein: 10, carbs: 20, fats: 15 },
    'Beef Stew (1 cup)': { calories: 300, protein: 25, carbs: 20, fats: 15 },
    'Vegetable Soup (1 cup)': { calories: 80, protein: 3, carbs: 15, fats: 1 },
    'French Onion Soup (1 cup)': { calories: 150, protein: 5, carbs: 15, fats: 7 },
    'Broccoli Cheddar Soup (1 cup)': { calories: 300, protein: 10, carbs: 20, fats: 20 },
    'Cream of Mushroom Soup (1 cup)': { calories: 180, protein: 5, carbs: 15, fats: 10 },

    // Sauces & Condiments
    'Ketchup (1 tbsp, 15g)': { calories: 15, protein: 0, carbs: 4, fats: 0 },
    'Mustard (Yellow, 1 tbsp, 15g)': { calories: 10, protein: 0, carbs: 1, fats: 0 },
    'BBQ Sauce (1 tbsp, 15g)': { calories: 30, protein: 0, carbs: 7, fats: 0 },
    'Soy Sauce (1 tbsp, 15ml)': { calories: 10, protein: 1, carbs: 1, fats: 0 },
    'Salsa (100g)': { calories: 30, protein: 1, carbs: 6, fats: 0 },
    'Hot Sauce (1 tsp, 5ml)': { calories: 0, protein: 0, carbs: 0, fats: 0 },
    'Honey (1 tbsp, 21g)': { calories: 64, protein: 0, carbs: 17, fats: 0 },
    'Maple Syrup (1 tbsp, 20ml)': { calories: 52, protein: 0, carbs: 13, fats: 0 },
    'Jam (Strawberry, 1 tbsp, 20g)': { calories: 50, protein: 0, carbs: 13, fats: 0 },
    'Peanut Butter (creamy, 1 tbsp, 16g)': { calories: 95, protein: 3, carbs: 3, fats: 8 },

    // Seafood 
    'Crab (cooked, 100g)': { calories: 97, protein: 20, carbs: 0, fats: 1 },
    'Lobster (cooked, 100g)': { calories: 89, protein: 19, carbs: 0, fats: 1 },
    'Mussels (cooked, 100g)': { calories: 73, protein: 11, carbs: 3, fats: 2 },
    'Octopus (cooked, 100g)': { calories: 82, protein: 15, carbs: 2, fats: 1 },
    'Squid (Calamari, cooked, 100g)': { calories: 92, protein: 16, carbs: 3, fats: 1 },
    'Prawns (cooked, 100g)': { calories: 99, protein: 24, carbs: 0, fats: 0 },
    'Haddock (cooked, 100g)': { calories: 85, protein: 18, carbs: 0, fats: 0 },
    'Pollock (cooked, 100g)': { calories: 92, protein: 20, carbs: 0, fats: 1 },
    'Trout (Rainbow, cooked, 100g)': { calories: 170, protein: 24, carbs: 0, fats: 8 },
    'Catfish (cooked, 100g)': { calories: 105, protein: 18, carbs: 0, fats: 3 },

    // Canned Goods & Preserves 
    'Canned Tuna (in water, 100g drained)': { calories: 116, protein: 25, carbs: 0, fats: 1 },
    'Canned Chicken (in water, 100g drained)': { calories: 120, protein: 22, carbs: 0, fats: 3 },
    'Canned Salmon (in water, 100g drained)': { calories: 130, protein: 20, carbs: 0, fats: 5 },
    'Canned Green Beans (100g)': { calories: 24, protein: 1, carbs: 5, fats: 0 },
    'Canned Corn (100g)': { calories: 60, protein: 2, carbs: 13, fats: 1 },
    'Canned Peas (100g)': { calories: 60, protein: 4, carbs: 10, fats: 0 },
    'Canned Chickpeas (100g)': { calories: 120, protein: 7, carbs: 20, fats: 2 },
    'Canned Black Beans (100g)': { calories: 110, protein: 7, carbs: 20, fats: 0 },
    'Canned Tomatoes (diced, 100g)': { calories: 20, protein: 1, carbs: 4, fats: 0 },
    'Canned Peaches (in light syrup, 100g)': { calories: 60, protein: 0, carbs: 15, fats: 0 },

    // Condiments, Spices & Herbs 
    'Olive Oil (extra virgin, 1 tbsp)': { calories: 120, protein: 0, carbs: 0, fats: 14 },
    'Apple Cider Vinegar (1 tbsp)': { calories: 3, protein: 0, carbs: 0, fats: 0 },
    'Balsamic Vinegar (1 tbsp)': { calories: 14, protein: 0, carbs: 3, fats: 0 },
    'Honey Mustard (1 tbsp)': { calories: 40, protein: 0, carbs: 7, fats: 1 },
    'Pesto Sauce (1 tbsp)': { calories: 80, protein: 2, carbs: 1, fats: 8 },
    'Sriracha Sauce (1 tsp)': { calories: 5, protein: 0, carbs: 1, fats: 0 },
    'Garlic Powder (1 tsp)': { calories: 10, protein: 0, carbs: 2, fats: 0 },
    'Onion Powder (1 tsp)': { calories: 8, protein: 0, carbs: 2, fats: 0 },
    'Black Pepper (1 tsp)': { calories: 5, protein: 0, carbs: 1, fats: 0 },
    'Cinnamon (1 tsp)': { calories: 6, protein: 0, carbs: 2, fats: 0 },
  };

  const handleSearch = () => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filteredResults = Object.keys(nutrientLookup).filter(item =>
      item.toLowerCase().includes(lowerCaseSearch)
    );
    setSearchResults(filteredResults);
  };

  const handleSelectItem = (item: string) => {
    setSelectedItems(prevItems => {
      if (!prevItems.includes(item)) {
        return [...prevItems, item];
      }
      return prevItems;
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setSelectedItems(prevItems => prevItems.filter(item => item !== itemToRemove));
  };

  const handleAddMeal = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item for the meal.');
      return;
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let mealNameParts: string[] = [];

    selectedItems.forEach(item => {
      const nutrients = nutrientLookup[item];
      if (nutrients) {
        totalCalories += nutrients.calories;
        totalProtein += nutrients.protein;
        totalCarbs += nutrients.carbs;
        totalFats += nutrients.fats;
        mealNameParts.push(item.split(' (')[0]);
      }
    });

    const mealData: LoggedMealData = {
      name: mealNameParts.join(', ') || 'Mixed Meal',
      date: new Date().toISOString(),
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    };
    onAddMeal(mealData);

    setSelectedItems([]);
    onClose();
  };

  const handleAddCustomMeal = () => {
    if (!customFoodName || customCalories === '' || customProtein === '' || customCarbs === '' || customFats === '') {
      alert('Please fill in all custom food fields.');
      return;
    }

    const customMealData: LoggedMealData = {
      name: customFoodName,
      date: new Date().toISOString(),
      calories: Number(customCalories),
      protein: Number(customProtein),
      carbs: Number(customCarbs),
      fats: Number(customFats),
    };

    onAddMeal(customMealData);
    setCustomFoodName('');
    setCustomCalories(0);
    setCustomProtein(0);
    setCustomCarbs(0);
    setCustomFats(0);
    onClose();
  };

  return (
    <div>
      <div className="search-section">
        <input
          type="text"
          placeholder="Search for food items (e.g., apple, chicken, rice)..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button onClick={handleSearch} className="search-button">Search</button>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results:</h3>
            <ul>
              {searchResults.map((result, index) => (
                <li key={index} onClick={() => handleSelectItem(result)}>
                  {result} <button className="add-item-button">Add</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="selected-items-section">
        <h3>Selected Items for Meal:</h3>
        {selectedItems.length === 0 ? (
          <p>No items selected yet. Search and add items above.</p>
        ) : (
          <ul>
            {selectedItems.map((item, index) => (
              <li key={index}>
                {item} <button onClick={() => handleRemoveItem(item)} className="remove-item-button">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={handleAddMeal} className="add-meal-button" disabled={selectedItems.length === 0}>
        Add Meal to Tracker
      </button>

      <div className="custom-food-section">
        <h3 className="custom-food-heading">
          Didn't find it? Manually enter your food:
        </h3>
        <div id="manual-entry-form" className="manual-inputs-grid">
          <label>
            Food Name:
            <input
              type="text"
              value={customFoodName}
              onChange={(e) => setCustomFoodName(e.target.value)}
              placeholder="e.g., Blueberry Pancakes"
            />
          </label>
          <label>
            Calories:
            <input
              type="number"
              value={customCalories}
              onChange={(e) => setCustomCalories(Number(e.target.value) || '')}
              placeholder="e.g., 350"
            />
          </label>
          <label>
            Protein (g):
            <input
              type="number"
              value={customProtein}
              onChange={(e) => setCustomProtein(Number(e.target.value) || '')}
              placeholder="e.g., 25"
            />
          </label>
          <label>
            Carbs (g):
            <input
              type="number"
              value={customCarbs}
              onChange={(e) => setCustomCarbs(Number(e.target.value) || '')}
              placeholder="e.g., 40"
            />
          </label>
          <label>
            Fats (g):
            <input
              type="number"
              value={customFats}
              onChange={(e) => setCustomFats(Number(e.target.value) || '')}
              placeholder="e.g., 15"
            />
          </label>
        </div>
        <button onClick={handleAddCustomMeal} className="add-custom-meal-button"
                disabled={!customFoodName || customCalories === '' || customProtein === '' || customCarbs === '' || customFats === ''}>
          Add Custom Meal
        </button>
      </div>
    </div>
  );
};

export default AddMeal;