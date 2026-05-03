import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Grid,
    Box,
    Users,
    Tags,
    BarChart2,
    CreditCard,
    Ticket,
    Receipt,
    LogOut,
    MoreVertical,
    User,
    Clock,
    Diamond,
    PackageSearch,
    Store
} from 'lucide-react';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState('');
    const [user, setUser] = useState({ full_name: 'User', role: 'Staff' });

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const userName = user.full_name;
    const userRole = user.role;
    const userInitial = userName.charAt(0).toUpperCase();

    // Map navigation items exactly to MVC _Layout, including RBAC logic
    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Grid, roles: ['Admin', 'Manager', 'Cashier'] },
        { name: 'Products', href: '/products', icon: Box, roles: ['Admin', 'Manager'] },
        { name: 'Categories', href: '/categories', icon: Tags, roles: ['Admin', 'Manager'] },
        // { name: 'Inventory', href: '/inventory', icon: PackageSearch, roles: ['Admin', 'Manager'] },
        { name: 'Stores', href: '/stores', icon: Store, roles: ['Admin'] },
        { name: 'Customers', href: '/customers', icon: Users, roles: ['Admin', 'Manager', 'Cashier'] },
        { name: 'Staff', href: '/staff', icon: User, roles: ['Admin'] },
        { name: 'Reports', href: '/reports', icon: BarChart2, roles: ['Admin', 'Manager'] },
        { name: 'BNPL Management', href: '/bnpl', icon: CreditCard, roles: ['Admin', 'Manager', 'Cashier'] },
        { name: 'Promo Codes', href: '/promocodes', icon: Ticket, roles: ['Admin', 'Manager'] },
    ];

    const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

    // Get Title from matched route
    const getPageTitle = () => {
        const path = location.pathname.toLowerCase();
        if (path.includes('dashboard')) return 'Store Dashboard';
        if (path.includes('checkout') || path.includes('billing')) return 'POS System';
        const item = navigation.find(n => path.includes(n.href.toLowerCase()));
        return item ? item.name : 'SmartPOS';
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8f9fa] text-[#212529] font-inter">
            <aside className="w-[280px] bg-white border-r border-[#0000001a] flex flex-col z-50">
                <div className="h-[80px] flex items-center px-6 border-b border-[#0000001a]">
                    <div className="flex items-center gap-2.5 text-[#d4af37] font-montserrat font-bold text-2xl tracking-wide">
                        <Diamond className="h-6 w-6 fill-[#d4af37]" />
                        <span>SmartPOS</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-2">
                    {filteredNavigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-[#d4af3726] to-transparent text-[#d4af37] border-l-[3px] border-[#d4af37]'
                                    : 'text-[#6c757d] hover:bg-black/5 hover:text-[#212529]'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 mr-3 text-center ${isActive ? '' : ''}`} />
                                {item.name}
                            </Link>
                        );
                    })}

                    {/* POS Link separated structurally */}
                    <div className="mt-6 pt-3">
                        <Link
                            to="/checkout"
                            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${location.pathname.includes('/checkout')
                                ? 'bg-gradient-to-r from-[#d4af3726] to-transparent text-[#d4af37] border-l-[3px] border-[#d4af37]'
                                : 'text-[#6c757d] hover:bg-black/5 hover:text-[#212529]'
                                }`}
                        >
                            <Receipt className="h-5 w-5 mr-3" />
                            POS System
                        </Link>
                    </div>
                </nav>

                {/* Footer matches .sidebar-footer */}
                <div className="p-5 border-t border-[#0000001a]">
                    <div className="flex items-center gap-3 p-3 bg-black/5 rounded-xl group relative">
                        <div className="w-10 h-10 rounded-full bg-[#d4af37] text-black font-bold flex items-center justify-center">
                            {userInitial}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <span className="block font-semibold text-sm leading-tight truncate">{userName}</span>
                            <span className="block text-xs text-[#6c757d] truncate">{userRole}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-[#6c757d] hover:text-red-600 transition-colors tooltip-trigger"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content matches .main-content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Topbar matches .top-bar (80px height) */}
                <header className="h-[80px] px-8 flex items-center justify-between bg-white border-b border-[#0000001a]">
                    <div className="page-title">
                        <h5 className="m-0 text-xl font-montserrat font-semibold tracking-wide">{getPageTitle()}</h5>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="bg-black/5 px-4 py-2 rounded-full flex items-center gap-2 font-medium border border-[#0000001a]">
                            <Clock className="h-4 w-4" />
                            <span>{currentTime}</span>
                        </div>
                    </div>
                </header>

                {/* Content wrapper matches .content-wrapper */}
                <div className="flex-1 overflow-y-auto p-8 pb-[150px]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
