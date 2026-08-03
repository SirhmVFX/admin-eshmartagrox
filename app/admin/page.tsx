"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats, getOrderStats } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    MdArticle, MdArrowForward, MdShoppingBag, MdPeople,
    MdBook, MdStar, MdBarChart, MdAttachMoney,
} from "react-icons/md";

interface FullStats {
    products: number;
    orders: number;
    users: number;
    blog: number;
    testimonials: number;
    team: number;
    revenue: number;
    pendingOrders: number;
}

export default function DashboardPage() {
    const { adminUser } = useAuth();
    const [stats, setStats] = useState<FullStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [base, orderStats, testiSnap, teamSnap, ordersSnap] = await Promise.all([
                    getDashboardStats(),
                    getOrderStats(),
                    getDocs(collection(db, "testimonials")),
                    getDocs(collection(db, "team")),
                    getDocs(collection(db, "orders")),
                ]);
                // calculate total revenue from all orders
                const revenue = ordersSnap.docs.reduce((sum, d) => {
                    const data = d.data();
                    return sum + (data.paymentStatus === "paid" ? (data.totalAmount ?? 0) : 0);
                }, 0);
                setStats({
                    ...base,
                    testimonials: testiSnap.size,
                    team: teamSnap.size,
                    revenue,
                    pendingOrders: orderStats.pending,
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingStats(false);
            }
        }
        load();
    }, []);

    const statCards = stats ? [
        { label: "Products", value: stats.products, icon: MdShoppingBag, href: "/admin/products", color: "bg-blue-50 text-blue-700" },
        { label: "Orders", value: stats.orders, icon: MdBook, href: "/admin/orders", color: "bg-purple-50 text-purple-700" },
        { label: "Customers", value: stats.users, icon: MdPeople, href: "/admin/users", color: "bg-green-50 text-green-700" },
        { label: "Pending Orders", value: stats.pendingOrders, icon: MdBarChart, href: "/admin/orders", color: "bg-orange-50 text-orange-700" },
        { label: "Blog Posts", value: stats.blog, icon: MdArticle, href: "/admin/blog", color: "bg-yellow-50 text-yellow-700" },
        { label: "Testimonials", value: stats.testimonials, icon: MdStar, href: "/admin/testimonials", color: "bg-pink-50 text-pink-700" },
    ] : [];

    const quickLinks = [
        { label: "New Product", href: "/admin/products/new" },
        { label: "View Orders", href: "/admin/orders" },
        { label: "View Customers", href: "/admin/users" },
        { label: "New Blog Post", href: "/admin/blog?new=1" },
        { label: "Edit Navigation", href: "/admin/navigation" },
        { label: "Site Settings", href: "/admin/settings" },
        { label: "Manage Team", href: "/admin/team" },
        { label: "Testimonials", href: "/admin/testimonials" },
        { label: "FAQs", href: "/admin/faqs" },
    ];

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome back{adminUser?.name ? `, ${adminUser.name}` : ""}</h1>
                <p className="text-sm text-gray-500 mt-1">Manage Eshmart Agrox content and settings.</p>
            </div>

            {/* Revenue highlight */}
            {stats && (
                <div className="bg-green-900 text-white rounded-lg p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-green-300">Total Revenue (Paid Orders)</p>
                        <p className="text-3xl font-bold mt-1">₦{stats.revenue.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <MdAttachMoney size={48} className="text-green-700" />
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {loadingStats
                    ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="stat-card animate-pulse"><div className="h-4 bg-gray-200 w-1/2 mb-3" /><div className="h-8 bg-gray-200 w-1/3" /></div>)
                    : statCards.map((card) => (
                        <Link key={card.label} href={card.href} className="stat-card hover:border-green-300 transition-colors block">
                            <div className={`inline-flex p-2 mb-3 ${card.color}`}><card.icon size={18} /></div>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                        </Link>
                    ))}
            </div>

            {/* Quick Actions */}
            <div className="admin-card">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {quickLinks.map((l) => (
                        <Link key={l.label} href={l.href} className="flex items-center justify-between px-3 py-2 border border-gray-200 text-sm text-gray-700 hover:border-green-400 hover:text-green-700 transition-colors">
                            <span>{l.label}</span><MdArrowForward size={14} className="shrink-0" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* E-commerce */}
            <div className="admin-card">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">E-commerce</h2>
                <table className="admin-table">
                    <thead><tr><th>Section</th><th>Description</th><th>Action</th></tr></thead>
                    <tbody>
                        {[
                            { name: "Products", desc: "Manage product catalog — add, edit, delete products", href: "/admin/products" },
                            { name: "Orders", desc: "View all orders, update status, manage fulfilment", href: "/admin/orders" },
                            { name: "Customers", desc: "See all registered users and their order counts", href: "/admin/users" },
                        ].map((row) => (
                            <tr key={row.name}><td className="font-semibold text-gray-800">{row.name}</td><td className="text-gray-500">{row.desc}</td><td><Link href={row.href} className="text-blue-700 text-xs font-semibold hover:underline">Manage →</Link></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Content Sections */}
            <div className="admin-card">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Content Sections</h2>
                <table className="admin-table">
                    <thead><tr><th>Section</th><th>Description</th><th>Action</th></tr></thead>
                    <tbody>
                        {[
                            { name: "Hero Slides", desc: "Homepage hero slideshow — images, headlines, CTAs", href: "/admin/hero" },
                            { name: "Produce Cards", desc: "Homepage 'Our Produce' section — cards with image, title, description", href: "/admin/produce" },
                            { name: "Quality Blocks", desc: "Homepage quality section — heading, images, and text blocks", href: "/admin/quality" },
                            { name: "Call to Action", desc: "Homepage CTA banner — title, description, contact image", href: "/admin/cta" },
                            { name: "Portfolio", desc: "Portfolio page items — image, title, description, link", href: "/admin/portfolio" },
                            { name: "Services", desc: "Book Online page — service cards with pricing and booking link", href: "/admin/services" },
                            { name: "Blog", desc: "Blog posts — full WYSIWYG editor, cover image, author, tags", href: "/admin/blog" },
                            { name: "Navigation", desc: "Header navigation links — label, href, order, visibility", href: "/admin/navigation" },
                            { name: "Testimonials", desc: "Customer testimonials — name, location, review, rating, image", href: "/admin/testimonials" },
                            { name: "Team", desc: "Team members — name, role, bio, image", href: "/admin/team" },
                            { name: "FAQs", desc: "Frequently asked questions — question, answer, visibility", href: "/admin/faqs" },
                            { name: "Settings", desc: "Site name, tagline, logo, contact info, currency, feature toggles", href: "/admin/settings" },
                        ].map((row) => (
                            <tr key={row.name}><td className="font-semibold text-gray-800">{row.name}</td><td className="text-gray-500">{row.desc}</td><td><Link href={row.href} className="text-green-700 text-xs font-semibold hover:underline">Manage →</Link></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
