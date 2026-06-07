'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createProduct, FirestoreProduct } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function NewProductPage() {
    const { user, adminUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [image1, setImage1] = useState<string>('');
    const [image2, setImage2] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        originalPrice: '',
        category: 'Tops',
        subcategory: 'T-Shirts',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White'],
        description: '',
        details: [''],
        rating: 0,
        reviews: 0,
        inStock: true,
        isNew: false,
        isBestSeller: false,
        tags: ['new'],
    });

    if (!user || !adminUser) {
        return <div>Please log in as an admin</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productData: Omit<FirestoreProduct, 'id'> = {
                name: formData.name,
                price: Number(formData.price),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
                category: formData.category,
                subcategory: formData.subcategory,
                images: image1 ? [image1, image2] : [],
                sizes: formData.sizes,
                colors: formData.colors,
                description: formData.description,
                details: formData.details.filter(d => d.trim()),
                rating: formData.rating,
                reviews: formData.reviews,
                inStock: formData.inStock,
                isNew: formData.isNew,
                isBestSeller: formData.isBestSeller,
                tags: formData.tags,
            };

            await createProduct(productData);
            router.push('/admin/products');
        } catch (e: any) {
            alert(e.message);
            setLoading(false);
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

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 32 }}>Add New Product</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Images */}
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Product Images</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Main Image *</label>
                            <label style={{
                                width: '100%',
                                aspectRatio: '1/1',
                                background: image1 ? 'none' : '#f5f5f5',
                                border: '2px dashed #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                {image1 ? (
                                    <>
                                        <img src={image1} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: 8, fontSize: 11 }}>
                                            Click to change
                                        </div>
                                    </>
                                ) : uploading ? (
                                    <span style={{ color: '#666' }}>Uploading...</span>
                                ) : (
                                    <span style={{ color: '#999' }}>Click to upload</span>
                                )}
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImage1)} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Secondary Image</label>
                            <label style={{
                                width: '100%',
                                aspectRatio: '1/1',
                                background: image2 ? 'none' : '#f5f5f5',
                                border: '2px dashed #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                {image2 ? (
                                    <>
                                        <img src={image2} alt="Secondary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: 8, fontSize: 11 }}>
                                            Click to change
                                        </div>
                                    </>
                                ) : uploading ? (
                                    <span style={{ color: '#666' }}>Uploading...</span>
                                ) : (
                                    <span style={{ color: '#999' }}>Click to upload</span>
                                )}
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImage2)} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Basic Info */}
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Basic Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Product Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Price (₦) *</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Original Price (Optional)</label>
                            <input
                                type="number"
                                value={formData.originalPrice}
                                onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
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
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Sizes (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.sizes.join(', ')}
                                onChange={e => setFormData({ ...formData, sizes: e.target.value.split(',').map(s => s.trim()) })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                placeholder="S, M, L, XL, XXL"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Colors (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.colors.join(', ')}
                                onChange={e => setFormData({ ...formData, colors: e.target.value.split(',').map(s => s.trim()) })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                placeholder="Black, White, Cream, Olive"
                            />
                        </div>
                    </div>
                </div>

                {/* Description & Details */}
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Description</h3>
                    <div>
                        <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Short Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14, minHeight: 80 }}
                            placeholder="Product description..."
                        />
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Details (Features)</label>
                        {formData.details.map((detail, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input
                                    type="text"
                                    value={detail}
                                    onChange={e => {
                                        const newDetails = [...formData.details];
                                        newDetails[idx] = e.target.value;
                                        setFormData({ ...formData, details: newDetails });
                                    }}
                                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                    placeholder={`Detail ${idx + 1}`}
                                />
                                {formData.details.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, details: formData.details.filter((_, i) => i !== idx) })}
                                        style={{ padding: '8px 12px', background: '#ff4444', color: '#fff', border: 'none', cursor: 'pointer' }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, details: [...formData.details, ''] })}
                            style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                            + Add Detail
                        </button>
                    </div>
                </div>

                {/* Tags & Status */}
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Tags & Status</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Tags (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.tags.join(', ')}
                                onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(s => s.trim()) })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                placeholder="new, bestseller, trending"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Rating</label>
                            <input
                                type="number"
                                min={0}
                                max={5}
                                step={0.1}
                                value={formData.rating}
                                onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Reviews</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.reviews}
                                onChange={e => setFormData({ ...formData, reviews: Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                            />
                        </div>
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

                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '16px 32px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, maxWidth: 200, width: '100%' }}
                >
                    {loading ? 'Creating...' : 'Create Product'}
                </button>
            </form>
        </div>
    );
}
