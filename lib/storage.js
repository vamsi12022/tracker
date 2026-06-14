'use client';

const MEALS_KEY = 'caltrack_meals';
const SETTINGS_KEY = 'caltrack_settings';

const DEFAULT_SETTINGS = {
  dailyCalorieGoal: 2000,
  dailyProteinGoal: 150,
  dailyCarbsGoal: 250,
  dailyFatGoal: 65,
  userName: '',
  onboardingDone: false,
};

// ─── Settings ────────────────────────────────────────────
export function getSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ─── Meals ───────────────────────────────────────────────
function getAllMeals() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MEALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAllMeals(meals) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
}

export function saveMeal(meal) {
  const meals = getAllMeals();
  const newMeal = {
    ...meal,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
  };
  meals.push(newMeal);
  saveAllMeals(meals);
  return newMeal;
}

export function getMeals(date) {
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  return getAllMeals().filter((m) => m.date === dateStr);
}

export function deleteMeal(id) {
  const meals = getAllMeals().filter((m) => m.id !== id);
  saveAllMeals(meals);
}

// ─── Daily Stats ─────────────────────────────────────────
export function getDailyStats(date) {
  const meals = getMeals(date);
  const settings = getSettings();

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.totalCalories || 0),
      protein: acc.protein + (meal.totalProtein || 0),
      carbs: acc.carbs + (meal.totalCarbs || 0),
      fat: acc.fat + (meal.totalFat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    ...totals,
    calorieGoal: settings.dailyCalorieGoal,
    proteinGoal: settings.dailyProteinGoal,
    carbsGoal: settings.dailyCarbsGoal,
    fatGoal: settings.dailyFatGoal,
    caloriePercent: Math.min(100, Math.round((totals.calories / settings.dailyCalorieGoal) * 100)),
    proteinPercent: Math.min(100, Math.round((totals.protein / settings.dailyProteinGoal) * 100)),
    carbsPercent: Math.min(100, Math.round((totals.carbs / settings.dailyCarbsGoal) * 100)),
    fatPercent: Math.min(100, Math.round((totals.fat / settings.dailyFatGoal) * 100)),
    mealCount: meals.length,
  };
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}
