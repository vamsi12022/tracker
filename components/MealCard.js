'use client';

import { useState } from 'react';

const MEAL_ICONS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍿',
};

export default function MealCard({ meal, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const mealType = meal.mealType || 'snack';
  const icon = MEAL_ICONS[mealType] || '🍽️';
  const time = new Date(meal.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const foodNames = meal.foods?.map((f) => f.name).join(', ') || 'Food entry';

  return (
    <article className="meal-card" onClick={() => setExpanded(!expanded)}>
      <div className="meal-card__header">
        <div className="meal-card__info">
          <div className={`meal-card__icon meal-card__icon--${mealType}`}>
            {icon}
          </div>
          <div>
            <div className="meal-card__name">{foodNames}</div>
            <div className="meal-card__time">{time}</div>
          </div>
        </div>
        <div className="meal-card__calories">
          {meal.totalCalories}
          <span className="meal-card__calories-unit"> cal</span>
        </div>
      </div>

      {expanded && (
        <div className="meal-card__details">
          {meal.foods && meal.foods.length > 0 && (
            <ul className="meal-card__foods">
              {meal.foods.map((food, i) => (
                <li key={i} className="meal-card__food-item">
                  <span>{food.name} ({food.portion})</span>
                  <span className="meal-card__food-cal">{food.calories} cal</span>
                </li>
              ))}
            </ul>
          )}

          <div className="meal-card__macros">
            <div className="meal-card__macro">
              <div className="meal-card__macro-value" style={{ color: 'var(--protein-color)' }}>
                {meal.totalProtein}g
              </div>
              <div className="meal-card__macro-label">Protein</div>
            </div>
            <div className="meal-card__macro">
              <div className="meal-card__macro-value" style={{ color: 'var(--carbs-color)' }}>
                {meal.totalCarbs}g
              </div>
              <div className="meal-card__macro-label">Carbs</div>
            </div>
            <div className="meal-card__macro">
              <div className="meal-card__macro-value" style={{ color: 'var(--fat-color)' }}>
                {meal.totalFat}g
              </div>
              <div className="meal-card__macro-label">Fat</div>
            </div>
          </div>

          <div className="meal-card__actions">
            <button
              className="meal-card__delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(meal.id);
              }}
              id={`delete-meal-${meal.id}`}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
