import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const EMPTY = {
  name: '',
  description: '',
  price: 0,
  category: '',
  image: '/images/placeholder.svg',
  countInStock: 0,
  featured: false,
  rating: 0,
};

export default function AdminProductEditPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    client
      .get(`/products/${id}`)
      .then(({ data }) =>
        setForm({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          image: data.image,
          countInStock: data.countInStock,
          featured: data.featured,
          rating: data.rating,
        }),
      )
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setField = (k, kind = 'text') => (e) => {
    const v = kind === 'checkbox' ? e.target.checked : kind === 'number' ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await client.put(`/admin/products/${id}`, form);
        notify('Product updated');
      } else {
        await client.post('/admin/products', form);
        notify('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      setError(msg);
      notify(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page auth-page">
      <form className="auth-card wide" onSubmit={submit} data-testid="admin-product-form">
        <Link to="/admin/products" className="back-link">
          ← Back to products
        </Link>
        <h1>{isEdit ? 'Edit Product' : 'New Product'}</h1>
        {error && (
          <div className="alert alert-error" data-testid="product-form-error" role="alert">
            {error}
          </div>
        )}
        <label>
          Name
          <input value={form.name} onChange={setField('name')} required data-testid="product-form-name" />
        </label>
        <label>
          Description
          <textarea value={form.description} onChange={setField('description')} data-testid="product-form-description" />
        </label>
        <label>
          Category
          <input value={form.category} onChange={setField('category')} required data-testid="product-form-category" />
        </label>
        <label>
          Price
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={setField('price', 'number')}
            required
            data-testid="product-form-price"
          />
        </label>
        <label>
          Stock
          <input
            type="number"
            min="0"
            value={form.countInStock}
            onChange={setField('countInStock', 'number')}
            required
            data-testid="product-form-stock"
          />
        </label>
        <label>
          Image path
          <input value={form.image} onChange={setField('image')} data-testid="product-form-image" />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={setField('featured', 'checkbox')}
            data-testid="product-form-featured"
          />
          Featured
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving} data-testid="product-form-submit">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
