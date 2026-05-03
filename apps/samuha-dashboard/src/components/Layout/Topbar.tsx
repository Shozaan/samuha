import { Bell, Search, Menu } from 'lucide-react';
import {
    Input,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Typography,
    Button
} from '@sujan77/ui-components';

interface TopbarProps {
    isCollapsed: boolean;
    toggleMobile: () => void;
    toggleSidebar: () => void;
}

export default function Topbar({ isCollapsed, toggleMobile, toggleSidebar }: TopbarProps) {
    return (
        <header className={`
            h-20 fixed top-0 left-0 w-full bg-card/80 backdrop-blur-md shadow-sm transition-all duration-300 z-[110]
            ${isCollapsed ? 'md:pl-20' : 'md:pl-60'}
        `}>
            <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (window.innerWidth >= 768) {
                                toggleSidebar();
                            } else {
                                toggleMobile();
                            }
                        }}
                        className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center border border-transparent hover:border-primary/20"
                        title="Toggle Navigation"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="hidden md:flex items-center gap-4 bg-muted px-4 py-1.5 rounded-xl w-64 lg:w-96 border border-border group focus-within:border-primary/50 transition-all">
                        <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 w-full"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted transition-all group">
                        <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card shadow-sm"></span>
                    </Button>

                    <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-border">
                        <div className="text-right hidden sm:block">
                            <Typography variant="small" className="font-semibold text-foreground block text-sm">Admin User</Typography>
                            <Typography variant="muted" className="text-[10px] text-primary uppercase font-bold">Group Admin</Typography>
                        </div>
                        <Avatar className="w-10 h-10 border-2 border-primary/20 p-0.5">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">AD</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    );
}
