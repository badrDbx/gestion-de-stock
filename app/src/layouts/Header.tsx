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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xl shrink-0 h-[61px] flex items-center">
      <div className="px-6 w-full flex items-center">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left: Title & Subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-sm mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          {/* Center/Right: Actions & Switcher */}
          <div className="flex items-center gap-4 shrink-0">
            {actions && (
              <div className="hidden lg:flex items-center gap-3">
                {actions}
              </div>
            )}
            
            {primaryAction && (
              <div className="hidden sm:block">
                {primaryAction}
              </div>
            )}


            
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile/Tablet Actions (Below title on small screens) */}
        {(actions || primaryAction) && (
          <div className="lg:hidden flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
            {actions}
            <div className="flex-1" />
            {primaryAction}
          </div>
        )}
      </div>
    </header>
  );
}
