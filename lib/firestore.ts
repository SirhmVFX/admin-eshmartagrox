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
    recommendedAddonIds?: string[]; // IDs of products to show as "Recommended Add-ons"
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
