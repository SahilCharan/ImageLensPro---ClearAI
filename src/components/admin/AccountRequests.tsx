import { useEffect, useState } from 'react';
import { accountRequestApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { AccountRequest } from '@/types/types';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2, RefreshCw, UserPlus, Mail } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { generateMemorablePassword } from '@/utils/passwordGenerator';

export default function AccountRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await accountRequestApi.getAllAccountRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading account requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load account requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApproveClick = (request: AccountRequest) => {
    setSelectedRequest(request);
    const newPassword = generateMemorablePassword();
    setGeneratedPassword(newPassword);
    setShowApproveDialog(true);
  };

  const regeneratePassword = () => {
    const newPassword = generateMemorablePassword();
    setGeneratedPassword(newPassword);
  };

  const handleApprove = async () => {
    if (!selectedRequest || !generatedPassword) return;

    try {
      setProcessing(selectedRequest.id);
      
      // Approve the account request with generated password
      await accountRequestApi.approveAccountRequest(selectedRequest.id, generatedPassword);

      // Send password to user via email
      try {
        await supabase.functions.invoke('send-password-email', {
          body: {
            email: selectedRequest.email,
            userName: selectedRequest.full_name || selectedRequest.email.split('@')[0],
            password: generatedPassword,
            isNewAccount: true
          }
        });
      } catch (emailError) {
        console.error('Failed to send password email:', emailError);
        toast({
          title: 'Warning',
          description: 'Account created but email notification failed. Please send password manually.',
          variant: 'destructive'
        });
      }
      
      toast({
        title: 'Success',
        description: 'Account approved and password sent to user',
      });

      setShowApproveDialog(false);
      setSelectedRequest(null);
      setGeneratedPassword('');
      await loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve account request',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await accountRequestApi.rejectAccountRequest(requestId);
      
      toast({
        title: 'Success',
        description: 'Account request rejected',
      });
      
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject account request',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await accountRequestApi.deleteAccountRequest(requestId);
      
      toast({
        title: 'Success',
        description: 'Account request deleted',
      });
      
      await loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete account request',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const showDetails = (request: AccountRequest) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Account Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Account Requests
              </CardTitle>
              <CardDescription>
                Manage user account access requests
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRequests}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingRequests.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {approvedRequests.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {rejectedRequests.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No account requests found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.full_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {request.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showDetails(request)}
                          >
                            Details
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveClick(request)}
                                disabled={processing === request.id}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                {processing === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                                disabled={processing === request.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {processing === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                          {request.status !== 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(request.id)}
                              disabled={processing === request.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {processing === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Request Details</DialogTitle>
            <DialogDescription>
              Review the details of this account request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm mt-1">{selectedRequest.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm mt-1">{selectedRequest.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reason for Access</label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {selectedRequest.message || 'No reason provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Requested On</label>
                <p className="text-sm mt-1">
                  {format(new Date(selectedRequest.created_at), 'MMMM d, yyyy \'at\' HH:mm')}
                </p>
              </div>
              {selectedRequest.approved_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {selectedRequest.status === 'approved' ? 'Approved On' : 'Rejected On'}
                  </label>
                  <p className="text-sm mt-1">
                    {format(new Date(selectedRequest.approved_at), 'MMMM d, yyyy \'at\' HH:mm')}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleApproveClick(selectedRequest);
                    setShowDetailsDialog(false);
                  }}
                  disabled={processing === selectedRequest.id}
                  className="text-green-600 hover:text-green-700 border-green-200"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleReject(selectedRequest.id);
                    setShowDetailsDialog(false);
                  }}
                  disabled={processing === selectedRequest.id}
                  className="text-red-600 hover:text-red-700 border-red-200"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Account Request</DialogTitle>
            <DialogDescription>
              Generate and send a password to the new user
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>User Name</Label>
                <Input value={selectedRequest.full_name} disabled />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
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

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>ℹ️ Note:</strong> The user will receive their password via email. 
                  They can use the "Forgot Password" feature if they need to reset it later.
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
