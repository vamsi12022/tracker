'use client';

import { useState } from 'react';

export default function OnboardingModal({ onComplete }) {
  const [name, setName] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(2000);

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      userName: name.trim() || 'Friend',
      dailyCalorieGoal: parseInt(calorieGoal) || 2000,
      dailyProteinGoal: Math.round((parseInt(calorieGoal) || 2000) * 0.3 / 4), // 30% calories from protein
      dailyCarbsGoal: Math.round((parseInt(calorieGoal) || 2000) * 0.45 / 4), // 45% from carbs
      dailyFatGoal: Math.round((parseInt(calorieGoal) || 2000) * 0.25 / 9), // 25% from fat
      onboardingDone: true,
    });
  };

  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit} id="onboarding-modal">
        <div className="modal__icon">🍎</div>
        <h2 className="modal__title">Welcome to CalTrack AI</h2>
        <p className="modal__subtitle">
          Let&apos;s set up your daily nutrition goals in 30 seconds
        </p>

        <div className="modal__field">
          <label className="modal__label" htmlFor="name-input">
            Your Name
          </label>
          <input
            className="modal__input"
            type="text"
            id="name-input"
            placeholder="e.g., Sathish"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="modal__field">
          <label className="modal__label" htmlFor="calorie-goal-input">
            Daily Calorie Goal
          </label>
          <input
            className="modal__input"
            type="number"
            id="calorie-goal-input"
            placeholder="2000"
            min="800"
            max="6000"
            value={calorieGoal}
            onChange={(e) => setCalorieGoal(e.target.value)}
          />
        </div>

        <button type="submit" className="modal__submit" id="start-tracking-btn">
          🚀 Start Tracking
        </button>
      </form>
    </div>
  );
}
