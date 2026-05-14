import {
  Loader2Icon,
  BotIcon,
  ZapIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  XCircleIcon
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { motion } from "framer-motion"

// ── Mini Robot Icon for Toasts ─────────────────────────────────────

const RobotIcon = ({ color }: { color: string }) => (
  <motion.div 
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="relative shrink-0"
  >
    <div className={`absolute inset-0 blur-lg opacity-20 ${color}`} />
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="relative z-10">
      <rect x="4" y="6" width="16" height="14" rx="5" fill="#1e1b4b" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="10" width="10" height="6" rx="3" fill="#0f172a" />
      <circle cx="10" cy="13" r="1.5" fill="currentColor" />
      <circle cx="14" cy="13" r="1.5" fill="currentColor" />
      <path d="M12 4V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
    </svg>
  </motion.div>
);

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      expand={true}
      icons={{
        success: <RobotIcon color="bg-emerald-500" />,
        info: <RobotIcon color="bg-blue-500" />,
        warning: <RobotIcon color="bg-amber-500" />,
        error: <RobotIcon color="bg-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin text-violet-500" />,
      }}
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background/80 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-foreground group-[.toaster]:border-violet-500/20 group-[.toaster]:shadow-[0_20px_50px_rgba(124,58,237,0.1)] group-[.toaster]:rounded-[24px] group-[.toaster]:p-4 group-[.toaster]:items-start",
          title: "text-[13px] font-bold tracking-tight",
          description: "group-[.toast]:text-muted-foreground text-[11px] font-medium leading-relaxed mt-1",
          actionButton: "group-[.toast]:bg-violet-600 group-[.toast]:text-white font-black uppercase tracking-widest text-[9px] rounded-xl px-4 py-2",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-black uppercase tracking-widest text-[9px] rounded-xl px-4 py-2",
        },
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "24px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
