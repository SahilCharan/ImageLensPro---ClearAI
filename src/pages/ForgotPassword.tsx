import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { passwordResetApi } from '@/db/api';
import { supabase } from '@/db/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'not-found' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Check if email exists in database
      const { exists, user } = await passwordResetApi.checkEmailExists(email);

      if (!exists || !user) {
        setStatus('not-found');
        setIsLoading(false);
        return;
      }

      // Create password reset request
      await passwordResetApi.createPasswordResetRequest(email, user.id);

      // Send notification to admins via Edge Function
      try {
        await supabase.functions.invoke('notify-password-reset', {
          body: {
            email,
            userName: user.full_name || 'User',
            userId: user.id
          }
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail the request if email fails
      }

      setStatus('success');
    } catch (error) {
      console.error('Password reset request error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send a password reset request to the administrator
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Password reset request submitted successfully! An administrator will review your request and send you your password via email.
              </AlertDescription>
            </Alert>
          )}

          {status === 'not-found' && (
            <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
              <XCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                Email not found. Please create an account to use our features.
                <Link to="/request-account" className="block mt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && errorMessage && (
            <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading || status === 'success'}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || status === 'success'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Request Submitted
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Remember your password?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-muted-foreground mt-2">
              Don't have an account?{' '}
              <Link to="/request-account" className="text-primary hover:underline font-medium">
                Request access
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">How it works:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Enter your registered email address</li>
              <li>We'll verify your account exists</li>
              <li>An administrator will review your request</li>
              <li>You'll receive your password via email once approved</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
