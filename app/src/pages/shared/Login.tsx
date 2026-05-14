import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Package, ClipboardList, Zap, Shield, ChevronRight, Eye, EyeOff, Lock, Mail, Activity } from "lucide-react";

const FeatureCard = ({ icon, label, delay }: { icon: React.ReactNode, label: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20 shadow-sm backdrop-blur-md hover:bg-white/20 transition-colors"
  >
    <div className="flex items-center justify-center w-12 h-12 rounded-[14px] bg-white/20 text-white">
      {icon}
    </div>
    <span className="text-sm font-bold text-white">{label}</span>
  </motion.div>
);

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error("Champs requis", { description: "Veuillez remplir tous les champs." });
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        toast.success(`Accès autorisé`, { description: `Bienvenue, ${user.name}` });
        navigate(user.role === 'admin' ? '/admin' : '/portal');
      } else {
        toast.error('Accès refusé', { description: 'Identifiants invalides.' });
      }
    } catch {
      toast.error('Erreur serveur', { description: 'Connexion impossible.' });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Package size={20} strokeWidth={2.5} />, label: "Catalogue unifié" },
    { icon: <ClipboardList size={20} strokeWidth={2.5} />, label: "Suivi des demandes" },
    { icon: <Zap size={20} strokeWidth={2.5} />, label: "Traitement rapide" },
    { icon: <Shield size={20} strokeWidth={2.5} />, label: "Hautement sécurisé" },
  ];

  return (
    <div 
      className="min-h-screen w-full flex bg-cover bg-center bg-no-repeat font-sans relative light"
      style={{ backgroundImage: `url('/bg.png')`, colorScheme: 'light' }}
    >
      {/* Overlay to ensure readability and contrast */}
      <div className="absolute inset-0 bg-slate-900/40"></div>
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[45%] xl:w-[50%] flex-col justify-between p-8 xl:p-16 relative z-10">
        
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 self-start backdrop-blur-md">
            <Activity size={14} className="text-white" />
            <span className="text-xs font-bold text-white tracking-wide uppercase">Portail Logistique</span>
          </div>
          
          <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-4 drop-shadow-md">
            Gérez vos ressources<br />
            simplement.
          </h1>
          
          <p className="text-lg text-white/90 leading-relaxed max-w-md font-medium mb-8 drop-shadow-sm">
            Une plateforme centralisée et intuitive pour soumettre vos demandes de matériel, suivre vos commandes et optimiser l'allocation.
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-lg">
            {features.map((f, i) => (
              <FeatureCard key={i} icon={f.icon} label={f.label} delay={0.4 + i * 0.1} />
            ))}
          </div>
        </div>

        {/* Footer info on left panel */}
        <div className="relative z-10 mt-8">
          <p className="text-sm font-semibold text-white/60">
            © {new Date().getFullYear()} CHU Stock. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Login form vertically centered */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 xl:p-16 relative z-10">
        
        <motion.div
          className="w-full max-w-[480px] bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_80px_rgb(0,0,0,0.15)] border border-white"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-0 mb-2">
              <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain drop-shadow-sm" />
              <span className="text-3xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-[#4b69a7] to-[#2a3f6d] translate-y-3 -ml-2">
                Stock
              </span>
            </div>
            <p className="text-slate-500 text-[15px] font-medium text-center">
              Connectez-vous à votre espace sécurisé
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Adresse email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@gmail.com"
                  autoComplete="off"
                  className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-white/60 border border-slate-200/60 text-slate-900 text-[15px] font-medium placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-600 transition-colors" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  autoComplete="new-password"
                  className="w-full h-[52px] pl-12 pr-12 rounded-xl bg-white/50 border border-white/60 text-slate-900 text-[15px] font-medium placeholder:text-slate-500 focus:bg-white/80 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors focus:outline-none"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] mt-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group shadow-md shadow-violet-600/20"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  />
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                        Se connecter
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </form>


        </motion.div>
      </div>
    </div>
  );
}
