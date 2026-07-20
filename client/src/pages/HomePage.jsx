import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const [data, setData] = useState({ products: [], pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(keyword);

  useEffect(() => {
    client
      .get('/products/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, sort };
    if (keyword) params.keyword = keyword;
    if (category && category !== 'all') params.category = category;
    client
      .get('/products', { params })
      .then(({ data }) => setData(data))
      .catch(() => setData({ products: [], pages: 1, total: 0 }))
      .finally(() => setLoading(false));
  }, [keyword, category, sort, page]);

  // Merge changes into the URL query (source of truth); reset to page 1 unless paging.
  const update = (changes) => {
    const next = { keyword, category, sort, page: 1, ...changes };
    const clean = {};
    if (next.keyword) clean.keyword = next.keyword;
    if (next.category && next.category !== 'all') clean.category = next.category;
    if (next.sort && next.sort !== 'newest') clean.sort = next.sort;
    if (next.page && next.page > 1) clean.page = String(next.page);
    setSearchParams(clean);
  };

  const onSearch = (e) => {
    e.preventDefault();
    update({ keyword: searchInput.trim() });
  };

  return (
    <div className="page">
      <section className="hero">
        <h1>TestMart</h1>
        <p>A demo storefront for practicing UI automation.</p>
      </section>

      <div className="toolbar">
        <form className="search" onSubmit={onSearch} role="search">
          <input
            type="search"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            data-testid="search-input"
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-primary" data-testid="search-submit">
            Search
          </button>
        </form>

        <div className="filters">
          <select
            value={category}
            onChange={(e) => update({ category: e.target.value })}
            data-testid="category-filter"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            data-testid="sort-select"
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <p className="result-count" data-testid="result-count">
        {data.total} product{data.total === 1 ? '' : 's'}
      </p>

      {loading ? (
        <Spinner />
      ) : data.products.length === 0 ? (
        <p className="empty" data-testid="empty">
          No products found.
        </p>
      ) : (
        <div className="product-grid" data-testid="product-grid">
          {data.products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      <Pagination page={page} pages={data.pages} onChange={(p) => update({ page: p })} />
    </div>
  );
}
