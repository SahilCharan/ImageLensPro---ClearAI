import { useEffect, useState } from 'react';
import { passwordResetApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { PasswordResetRequest } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Key, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { generateMemorablePassword } from '@/utils/passwordGenerator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function PasswordResetRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await passwordResetApi.getAllPasswordResetRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading password reset requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load password reset requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApproveClick = (request: PasswordResetRequest) => {
    setSelectedRequest(request);
    const newPassword = generateMemorablePassword();
    setGeneratedPassword(newPassword);
    setShowApproveDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest || !generatedPassword) return;

    try {
      setProcessing(selectedRequest.id);

      // Approve the request and update password
      await passwordResetApi.approvePasswordResetRequest(selectedRequest.id, generatedPassword);

      // Send password to user via email
      try {
        await supabase.functions.invoke('send-password-email', {
          body: {
            email: selectedRequest.email,
            userName: selectedRequest.email.split('@')[0],
            password: generatedPassword,
            isNewAccount: false
          }
        });
      } catch (emailError) {
        console.error('Failed to send password email:', emailError);
        toast({
          title: 'Warning',
          description: 'Password updated but email notification failed. Please send password manually.',
          variant: 'destructive'
        });
      }

      toast({
        title: 'Success',
        description: 'Password reset approved and email sent to user',
      });

      setShowApproveDialog(false);
      setSelectedRequest(null);
      setGeneratedPassword('');
      loadRequests();
    } catch (error) {
      console.error('Error approving password reset:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve password reset',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await passwordResetApi.rejectPasswordResetRequest(requestId, 'Rejected by administrator');

      toast({
        title: 'Success',
        description: 'Password reset request rejected',
      });

      loadRequests();
    } catch (error) {
      console.error('Error rejecting password reset:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject password reset',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const regeneratePassword = () => {
    const newPassword = generateMemorablePassword();
    setGeneratedPassword(newPassword);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Reset Requests
          </CardTitle>
          <CardDescription>Manage user password reset requests</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password Reset Requests
              </CardTitle>
              <CardDescription>Review and approve password reset requests</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRequests}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No password reset requests found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Pending Requests ({pendingRequests.length})
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.email}</TableCell>
                            <TableCell>{format(new Date(request.requested_at), 'MMM d, yyyy HH:mm')}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveClick(request)}
                                  disabled={processing === request.id}
                                >
                                  {processing === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Accept
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(request.id)}
                                  disabled={processing === request.id}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Processed Requests */}
              {processedRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Processed Requests ({processedRequests.length})
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Processed</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.email}</TableCell>
                            <TableCell>{format(new Date(request.requested_at), 'MMM d, yyyy HH:mm')}</TableCell>
                            <TableCell>
                              {request.processed_at 
                                ? format(new Date(request.processed_at), 'MMM d, yyyy HH:mm')
                                : '-'}
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Password Reset</DialogTitle>
            <DialogDescription>
              Generate and send a new password to the user
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>User Email</Label>
                <Input value={selectedRequest.email} disabled />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated Password</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={regeneratePassword}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
                <Input
                  value={generatedPassword}
                  onChange={(e) => setGeneratedPassword(e.target.value)}
                  className="font-mono text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  This password will be sent to the user via email
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Important:</strong> The password will be sent to the user's email address. 
                  Make sure the email is correct before approving.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setSelectedRequest(null);
                setGeneratedPassword('');
              }}
              disabled={processing !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing !== null || !generatedPassword}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve & Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
