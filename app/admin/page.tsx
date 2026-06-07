"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { MdArticle, MdStar, MdBook, MdArrowForward, MdShoppingBag, MdPeople } from "react-icons/md";

const statCards = (s: { products: number; orders: number; users: number; blog: number }) => [
    { label: "Products", value: s.products, icon: MdShoppingBag, href: "/admin/products", color: "bg-blue-50 text-blue-700" },
    { label: "Orders", value: s.orders, icon: MdShoppingBag, href: "/admin/orders", color: "bg-purple-50 text-purple-700" },
    { label: "Customers", value: s.users, icon: MdPeople, href: "/admin/users", color: "bg-green-50 text-green-700" },
    { label: "Blog Posts", value: s.blog, icon: MdArticle, href: "/admin/blog", color: "bg-orange-50 text-orange-700" },
];

const quickLinks = [
    { label: "New Product", href: "/admin/products/new" },
    { label: "View Orders", href: "/admin/orders" },
    { label: "View Customers", href: "/admin/users" },
    { label: "New Blog Post", href: "/admin/blog?new=1" },
    { label: "Edit Navigation", href: "/admin/navigation" },
    { label: "Site Settings", href: "/admin/settings" },
    { label: "Manage Team", href: "/admin/team" },
];

export default function DashboardPage() {
    const { adminUser } = useAuth();
    const [stats, setStats] = useState<{ products: number; orders: number; users: number; blog: number } | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => { getDashboardStats().then(setStats).finally(() => setLoadingStats(false)); }, []);

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome back{adminUser?.name ? `, ${adminUser.name}` : ""}</h1>
                <p className="text-sm text-gray-500 mt-1">Manage Eshmart Agrox content and settings.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {loadingStats ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="stat-card animate-pulse"><div className="h-4 bg-gray-200 w-1/2 mb-3" /><div className="h-8 bg-gray-200 w-1/3" /></div>) : stats && statCards(stats).map((card) => (
                    <Link key={card.label} href={card.href} className="stat-card hover:border-green-300 transition-colors block">
                        <div className={`inline-flex p-2 mb-3 ${card.color}`}><card.icon size={18} /></div>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                    </Link>
                ))}
            </div>
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
            <div className="admin-card">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">E-commerce</h2>
                <table className="admin-table">
                    <thead><tr><th>Section</th><th>Description</th><th>Action</th></tr></thead>
                    <tbody>
                        {[
                            { name: "Products", desc: "Manage product catalog", href: "/admin/products" },
                            { name: "Orders", desc: "View and manage orders", href: "/admin/orders" },
                            { name: "Customers", desc: "Manage customer accounts", href: "/admin/users" },
                        ].map((row) => (
                            <tr key={row.name}><td className="font-semibold text-gray-800">{row.name}</td><td className="text-gray-500">{row.desc}</td><td><Link href={row.href} className="text-blue-700 text-xs font-semibold hover:underline">Manage →</Link></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="admin-card">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Content Sections</h2>
                <table className="admin-table">
                    <thead><tr><th>Section</th><th>Description</th><th>Action</th></tr></thead>
                    <tbody>
                        {[
                            { name: "Hero Slides", desc: "Homepage hero slideshow images", href: "/admin/hero" },
                            { name: "Produce Cards", desc: "First feature section on homepage", href: "/admin/produce" },
                            { name: "Quality Blocks", desc: "Second feature section on homepage", href: "/admin/quality" },
                            { name: "Call to Action", desc: "Bottom CTA section", href: "/admin/cta" },
                            { name: "Portfolio", desc: "Portfolio showcase items", href: "/admin/portfolio" },
                            { name: "Services", desc: "Book online services", href: "/admin/services" },
                            { name: "Blog", desc: "Blog posts", href: "/admin/blog" },
                            { name: "Navigation", desc: "Header navigation links", href: "/admin/navigation" },
                            { name: "Testimonials", desc: "Customer testimonials", href: "/admin/testimonials" },
                            { name: "Team", desc: "Team members", href: "/admin/team" },
                            { name: "FAQs", desc: "Frequently asked questions", href: "/admin/faqs" },
                            { name: "Settings", desc: "Site name, contact info, currency", href: "/admin/settings" },
                        ].map((row) => (
                            <tr key={row.name}><td className="font-semibold text-gray-800">{row.name}</td><td className="text-gray-500">{row.desc}</td><td><Link href={row.href} className="text-green-700 text-xs font-semibold hover:underline">Manage →</Link></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
