'use client';

import { useState, useEffect } from 'react';

export default function Dashboard({ stats }) {
  const [animatedCalories, setAnimatedCalories] = useState(0);
  const circumference = 2 * Math.PI * 76; // radius = 76
  const offset = circumference - (stats.caloriePercent / 100) * circumference;

  useEffect(() => {
    // Animate calorie count
    const duration = 1000;
    const start = performance.now();
    const startVal = 0;
    const endVal = stats.calories;

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedCalories(Math.round(startVal + (endVal - startVal) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [stats.calories]);

  return (
    <section className="dashboard" id="dashboard">
      <div className="dashboard__ring-container">
        <div className="dashboard__ring">
          <svg viewBox="0 0 164 164">
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#c4b5fd" />
              </linearGradient>
            </defs>
            <circle
              className="dashboard__ring-bg"
              cx="82"
              cy="82"
              r="76"
            />
            <circle
              className="dashboard__ring-progress"
              cx="82"
              cy="82"
              r="76"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="dashboard__ring-center">
            <div className="dashboard__calories-count">{animatedCalories}</div>
            <div className="dashboard__calories-label">Calories</div>
            <div className="dashboard__calories-goal">of {stats.calorieGoal}</div>
          </div>
        </div>
      </div>

      <div className="macros">
        <div className="macro">
          <div className="macro__label">Protein</div>
          <div className="macro__value macro__value--protein">{stats.protein}g</div>
          <div className="macro__bar">
            <div
              className="macro__bar-fill macro__bar-fill--protein"
              style={{ width: `${stats.proteinPercent}%` }}
            />
          </div>
          <div className="macro__goal">{stats.proteinGoal}g goal</div>
        </div>
        <div className="macro">
          <div className="macro__label">Carbs</div>
          <div className="macro__value macro__value--carbs">{stats.carbs}g</div>
          <div className="macro__bar">
            <div
              className="macro__bar-fill macro__bar-fill--carbs"
              style={{ width: `${stats.carbsPercent}%` }}
            />
          </div>
          <div className="macro__goal">{stats.carbsGoal}g goal</div>
        </div>
        <div className="macro">
          <div className="macro__label">Fat</div>
          <div className="macro__value macro__value--fat">{stats.fat}g</div>
          <div className="macro__bar">
            <div
              className="macro__bar-fill macro__bar-fill--fat"
              style={{ width: `${stats.fatPercent}%` }}
            />
          </div>
          <div className="macro__goal">{stats.fatGoal}g goal</div>
        </div>
      </div>
    </section>
  );
}
