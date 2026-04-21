import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-4xl font-bold mb-2">403</h1>
      <p className="text-xl text-muted-foreground mb-6">Accès non autorisé.</p>
      <Button asChild>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  );
}
