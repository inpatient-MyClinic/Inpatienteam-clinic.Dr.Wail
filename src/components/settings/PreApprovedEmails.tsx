import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface PreApprovedEmail {
  id: string;
  email: string;
  added_at: string;
  notes?: string;
}

const PreApprovedEmails = () => {
  const [emails, setEmails] = useState<PreApprovedEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreApprovedEmails();
  }, []);

  const fetchPreApprovedEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('pre_approved_emails')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching pre-approved emails:', error);
      toast.error('Failed to load pre-approved emails');
    } finally {
      setLoading(false);
    }
  };

  const addPreApprovedEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if it's a @myclinic.com.sa email
    if (newEmail.toLowerCase().endsWith('@myclinic.com.sa')) {
      toast.error('@myclinic.com.sa emails are already allowed and don\'t need pre-approval');
      return;
    }

    try {
      const { error } = await supabase
        .from('pre_approved_emails')
        .insert({
          email: newEmail.toLowerCase().trim(),
          notes: newNotes.trim() || null,
          added_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('This email is already pre-approved');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Email pre-approved successfully');
      setNewEmail('');
      setNewNotes('');
      fetchPreApprovedEmails();
    } catch (error) {
      console.error('Error adding pre-approved email:', error);
      toast.error('Failed to add pre-approved email');
    }
  };

  const removePreApprovedEmail = async (id: string, email: string) => {
    try {
      const { error } = await supabase
        .from('pre_approved_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(`Removed ${email} from pre-approved list`);
      fetchPreApprovedEmails();
    } catch (error) {
      console.error('Error removing pre-approved email:', error);
      toast.error('Failed to remove pre-approved email');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pre-Approved Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Pre-Approved Emails
        </CardTitle>
        <CardDescription>
          Manage email addresses that are allowed to register from non-@myclinic.com.sa domains.
          Users with @myclinic.com.sa emails can always register and will appear for admin approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Email Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Pre-Approved Email
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@external-domain.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Reason for pre-approval..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <Button onClick={addPreApprovedEmail} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Email
          </Button>
        </div>

        {/* Domain Access Rules */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Domain Access Rules</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">Allowed</Badge>
              <span>@myclinic.com.sa emails can register directly (require admin approval)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pre-Approved</Badge>
              <span>Other domains can only register if pre-approved by admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Blocked</Badge>
              <span>All other emails are blocked from registration</span>
            </div>
          </div>
        </div>

        {/* Pre-Approved Emails Table */}
        {emails.length > 0 ? (
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Pre-Approved Emails ({emails.length})
            </h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.email}</TableCell>
                      <TableCell>{formatDate(email.added_at)}</TableCell>
                      <TableCell>
                        {email.notes ? (
                          <span className="text-sm text-gray-600">{email.notes}</span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No notes</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Pre-Approved Email</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove <strong>{email.email}</strong> from the pre-approved list? 
                                This user will no longer be able to register.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => removePreApprovedEmail(email.id, email.email)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No pre-approved emails yet</p>
            <p className="text-sm">Add emails from external domains to allow registration</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreApprovedEmails;