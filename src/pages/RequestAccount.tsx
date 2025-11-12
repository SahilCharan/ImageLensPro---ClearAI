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
import Logo from '@/components/common/Logo';

export default function RequestAccount() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
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

    setLoading(true);

    try {
      console.log('Submitting account request...', { full_name: fullName, email });
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      const result = await accountRequestApi.createAccountRequest({
        full_name: fullName,
        email,
        message: message.trim() || undefined
      });

      console.log('Account request created successfully:', result);

      // Try to send email notification to admins
      try {
        console.log('Sending email notification to admins...');
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            type: 'new_account_request',
            data: {
              full_name: fullName,
              email,
              message: message.trim() || 'No message provided'
            }
          })
        });
        console.log('Email notification sent successfully');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the whole request if email fails
      }

      setSubmitted(true);
      toast({
        title: 'Request Submitted',
        description: 'Your account request has been submitted successfully. Admins will be notified via email.',
      });
    } catch (error) {
      console.error('Account request error:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // More detailed error message
      let errorMessage = 'Failed to submit account request. Please try again.';
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        errorMessage = error.message;
        
        // Check for specific error types
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          errorMessage = 'An account request with this email already exists.';
        } else if (error.message.includes('permission') || error.message.includes('denied')) {
          errorMessage = 'Permission denied. Please contact support.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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
            <Logo className="h-12" />
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

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>ℹ️ Note:</strong> Once your request is approved, you'll receive a system-generated password via email. 
                You can change it later using the "Forgot Password" feature.
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
