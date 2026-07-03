import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Wallet,
    HandCoins,
    AlertCircle,
    ReceiptText,
    Activity,
    FileBarChart,
    Settings,
    LogOut,
    ChevronLeft,
    PanelLeft,
    Shield,
    CreditCard
} from 'lucide-react';
import { Button, Typography } from '@sujan77/ui-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'member'] },
    { icon: Shield, label: 'Groups', path: '/groups', roles: ['admin', 'member'] },
    { icon: Users, label: 'Family Members', path: '/members', roles: ['admin', 'member'] },
    { icon: Users, label: 'Users', path: '/users', roles: ['admin'] },
    { icon: Wallet, label: 'Deposits', path: '/deposits', roles: ['admin', 'member'] },
    { icon: HandCoins, label: 'Loans', path: '/loans', roles: ['admin', 'member'] },
    { icon: CreditCard, label: 'Repayments', path: '/repayments', roles: ['admin', 'member'] },
    { icon: AlertCircle, label: 'Fines', path: '/fines', roles: ['admin', 'member'] },
    { icon: ReceiptText, label: 'Expenses', path: '/expenses', roles: ['admin', 'member'] },
    { icon: Activity, label: 'Activity', path: '/activity', roles: ['admin', 'member'] },
    { icon: FileBarChart, label: 'Reports', path: '/reports', roles: ['admin'] },
    { icon: Settings, label: 'Settings', path: '/settings/group', roles: ['admin'] },
];

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobileOpen: boolean;
    toggleMobile: () => void;
}

export default function Sidebar({ isCollapsed, toggleSidebar, isMobileOpen, toggleMobile }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, role, logout } = useAuth();

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true;

        // System Admin check (Global role)
        if (role?.toUpperCase() === 'ADMIN') return true;

        if (!user) return false;

        // Check membership roles
        const membershipRoles = user.memberships?.map(m => m.role.toUpperCase()) || [];
        return item.roles.some(navRole => membershipRoles.includes(navRole.toUpperCase()));
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`
            fixed top-0 left-0 h-screen bg-card flex flex-col z-[150] transition-all duration-300 shadow-xl overflow-x-hidden
            ${isCollapsed ? 'w-20' : 'w-60'}
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            {/* Header / Logo */}
            <div className={`h-20 flex items-center px-6 bg-primary/5 ${isCollapsed ? 'justify-center px-0' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    {!isCollapsed && (
                        <Typography variant="h4" className="font-black text-foreground tracking-tight">
                            SAMUHA
                        </Typography>
                    )}
                </div>
            </div>

            {/* Desktop Collapse Toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                }}
                className="hidden md:flex absolute -right-3.5 top-[72px] w-7 h-7 bg-card border border-border rounded-full items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all z-[200] shadow-md group"
            >
                {isCollapsed ? (
                    <PanelLeft className="w-3.5 h-3.5" />
                ) : (
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                )}
            </button>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 pt-4 overflow-y-auto overflow-x-hidden no-scrollbar">
                {filteredNavItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => isMobileOpen && toggleMobile()}
                            className={`
                                flex items-center rounded-xl transition-all duration-200 group relative
                                ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}
                                ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }
                            `}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'group-hover:text-primary transition-colors'}`} />
                            {!isCollapsed && (
                                <span className="font-medium text-sm truncate animate-in fade-in slide-in-from-left-2 duration-300">
                                    {item.label}
                                </span>
                            )}
                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100]">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className={`mt-auto p-3`}>
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={`
                        w-full justify-start rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200
                        ${isCollapsed ? 'px-0 justify-center h-12' : 'gap-3 px-4 py-6'}
                    `}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                </Button>
            </div>
        </aside>
    );
}
