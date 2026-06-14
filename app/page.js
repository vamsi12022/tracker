'use client';

import { useState, useEffect, useCallback } from 'react';
import Dashboard from '@/components/Dashboard';
import FoodInput from '@/components/FoodInput';
import MealHistory from '@/components/MealHistory';
import NutritionChart from '@/components/NutritionChart';
import OnboardingModal from '@/components/OnboardingModal';
import {
  getSettings,
  saveSettings,
  saveMeal,
  getMeals,
  deleteMeal,
  getDailyStats,
  getToday,
} from '@/lib/storage';

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [meals, setMeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  const today = getToday();

  const refreshData = useCallback(() => {
    const currentMeals = getMeals(today);
    const currentStats = getDailyStats(today);
    setMeals(currentMeals);
    setStats(currentStats);
  }, [today]);

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    if (!s.onboardingDone) {
      setShowOnboarding(true);
    }
    refreshData();
    setMounted(true);
  }, [refreshData]);

  const handleOnboardingComplete = (newSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
    setShowOnboarding(false);
    refreshData();
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    saveSettings(settings);
    setShowSettings(false);
    refreshData();
  };

  const handleAnalysisResult = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  const handleSaveMeal = () => {
    if (!analysisResult) return;
    saveMeal(analysisResult);
    setAnalysisResult(null);
    refreshData();
  };

  const handleDiscardResult = () => {
    setAnalysisResult(null);
  };

  const handleDeleteMeal = (id) => {
    deleteMeal(id);
    refreshData();
  };

  if (!mounted || !stats) {
    return (
      <main className="app">
        <div className="loading">
          <div className="loading__spinner" />
          <div className="loading__text">Loading CalTrack AI...</div>
        </div>
      </main>
    );
  }

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <main className="app">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Settings Modal */}
      {showSettings && settings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSettingsSave}
            id="settings-modal"
          >
            <div className="modal__icon">⚙️</div>
            <h2 className="modal__title">Settings</h2>
            <p className="modal__subtitle">Adjust your daily nutrition goals</p>

            <div className="modal__field">
              <label className="modal__label" htmlFor="settings-name">Your Name</label>
              <input
                className="modal__input"
                type="text"
                id="settings-name"
                value={settings.userName}
                onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
              />
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="settings-calories">Daily Calorie Goal</label>
              <input
                className="modal__input"
                type="number"
                id="settings-calories"
                min="800"
                max="6000"
                value={settings.dailyCalorieGoal}
                onChange={(e) => setSettings({ ...settings, dailyCalorieGoal: parseInt(e.target.value) || 2000 })}
              />
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="settings-protein">Protein Goal (g)</label>
              <input
                className="modal__input"
                type="number"
                id="settings-protein"
                value={settings.dailyProteinGoal}
                onChange={(e) => setSettings({ ...settings, dailyProteinGoal: parseInt(e.target.value) || 150 })}
              />
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="settings-carbs">Carbs Goal (g)</label>
              <input
                className="modal__input"
                type="number"
                id="settings-carbs"
                value={settings.dailyCarbsGoal}
                onChange={(e) => setSettings({ ...settings, dailyCarbsGoal: parseInt(e.target.value) || 250 })}
              />
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="settings-fat">Fat Goal (g)</label>
              <input
                className="modal__input"
                type="number"
                id="settings-fat"
                value={settings.dailyFatGoal}
                onChange={(e) => setSettings({ ...settings, dailyFatGoal: parseInt(e.target.value) || 65 })}
              />
            </div>

            <button type="submit" className="modal__submit" id="save-settings-btn">
              💾 Save Settings
            </button>
          </form>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <div className="header__icon">🔥</div>
          <div>
            <h1 className="header__title">CalTrack AI</h1>
            <div className="header__date">{formattedDate}</div>
          </div>
        </div>
        <button
          className="header__settings-btn"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          id="settings-btn"
        >
          ⚙️
        </button>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error">
          <span className="error__icon">⚠️</span>
          <span className="error__text">{error}</span>
          <button className="error__close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Dashboard */}
      <Dashboard stats={stats} />

      {/* Analysis Result Card */}
      {analysisResult && (
        <section className="result-card" id="result-card">
          <div className="result-card__header">
            <span className="result-card__badge">✓ AI Analysis</span>
            {analysisResult.confidence && (
              <span className="result-card__confidence">
                {analysisResult.confidence} confidence
              </span>
            )}
          </div>

          <div className="result-card__total">
            <div className="result-card__total-value">{analysisResult.totalCalories}</div>
            <div className="result-card__total-label">Total Calories</div>
          </div>

          {analysisResult.foods && (
            <ul className="result-card__foods">
              {analysisResult.foods.map((food, i) => (
                <li key={i} className="result-card__food">
                  <div>
                    <div className="result-card__food-name">{food.name}</div>
                    <div className="result-card__food-portion">{food.portion}</div>
                  </div>
                  <span className="result-card__food-cal">{food.calories} cal</span>
                </li>
              ))}
            </ul>
          )}

          <div className="result-card__actions">
            <button
              className="result-card__save-btn"
              onClick={handleSaveMeal}
              id="save-meal-btn"
            >
              ✅ Save Meal
            </button>
            <button
              className="result-card__discard-btn"
              onClick={handleDiscardResult}
              id="discard-meal-btn"
            >
              ✕ Discard
            </button>
          </div>
        </section>
      )}

      {/* Food Input */}
      <FoodInput onResult={handleAnalysisResult} onError={setError} />

      {/* Nutrition Chart */}
      <NutritionChart stats={stats} />

      {/* Meal History */}
      <MealHistory meals={meals} onDelete={handleDeleteMeal} />
    </main>
  );
}
