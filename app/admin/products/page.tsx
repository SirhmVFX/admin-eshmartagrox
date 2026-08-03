'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, deleteProduct, FirestoreProduct, getDashboardStats } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

export default function ProductsPage() {
    const [products, setProducts] = useState<FirestoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, blog: 0 });
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    async function load() {
        try {
            const [data, s] = await Promise.all([getProducts(), getDashboardStats()]);
            setProducts(data);
            setStats(s);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleDelete(id: string) {
        if (!confirm('Delete this product? This cannot be undone.')) return;
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch {
            alert('Failed to delete product.');
        }
    }

    // Derive categories from actual products
    const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()];

    const filtered = products.filter(p => {
        const matchSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase()) ||
            p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
        return matchSearch && matchCat;
    });

    return (
        <div className="max-w-6xl space-y-4">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Products</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {stats.products} total products · {stats.orders} orders
                    </p>
                </div>
                <Link href="/admin/products/new">
                    <button className="btn-primary flex items-center gap-2">
                        <MdAdd size={16} /> Add Product
                    </button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Products', value: stats.products, href: '#' },
                    { label: 'Orders', value: stats.orders, href: '/admin/orders' },
                    { label: 'Customers', value: stats.users, href: '/admin/users' },
                    { label: 'Blog Posts', value: stats.blog, href: '/admin/blog' },
                ].map((s, i) => (
                    <Link key={i} href={s.href} className="stat-card hover:border-green-300 transition-colors block text-center py-4">
                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </Link>
                ))}
            </div>

            {/* Search + filter */}
            <div className="admin-card">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search products by name, category, or tag…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="admin-input flex-1"
                    />
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="admin-input sm:w-48"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Products table */}
            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading products…</div>
            ) : filtered.length === 0 ? (
                <div className="admin-card text-center py-16">
                    <p className="text-gray-500 mb-4">
                        {search || categoryFilter !== 'All' ? 'No products match your search.' : 'No products yet.'}
                    </p>
                    {!search && categoryFilter === 'All' && (
                        <Link href="/admin/products/new">
                            <button className="btn-primary">+ Add First Product</button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Sizes</th>
                                <th>Colors</th>
                                <th>Status</th>
                                <th>Tags</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        {product.images?.[0] ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                width={56}
                                                height={56}
                                                className="w-14 h-14 object-cover"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
                                        )}
                                    </td>
                                    <td>
                                        <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{product.description}</p>
                                    </td>
                                    <td>
                                        <span className="text-sm text-gray-600">{product.category}</span>
                                        {product.subcategory && (
                                            <p className="text-xs text-gray-400">{product.subcategory}</p>
                                        )}
                                    </td>
                                    <td>
                                        <p className="font-semibold text-gray-900 text-sm">{formatPrice(product.price)}</p>
                                        {product.originalPrice && (
                                            <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                                        )}
                                    </td>
                                    <td className="text-xs text-gray-600 max-w-[80px]">
                                        {product.sizes?.join(', ') || '—'}
                                    </td>
                                    <td className="text-xs text-gray-600 max-w-[80px]">
                                        {product.colors?.join(', ') || '—'}
                                    </td>
                                    <td>
                                        <div className="flex flex-col gap-1">
                                            <span className={`badge ${product.inStock ? 'badge-green' : 'badge-red'}`}>
                                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                            {product.isNew && <span className="badge badge-blue">New</span>}
                                            {product.isBestSeller && <span className="badge badge-yellow">Best Seller</span>}
                                        </div>
                                    </td>
                                    <td className="text-xs text-gray-400 max-w-[100px] truncate">
                                        {product.tags?.join(', ') || '—'}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/products/${product.id}`}>
                                                <button className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                                                    <MdEdit size={12} /> Edit
                                                </button>
                                            </Link>
                                            <button
                                                className="btn-danger py-1 px-2 text-xs flex items-center gap-1"
                                                onClick={() => handleDelete(product.id!)}
                                            >
                                                <MdDelete size={12} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
                        Showing {filtered.length} of {products.length} products
                    </div>
                </div>
            )}
        </div>
    );
}
