
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquare, Plus, Sparkles, Send, Edit, Trash2, CheckCircle, XCircle, 
  Clock, Users, Phone, Bell, Shield, Copy, Eye
} from "lucide-react";

const triggerLabels: Record<string, string> = {
  request_created: "Request Created → Coordinator + Doctor + Patient",
  request_approved: "Request Approved → Patient",
  anesthesia_date_set: "Anesthesia Date Set → Patient",
  surgery_date_agreed: "Surgery Date Agreed → Patient + Doctor",
  manual: "Manual Send"
};

const channelLabels: Record<string, string> = {
  sms: "SMS",
  whatsapp: "WhatsApp",
  both: "SMS + WhatsApp"
};

const targetLabels: Record<string, string> = {
  patient: "Patient",
  doctor: "Doctor",
  coordinator: "Coordinator",
  all: "All"
};

const specialties = [
  "Cardiology", "ENT", "GIT (Gastroenterology)", "General Surgery",
  "Neurology", "Neurosurgery", "OBGYN", "Ophthalmology",
  "Orthopaedic", "Urology", "Vascular Surgery"
];

interface Template {
  id: string;
  title: string;
  trigger_event: string;
  channel: string;
  target: string;
  target_specialty: string | null;
  target_doctor_id: string | null;
  content: string;
  ai_generated_content: string | null;
  is_active: boolean;
  approval_status: string;
  created_at: string;
}

interface ApprovalRequest {
  id: string;
  template_id: string;
  old_content: string | null;
  new_content: string;
  new_title: string | null;
  status: string;
  created_at: string;
  requested_by: string;
}

