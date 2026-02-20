
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Clock, CalendarDays, User, Stethoscope } from "lucide-react";
import { getDoctorsBySpecialty, specialties } from "@/data/medicalData";

interface FollowUpRule {
  id: string;
  diagnosis: string;
  doctorName: string;
  specialty: string;
  frequency: string; // monthly, every_3_months, every_6_months, yearly
  channel: string;
  messageTemplate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  applyToAll: boolean;
}

const frequencyOptions = [
  { value: "monthly", label: "Every Month" },
  { value: "every_3_months", label: "Every 3 Months" },
  { value: "every_6_months", label: "Every 6 Months" },
  { value: "yearly", label: "Every Year" },
];

const frequencyLabels: Record<string, string> = {
  monthly: "Monthly",
  every_3_months: "Every 3 Months",
  every_6_months: "Every 6 Months",
  yearly: "Yearly",
};

const STORAGE_KEY = "followup_rules";

const FollowUpRules = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<FollowUpRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<FollowUpRule | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const [form, setForm] = useState({
    diagnosis: "",
    doctorName: "all",
    specialty: "all",
    frequency: "every_6_months",
    channel: "whatsapp",
    messageTemplate: "Dear {patient_name}, this is a reminder for your follow-up appointment regarding {diagnosis}. Please contact us to schedule your visit.",
    applyToAll: true,
  });

  const saveRules = (updated: FollowUpRule[]) => {
    setRules(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSave = () => {
    if (!form.diagnosis) {
      toast({ title: "Diagnosis is required", variant: "destructive" });
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (editingRule) {
      const updated = rules.map(r => r.id === editingRule.id ? {
        ...r,
        ...form,
      } : r);
      saveRules(updated);
      toast({ title: "Follow-up rule updated" });
    } else {
      const newRule: FollowUpRule = {
        id: Date.now().toString(),
        ...form,
        isActive: true,
        createdBy: currentUser.email || "admin",
        createdAt: new Date().toISOString(),
      };
      saveRules([...rules, newRule]);
      toast({ title: "Follow-up rule created" });
    }

    setShowDialog(false);
    setEditingRule(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      diagnosis: "",
      doctorName: "all",
      specialty: "all",
      frequency: "every_6_months",
      channel: "whatsapp",
      messageTemplate: "Dear {patient_name}, this is a reminder for your follow-up appointment regarding {diagnosis}. Please contact us to schedule your visit.",
      applyToAll: true,
    });
  };

  const deleteRule = (id: string) => {
    saveRules(rules.filter(r => r.id !== id));
    toast({ title: "Rule deleted" });
  };

  const toggleRule = (id: string) => {
    saveRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const openEdit = (rule: FollowUpRule) => {
    setEditingRule(rule);
    setForm({
      diagnosis: rule.diagnosis,
      doctorName: rule.doctorName,
      specialty: rule.specialty,
      frequency: rule.frequency,
      channel: rule.channel,
      messageTemplate: rule.messageTemplate,
      applyToAll: rule.applyToAll,
    });
    setShowDialog(true);
  };

  const filteredRules = useMemo(() => {
    if (!searchFilter) return rules;
    const s = searchFilter.toLowerCase();
    return rules.filter(r =>
      r.diagnosis.toLowerCase().includes(s) ||
      r.doctorName.toLowerCase().includes(s) ||
      r.specialty.toLowerCase().includes(s)
    );
  }, [rules, searchFilter]);

  // Get patient count affected (mock from localStorage)
  const getAffectedPatientCount = (rule: FollowUpRule) => {
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    return requests.filter((req: any) => {
      const matchesDiagnosis = req.diagnosis?.toLowerCase().includes(rule.diagnosis.toLowerCase()) ||
        req.serviceDescription?.toLowerCase().includes(rule.diagnosis.toLowerCase());
      const matchesDoctor = rule.doctorName === "all" || req.doctorName === rule.doctorName;
      return matchesDiagnosis && matchesDoctor;
    }).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Follow-Up Rules
          </h3>
          <p className="text-sm text-muted-foreground">
            Create diagnosis-based follow-up schedules for automated patient reminders
          </p>
        </div>
        <Button onClick={() => { setEditingRule(null); resetForm(); setShowDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search rules by diagnosis, doctor, or specialty..."
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
      />

      {/* Rules Table */}
      {filteredRules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No follow-up rules</h3>
            <p className="text-muted-foreground mb-4">Create rules to automate patient follow-up reminders</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map(rule => (
                <TableRow key={rule.id} className={!rule.isActive ? "opacity-60" : ""}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rule.diagnosis}</div>
                      {rule.specialty !== "all" && (
                        <Badge variant="outline" className="mt-1 text-xs">{rule.specialty}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rule.doctorName === "all" ? (
                      <Badge variant="secondary">All Doctors</Badge>
                    ) : rule.doctorName}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">
                      <Clock className="w-3 h-3 mr-1" />
                      {frequencyLabels[rule.frequency]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {rule.channel === "whatsapp" ? "WhatsApp" : rule.channel === "sms" ? "SMS" : "Both"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getAffectedPatientCount(rule)} patients</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(rule)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Follow-Up Rule" : "Create Follow-Up Rule"}</DialogTitle>
            <DialogDescription>
              Define a diagnosis-based follow-up schedule for automated patient reminders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Diagnosis / Condition *</Label>
              <Input
                placeholder="e.g. Post-Surgery Knee Replacement, Cardiac Follow-up..."
                value={form.diagnosis}
                onChange={(e) => setForm(prev => ({ ...prev, diagnosis: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Specialty</Label>
                <Select value={form.specialty} onValueChange={(v) => setForm(prev => ({ ...prev, specialty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Doctor</Label>
                <Select value={form.doctorName} onValueChange={(v) => setForm(prev => ({ ...prev, doctorName: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {[...new Set(Object.values(getDoctorsBySpecialty()).flat().map((d: any) => typeof d === 'string' ? d : d.label))].map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Follow-Up Frequency *</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm(prev => ({ ...prev, frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={(v) => setForm(prev => ({ ...prev, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.applyToAll}
                onCheckedChange={(v) => setForm(prev => ({ ...prev, applyToAll: v }))}
              />
              <Label>Apply to all matching patients</Label>
            </div>

            <div>
              <Label>Message Template</Label>
              <textarea
                className="w-full min-h-[100px] p-3 border rounded-md text-sm"
                value={form.messageTemplate}
                onChange={(e) => setForm(prev => ({ ...prev, messageTemplate: e.target.value }))}
                placeholder="Use {patient_name}, {diagnosis}, {doctor_name} as placeholders..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available placeholders: {"{patient_name}"}, {"{diagnosis}"}, {"{doctor_name}"}, {"{hospital}"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingRule ? "Update Rule" : "Create Rule"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowUpRules;
