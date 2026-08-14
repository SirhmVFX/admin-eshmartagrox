"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
    MdDashboard, MdImage, MdArticle, MdBook, MdPeople, MdSettings,
    MdMenu, MdClose, MdLogout, MdStar, MdOutlineStore, MdContactPhone,
    MdLocalOffer, MdMail, MdAdminPanelSettings, MdCurrencyExchange, MdPublic, MdInventory,
} from "react-icons/md";

const navSections = [
    { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: MdDashboard }] },
    {
        label: "E-commerce", items: [
            { href: "/admin/products", label: "Products", icon: MdOutlineStore },
            { href: "/admin/orders", label: "Orders", icon: MdBook },
            { href: "/admin/users", label: "Customers", icon: MdPeople },
            { href: "/admin/coupons", label: "Coupons", icon: MdLocalOffer },
            { href: "/admin/currency-rates", label: "Currency Rates", icon: MdCurrencyExchange },
            { href: "/admin/packages", label: "Subscription Packages", icon: MdOutlineStore },
            { href: "/admin/box-items", label: "Box Builder Items", icon: MdInventory },
            { href: "/admin/consultations", label: "Consultation Tiers", icon: MdContactPhone },
        ]
    },
    {
        label: "International Export", items: [
            { href: "/admin/export-settings", label: "Export Settings", icon: MdPublic },
            { href: "/admin/export-commodities", label: "Commodities", icon: MdPublic },
            { href: "/admin/export-quotes", label: "Quote Requests", icon: MdInventory },
            { href: "/admin/export-compliance-settings", label: "Compliance Settings", icon: MdPublic },
        ]
    },
    {
        label: "Content", items: [
            { href: "/admin/blog", label: "Blog", icon: MdArticle },
            { href: "/admin/portfolio", label: "Portfolio", icon: MdStar },
            { href: "/admin/services", label: "Services", icon: MdBook },
            { href: "/admin/food-library", label: "Food Library", icon: MdImage },
            { href: "/admin/health-calculator", label: "Health Calculator", icon: MdLocalOffer },
            { href: "/admin/about-page", label: "About Page", icon: MdArticle },
        ]
    },
    {
        label: "Site", items: [
            { href: "/admin/homepage-settings", label: "Homepage Settings", icon: MdSettings },
            { href: "/admin/navigation", label: "Navigation", icon: MdMenu },
            { href: "/admin/settings", label: "Site Settings", icon: MdSettings },
            { href: "/admin/team", label: "Team", icon: MdPeople },
            { href: "/admin/testimonials", label: "Testimonials", icon: MdStar },
            { href: "/admin/faqs", label: "Local FAQs", icon: MdContactPhone },
            { href: "/admin/messages", label: "Messages", icon: MdMail },
        ]
    },
    {
        label: "Admin", items: [
            { href: "/admin/staff", label: "Staff Management", icon: MdAdminPanelSettings },
        ]
    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, adminUser, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.replace("/login");
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-green-900"><p className="text-white text-sm">Loading…</p></div>;
    if (!user) return null;

    async function handleSignOut() { await signOut(); router.replace("/login"); }

    const Sidebar = () => (
        <div className="bg-green-900 flex flex-col h-full">
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                <div className="w-9 h-9 bg-green-800 flex items-center justify-center shrink-0"><span className="text-white text-xs font-bold">E</span></div>
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-green-300">Eshmart Agrox</p>
                    <p className="text-sm font-semibold text-white">Admin Panel</p>
                </div>
            </div>
            <nav className="flex-1 py-4 overflow-y-auto">
                {navSections.map((section) => (
                    <div key={section.label}>
                        <p className="nav-section-label">{section.label}</p>
                        {section.items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`nav-item ${isActive ? "bg-green-800 text-white" : ""}`}>
                                    <item.icon size={16} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>
            <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-900 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold uppercase">{(adminUser?.name || user.email || "A")[0]}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{adminUser?.name || "Admin"}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>
                </div>
                <button onClick={handleSignOut} className="flex items-center gap-2 text-gray-400 text-xs hover:text-white transition-colors w-full">
                    <MdLogout size={14} /> Sign out
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen">
            <aside className="hidden lg:flex flex-col bg-gree-900 fixed left-0 top-0 h-full z-40 overflow-y-auto"><Sidebar /></aside>
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed left-0 top-0 h-full z-40 lg:hidden transition-transform duration-300 overflow-y-auto bg-green-900 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ width: 260 }}><Sidebar /></aside>
            <div className="flex-1 flex flex-col lg:ml-65">
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                    <button className="lg:hidden p-1" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><MdMenu size={22} /></button>
                    <div className="hidden lg:block"><p className="text-sm font-semibold text-gray-700 capitalize">{pathname.replace("/admin/", "").replace("/admin", "Dashboard") || "Dashboard"}</p></div>
                    <div className="flex items-center gap-3 ml-auto">
                        <span className="text-xs text-gray-500 hidden sm:block">{user.email}</span>
                        {adminUser?.roleId && <span className="badge badge-blue">{adminUser.roleId.replace("_", " ")}</span>}
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
