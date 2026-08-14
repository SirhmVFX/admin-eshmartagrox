import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, Timestamp, limit, where, DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Types ──────────────────────────────────────────────────

export interface HeroSlide {
    id?: string;
    image: string;
    headline: string;
    subheadline: string;
    ctaLabel: string;
    ctaHref: string;
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface ProduceCard {
    id?: string;
    number: string;
    title: string;
    description: string;
    image: string;
    ctaLabel: string;
    ctaHref: string;
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface QualityBlock {
    id?: string;
    title: string;
    description: string;
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface CallToActionContent {
    id?: string;
    title: string;
    description: string;
    contactImage: string;
    secondaryTitle: string;
    secondaryDescription: string;
    updatedAt?: Timestamp;
}

export interface SiteSettings {
    id?: string;
    siteName: string;
    tagline: string;
    title: string;
    description: string;
    logoUrl: string;
    faviconUrl: string;
    currency: string;
    currencySymbol: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    showSearch: boolean;
    showCart: boolean;
    showUser: boolean;
    shopBannerImage?: string;
    shopBannerTitle?: string;
    teamPageLabel?: string;
    teamPageTitle?: string;
    teamPageSubtitle?: string;
    faqPageTitle?: string;
    faqPageSubtitle?: string;
    // Social media
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
    pinterest?: string;
    threads?: string;
    whatsapp?: string;
    updatedAt?: Timestamp;
}

export interface NavLink {
    id?: string;
    label: string;
    href: string;
    order: number;
    isVisible: boolean;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface PortfolioItem {
    id?: string;
    title: string;
    description: string;
    image: string;
    link?: string;
    order: number;
    active: boolean;
    content?: string;       // HTML from WYSIWYG — shown on detail page
    galleryImages?: string[]; // additional images shown on detail page
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface Service {
    id?: string;
    title: string;
    duration: string;
    price: string;
    image: string;
    description: string;
    bookLabel: string;
    bookHref: string;
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    author: string;
    publishedAt: string | null;
    active: boolean;
    order: number;
    tags: string[];
    readingTime?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface AdminUser {
    id?: string;
    email: string;
    name: string;
    roleId: "super_admin" | "admin" | "editor";
    isActive: boolean;
    uid: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const PRODUCT_MEASURE_UNITS = [
    "kg", "g", "cup", "pcs", "tbsp", "tsp", "bowl", "bunch", "pack", "litre", "ml",
] as const;
export type ProductMeasureUnit = (typeof PRODUCT_MEASURE_UNITS)[number];

export interface FirestoreProduct {
    id?: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    subcategory?: string;
    images: string[];
    sizes: string[];
    colors: string[];
    description: string;
    details: string[];
    detailsHtml?: string; // WYSIWYG product details
    rating: number;
    reviews: number;
    inStock: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
    tags: string[];
    inventory?: { size: string; color: string; quantity: number }[];
    recommendedAddonIds?: string[];
    relatedProductIds?: string[];
    // Food measurements used by the nutrition/health calculators
    weight?: number;
    weightUnit?: string;
    measureAmount?: number;
    measureUnit?: string;
    servingSize?: string;
    gramsPerUnit?: number;
    caloriesPerServing?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fibre?: number;
    sodium?: number;
    sugar?: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface Order {
    id?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: 'card' | 'bank' | 'ussd' | 'transfer' | 'cash';
    paymentReference?: string;
    status: 'pending' | 'received' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    notes?: string;
    userId?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface OrderItem {
    productId: string;
    productName: string;
    productImage: string;
    productPrice: number;
    size: string;
    color: string;
    quantity: number;
    subtotal: number;
}

export interface User {
    id?: string;
    email: string;
    name: string;
    phone: string;
    address: string;
    orders: string[];
    createdAt?: Timestamp;
}

export interface Testimonial {
    id?: string;
    name: string;
    location: string;
    text: string;
    rating: number;
    isVisible: boolean;
    imgSrc?: string;
    order?: number;
}

export interface TeamMember {
    id?: string;
    name: string;
    role: string;
    bio: string;
    image: string;
    order: number;
    isVisible: boolean;
}

export interface FAQ {
    id?: string;
    question: string;
    answer: string;
    order: number;
    isVisible: boolean;
}

// ── Helpers ───────────────────────────────────────────────

async function getAll<T>(col: string): Promise<T[]> {
    const snap = await getDocs(collection(db, col));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
}

async function getOrdered<T>(col: string, field = "order"): Promise<T[]> {
    const q = query(collection(db, col), orderBy(field));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
}

async function getOne<T>(col: string, id: string): Promise<T | null> {
    const snap = await getDoc(doc(db, col, id));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as T;
}

/** Firestore rejects `undefined` / `NaN` in writes. */
function stripUndefined(data: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (key === "id" || key === "createdAt" || key === "updatedAt") continue;
        if (value === undefined) continue;
        if (typeof value === "number" && Number.isNaN(value)) continue;
        out[key] = value;
    }
    return out;
}

async function create<T extends DocumentData>(col: string, data: Omit<T, "id">): Promise<string> {
    const ref = await addDoc(collection(db, col), {
        ...stripUndefined(data as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

async function update<T extends DocumentData>(col: string, id: string, data: Partial<T>): Promise<void> {
    await updateDoc(doc(db, col, id), {
        ...stripUndefined(data as Record<string, unknown>),
        updatedAt: serverTimestamp(),
    });
}

async function remove(col: string, id: string): Promise<void> {
    await deleteDoc(doc(db, col, id));
}

// ── Collections ───────────────────────────────────────────

// Hero Slides
export const getHeroSlides = () => getOrdered<HeroSlide>("heroSlides", "order");
export const createHeroSlide = (data: Omit<HeroSlide, "id">) => create<HeroSlide>("heroSlides", data);
export const updateHeroSlide = (id: string, data: Partial<HeroSlide>) => update<HeroSlide>("heroSlides", id, data);
export const deleteHeroSlide = (id: string) => remove("heroSlides", id);

export interface ProduceSection {
    id?: string;
    heading: string;
    subtext: string;
    updatedAt?: Timestamp;
}

// Produce Section header (single doc)
export async function getProduceSection(): Promise<ProduceSection | null> {
    const snap = await getDocs(collection(db, "produceSection"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ProduceSection;
}
export async function saveProduceSection(data: Partial<ProduceSection>): Promise<void> {
    const snap = await getDocs(collection(db, "produceSection"));
    if (snap.empty) await addDoc(collection(db, "produceSection"), { ...data, updatedAt: serverTimestamp() });
    else await updateDoc(doc(db, "produceSection", snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
}

// Produce Cards
export const getProduceCards = () => getOrdered<ProduceCard>("produceCards", "order");
export const createProduceCard = (data: Omit<ProduceCard, "id">) => create<ProduceCard>("produceCards", data);
export const updateProduceCard = (id: string, data: Partial<ProduceCard>) => update<ProduceCard>("produceCards", id, data);
export const deleteProduceCard = (id: string) => remove("produceCards", id);

export interface QualitySection {
    id?: string;
    heading: string;
    mainImage: string;
    secondaryImage: string;
    updatedAt?: Timestamp;
}

// Quality Section header (single doc)
export async function getQualitySection(): Promise<QualitySection | null> {
    const snap = await getDocs(collection(db, "qualitySection"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as QualitySection;
}
export async function saveQualitySection(data: Partial<QualitySection>): Promise<void> {
    const snap = await getDocs(collection(db, "qualitySection"));
    if (snap.empty) await addDoc(collection(db, "qualitySection"), { ...data, updatedAt: serverTimestamp() });
    else await updateDoc(doc(db, "qualitySection", snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
}
export const getQualityBlocks = () => getOrdered<QualityBlock>("qualityBlocks", "order");
export const createQualityBlock = (data: Omit<QualityBlock, "id">) => create<QualityBlock>("qualityBlocks", data);
export const updateQualityBlock = (id: string, data: Partial<QualityBlock>) => update<QualityBlock>("qualityBlocks", id, data);
export const deleteQualityBlock = (id: string) => remove("qualityBlocks", id);

// Call To Action
export async function getCTA(): Promise<CallToActionContent | null> {
    const snap = await getDocs(collection(db, "cta"));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as CallToActionContent;
}
export async function saveCTA(data: Partial<CallToActionContent>): Promise<void> {
    const snap = await getDocs(collection(db, "cta"));
    if (snap.empty) await addDoc(collection(db, "cta"), { ...data, updatedAt: serverTimestamp() });
    else await updateDoc(doc(db, "cta", snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
}

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings | null> {
    const snap = await getDocs(collection(db, "settings"));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as SiteSettings;
}
export async function saveSiteSettings(data: Partial<SiteSettings>): Promise<void> {
    const snap = await getDocs(collection(db, "settings"));
    if (snap.empty) await addDoc(collection(db, "settings"), { ...data, updatedAt: serverTimestamp() });
    else await updateDoc(doc(db, "settings", snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
}

// Navigation Links
export const getNavigation = () => getOrdered<NavLink>("navigation", "order");
export const createLink = (data: Omit<NavLink, "id">) => create<NavLink>("navigation", data);
export const updateLink = (id: string, data: Partial<NavLink>) => update<NavLink>("navigation", id, data);
export const deleteLink = (id: string) => remove("navigation", id);

// Portfolio Items
export const getPortfolioItems = () => getOrdered<PortfolioItem>("portfolio", "order");
export const createPortfolioItem = (data: Omit<PortfolioItem, "id">) => create<PortfolioItem>("portfolio", data);
export const updatePortfolioItem = (id: string, data: Partial<PortfolioItem>) => update<PortfolioItem>("portfolio", id, data);
export const deletePortfolioItem = (id: string) => remove("portfolio", id);

// Services
export const getServices = () => getOrdered<Service>("services", "order");
export const createService = (data: Omit<Service, "id">) => create<Service>("services", data);
export const updateService = (id: string, data: Partial<Service>) => update<Service>("services", id, data);
export const deleteService = (id: string) => remove("services", id);

// Blog Posts
export const getBlogPosts = () => getOrdered<BlogPost>("blog", "order");
export const getBlogPost = (id: string) => getOne<BlogPost>("blog", id);
export const createBlogPost = (data: Omit<BlogPost, "id">) => create<BlogPost>("blog", data);
export const updateBlogPost = (id: string, data: Partial<BlogPost>) => update<BlogPost>("blog", id, data);
export const deleteBlogPost = (id: string) => remove("blog", id);

// Products (E-commerce)
export const getProducts = () => getOrdered<FirestoreProduct>("products", "createdAt");
export const getProduct = (id: string) => getOne<FirestoreProduct>("products", id);
export const createProduct = (data: Omit<FirestoreProduct, "id">) => create<FirestoreProduct>("products", data);
export const updateProduct = (id: string, data: Partial<FirestoreProduct>) => update<FirestoreProduct>("products", id, data);
export const deleteProduct = (id: string) => remove("products", id);

export const getProductsByCategory = async (category: string): Promise<FirestoreProduct[]> => {
    const q = query(collection(db, "products"), where("category", "==", category), orderBy("createdAt"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreProduct));
};

export const getFeaturedProducts = async (limitCount = 4): Promise<FirestoreProduct[]> => {
    const q = query(collection(db, "products"), where("isBestSeller", "==", true), orderBy("createdAt"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreProduct));
};

export const getNewProducts = async (limitCount = 4): Promise<FirestoreProduct[]> => {
    const q = query(collection(db, "products"), where("isNew", "==", true), orderBy("createdAt"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreProduct));
};

// Admin Users — collection: "admins", doc ID = Firebase Auth UID
export const getAdminUsers = () => getAll<AdminUser>("admins");
export async function createAdminUser(data: Omit<AdminUser, "id">): Promise<string> {
    // Use UID as the document ID to match Firestore rules
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "admins", data.uid), {
        email: data.email,
        name: data.name,
        roleId: data.roleId,
        isActive: data.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return data.uid;
}
export const updateAdminUser = (id: string, data: Partial<AdminUser>) => update<AdminUser>("admins", id, data);
export const deleteAdminUser = (id: string) => remove("admins", id);
export async function getAdminUserByUid(uid: string): Promise<AdminUser | null> {
    const snap = await getDoc(doc(db, "admins", uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return { id: snap.id, uid: snap.id, ...d } as AdminUser;
}

// Orders — note: API route writes createdAt as ISO string, not Timestamp
export const getOrders = () => getAll<Order>("orders");
export const getOrder = (id: string) => getOne<Order>("orders", id);
export const createOrder = (data: Omit<Order, "id">) => create<Order>("orders", data);
export const updateOrder = (id: string, data: Partial<Order>) => update<Order>("orders", id, data);
export const deleteOrder = (id: string) => remove("orders", id);

export const getOrderStats = async () => {
    const [all, received, pending, processing, shipped, out_for_delivery, delivered, cancelled] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(query(collection(db, "orders"), where("status", "==", "received"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "pending"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "processing"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "shipped"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "out_for_delivery"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "delivered"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "cancelled"))),
    ]);
    return {
        total: all.size,
        received: received.size,
        pending: pending.size,
        processing: processing.size,
        shipped: shipped.size,
        out_for_delivery: out_for_delivery.size,
        delivered: delivered.size,
        cancelled: cancelled.size,
    };
};

// Users
export const getUsers = () => getAll<User>("users");
export const getUser = (uid: string) => getOne<User>("users", uid);
export const createUser = (data: Omit<User, "id">) => create<User>("users", data);
export const updateUser = (id: string, data: Partial<User>) => update<User>("users", id, data);
export const deleteUser = (id: string) => remove("users", id);

export const getUserCount = async () => {
    const snap = await getDocs(collection(db, "users"));
    return snap.size;
};

// Testimonials
export const getTestimonials = () => getAll<Testimonial>("testimonials");
export const getVisibleTestimonials = async (): Promise<Testimonial[]> => {
    try {
        const q = query(collection(db, "testimonials"), where("isVisible", "==", true), orderBy("order"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Testimonial));
    } catch {
        // Fallback if 'order' field/index missing
        const snap = await getDocs(query(collection(db, "testimonials"), where("isVisible", "==", true)));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Testimonial));
    }
};
export const createTestimonial = (data: Omit<Testimonial, "id">) => create<Testimonial>("testimonials", data);
export const updateTestimonial = (id: string, data: Partial<Testimonial>) => update<Testimonial>("testimonials", id, data);
export const deleteTestimonial = (id: string) => remove("testimonials", id);

// Team Members
export const getTeamMembers = () => getAll<TeamMember>("team");
export const getVisibleTeamMembers = async (): Promise<TeamMember[]> => {
    try {
        const q = query(collection(db, "team"), where("isVisible", "==", true), orderBy("order"));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMember));
    } catch {
        const snap = await getDocs(query(collection(db, "team"), where("isVisible", "==", true)));
        const members = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMember));
        return members.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
};
export const createTeamMember = (data: Omit<TeamMember, "id">) => create<TeamMember>("team", data);
export const updateTeamMember = (id: string, data: Partial<TeamMember>) => update<TeamMember>("team", id, data);
export const deleteTeamMember = (id: string) => remove("team", id);

// FAQs
export const getFAQs = () => getAll<FAQ>("faqs");
export const getVisibleFAQs = async (): Promise<FAQ[]> => {
    const q = query(collection(db, "faqs"), where("isVisible", "==", true), orderBy("order"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FAQ));
};
export const createFAQ = (data: Omit<FAQ, "id">) => create<FAQ>("faqs", data);
export const updateFAQ = (id: string, data: Partial<FAQ>) => update<FAQ>("faqs", id, data);
export const deleteFAQ = (id: string) => remove("faqs", id);

// Dashboard stats
export async function getDashboardStats() {
    const [products, orders, users, blog] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "blog")),
    ]);
    return { products: products.size, orders: orders.size, users: users.size, blog: blog.size };
}

// ── Contact Messages ───────────────────────────────────────────────────────

export interface ContactMessage {
    id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    createdAt?: Timestamp;
}

export const getContactMessages = () => getAll<ContactMessage>("contactMessages");
export const markMessageRead = (id: string, read = true) =>
    updateDoc(doc(db, "contactMessages", id), { read });
export const deleteContactMessage = (id: string) => remove("contactMessages", id);

// ── Coupons ────────────────────────────────────────────────────────────────

export interface Coupon {
    id?: string;
    code: string;                            // e.g. "SUMMER20"
    discountType: "percentage" | "fixed";    // % off or flat amount off
    discountValue: number;                   // e.g. 20 (%) or 500 (₦)
    minOrderAmount: number;                  // minimum cart total to apply
    maxUses: number;                         // 0 = unlimited
    usedCount: number;                       // incremented on each valid redemption
    validFrom: string;                       // ISO date string "YYYY-MM-DD"
    validUntil: string;                      // ISO date string "YYYY-MM-DD"
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getCoupons = () => getAll<Coupon>("coupons");
export const getCoupon = (id: string) => getOne<Coupon>("coupons", id);
export const createCoupon = (data: Omit<Coupon, "id">) => create<Coupon>("coupons", data);
export const updateCoupon = (id: string, data: Partial<Coupon>) => update<Coupon>("coupons", id, data);
export const deleteCoupon = (id: string) => remove("coupons", id);

/** Look up a coupon by code string (case-insensitive) */
export async function getCouponByCode(code: string): Promise<Coupon | null> {
    const snap = await getDocs(collection(db, "coupons"));
    const match = snap.docs.find(
        (d) => (d.data().code as string).toUpperCase() === code.toUpperCase()
    );
    if (!match) return null;
    return { id: match.id, ...match.data() } as Coupon;
}

// ── Staff Members (Admin Panel Users) ─────────────────────────────────────
// Distinct from "team" (public-facing site team members).
// Staff can log in to the admin and are assigned a role that controls
// which sections they can access.

export interface StaffMember {
    id?: string;
    name: string;
    email: string;
    role: "super_admin" | "admin" | "editor" | "viewer";
    permissions: {
        products: boolean;
        orders: boolean;
        blog: boolean;
        content: boolean;       // hero, produce, quality, CTA, portfolio, services
        navigation: boolean;
        testimonials: boolean;
        team: boolean;
        faqs: boolean;
        settings: boolean;
        messages: boolean;
        coupons: boolean;
        users: boolean;
    };
    isActive: boolean;
    invitedAt?: string;         // ISO string — when the invite was sent
    lastLogin?: string;         // ISO string
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const DEFAULT_PERMISSIONS: StaffMember["permissions"] = {
    products: false,
    orders: false,
    blog: false,
    content: false,
    navigation: false,
    testimonials: false,
    team: false,
    faqs: false,
    settings: false,
    messages: false,
    coupons: false,
    users: false,
};

export const ROLE_DEFAULTS: Record<StaffMember["role"], StaffMember["permissions"]> = {
    super_admin: {
        products: true, orders: true, blog: true, content: true, navigation: true,
        testimonials: true, team: true, faqs: true, settings: true, messages: true,
        coupons: true, users: true,
    },
    admin: {
        products: true, orders: true, blog: true, content: true, navigation: true,
        testimonials: true, team: true, faqs: true, settings: false, messages: true,
        coupons: true, users: true,
    },
    editor: {
        products: false, orders: false, blog: true, content: true, navigation: false,
        testimonials: true, team: true, faqs: true, settings: false, messages: false,
        coupons: false, users: false,
    },
    viewer: {
        products: true, orders: true, blog: true, content: true, navigation: false,
        testimonials: false, team: false, faqs: false, settings: false, messages: true,
        coupons: false, users: false,
    },
};

export const getStaffMembers = () => getAll<StaffMember>("staff");
export const getStaffMember = (id: string) => getOne<StaffMember>("staff", id);
export const createStaffMember = (data: Omit<StaffMember, "id">) => create<StaffMember>("staff", data);
export const updateStaffMember = (id: string, data: Partial<StaffMember>) =>
    update<StaffMember>("staff", id, data);
export const deleteStaffMember = (id: string) => remove("staff", id);

// ── Currency Rates ─────────────────────────────────────────────────────────
// Base currency is always NGN (Nigerian Naira). Each rate is NGN → target.
// e.g. { code: "USD", symbol: "$", name: "US Dollar", rateFromNGN: 0.00065 }
// 1 NGN = 0.00065 USD, so 1500 NGN = 1500 * 0.00065 = $0.975

export interface CurrencyRate {
    id?: string;
    code: string;        // ISO 4217 e.g. "USD"
    symbol: string;      // e.g. "$"
    name: string;        // e.g. "US Dollar"
    rateFromNGN: number; // how many units of this currency equal 1 NGN
    active: boolean;
    updatedAt?: Timestamp;
}

export const getCurrencyRates = () => getAll<CurrencyRate>("currencyRates");
export const createCurrencyRate = (data: Omit<CurrencyRate, "id">) => create<CurrencyRate>("currencyRates", data);
export const updateCurrencyRate = (id: string, data: Partial<CurrencyRate>) => update<CurrencyRate>("currencyRates", id, data);
export const deleteCurrencyRate = (id: string) => remove("currencyRates", id);

// ── Order Notifications ────────────────────────────────────────────────────

export interface OrderNotification {
    id?: string;
    userId: string;
    orderId: string;
    orderRef: string;
    title: string;
    message: string;
    status: string;
    read: boolean;
    createdAt?: Timestamp;
}

const STATUS_NOTIFICATION_COPY: Record<string, { title: string; message: string }> = {
    received: { title: "Order Received", message: "We've received your order and will begin processing it shortly." },
    pending: { title: "Order Pending", message: "Your order is pending confirmation. We'll update you soon." },
    processing: { title: "Order Processing", message: "Great news — your order is now being processed and prepared." },
    shipped: { title: "Order Shipped", message: "Your order is on its way! Expect delivery within the estimated timeframe." },
    out_for_delivery: { title: "Out for Delivery", message: "Your order is out for delivery and will arrive today." },
    delivered: { title: "Order Delivered", message: "Your order has been delivered. Thank you for shopping with Eshmart Agrox!" },
    cancelled: { title: "Order Cancelled", message: "Your order has been cancelled. Contact us if you have any questions." },
};

/**
 * Write a notification to the orderNotifications collection.
 * Called by the admin whenever an order status is updated.
 */
export async function createOrderNotification(
    order: Pick<Order, "id" | "customerEmail"> & { userId?: string },
    status: string
): Promise<void> {
    if (!order.userId) return; // only notify logged-in customers
    const copy = STATUS_NOTIFICATION_COPY[status] ?? {
        title: `Order ${status}`,
        message: `Your order status has been updated to ${status}.`,
    };
    await addDoc(collection(db, "orderNotifications"), {
        userId: order.userId,
        orderId: order.id ?? "",
        orderRef: (order.id ?? "").slice(-8).toUpperCase(),
        title: copy.title,
        message: copy.message,
        status,
        read: false,
        createdAt: serverTimestamp(),
    });
}

// ── Export Commodities ─────────────────────────────────────────────────────

export const EXPORT_CATEGORIES = [
    "Cocoa", "Nuts", "Seeds", "Spices", "Roots", "Fruits", "Botanicals", "Grains", "Oils",
] as const;
export const EXPORT_CERTIFICATIONS = ["Organic", "Non-GMO", "Conventional"] as const;
export const EXPORT_MARKETS = ["Europe", "USA", "Asia", "Middle East", "Africa"] as const;
export const EXPORT_PACKAGING = ["25 kg", "50 kg", "1 MT", "Bulk", "Container"] as const;

export type ExportCategory = (typeof EXPORT_CATEGORIES)[number];
export type ExportCertification = (typeof EXPORT_CERTIFICATIONS)[number];
export type ExportMarket = (typeof EXPORT_MARKETS)[number];
export type ExportPackaging = (typeof EXPORT_PACKAGING)[number];

export interface ExportCommodity {
    id?: string;
    name: string;
    spec: string;
    priceMin: number;
    priceMax: number;
    moq: string;
    catalogType: "raw" | "processed";
    category?: ExportCategory;
    certification?: ExportCertification;
    markets?: ExportMarket[];
    packaging?: ExportPackaging[];
    image?: string;
    galleryImages?: string[];
    description?: string;
    detailsHtml?: string;
    relatedIds?: string[];
    active: boolean;
    order: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getExportCommodities = () => getAll<ExportCommodity>("exportCommodities");
export const getExportCommodity = (id: string) => getOne<ExportCommodity>("exportCommodities", id);
export const createExportCommodity = (data: Omit<ExportCommodity, "id">) => create<ExportCommodity>("exportCommodities", data);
export const updateExportCommodity = (id: string, data: Partial<ExportCommodity>) => update<ExportCommodity>("exportCommodities", id, data);
export const deleteExportCommodity = (id: string) => remove("exportCommodities", id);

// ── Export Quote Requests ──────────────────────────────────────────────────

export interface ExportQuoteRequest {
    id?: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    commodity: string;
    quantity: string;
    destination: string;
    message?: string;
    status: "new" | "contacted" | "closed";
    createdAt?: Timestamp | string;
}

export const getExportQuotes = () => getAll<ExportQuoteRequest>("exportQuotes");
export const updateExportQuote = (id: string, data: Partial<ExportQuoteRequest>) => update<ExportQuoteRequest>("exportQuotes", id, data);
export const deleteExportQuote = (id: string) => remove("exportQuotes", id);

// ── Subscription Packages ──────────────────────────────────────────────────

export interface SubscriptionPackage {
    id?: string;
    name: string;
    tag: string;
    tagColor: "green" | "orange";   // green = #14532d, orange = #f97316
    description: string;
    price: number;                  // in NGN
    period: string;                 // e.g. "/ week"
    items: string[];                // checklist items
    active: boolean;
    order: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getSubscriptionPackages = () => getAll<SubscriptionPackage>("subscriptionPackages");
export const createSubscriptionPackage = (data: Omit<SubscriptionPackage, "id">) => create<SubscriptionPackage>("subscriptionPackages", data);
export const updateSubscriptionPackage = (id: string, data: Partial<SubscriptionPackage>) => update<SubscriptionPackage>("subscriptionPackages", id, data);
export const deleteSubscriptionPackage = (id: string) => remove("subscriptionPackages", id);

// ── Box Items ──────────────────────────────────────────────────────────────

export interface BoxItem {
    id?: string;
    name: string;
    price: number;
    active: boolean;
    order: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getBoxItems = () => getAll<BoxItem>("boxItems");
export const createBoxItem = (data: Omit<BoxItem, "id">) => create<BoxItem>("boxItems", data);
export const updateBoxItem = (id: string, data: Partial<BoxItem>) => update<BoxItem>("boxItems", id, data);
export const deleteBoxItem = (id: string) => remove("boxItems", id);

// ── Consultation Tiers ─────────────────────────────────────────────────────

export interface ConsultationTier {
    id?: string;
    icon: string;           // emoji
    title: string;          // e.g. "Basic · 15 min"
    subtitle: string;       // e.g. "Phone call"
    price: number;          // NGN
    active: boolean;
    order: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getConsultationTiers = () => getAll<ConsultationTier>("consultationTiers");
export const createConsultationTier = (data: Omit<ConsultationTier, "id">) => create<ConsultationTier>("consultationTiers", data);
export const updateConsultationTier = (id: string, data: Partial<ConsultationTier>) => update<ConsultationTier>("consultationTiers", id, data);
export const deleteConsultationTier = (id: string) => remove("consultationTiers", id);

// ── Homepage Stats ─────────────────────────────────────────────────────────

export interface HomepageStat {
    id?: string;
    value: string;      // e.g. "12k+"
    label: string;      // e.g. "Meals delivered"
    order: number;
    active: boolean;
}

export const getHomepageStats = () => getAll<HomepageStat>("homepageStats");
export const createHomepageStat = (data: Omit<HomepageStat, "id">) => create<HomepageStat>("homepageStats", data);
export const updateHomepageStat = (id: string, data: Partial<HomepageStat>) => update<HomepageStat>("homepageStats", id, data);
export const deleteHomepageStat = (id: string) => remove("homepageStats", id);

// ── Food Library Categories ────────────────────────────────────────────────

export interface FoodLibraryCategory {
    id?: string;
    category: string;       // e.g. "Grains"
    items: string[];        // food names in this category
    note: string;           // e.g. "5 foods · updated weekly"
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getFoodLibraryCategories = () => getAll<FoodLibraryCategory>("foodLibrary");
export const createFoodLibraryCategory = (data: Omit<FoodLibraryCategory, "id">) => create<FoodLibraryCategory>("foodLibrary", data);
export const updateFoodLibraryCategory = (id: string, data: Partial<FoodLibraryCategory>) => update<FoodLibraryCategory>("foodLibrary", id, data);
export const deleteFoodLibraryCategory = (id: string) => remove("foodLibrary", id);

// ── Homepage Hero Content ──────────────────────────────────────────────────

export interface HomepageHeroContent {
    id?: string;
    deliveryText: string;       // e.g. "Now delivering across Lagos & Abuja"
    line1: string;              // e.g. "Eat better."
    line2: string;              // e.g. "Live longer."
    line3: string;              // e.g. "Stay healthier."
    subtitle: string;
    cta1Label: string;
    cta1Href: string;
    cta2Label: string;
    cta2Href: string;
    healthPills: string[];      // e.g. ["💧 Diabetes", "💚 Blood Pressure"]
    floatingCard1Title: string;
    floatingCard1Sub: string;
    floatingCard2Title: string;
    floatingCard2Sub: string;
    heroImage: string;
    assessmentHeading: string;
    assessmentCta1Label: string;
    assessmentCta2Label: string;
    consultationImage?: string;
    updatedAt?: Timestamp;
}

export async function getHomepageHeroContent(): Promise<HomepageHeroContent | null> {
    const snap = await getDocs(collection(db, "homepageHero"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as HomepageHeroContent;
}
export async function saveHomepageHeroContent(data: Partial<HomepageHeroContent>): Promise<void> {
    const snap = await getDocs(collection(db, "homepageHero"));
    if (snap.empty) await addDoc(collection(db, "homepageHero"), { ...data, updatedAt: serverTimestamp() });
    else await updateDoc(doc(db, "homepageHero", snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
}

// ── Export Destinations (cards above commodity table) ─────────────────────

export interface ExportDestination {
    id?: string;
    flag: string;           // emoji flag e.g. "🇪🇺"
    region: string;         // e.g. "Europe"
    ports: string;          // e.g. "Rotterdam · Hamburg · Antwerp"
    note: string;           // e.g. "EU-compliant documentation & phytosanitary certs."
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getExportDestinations = () => getAll<ExportDestination>("exportDestinations");
export const createExportDestination = (data: Omit<ExportDestination, "id">) => create<ExportDestination>("exportDestinations", data);
export const updateExportDestination = (id: string, data: Partial<ExportDestination>) => update<ExportDestination>("exportDestinations", id, data);
export const deleteExportDestination = (id: string) => remove("exportDestinations", id);

// ── Export Hero Content ────────────────────────────────────────────────────

export interface ExportHeroContent {
    id?: string;
    eyebrow: string;        // e.g. "Global Export"
    headingLine1: string;   // e.g. "Raw & processed organic"
    headingLine2: string;   // e.g. "commodities —"
    headingAccent: string;  // e.g. "Nigeria to the world."
    subtitle: string;
    cta1Label: string;
    cta2Label: string;
    catalogFootnote: string;
    quoteCta1Label: string;
    quoteCta2Label: string;
    /** Hide indicative prices on catalog listings (homepage + /export). */
    hidePrices?: boolean;
    /** Show indicative prices on the single commodity page. Defaults to true. */
    showDetailPrices?: boolean;
    updatedAt?: Timestamp;
}

export async function getExportHeroContent(): Promise<ExportHeroContent | null> {
    const snap = await getDocs(collection(db, "exportHero"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ExportHeroContent;
}
export async function saveExportHeroContent(data: Partial<ExportHeroContent>): Promise<void> {
    const snap = await getDocs(collection(db, "exportHero"));
    if (snap.empty) await addDoc(collection(db, "exportHero"), { ...data, updatedAt: serverTimestamp() });
    else await updateDoc(doc(db, "exportHero", snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
}

// ── Compliance Certifications ──────────────────────────────────────────────

export interface ComplianceCertification {
    id?: string;
    title: string;
    body: string;
    badge: string;          // e.g. "EU · USA · ASIA"
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getComplianceCertifications = () => getAll<ComplianceCertification>("complianceCerts");
export const createComplianceCertification = (data: Omit<ComplianceCertification, "id">) => create<ComplianceCertification>("complianceCerts", data);
export const updateComplianceCertification = (id: string, data: Partial<ComplianceCertification>) => update<ComplianceCertification>("complianceCerts", id, data);
export const deleteComplianceCertification = (id: string) => remove("complianceCerts", id);

// ── Compliance Destination Documents ──────────────────────────────────────

export interface ComplianceDestination {
    id?: string;
    region: string;         // e.g. "Europe"
    docs: string[];         // list of required document names
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getComplianceDestinations = () => getAll<ComplianceDestination>("complianceDests");
export const createComplianceDestination = (data: Omit<ComplianceDestination, "id">) => create<ComplianceDestination>("complianceDests", data);
export const updateComplianceDestination = (id: string, data: Partial<ComplianceDestination>) => update<ComplianceDestination>("complianceDests", id, data);
export const deleteComplianceDestination = (id: string) => remove("complianceDests", id);

// ── Compliance Hero & FAQs ─────────────────────────────────────────────────

export interface ComplianceHeroContent {
    id?: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    accrHeading: string;
    accrSubtitle: string;
    docsHeading: string;
    docsSubtitle: string;
    faqHeading: string;
    faqSubtitle: string;
    dueDiligenceHeading: string;
    dueDiligenceBody: string;
    cta1Label: string;
    cta2Label: string;
    updatedAt?: Timestamp;
}

export async function getComplianceHeroContent(): Promise<ComplianceHeroContent | null> {
    const snap = await getDocs(collection(db, "complianceHero"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ComplianceHeroContent;
}
export async function saveComplianceHeroContent(data: Partial<ComplianceHeroContent>): Promise<void> {
    const snap = await getDocs(collection(db, "complianceHero"));
    if (snap.empty) await addDoc(collection(db, "complianceHero"), { ...data, updatedAt: serverTimestamp() });
    else await updateDoc(doc(db, "complianceHero", snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
}

export interface ExportFAQ {
    id?: string;
    question: string;
    answer: string;
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getExportFAQs = () => getAll<ExportFAQ>("exportFAQs");
export const createExportFAQ = (data: Omit<ExportFAQ, "id">) => create<ExportFAQ>("exportFAQs", data);
export const updateExportFAQ = (id: string, data: Partial<ExportFAQ>) => update<ExportFAQ>("exportFAQs", id, data);
export const deleteExportFAQ = (id: string) => remove("exportFAQs", id);

// ── About Page Content ─────────────────────────────────────────────────────

export interface AboutStat {
    value: string;   // e.g. "500+"
    label: string;   // e.g. "Happy Customers"
    color: string;   // tailwind bg class e.g. "bg-green-900"
}

export interface AboutValue {
    icon: string;   // emoji
    title: string;
    desc: string;
}

export interface AboutService {
    icon: string;
    title: string;
    desc: string;
    href: string;
}

export interface AboutPageContent {
    id?: string;
    // Hero
    heroLabel: string;             // e.g. "Our Story"
    heroHeading: string;           // e.g. "About Eshmart Agrox"
    heroSubtext: string;
    heroBgImage: string;
    // Who We Are
    whoHeading: string;
    whoParagraph1: string;
    whoParagraph2: string;
    whoParagraph3: string;
    // Stats
    stats: AboutStat[];
    // Values
    valuesHeading: string;
    valuesSubtext: string;
    values: AboutValue[];
    // What We Do
    servicesHeading: string;
    services: AboutService[];
    // CTA section
    ctaHeading: string;
    ctaSubtext: string;
    updatedAt?: Timestamp;
}

const DEFAULT_ABOUT: Omit<AboutPageContent, "id"> = {
    heroLabel: "Our Story",
    heroHeading: "About Eshmart Agrox",
    heroSubtext: "Nigerian Produce. Exported with Integrity.",
    heroBgImage: "",
    whoHeading: "Who We Are",
    whoParagraph1: "Eshmart Agrox is a Nigerian agro-export and healthy food delivery company dedicated to bringing the best of Nigeria's organic produce to your table — and to the world.",
    whoParagraph2: "Whether you're looking for weekly grocery packs designed around your health goals, or you're an international buyer seeking certified Nigerian commodities — we are your reliable partner.",
    whoParagraph3: "Our commitment goes beyond commerce. We work to empower local farmers, support community food security, and make nutritious eating accessible for every Nigerian household.",
    stats: [
        { value: "500+", label: "Happy Customers", color: "bg-green-900 text-white" },
        { value: "20+", label: "Produce Varieties", color: "bg-orange-500 text-white" },
        { value: "10+", label: "Countries Served", color: "bg-green-100 text-green-900" },
        { value: "100%", label: "Organic Sourced", color: "bg-gray-100 text-gray-900" },
    ],
    valuesHeading: "Our Values",
    valuesSubtext: "Every decision we make is guided by these core principles.",
    values: [
        { icon: "🌱", title: "Freshness First", desc: "We source produce at peak freshness and deliver within 24–48 hours of harvest where possible." },
        { icon: "🤝", title: "Farmer Partnership", desc: "We pay fair prices to smallholder farmers and provide technical support to improve yield quality." },
        { icon: "📦", title: "Export Quality", desc: "All our export commodities meet EU, UK, and US phytosanitary and certification standards." },
        { icon: "❤️", title: "Wellness Focus", desc: "We design our packs around real health goals — diabetes, hypertension, weight management, and senior care." },
    ],
    servicesHeading: "What We Do",
    services: [
        { icon: "🛒", title: "Healthy Grocery Packs", desc: "Curated weekly meal packs designed for specific health conditions.", href: "/shop" },
        { icon: "🚢", title: "International Export", desc: "We export premium Nigerian commodities to buyers in Europe, USA and Asia.", href: "/export" },
        { icon: "📊", title: "Nutrition Calculator", desc: "Free tool to analyse Nigerian meals and build healthier eating habits.", href: "/calculator" },
        { icon: "👥", title: "Senior Wellness", desc: "Dedicated programmes for older adults with guidance from nutrition professionals.", href: "/shop" },
        { icon: "📱", title: "WhatsApp Support", desc: "Direct human support via WhatsApp — no bots, no long waits.", href: "https://wa.me/2347047296000" },
        { icon: "📰", title: "Health Blog", desc: "Expert articles on Nigerian nutrition and practical wellness advice.", href: "/blog" },
    ],
    ctaHeading: "Get in Touch",
    ctaSubtext: "Whether you're a customer, a farmer, or an international buyer — we'd love to hear from you.",
};

export async function getAboutPageContent(): Promise<AboutPageContent> {
    const snap = await getDocs(collection(db, "aboutPage"));
    if (snap.empty) return DEFAULT_ABOUT as AboutPageContent;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as AboutPageContent;
}

export async function saveAboutPageContent(data: Partial<AboutPageContent>): Promise<void> {
    const snap = await getDocs(collection(db, "aboutPage"));
    if (snap.empty) {
        await addDoc(collection(db, "aboutPage"), { ...DEFAULT_ABOUT, ...data, updatedAt: serverTimestamp() });
    } else {
        await updateDoc(doc(db, "aboutPage", snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
    }
}

// ── Nutritionists ──────────────────────────────────────────────────────────

export interface NutritionistTier {
    icon: string;
    title: string;
    subtitle: string;
    price: number;
}

export interface Nutritionist {
    id?: string;
    name: string;
    designation: string;
    photo: string;
    tiers: NutritionistTier[];
    active: boolean;
    order: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const getNutritionists = () => getAll<Nutritionist>("nutritionists");
export const createNutritionist = (data: Omit<Nutritionist, "id">) => create<Nutritionist>("nutritionists", data);
export const updateNutritionist = (id: string, data: Partial<Nutritionist>) => update<Nutritionist>("nutritionists", id, data);
export const deleteNutritionist = (id: string) => remove("nutritionists", id);

// ── Health Calculator ──────────────────────────────────────────────────────

export type HealthMetricKind = "number" | "derived_bmi";

export interface HealthMetric {
    id?: string;
    key: string;
    label: string;
    unit: string;
    icon: string;
    placeholder?: string;
    helpText?: string;
    kind: HealthMetricKind;
    scored: boolean;
    greenMin: number;
    greenMax: number;
    yellowMin: number;
    yellowMax: number;
    order: number;
    active: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface HealthCalculatorPage {
    id?: string;
    pageTitle: string;
    pageSubtitle: string;
    disclaimer: string;
    goodLabel: string;
    fairLabel: string;
    badLabel: string;
    goodMinScore: number;
    fairMinScore: number;
    ctaLabel?: string;
    ctaHref?: string;
    updatedAt?: Timestamp;
}

export const DEFAULT_HEALTH_PAGE: HealthCalculatorPage = {
    pageTitle: "Health Calculator",
    pageSubtitle: "Enter your age, height, weight, sleep, blood pressure, blood glucose and more to get a traffic-light health status.",
    disclaimer: "This calculator provides general wellness guidance only. It does not replace medical advice. Please consult your doctor for personal health conditions.",
    goodLabel: "Good health",
    fairLabel: "Fairly good health status",
    badLabel: "Very bad health",
    goodMinScore: 1.6,
    fairMinScore: 0.8,
    ctaLabel: "Book a nutrition consultation",
    ctaHref: "/book-online",
};

export const DEFAULT_HEALTH_METRICS: Omit<HealthMetric, "id">[] = [
    { key: "age", label: "Age", unit: "years", icon: "🎂", placeholder: "e.g. 34", helpText: "Your age in years.", kind: "number", scored: false, greenMin: 0, greenMax: 0, yellowMin: 0, yellowMax: 0, order: 0, active: true },
    { key: "height", label: "Height", unit: "cm", icon: "📏", placeholder: "e.g. 170", helpText: "Used with weight to calculate BMI.", kind: "number", scored: false, greenMin: 0, greenMax: 0, yellowMin: 0, yellowMax: 0, order: 1, active: true },
    { key: "weight", label: "Weight", unit: "kg", icon: "⚖️", placeholder: "e.g. 68", helpText: "Used with height to calculate BMI.", kind: "number", scored: false, greenMin: 0, greenMax: 0, yellowMin: 0, yellowMax: 0, order: 2, active: true },
    { key: "bmi", label: "Body Mass Index (BMI)", unit: "kg/m²", icon: "📊", helpText: "Calculated automatically from height and weight.", kind: "derived_bmi", scored: true, greenMin: 18.5, greenMax: 24.9, yellowMin: 17, yellowMax: 29.9, order: 3, active: true },
    { key: "sleep", label: "Sleeping hours", unit: "hrs/night", icon: "😴", placeholder: "e.g. 7.5", helpText: "Average hours of sleep per night.", kind: "number", scored: true, greenMin: 7, greenMax: 9, yellowMin: 6, yellowMax: 10, order: 4, active: true },
    { key: "bp_systolic", label: "Blood Pressure (Systolic)", unit: "mmHg", icon: "🫀", placeholder: "e.g. 118", helpText: "The top number of your blood pressure reading.", kind: "number", scored: true, greenMin: 90, greenMax: 120, yellowMin: 80, yellowMax: 139, order: 5, active: true },
    { key: "bp_diastolic", label: "Blood Pressure (Diastolic)", unit: "mmHg", icon: "🫀", placeholder: "e.g. 76", helpText: "The bottom number of your blood pressure reading.", kind: "number", scored: true, greenMin: 60, greenMax: 80, yellowMin: 50, yellowMax: 89, order: 6, active: true },
    { key: "glucose", label: "Blood Glucose (fasting)", unit: "mg/dL", icon: "🩸", placeholder: "e.g. 92", helpText: "Fasting blood glucose reading.", kind: "number", scored: true, greenMin: 70, greenMax: 99, yellowMin: 55, yellowMax: 125, order: 7, active: true },
    { key: "heart_rate", label: "Resting Heart Rate", unit: "bpm", icon: "❤️", placeholder: "e.g. 72", helpText: "Beats per minute at rest.", kind: "number", scored: true, greenMin: 60, greenMax: 100, yellowMin: 50, yellowMax: 110, order: 8, active: true },
    { key: "waist", label: "Waist Circumference", unit: "cm", icon: "📐", placeholder: "e.g. 82", helpText: "Measured at the navel.", kind: "number", scored: true, greenMin: 0, greenMax: 94, yellowMin: 0, yellowMax: 102, order: 9, active: true },
    { key: "water", label: "Daily Water Intake", unit: "litres", icon: "💧", placeholder: "e.g. 2.5", helpText: "Average litres of water drunk per day.", kind: "number", scored: true, greenMin: 2, greenMax: 4, yellowMin: 1.5, yellowMax: 5, order: 10, active: true },
];

export const getHealthMetrics = () => getAll<HealthMetric>("healthMetrics");
export const createHealthMetric = (data: Omit<HealthMetric, "id">) => create<HealthMetric>("healthMetrics", data);
export const updateHealthMetric = (id: string, data: Partial<HealthMetric>) => update<HealthMetric>("healthMetrics", id, data);
export const deleteHealthMetric = (id: string) => remove("healthMetrics", id);

export async function getHealthCalculatorPage(): Promise<HealthCalculatorPage> {
    const snap = await getDocs(collection(db, "healthCalculatorPage"));
    if (snap.empty) return DEFAULT_HEALTH_PAGE;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as HealthCalculatorPage;
}

export async function saveHealthCalculatorPage(data: Partial<HealthCalculatorPage>): Promise<void> {
    const snap = await getDocs(collection(db, "healthCalculatorPage"));
    if (snap.empty) {
        await addDoc(collection(db, "healthCalculatorPage"), { ...DEFAULT_HEALTH_PAGE, ...data, updatedAt: serverTimestamp() });
    } else {
        await updateDoc(doc(db, "healthCalculatorPage", snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
    }
}