const NotificationTemplates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [sendTarget, setSendTarget] = useState({ type: "all", value: "" });

  // Form state
  const [form, setForm] = useState({
    title: "",
    trigger_event: "manual",
    channel: "whatsapp",
    target: "patient",
    target_specialty: "",
    content: "",
    ai_generated_content: ""
  });

  useEffect(() => {
    loadTemplates();
    loadApprovals();
    loadLogs();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTemplates(data as any);
    }
    setLoading(false);
  };

  const loadApprovals = async () => {
    const { data } = await supabase
      .from('template_approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data) setApprovals(data as any);
  };

  const loadLogs = async () => {
    const { data } = await supabase
      .from('notification_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);
    if (data) setLogs(data);
  };

  const generateAIContent = async () => {
    if (!form.content) {
      toast({ title: "Enter your message content first", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sms', {
        body: {
          originalContent: form.content,
          trigger: form.trigger_event,
          target: form.target,
          channel: form.channel
        }
      });
      if (error) throw error;
      setForm(prev => ({ ...prev, ai_generated_content: data.content }));
      toast({ title: "AI suggestion generated!" });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to generate AI content", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const useAIContent = () => {
    if (form.ai_generated_content) {
      setForm(prev => ({ ...prev, content: prev.ai_generated_content, ai_generated_content: "" }));
    }
  };

  const saveTemplate = async () => {
    if (!form.title || !form.content) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const templateData = {
      title: form.title,
      trigger_event: form.trigger_event as "request_created" | "request_approved" | "anesthesia_date_set" | "surgery_date_agreed" | "manual",
      channel: form.channel as "sms" | "whatsapp" | "both",
      target: form.target as "patient" | "doctor" | "coordinator" | "all",
      target_specialty: form.target_specialty || null,
      content: form.content,
      ai_generated_content: form.ai_generated_content || null,
      created_by: user.id,
      approval_status: 'approved' as const
    };

    if (editingTemplate) {
      const { error } = await supabase
        .from('notification_templates')
        .update(templateData)
        .eq('id', editingTemplate.id);
      if (error) {
        toast({ title: "Failed to update template", variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase
        .from('notification_templates')
        .insert([templateData]);
      if (error) {
        toast({ title: "Failed to create template", variant: "destructive" });
        return;
      }
    }

    toast({ title: editingTemplate ? "Template updated" : "Template created" });
    setShowCreateDialog(false);
    setEditingTemplate(null);
    setForm({ title: "", trigger_event: "manual", channel: "whatsapp", target: "patient", target_specialty: "", content: "", ai_generated_content: "" });
    loadTemplates();
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from('notification_templates').delete().eq('id', id);
    if (!error) {
      toast({ title: "Template deleted" });
      loadTemplates();
    }
  };

  const toggleTemplate = async (id: string, active: boolean) => {
    await supabase.from('notification_templates').update({ is_active: !active }).eq('id', id);
    loadTemplates();
  };

  const sendManualNotification = async () => {
    if (!selectedTemplate) return;
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          templateId: selectedTemplate.id,
          targetType: sendTarget.type,
          targetValue: sendTarget.value,
          content: selectedTemplate.content,
          channel: selectedTemplate.channel
        }
      });
      if (error) throw error;
      toast({ title: "Notifications sent successfully!" });
      setShowSendDialog(false);
      loadLogs();
    } catch (e) {
      toast({ title: "Failed to send notifications", variant: "destructive" });
    }
  };

  const handleApproval = async (approvalId: string, status: 'approved' | 'rejected') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('template_approvals')
      .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq('id', approvalId);

    if (!error) {
      toast({ title: `Template change ${status}` });
      loadApprovals();
      loadTemplates();
    }
  };

  const openEdit = (template: Template) => {
    setEditingTemplate(template);
    setForm({
      title: template.title,
      trigger_event: template.trigger_event,
      channel: template.channel,
      target: template.target,
      target_specialty: template.target_specialty || "",
      content: template.content,
      ai_generated_content: template.ai_generated_content || ""
    });
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
            SMS / WhatsApp Notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage automated and manual message templates with AI assistance
          </p>
        </div>
        <Button onClick={() => { setEditingTemplate(null); setForm({ title: "", trigger_event: "manual", channel: "whatsapp", target: "patient", target_specialty: "", content: "", ai_generated_content: "" }); setShowCreateDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Pending Approvals */}
      {approvals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Pending Approvals ({approvals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvals.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{a.new_title || "Content Change"}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-md">{a.new_content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApproval(a.id, 'approved')}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleApproval(a.id, 'rejected')}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">📝 Templates</TabsTrigger>
          <TabsTrigger value="auto-triggers">⚡ Auto Triggers</TabsTrigger>
          <TabsTrigger value="logs">📊 Send Log</TabsTrigger>
          <TabsTrigger value="access">🔐 Access Control</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No templates yet</h3>
                <p className="text-muted-foreground mb-4">Create your first SMS/WhatsApp notification template</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.map(t => (
                <Card key={t.id} className={!t.is_active ? "opacity-60" : ""}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{t.title}</h3>
                          <Badge variant={t.is_active ? "default" : "secondary"}>
                            {t.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{channelLabels[t.channel]}</Badge>
                          <Badge variant="outline" className="bg-blue-50">{targetLabels[t.target]}</Badge>
                          {t.target_specialty && (
                            <Badge variant="outline" className="bg-purple-50">{t.target_specialty}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Trigger: {triggerLabels[t.trigger_event]}
                        </p>
                        <div className="bg-muted/50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                          {t.content}
                        </div>
                        {t.ai_generated_content && (
                          <div className="mt-2 bg-blue-50 p-3 rounded-lg text-sm">
                            <span className="text-blue-600 font-medium flex items-center gap-1 mb-1">
                              <Sparkles className="w-3 h-3" /> AI Alternative
                            </span>
                            {t.ai_generated_content}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Switch checked={t.is_active} onCheckedChange={() => toggleTemplate(t.id, t.is_active)} />
                        <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setSelectedTemplate(t); setShowSendDialog(true); }}>
                          <Send className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteTemplate(t.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Auto Triggers Tab */}
        <TabsContent value="auto-triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Notification Triggers</CardTitle>
              <CardDescription>These templates are sent automatically when specific events occur</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['request_created', 'request_approved', 'anesthesia_date_set', 'surgery_date_agreed'].map(trigger => {
                    const t = templates.find(tpl => tpl.trigger_event === trigger && tpl.is_active);
                    return (
                      <TableRow key={trigger}>
                        <TableCell className="font-medium">{triggerLabels[trigger]}</TableCell>
                        <TableCell>{t ? t.title : <span className="text-muted-foreground">No template assigned</span>}</TableCell>
                        <TableCell>{t ? channelLabels[t.channel] : "—"}</TableCell>
                        <TableCell>{t ? targetLabels[t.target] : "—"}</TableCell>
                        <TableCell>
                          {t ? (
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Not configured</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Send Log</CardTitle>
              <CardDescription>History of all sent SMS/WhatsApp messages</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No notifications sent yet</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Content</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs">{new Date(log.sent_at).toLocaleString()}</TableCell>
                          <TableCell>{log.recipient_name || "—"}</TableCell>
                          <TableCell className="font-mono text-xs">{log.recipient_phone || "—"}</TableCell>
                          <TableCell><Badge variant="outline">{channelLabels[log.channel]}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={log.status === 'sent' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs">{log.content}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
          <AccessControlPanel />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
            <DialogDescription>Design your SMS/WhatsApp notification message</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Title</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Surgery Confirmation" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Trigger Event</Label>
                <Select value={form.trigger_event} onValueChange={v => setForm(p => ({ ...p, trigger_event: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(triggerLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={v => setForm(p => ({ ...p, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(channelLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target</Label>
                <Select value={form.target} onValueChange={v => setForm(p => ({ ...p, target: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(targetLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Target Specialty (optional)</Label>
              <Select value={form.target_specialty} onValueChange={v => setForm(p => ({ ...p, target_specialty: v }))}>
                <SelectTrigger><SelectValue placeholder="All specialties" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specialties</SelectItem>
                  {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Message Content</Label>
              <Textarea 
                value={form.content} 
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="Dear {patient_name}, your surgery at {hospital} is confirmed for {surgery_date}..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variables: {"{patient_name}"}, {"{doctor_name}"}, {"{hospital}"}, {"{surgery_date}"}, {"{anesthesia_date}"}, {"{service}"}, {"{mrn}"}
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50/50">
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI-Generated Alternative
                </Label>
                <Button size="sm" variant="outline" onClick={generateAIContent} disabled={aiLoading}>
                  {aiLoading ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              {form.ai_generated_content ? (
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                    {form.ai_generated_content}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={useAIContent}>
                      <Copy className="w-3 h-3 mr-1" /> Use This Version
                    </Button>
                    <Button size="sm" variant="outline" onClick={generateAIContent} disabled={aiLoading}>
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Write your message first, then click "Generate with AI" to get an optimized version
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={saveTemplate}>{editingTemplate ? "Update Template" : "Create Template"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>Send "{selectedTemplate?.title}" to recipients</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Send To</Label>
              <Select value={sendTarget.type} onValueChange={v => setSendTarget(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="specialty">By Specialty</SelectItem>
                  <SelectItem value="doctor">Specific Doctor</SelectItem>
                  <SelectItem value="selected">Selected Patients</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sendTarget.type === "specialty" && (
              <div>
                <Label>Specialty</Label>
                <Select value={sendTarget.value} onValueChange={v => setSendTarget(p => ({ ...p, value: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                  <SelectContent>
                    {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {sendTarget.type === "doctor" && (
              <div>
                <Label>Doctor Name or Email</Label>
                <Input value={sendTarget.value} onChange={e => setSendTarget(p => ({ ...p, value: e.target.value }))} placeholder="Enter doctor name or email" />
              </div>
            )}
            <div className="bg-muted/50 p-3 rounded-lg">
              <Label className="text-xs text-muted-foreground">Preview:</Label>
              <p className="text-sm mt-1 whitespace-pre-wrap">{selectedTemplate?.content}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
            <Button onClick={sendManualNotification} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" /> Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Access Control Panel for template approvers
const AccessControlPanel = () => {
  const { toast } = useToast();
  const [approvers, setApprovers] = useState<any[]>([]);
  const [newApproverEmail, setNewApproverEmail] = useState("");

  useEffect(() => { loadApprovers(); }, []);

  const loadApprovers = async () => {
    const { data } = await supabase
      .from('template_approvers')
      .select('*')
      .order('created_at');
    if (data) setApprovers(data);
  };

  const addApprover = async () => {
    if (!newApproverEmail) return;
    // Look up user by email in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', newApproverEmail)
      .single();

    if (!profile) {
      toast({ title: "User not found", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('template_approvers')
      .insert({ user_id: profile.id, granted_by: user.id });

    if (error) {
      toast({ title: "Failed to add approver", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Approver added" });
      setNewApproverEmail("");
      loadApprovers();
    }
  };

  const removeApprover = async (id: string) => {
    await supabase.from('template_approvers').delete().eq('id', id);
    toast({ title: "Approver removed" });
    loadApprovers();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Template Approval Access
        </CardTitle>
        <CardDescription>
          Users who can create/edit templates and approve changes. Admins always have full access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newApproverEmail}
            onChange={e => setNewApproverEmail(e.target.value)}
            placeholder="Enter user email to grant access..."
            className="flex-1"
          />
          <Button onClick={addApprover}>
            <Plus className="w-4 h-4 mr-2" /> Add Approver
          </Button>
        </div>
        {approvers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Only admins can manage templates. Add approvers to delegate access.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Added</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvers.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.user_id}</TableCell>
                  <TableCell className="text-sm">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeApprover(a.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationTemplates;
