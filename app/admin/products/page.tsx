'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, deleteProduct, FirestoreProduct, getDashboardStats } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { formatPrice } from '@/lib/products';

export default function ProductsPage() {
    const [products, setProducts] = useState<FirestoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, blog: 0 });
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (e) {
            console.error('Failed to load products:', e);
        } finally {
            setLoading(false);
        }
    }

    async function loadStats() {
        try {
            const s = await getDashboardStats();
            setStats(s);
        } catch (e) {
            console.error('Failed to load stats:', e);
        }
    }

    useEffect(() => { loadProducts(); loadStats(); }, []);

    async function handleImageUpload(file: File) {
        if (!file) return;

        setUploading(true);
        setUploadFile(file);

        try {
            const url = await uploadToCloudinary(file);
            setUploadProgress(100);
            setUploading(false);
            setUploadFile(null);

            // Create new product with uploaded image
            const newProduct: Omit<FirestoreProduct, 'id'> = {
                name: 'New Product',
                price: 0,
                category: 'Tops',
                subcategory: 'T-Shirts',
                images: [url],
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Black', 'White'],
                description: '',
                details: [],
                rating: 0,
                reviews: 0,
                inStock: true,
                isNew: false,
                isBestSeller: false,
                tags: ['new'],
            };

            // For now, just log - in real app, you'd want a form to fill this out
            console.log('New product image URL:', url);

            loadProducts();
        } catch (e: any) {
            alert(e.message);
            setUploading(false);
            setUploadFile(null);
        }
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    }

    async function deleteProductHandler(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (e) {
            alert('Failed to delete product');
        }
    }

    if (loading) {
        return <div style={{ padding: 40 }}>Loading products...</div>;
    }

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Products</h1>
                    <p style={{ color: '#666' }}>Manage your product catalog</p>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>{stats.products}</div>
                        <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>Products</div>
                    </div>
                    <Link href="/admin/products/new">
                        <button style={{ padding: '10px 20px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            + Add Product
                        </button>
                    </Link>
                    <label style={{ padding: '10px 20px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'inline-block' }}>
                        Upload Image
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{stats.products}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Total Products</div>
                </div>
                <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{stats.orders}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Total Orders</div>
                </div>
                <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{stats.users}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Customers</div>
                </div>
                <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{stats.blog}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Blog Posts</div>
                </div>
            </div>

            {/* Products Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                {products.map((product) => (
                    <div key={product.id} style={{ background: '#fff', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                            <Image
                                src={product.images[0] || 'https://via.placeholder.com/400'}
                                alt={product.name}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                            {product.isNew && (
                                <span style={{ position: 'absolute', top: 8, left: 8, background: '#0a0a0a', color: '#fff', padding: '4px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>NEW</span>
                            )}
                            {product.isBestSeller && (
                                <span style={{ position: 'absolute', top: 8, right: 8, background: '#ff4444', color: '#fff', padding: '4px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>BESTSELLER</span>
                            )}
                        </div>
                        <div style={{ padding: 16 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{product.name}</h3>
                            <p style={{ fontSize: 16, fontWeight: 900, color: '#0a0a0a', marginBottom: 8 }}>{formatPrice(product.price)}</p>
                            {product.originalPrice && (
                                <p style={{ fontSize: 12, textDecoration: 'line-through', color: '#888', marginBottom: 8 }}>{formatPrice(product.originalPrice)}</p>
                            )}
                            <div style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
                                <span style={{ marginRight: 8 }}>{product.category}</span>
                                <span>{product.sizes.slice(0, 3).join(', ')}...</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Link href={`/admin/products/${product.id}`}>
                                    <button style={{ flex: 1, padding: '8px', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Edit</button>
                                </Link>
                                <button
                                    onClick={() => deleteProductHandler(product.id!)}
                                    style={{ flex: 1, padding: '8px', background: '#fff', border: '1px solid #ff4444', color: '#ff4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, background: '#f9f9f9', borderRadius: 0 }}>
                    <p style={{ color: '#666', fontSize: 16 }}>No products yet. Add your first product!</p>
                    <Link href="/admin/products/new">
                        <button style={{ marginTop: 16, padding: '12px 24px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Product</button>
                    </Link>
                </div>
            )}
        </div>
    );
}
