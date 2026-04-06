import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Home, BookOpen, FileText, Video, Rocket, Sun, Moon, ShieldCheck, Globe, Gift, ClipboardList, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-4 mx-4 md:mx-8 z-50 rounded-2xl glass-morphism px-6 py-3 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 no-underline group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            L
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 font-sans tracking-tight">
            LevelUp
          </span>
        </Link>

        {/* Authenticated Navigation */}
        {user ? (
          <div className="flex items-center gap-1 md:gap-2">
            {[
              { path: '/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
              { path: '/modules', icon: <BookOpen size={18} />, label: 'Learn' },
              { path: '/resume', icon: <FileText size={18} />, label: 'Resume' },
              { path: '/interview', icon: <Video size={18} />, label: 'Interview' },
              { path: '/assessment', icon: <ClipboardList size={18} />, label: 'Assessment' },
              { path: '/roadmap', icon: <Rocket size={18} />, label: 'Roadmap' },
              { path: '/activities', icon: <Globe size={18} />, label: 'Programs' },
              { path: '/benefits', icon: <Gift size={18} />, label: 'Benefits' },
              // Admin link — only shown for non-student roles
              ...(['faculty','hod','principal','placement','admin'].includes(user.role)
                ? [{ path: '/admin', icon: <ShieldCheck size={18} />, label: 'Admin' }]
                : []
              )
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-foreground",
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.icon}
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            ))}
            
            <div className="w-[1px] h-6 bg-border mx-2"></div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link 
              to="/profile" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors mx-1"
            >
              <User size={16} /> 
              <span className="hidden sm:block">{user.name?.split(' ')[0]}</span>
            </Link>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 p-2 px-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
            >
              <LogOut size={16} /> <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="px-5 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
