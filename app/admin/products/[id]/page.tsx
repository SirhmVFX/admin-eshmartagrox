'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getProduct, updateProduct, FirestoreProduct, getProducts } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface EditProductPageProps {
    params: {
        id: string;
    };
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const { user, adminUser } = useAuth();
    const router = useRouter();
    const [product, setProduct] = useState<FirestoreProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user && adminUser && params.id) {
            loadProduct();
        } else {
            setLoading(false);
        }
    }, [user, adminUser, params.id]);

    async function loadProduct() {
        try {
            const data = await getProduct(params.id);
            setProduct(data);
        } catch (e) {
            console.error('Failed to load product:', e);
        } finally {
            setLoading(false);
        }
    }

    const [formData, setFormData] = useState<FirestoreProduct | null>(null);

    useEffect(() => {
        if (product) {
            setFormData({ ...product });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !product) return;

        setSaving(true);
        try {
            await updateProduct(product.id!, formData);
            router.push('/admin/products');
        } catch (e: any) {
            alert(e.message);
            setSaving(false);
        }
    };

    const handleImageUpload = async (file: File, setImage: (url: string) => void) => {
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setImage(url);
            setUploading(false);
        } catch (e: any) {
            alert(e.message);
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setImage: (url: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0], setImage);
        }
    };

    if (!user || !adminUser) {
        return <div>Please log in as an admin</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!formData) {
        return <div>Product not found</div>;
    }

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 32 }}>Edit Product</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Images */}
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Product Images</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Main Image</label>
                            <label style={{
                                width: '100%',
                                aspectRatio: '1/1',
                                background: formData.images[0] ? 'none' : '#f5f5f5',
                                border: '2px dashed #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                {formData.images[0] ? (
                                    <>
                                        <img src={formData.images[0]} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: 8, fontSize: 11 }}>
                                            Click to change
                                        </div>
                                    </>
                                ) : uploading ? (
                                    <span style={{ color: '#666' }}>Uploading...</span>
                                ) : (
                                    <span style={{ color: '#999' }}>Click to upload</span>
                                )}
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, (url) => {
                                    setFormData(prev => prev ? { ...prev, images: [url, prev.images[1] || ''] } : null);
                                })} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Secondary Image</label>
                            <label style={{
                                width: '100%',
                                aspectRatio: '1/1',
                                background: formData.images[1] ? 'none' : '#f5f5f5',
                                border: '2px dashed #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                {formData.images[1] ? (
                                    <>
                                        <img src={formData.images[1]} alt="Secondary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: 8, fontSize: 11 }}>
                                            Click to change
                                        </div>
                                    </>
                                ) : uploading ? (
                                    <span style={{ color: '#666' }}>Uploading...</span>
                                ) : (
                                    <span style={{ color: '#999' }}>Click to upload</span>
                                )}
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, (url) => {
                                    setFormData(prev => prev ? { ...prev, images: [prev.images[0] || '', url] } : null);
                                })} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Basic Info */}
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Basic Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Product Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Price (₦)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Original Price</label>
                            <input
                                type="number"
                                value={formData.originalPrice || ''}
                                onChange={e => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            >
                                <option value="Tops">Tops</option>
                                <option value="Bottoms">Bottoms</option>
                                <option value="Outerwear">Outerwear</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Subcategory</label>
                            <select
                                value={formData.subcategory}
                                onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            >
                                <option value="T-Shirts">T-Shirts</option>
                                <option value="Hoodies">Hoodies</option>
                                <option value="Sweatshirts">Sweatshirts</option>
                                <option value="Long Sleeves">Long Sleeves</option>
                                <option value="Pants">Pants</option>
                                <option value="Shorts">Shorts</option>
                                <option value="Jackets">Jackets</option>
                                <option value="Headwear">Headwear</option>
                                <option value="Bags">Bags</option>
                                <option value="Socks">Socks</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Inventory */}
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Inventory</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Sizes</label>
                            <input
                                type="text"
                                value={formData.sizes.join(', ')}
                                onChange={e => setFormData({ ...formData, sizes: e.target.value.split(',').map(s => s.trim()) })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Colors</label>
                            <input
                                type="text"
                                value={formData.colors.join(', ')}
                                onChange={e => setFormData({ ...formData, colors: e.target.value.split(',').map(s => s.trim()) })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Description</h3>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14, minHeight: 80 }}
                    />
                </div>

                {/* Tags & Status */}
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Tags & Status</h3>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {formData.tags.map((tag, idx) => (
                            <span key={idx} style={{
                                background: '#f0f0f0',
                                padding: '4px 10px',
                                borderRadius: 0,
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}>
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) })}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            placeholder="Add tag..."
                            style={{ padding: '4px 10px', border: '1px solid #e0e0e0', fontSize: 12, flex: 1, minWidth: 100 }}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    const value = e.currentTarget.value.trim();
                                    if (value && !formData.tags.includes(value)) {
                                        setFormData({ ...formData, tags: [...formData.tags, value] });
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={formData.inStock}
                                onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                            />
                            <span style={{ fontSize: 13 }}>In Stock</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={formData.isNew}
                                onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                            />
                            <span style={{ fontSize: 13 }}>New Arrival</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={formData.isBestSeller}
                                onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                            />
                            <span style={{ fontSize: 13 }}>Best Seller</span>
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{ flex: 1, padding: '16px 32px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/products')}
                        style={{ padding: '16px 32px', background: '#f5f5f5', color: '#0a0a0a', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
