import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/layouts/ThemeToggle';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  primaryAction?: React.ReactNode;
}

export function Header({ title, subtitle, actions, primaryAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-[49] w-full border-b border-border/40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl shrink-0 h-[72px] flex items-center transition-all duration-500">
      <div className="px-8 w-full flex items-center">
        <div className="flex items-center justify-between gap-6 w-full">
          {/* Left: Title & Subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-foreground tracking-tight truncate italic bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground/80 text-[11px] font-bold uppercase tracking-widest mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Center/Right: Actions & Switcher */}
          <div className="flex items-center gap-6 shrink-0">
            {actions && (
              <div className="hidden xl:flex items-center gap-4">
                {actions}
              </div>
            )}
            
            {primaryAction && (
              <div className="hidden md:block">
                <div className="transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  {primaryAction}
                </div>
              </div>
            )}

            <div className="h-8 w-[1px] bg-border/40 mx-1 hidden sm:block" />
            
            <div className="transition-transform duration-300 hover:rotate-12">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
