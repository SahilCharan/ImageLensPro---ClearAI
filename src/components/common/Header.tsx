import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Shield, LayoutDashboard, Upload as UploadIcon, Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">IL</span>
          </div>
          <span className="text-xl font-bold text-foreground">ImageLens Pro</span>
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/upload">
                <Button variant="ghost">Upload</Button>
              </Link>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                      <AvatarFallback>
                        {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-0">
                  <div className="flex flex-col">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {profile?.email}
                      </p>
                    </div>
                    <Separator />
                    <div className="p-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/')}
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/dashboard')}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/upload')}
                      >
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                      {profile?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleNavigation('/admin')}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Button>
                      )}
                    </div>
                    <Separator />
                    <div className="p-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
