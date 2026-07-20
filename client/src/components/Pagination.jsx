export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <div className="pagination" data-testid="pagination">
      <button
        className="btn btn-ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        data-testid="page-prev"
      >
        Prev
      </button>
      {nums.map((p) => (
        <button
          key={p}
          className={`btn page-num ${p === page ? 'active' : ''}`}
          onClick={() => onChange(p)}
          data-testid="page-num"
          data-page={p}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
      <button
        className="btn btn-ghost"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        data-testid="page-next"
      >
        Next
      </button>
    </div>
  );
}
