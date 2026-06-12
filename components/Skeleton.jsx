'use client';
// Cac khung "skeleton" hien khi dang tai du lieu

export function SkeletonKpis({ n = 4 }) {
  return (
    <div className="kpi-grid">
      {Array.from({ length: n }).map((_, i) => (
        <div className="kpi" key={i}>
          <div className="skeleton sk-line" style={{ width: '55%' }} />
          <div className="skeleton" style={{ height: 26, width: '80%', marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ height = 280, title = true }) {
  return (
    <div className="card">
      {title && <div className="skeleton sk-line" style={{ width: 200, height: 16, marginBottom: 18 }} />}
      <div className="skeleton" style={{ height, width: '100%' }} />
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5, title = true }) {
  return (
    <div className="card">
      {title && <div className="skeleton sk-line" style={{ width: 180, height: 16, marginBottom: 18 }} />}
      <div className="sk-row">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="skeleton sk-line" style={{ flex: 1, height: 11, opacity: .6 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div className="sk-row" key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton sk-line" style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
