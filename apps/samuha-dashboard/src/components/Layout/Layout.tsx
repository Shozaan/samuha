import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    return (
        <div className="min-h-screen bg-background relative">
            <Topbar
                isCollapsed={isCollapsed}
                toggleMobile={toggleMobile}
                toggleSidebar={toggleSidebar}
            />

            <Sidebar
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                isMobileOpen={isMobileOpen}
                toggleMobile={toggleMobile}
            />

            <div className={`
                min-h-screen transition-all duration-300 pt-20
                ${isCollapsed ? 'md:pl-20' : 'md:pl-60'}
            `}>
                <main className="p-4 md:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[140] md:hidden animate-in fade-in duration-300"
                    onClick={toggleMobile}
                />
            )}
        </div>
    );
}
