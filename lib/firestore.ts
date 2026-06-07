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
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface AdminUser {
    id?: string;
    email: string;
    name: string;
    role: "super_admin" | "admin" | "editor";
    active: boolean;
    uid: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

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
    rating: number;
    reviews: number;
    inStock: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
    tags: string[];
    inventory?: { size: string; color: string; quantity: number }[];
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
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    notes?: string;
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
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

async function getOrdered<T>(col: string, field = "order"): Promise<T[]> {
    const q = query(collection(db, col), orderBy(field));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

async function getOne<T>(col: string, id: string): Promise<T | null> {
    const snap = await getDoc(doc(db, col, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as T;
}

async function create<T extends DocumentData>(col: string, data: Omit<T, "id">): Promise<string> {
    const ref = await addDoc(collection(db, col), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

async function update<T extends DocumentData>(col: string, id: string, data: Partial<T>): Promise<void> {
    await updateDoc(doc(db, col, id), {
        ...data,
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

// Produce Cards
export const getProduceCards = () => getOrdered<ProduceCard>("produceCards", "order");
export const createProduceCard = (data: Omit<ProduceCard, "id">) => create<ProduceCard>("produceCards", data);
export const updateProduceCard = (id: string, data: Partial<ProduceCard>) => update<ProduceCard>("produceCards", id, data);
export const deleteProduceCard = (id: string) => remove("produceCards", id);

// Quality Blocks
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

// Admin Users
export const getAdminUsers = () => getAll<AdminUser>("adminUsers");
export const createAdminUser = (data: Omit<AdminUser, "id">) => create<AdminUser>("adminUsers", data);
export const updateAdminUser = (id: string, data: Partial<AdminUser>) => update<AdminUser>("adminUsers", id, data);
export const deleteAdminUser = (id: string) => remove("adminUsers", id);
export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
    const q = query(collection(db, "adminUsers"), where("email", "==", email), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as AdminUser;
}

// Orders
export const getOrders = () => getOrdered<Order>("orders", "createdAt");
export const getOrder = (id: string) => getOne<Order>("orders", id);
export const createOrder = (data: Omit<Order, "id">) => create<Order>("orders", data);
export const updateOrder = (id: string, data: Partial<Order>) => update<Order>("orders", id, data);
export const deleteOrder = (id: string) => remove("orders", id);

export const getOrderStats = async () => {
    const [all, pending, processing, shipped, delivered, cancelled] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(query(collection(db, "orders"), where("status", "==", "pending"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "processing"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "shipped"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "delivered"))),
        getDocs(query(collection(db, "orders"), where("status", "==", "cancelled"))),
    ]);
    return {
        total: all.size,
        pending: pending.size,
        processing: processing.size,
        shipped: shipped.size,
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
    const q = query(collection(db, "testimonials"), where("isVisible", "==", true), orderBy("order"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Testimonial));
};
export const createTestimonial = (data: Omit<Testimonial, "id">) => create<Testimonial>("testimonials", data);
export const updateTestimonial = (id: string, data: Partial<Testimonial>) => update<Testimonial>("testimonials", id, data);
export const deleteTestimonial = (id: string) => remove("testimonials", id);

// Team Members
export const getTeamMembers = () => getAll<TeamMember>("team");
export const getVisibleTeamMembers = async (): Promise<TeamMember[]> => {
    const q = query(collection(db, "team"), where("isVisible", "==", true), orderBy("order"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMember));
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
