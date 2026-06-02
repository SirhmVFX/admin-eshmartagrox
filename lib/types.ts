export type Permission =
  | "site:read"
  | "site:write"
  | "navigation:read"
  | "navigation:write"
  | "home:read"
  | "home:write"
  | "footer:read"
  | "footer:write"
  | "shop:read"
  | "shop:write"
  | "portfolio:read"
  | "portfolio:write"
  | "services:read"
  | "services:write"
  | "blog:read"
  | "blog:write"
  | "media:read"
  | "media:write"
  | "orders:read"
  | "orders:write"
  | "admins:read"
  | "admins:write"
  | "roles:read"
  | "roles:write";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Admin profile in Firestore; auth credentials live in Firebase Auth */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  order: number;
  isVisible: boolean;
}

export interface SiteSettings {
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
}

export interface HeroSlide {
  id: string;
  image: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
}

export interface HeroContent {
  /** Legacy single-slide fields kept for backwards compat */
  image: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  /** Up to 5 slides for the slider */
  slides: HeroSlide[];
}

export interface ProduceCard {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface HomeFeatures {
  sectionTitle: string;
  sectionSubtitle: string;
  cards: ProduceCard[];
}

export interface QualityBlock {
  id: string;
  title: string;
  description: string;
}

export interface HomeQuality {
  sectionTitle: string;
  mainImage: string;
  secondaryImage: string;
  blocks: QualityBlock[];
}

export interface CallToActionContent {
  title: string;
  description: string;
  contactImage: string;
  secondaryTitle: string;
  secondaryDescription: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterContent {
  columns: FooterColumn[];
  copyright: string;
  socialLinks: { platform: string; url: string }[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  priceRange: string;
  length: string | null;
  quantity: string | null;
  size: string | null;
  weight: string | null;
  image: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface ShopFilters {
  productTypes: string[];
  priceOptions: string[];
  lengthOptions: string[];
  quantityOptions: string[];
  sizeOptions: string[];
  weightOptions: string[];
  browseOptions: string[];
}

export interface ShopContent {
  bannerImage: string;
  bannerTitle: string;
  products: Product[];
  filters: ShopFilters;
  sortOptions: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface PortfolioContent {
  pageTitle: string;
  pageSubtitle: string;
  items: PortfolioItem[];
}

export interface Service {
  id: string;
  title: string;
  duration: string;
  price: string;
  image: string;
  description: string;
  bookLabel: string;
  bookHref: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface ServicesContent {
  pageTitle: string;
  pageSubtitle: string;
  services: Service[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string | null;
  isPublished: boolean;
  tags: string[];
}

export interface BlogContent {
  pageTitle: string;
  pageSubtitle: string;
  posts: BlogPost[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: { productName: string; quantity: number; price: number }[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrackOrderContent {
  pageTitle: string;
  pageDescription: string;
  orders: Order[];
}

export interface SiteContent {
  version: number;
  updatedAt: string;
  settings: SiteSettings;
  navigation: NavLink[];
  hero: HeroContent;
  homeFeatures: HomeFeatures;
  homeQuality: HomeQuality;
  callToAction: CallToActionContent;
  footer: FooterContent;
  shop: ShopContent;
  portfolio: PortfolioContent;
  services: ServicesContent;
  blog: BlogContent;
  trackOrder: TrackOrderContent;
}

export type ContentSection = keyof Omit<SiteContent, "version" | "updatedAt">;

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  roleId: string;
  permissions: Permission[];
}

export interface PublicAdmin {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
