'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProduct, updateProduct, getProducts, FirestoreProduct, PRODUCT_MEASURE_UNITS } from '@/lib/firestore';
import ImageUpload from '@/components/ImageUpload';
import WysiwygEditor from '@/components/WysiwygEditor';
import { MdClose, MdAdd } from 'react-icons/md';

interface Props { params: { id: string } }

export default function EditProductPage({ params }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [product, setProduct] = useState<FirestoreProduct | null>(null);
    const [allProducts, setAllProducts] = useState<FirestoreProduct[]>([]);
    const [images, setImages] = useState<string[]>(['', '', '', '']);
    const [form, setForm] = useState({
        name: '',
        price: '',
        originalPrice: '',
        category: '',
        subcategory: '',
        sizes: '',
        colors: '',
        description: '',
        details: [''],
        detailsHtml: '',
        rating: '0',
        reviews: '0',
        inStock: true,
        isNew: false,
        isBestSeller: false,
        tags: '',
        recommendedAddonIds: [] as string[],
        relatedProductIds: [] as string[],
        weight: '',
        weightUnit: 'kg',
        measureAmount: '',
        measureUnit: 'pcs',
        servingSize: '',
        gramsPerUnit: '',
        caloriesPerServing: '',
        protein: '',
        carbs: '',
        fat: '',
        fibre: '',
        sodium: '',
        sugar: '',
    });

    useEffect(() => {
        if (!params.id) return;
        Promise.all([getProduct(params.id), getProducts()])
            .then(([p, all]) => {
                if (!p) { setError('Product not found.'); setLoading(false); return; }
                setProduct(p);
                setAllProducts(all.filter(x => x.id !== params.id));
                setImages([p.images?.[0] || '', p.images?.[1] || '', p.images?.[2] || '', p.images?.[3] || '']);
                setForm({
                    name: p.name,
                    price: String(p.price),
                    originalPrice: p.originalPrice ? String(p.originalPrice) : '',
                    category: p.category || '',
                    subcategory: p.subcategory || '',
                    sizes: p.sizes?.join(', ') || '',
                    colors: p.colors?.join(', ') || '',
                    description: p.description || '',
                    details: p.details?.length ? p.details : [''],
                    detailsHtml: p.detailsHtml || '',
                    rating: String(p.rating ?? 0),
                    reviews: String(p.reviews ?? 0),
                    inStock: p.inStock ?? true,
                    isNew: p.isNew ?? false,
                    isBestSeller: p.isBestSeller ?? false,
                    tags: p.tags?.join(', ') || '',
                    recommendedAddonIds: p.recommendedAddonIds ?? [],
                    relatedProductIds: p.relatedProductIds ?? [],
                    weight: p.weight != null ? String(p.weight) : '',
                    weightUnit: p.weightUnit || 'kg',
                    measureAmount: p.measureAmount != null ? String(p.measureAmount) : '',
                    measureUnit: p.measureUnit || 'pcs',
                    servingSize: p.servingSize || '',
                    gramsPerUnit: p.gramsPerUnit != null ? String(p.gramsPerUnit) : '',
                    caloriesPerServing: p.caloriesPerServing != null ? String(p.caloriesPerServing) : '',
                    protein: p.protein != null ? String(p.protein) : '',
                    carbs: p.carbs != null ? String(p.carbs) : '',
                    fat: p.fat != null ? String(p.fat) : '',
                    fibre: p.fibre != null ? String(p.fibre) : '',
                    sodium: p.sodium != null ? String(p.sodium) : '',
                    sugar: p.sugar != null ? String(p.sugar) : '',
                });
                setLoading(false);
            })
            .catch(() => { setError('Failed to load product.'); setLoading(false); });
    }, [params.id]);

    const set = (key: keyof typeof form, value: any) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) { setError('Product name is required.'); return; }
        setSaving(true); setError('');
        try {
            const data: Partial<FirestoreProduct> = {
                name: form.name.trim(),
                price: Number(form.price),
                originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
                category: form.category.trim(),
                subcategory: form.subcategory.trim() || undefined,
                images: images.filter(Boolean),
                sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
                colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
                description: form.description.trim(),
                details: form.details.filter(d => d.trim()),
                detailsHtml: form.detailsHtml,
                rating: Number(form.rating) || 0,
                reviews: Number(form.reviews) || 0,
                inStock: form.inStock,
                isNew: form.isNew,
                isBestSeller: form.isBestSeller,
                tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
                recommendedAddonIds: form.recommendedAddonIds,
                relatedProductIds: form.relatedProductIds,
                weight: form.weight ? Number(form.weight) : undefined,
                weightUnit: form.weightUnit || undefined,
                measureAmount: form.measureAmount ? Number(form.measureAmount) : undefined,
                measureUnit: form.measureUnit || undefined,
                servingSize: form.servingSize.trim() || undefined,
                gramsPerUnit: form.gramsPerUnit ? Number(form.gramsPerUnit) : undefined,
                caloriesPerServing: form.caloriesPerServing ? Number(form.caloriesPerServing) : undefined,
                protein: form.protein ? Number(form.protein) : undefined,
                carbs: form.carbs ? Number(form.carbs) : undefined,
                fat: form.fat ? Number(form.fat) : undefined,
                fibre: form.fibre ? Number(form.fibre) : undefined,
                sodium: form.sodium ? Number(form.sodium) : undefined,
                sugar: form.sugar ? Number(form.sugar) : undefined,
            };
            await updateProduct(params.id, data);
            router.push('/admin/products');
        } catch (e: any) {
            setError(e.message || 'Failed to save changes.');
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-card text-sm text-gray-500">Loading product…</div>;
    if (error && !product) return <div className="admin-card text-sm text-red-600">{error}</div>;

    return (
        <div className="max-w-3xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Edit Product</h1>
                    <p className="text-xs text-gray-500 mt-0.5">{product?.name}</p>
                </div>
                <button className="btn-secondary" onClick={() => router.push('/admin/products')}>
                    ← Back to Products
                </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Images */}
                <div className="admin-card space-y-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Product Images</p>
                    <div className="grid grid-cols-2 gap-4">
                        <ImageUpload
                            value={images[0]}
                            onChange={url => setImages(prev => { const n = [...prev]; n[0] = url; return n; })}
                            label="Main Image"
                        />
                        <ImageUpload
                            value={images[1]}
                            onChange={url => setImages(prev => { const n = [...prev]; n[1] = url; return n; })}
                            label="Image 2"
                        />
                        <ImageUpload
                            value={images[2]}
                            onChange={url => setImages(prev => { const n = [...prev]; n[2] = url; return n; })}
                            label="Image 3"
                        />
                        <ImageUpload
                            value={images[3]}
                            onChange={url => setImages(prev => { const n = [...prev]; n[3] = url; return n; })}
                            label="Image 4"
                        />
                    </div>
                </div>

                {/* Basic Info */}
                <div className="admin-card space-y-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Basic Information</p>
                    <div>
                        <label className="admin-label">Product Name *</label>
                        <input required className="admin-input" value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">Price</label>
                            <input type="number" min="0" step="0.01" className="admin-input" value={form.price} onChange={e => set('price', e.target.value)} />
                        </div>
                        <div>
                            <label className="admin-label">Original Price (sale)</label>
                            <input type="number" min="0" step="0.01" className="admin-input" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} placeholder="Leave blank if not on sale" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">Category</label>
                            <input className="admin-input" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Vegetables" />
                        </div>
                        <div>
                            <label className="admin-label">Subcategory</label>
                            <input className="admin-input" value={form.subcategory} onChange={e => set('subcategory', e.target.value)} placeholder="e.g. Export Grade" />
                        </div>
                    </div>
                </div>

                {/* Variants */}
                <div className="admin-card space-y-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Variants & Options</p>
                    <div>
                        <label className="admin-label">Sizes / Grades (comma-separated)</label>
                        <input className="admin-input" value={form.sizes} onChange={e => set('sizes', e.target.value)} placeholder="e.g. 500g, 1kg, 5kg" />
                    </div>
                    <div>
                        <label className="admin-label">Colors / Varieties (comma-separated)</label>
                        <input className="admin-input" value={form.colors} onChange={e => set('colors', e.target.value)} placeholder="e.g. Fresh, Dried, Frozen" />
                    </div>
                </div>

                {/* Description */}
                <div className="admin-card space-y-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Description</p>
                    <div>
                        <label className="admin-label">Short Description</label>
                        <textarea className="admin-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Product Details / Features</label>
                        {form.details.map((detail, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    className="admin-input flex-1"
                                    value={detail}
                                    onChange={e => {
                                        const n = [...form.details];
                                        n[idx] = e.target.value;
                                        set('details', n);
                                    }}
                                />
                                {form.details.length > 1 && (
                                    <button type="button" onClick={() => set('details', form.details.filter((_, i) => i !== idx))} className="btn-danger p-2">
                                        <MdClose size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="btn-secondary text-xs py-1 px-3" onClick={() => set('details', [...form.details, ''])}>
                            + Add Detail
                        </button>
                    </div>
                    <div>
                        <label className="admin-label">Full Product Details (WYSIWYG)</label>
                        <WysiwygEditor
                            key={params.id}
                            content={form.detailsHtml}
                            onChange={html => set('detailsHtml', html)}
                            placeholder="Write the full product description…"
                        />
                    </div>
                </div>

                {/* Food measurements */}
                <div className="admin-card space-y-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Food Measurements</p>
                    <p className="text-xs text-gray-500">Used for nutrition calculations (weight, cups, pieces, kg, etc.).</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">Weight</label>
                            <input type="number" min="0" step="0.01" className="admin-input" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 1" />
                        </div>
                        <div>
                            <label className="admin-label">Weight unit</label>
                            <select className="admin-input" value={form.weightUnit} onChange={e => set('weightUnit', e.target.value)}>
                                {PRODUCT_MEASURE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="admin-label">Measure amount</label>
                            <input type="number" min="0" step="0.01" className="admin-input" value={form.measureAmount} onChange={e => set('measureAmount', e.target.value)} placeholder="e.g. 2" />
                        </div>
                        <div>
                            <label className="admin-label">Measure unit (cup, pcs, kg…)</label>
                            <select className="admin-input" value={form.measureUnit} onChange={e => set('measureUnit', e.target.value)}>
                                {PRODUCT_MEASURE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="admin-label">Serving size label</label>
                            <input className="admin-input" value={form.servingSize} onChange={e => set('servingSize', e.target.value)} placeholder="e.g. 1 cup (150g)" />
                        </div>
                        <div>
                            <label className="admin-label">Grams per unit</label>
                            <input type="number" min="0" step="0.01" className="admin-input" value={form.gramsPerUnit} onChange={e => set('gramsPerUnit', e.target.value)} placeholder="For calculator conversion" />
                        </div>
                    </div>
                    <p className="text-xs font-semibold uppercase text-gray-500 pt-2">Nutrition per serving</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div><label className="admin-label">Calories</label><input type="number" min="0" step="0.1" className="admin-input" value={form.caloriesPerServing} onChange={e => set('caloriesPerServing', e.target.value)} /></div>
                        <div><label className="admin-label">Protein (g)</label><input type="number" min="0" step="0.1" className="admin-input" value={form.protein} onChange={e => set('protein', e.target.value)} /></div>
                        <div><label className="admin-label">Carbs (g)</label><input type="number" min="0" step="0.1" className="admin-input" value={form.carbs} onChange={e => set('carbs', e.target.value)} /></div>
                        <div><label className="admin-label">Fat (g)</label><input type="number" min="0" step="0.1" className="admin-input" value={form.fat} onChange={e => set('fat', e.target.value)} /></div>
                        <div><label className="admin-label">Fibre (g)</label><input type="number" min="0" step="0.1" className="admin-input" value={form.fibre} onChange={e => set('fibre', e.target.value)} /></div>
                        <div><label className="admin-label">Sodium (mg)</label><input type="number" min="0" step="0.1" className="admin-input" value={form.sodium} onChange={e => set('sodium', e.target.value)} /></div>
                        <div><label className="admin-label">Sugar (g)</label><input type="number" min="0" step="0.1" className="admin-input" value={form.sugar} onChange={e => set('sugar', e.target.value)} /></div>
                    </div>
                </div>

                {/* Recommended Add-ons */}
                <div className="admin-card space-y-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Recommended Add-ons</p>
                    <p className="text-xs text-gray-500">Select products to show as "Customers also buy" on this product's page.</p>
                    {allProducts.length === 0 ? (
                        <p className="text-xs text-gray-400">No other products available to recommend.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-gray-100 p-3">
                            {allProducts.map(p => {
                                const checked = form.recommendedAddonIds.includes(p.id!);
                                return (
                                    <label key={p.id} className={`flex items-center gap-2 px-3 py-2 border cursor-pointer text-sm transition-colors ${checked ? 'border-green-600 bg-green-50 text-green-800' : 'border-gray-200 hover:border-gray-400 text-gray-700'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={checked}
                                            onChange={() => set('recommendedAddonIds', checked
                                                ? form.recommendedAddonIds.filter(id => id !== p.id)
                                                : [...form.recommendedAddonIds, p.id!]
                                            )}
                                        />
                                        <MdAdd size={14} className={checked ? 'text-green-600 rotate-45' : 'text-gray-400'} />
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{p.name}</p>
                                            <p className="text-xs text-gray-400">₦{p.price.toLocaleString()}</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                    {form.recommendedAddonIds.length > 0 && (
                        <p className="text-xs text-green-700 font-medium">{form.recommendedAddonIds.length} add-on(s) selected</p>
                    )}
                </div>

                {/* Related products */}
                <div className="admin-card space-y-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Related Products</p>
                    <p className="text-xs text-gray-500">Shown as related products on this product&apos;s detail page.</p>
                    {allProducts.length === 0 ? (
                        <p className="text-xs text-gray-400">No other products available.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-gray-100 p-3">
                            {allProducts.map(p => {
                                const checked = form.relatedProductIds.includes(p.id!);
                                return (
                                    <label key={p.id} className={`flex items-center gap-2 px-3 py-2 border cursor-pointer text-sm transition-colors ${checked ? 'border-green-600 bg-green-50 text-green-800' : 'border-gray-200 hover:border-gray-400 text-gray-700'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={checked}
                                            onChange={() => set('relatedProductIds', checked
                                                ? form.relatedProductIds.filter(id => id !== p.id)
                                                : [...form.relatedProductIds, p.id!]
                                            )}
                                        />
                                        <MdAdd size={14} className={checked ? 'text-green-600 rotate-45' : 'text-gray-400'} />
                                        <p className="font-medium truncate">{p.name}</p>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className="admin-card space-y-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Status & Tags</p>                    <div>
                        <label className="admin-label">Tags (comma-separated)</label>
                        <input className="admin-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. okra, export, fresh" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">Rating (0–5)</label>
                            <input type="number" min="0" max="5" step="0.1" className="admin-input" value={form.rating} onChange={e => set('rating', e.target.value)} />
                        </div>
                        <div>
                            <label className="admin-label">Review Count</label>
                            <input type="number" min="0" className="admin-input" value={form.reviews} onChange={e => set('reviews', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.inStock} onChange={e => set('inStock', e.target.checked)} />
                            In Stock
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.isNew} onChange={e => set('isNew', e.target.checked)} />
                            Mark as New Arrival
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.isBestSeller} onChange={e => set('isBestSeller', e.target.checked)} />
                            Mark as Best Seller
                        </label>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button type="submit" disabled={saving} className="btn-primary px-8 py-3">
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn-secondary px-8 py-3" onClick={() => router.push('/admin/products')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
