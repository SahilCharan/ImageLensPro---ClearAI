import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { accountRequestApi } from '@/db/api';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function RequestAccount() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }
    
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [username, domain] = parts;
    
    if (username.length < 1) return false;
    
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    
    for (const part of domainParts) {
      if (part.length < 1) return false;
    }
    
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) return false;
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your full name',
        variant: 'destructive'
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address (e.g., user@example.com)',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive'
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      await accountRequestApi.createAccountRequest({
        full_name: fullName,
        email,
        password,
        message: message.trim() || undefined
      });

      setSubmitted(true);
      toast({
        title: 'Request Submitted',
        description: 'Your account request has been submitted successfully. You will be notified once approved.',
      });
    } catch (error) {
      console.error('Account request error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit account request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-accent" />
            </div>
            <CardTitle className="text-2xl">Request Submitted</CardTitle>
            <CardDescription>
              Your account request has been submitted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                An administrator will review your request and notify you via email once your account is approved.
              </p>
              <p className="text-sm text-muted-foreground">
                This usually takes 1-2 business days.
              </p>
            </div>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/clearai-logo.png" alt="ClearAI" className="h-12" />
          </div>
          <CardTitle className="text-2xl">Request Account Access</CardTitle>
          <CardDescription>
            Submit a request to create your ClearAI account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Reason for Access (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell us why you need access to ClearAI..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Providing a reason helps us process your request faster
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Your request will be reviewed by an administrator. You will receive an email notification once your account is approved.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
