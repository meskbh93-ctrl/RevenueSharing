import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { useTheme } from '@/lib/theme.jsx';
import { 
  BookOpen, Package, DollarSign, Clock, LayoutDashboard, Home,
  Bot, Sun, Moon, Languages, ChevronLeft, ChevronRight, BarChart2, LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';


const navItems = [
  { key: 'home', path: '/', icon: Home },
  { key: 'introduction', path: '/introduction', icon: BookOpen },
  { key: 'services', path: '/services', icon: Package },
  { key: 'costs', path: '/costs', icon: DollarSign },
  { key: 'incomeSharing', path: '/income-sharing', icon: Clock },
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'chatbot', path: '/chatbot', icon: Bot },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { t, isRTL, toggleLang, lang } = useI18n();
  const { toggleTheme, isDark } = useTheme();
  const { logout } = useAuth();
  const location = useLocation();

  const renderNavItem = ({ key, path, icon: Icon }) => {
    const isActive = location.pathname === path;
    return (
      <Link
        key={key}
        to={path}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
          isActive
            ? "bg-accent text-white font-semibold"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? t(key) : undefined}
      >
        {Icon && <Icon className="w-5 h-5 shrink-0" />}
        {!collapsed && <span className="truncate">{t(key)}</span>}
      </Link>
    );
  };

  return (
    <aside className={cn(
      "fixed top-0 h-screen bg-sidebar text-sidebar-foreground border-sidebar-border z-50 flex flex-col transition-all duration-300",
      isRTL ? "right-0 border-l" : "left-0 border-r",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo/App Header */}
      <div className={cn("p-4 border-b border-sidebar-border", collapsed ? "flex justify-center" : "")}>
        {!collapsed && (
          <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#2e2e38] flex items-center justify-center shrink-0">
            <img src="https://media.base44.com/images/public/6a0d9196a69e95c6facc0eaf/e75b7f1c6_image.png" alt="EY" className="w-full h-full object-contain p-1" />
          </div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm text-white">{t('appName')}</p>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
          </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => renderNavItem(item))}
      </nav>

      {/* Bottom controls */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {/* Light/Dark Mode */}
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          {isDark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{isDark ? (lang === 'ar' ? 'وضع نهاري' : 'Light Mode') : (lang === 'ar' ? 'وضع ليلي' : 'Dark Mode')}</span>}
        </button>

        {/* Language */}
        <button
          onClick={toggleLang}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <Languages className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{lang === 'ar' ? 'English' : 'عربي'}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>}
        </button>

        {/* Collapse */}
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          {isRTL ? (
            collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          )}
          {!collapsed && <span>{lang === 'ar' ? 'طي القائمة' : 'Collapse'}</span>}
        </button>
      </div>
    </aside>
  );
}