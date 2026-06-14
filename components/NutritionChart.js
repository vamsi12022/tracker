'use client';

export default function NutritionChart({ stats }) {
  const total = stats.protein + stats.carbs + stats.fat;
  if (total === 0) return null;

  const proteinPct = (stats.protein / total) * 100;
  const carbsPct = (stats.carbs / total) * 100;
  const fatPct = (stats.fat / total) * 100;

  // SVG donut chart calculation
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const proteinDash = (proteinPct / 100) * circumference;
  const carbsDash = (carbsPct / 100) * circumference;
  const fatDash = (fatPct / 100) * circumference;

  const proteinOffset = 0;
  const carbsOffset = -(proteinDash);
  const fatOffset = -(proteinDash + carbsDash);

  return (
    <section className="nutrition-chart" id="nutrition-chart">
      <h2 className="nutrition-chart__title">📊 Macro Split</h2>
      <div className="nutrition-chart__donut-container">
        <div className="nutrition-chart__donut">
          <svg viewBox="0 0 120 120">
            {/* Protein arc */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="var(--protein-color)"
              strokeWidth="12"
              strokeDasharray={`${proteinDash} ${circumference - proteinDash}`}
              strokeDashoffset={proteinOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            {/* Carbs arc */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="var(--carbs-color)"
              strokeWidth="12"
              strokeDasharray={`${carbsDash} ${circumference - carbsDash}`}
              strokeDashoffset={carbsOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            {/* Fat arc */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="var(--fat-color)"
              strokeWidth="12"
              strokeDasharray={`${fatDash} ${circumference - fatDash}`}
              strokeDashoffset={fatOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
        </div>

        <div className="nutrition-chart__legend">
          <div className="nutrition-chart__legend-item">
            <span className="nutrition-chart__legend-dot" style={{ background: 'var(--protein-color)' }} />
            <span>Protein</span>
            <span className="nutrition-chart__legend-value">{Math.round(proteinPct)}%</span>
          </div>
          <div className="nutrition-chart__legend-item">
            <span className="nutrition-chart__legend-dot" style={{ background: 'var(--carbs-color)' }} />
            <span>Carbs</span>
            <span className="nutrition-chart__legend-value">{Math.round(carbsPct)}%</span>
          </div>
          <div className="nutrition-chart__legend-item">
            <span className="nutrition-chart__legend-dot" style={{ background: 'var(--fat-color)' }} />
            <span>Fat</span>
            <span className="nutrition-chart__legend-value">{Math.round(fatPct)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
