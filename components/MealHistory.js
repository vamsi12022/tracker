'use client';

import MealCard from './MealCard';

export default function MealHistory({ meals, onDelete }) {
  return (
    <section className="meal-history" id="meal-history">
      <div className="meal-history__header">
        <h2 className="meal-history__title">📋 Today&apos;s Meals</h2>
        <span className="meal-history__count">{meals.length} entries</span>
      </div>

      {meals.length === 0 ? (
        <div className="meal-history__empty">
          <div className="meal-history__empty-icon">🍽️</div>
          <p className="meal-history__empty-text">
            No meals logged yet today.<br />
            Take a photo or type what you ate!
          </p>
        </div>
      ) : (
        [...meals].reverse().map((meal) => (
          <MealCard key={meal.id} meal={meal} onDelete={onDelete} />
        ))
      )}
    </section>
  );
}
