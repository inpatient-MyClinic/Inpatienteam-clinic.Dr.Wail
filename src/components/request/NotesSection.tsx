
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { RequestFormData } from "@/types/request";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Check, X, Loader2, Lightbulb, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NotesSectionProps {
  form: Partial<RequestFormData>;
  onFieldChange: (key: string, value: string) => void;
}

interface CodeItem {
  code: string;
  description: string;
  reasoning: string;
}

interface AISuggestion {
  icdCodes: CodeItem[];
  procedureCodes: CodeItem[];
  suggestedHistory: string;
  tips: string[];
}

const NotesSection = ({ form, onFieldChange }: NotesSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [selectedIcdCodes, setSelectedIcdCodes] = useState<Set<string>>(new Set());
  const [selectedProcCodes, setSelectedProcCodes] = useState<Set<string>>(new Set());
  const [freeTextDiagnosis, setFreeTextDiagnosis] = useState("");
  const [freeTextProcedure, setFreeTextProcedure] = useState("");
  const { toast } = useToast();

  // Parse current multi-value fields
  const diagnosisList = (form.diagnosis || "").split(";").map(s => s.trim()).filter(Boolean);
  const procedureList = (form.serviceDescription || "").split(";").map(s => s.trim()).filter(Boolean);

  const updateDiagnosis = (items: string[]) => {
    onFieldChange("diagnosis", items.join("; "));
  };

  const updateProcedures = (items: string[]) => {
    onFieldChange("serviceDescription", items.join("; "));
  };

  const handleGetSuggestions = async () => {
    if (!form.history?.trim() && !form.diagnosis?.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a history or diagnosis before requesting AI suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);
    setSelectedIcdCodes(new Set());
    setSelectedProcCodes(new Set());

    try {
      const { data, error } = await supabase.functions.invoke("suggest-icd-history", {
        body: {
          history: form.history || "",
          diagnosis: form.diagnosis || "",
          specialty: form.specialty || "",
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        return;
      }

      setSuggestion(data as AISuggestion);
      toast({ title: "Suggestions Ready", description: "ICD codes and procedure codes generated." });
    } catch (err) {
      console.error("AI suggestion error:", err);
      toast({ title: "Error", description: "Failed to get AI suggestions.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIcdCode = (code: string, description: string) => {
    const key = `${code} - ${description}`;
    const next = new Set(selectedIcdCodes);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedIcdCodes(next);
  };

  const toggleProcCode = (code: string, description: string) => {
    const key = `${code} - ${description}`;
    const next = new Set(selectedProcCodes);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedProcCodes(next);
  };

  const applySelectedDiagnoses = () => {
    const newItems = Array.from(selectedIcdCodes).filter(item => !diagnosisList.includes(item));
    updateDiagnosis([...diagnosisList, ...newItems]);
    setSelectedIcdCodes(new Set());
    toast({ title: "Added", description: `${newItems.length} diagnosis code(s) added.` });
  };

  const applySelectedProcedures = () => {
    const newItems = Array.from(selectedProcCodes).filter(item => !procedureList.includes(item));
    updateProcedures([...procedureList, ...newItems]);
    setSelectedProcCodes(new Set());
    toast({ title: "Added", description: `${newItems.length} procedure code(s) added.` });
  };

  const addFreeTextDiagnosis = () => {
    if (!freeTextDiagnosis.trim()) return;
    updateDiagnosis([...diagnosisList, freeTextDiagnosis.trim()]);
    setFreeTextDiagnosis("");
  };

  const addFreeTextProcedure = () => {
    if (!freeTextProcedure.trim()) return;
    updateProcedures([...procedureList, freeTextProcedure.trim()]);
    setFreeTextProcedure("");
  };

  const removeDiagnosis = (index: number) => {
    updateDiagnosis(diagnosisList.filter((_, i) => i !== index));
  };

  const removeProcedure = (index: number) => {
    updateProcedures(procedureList.filter((_, i) => i !== index));
  };

  const handleAcceptHistory = () => {
    if (suggestion?.suggestedHistory) {
      onFieldChange("history", suggestion.suggestedHistory);
      toast({ title: "Accepted", description: "Suggested history has been applied." });
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Clinical Details & AI Assistance</h3>

      {/* History */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">History</label>
        <Textarea
          value={form.history || ""}
          onChange={(e) => onFieldChange("history", e.target.value)}
          rows={3}
          placeholder="Enter patient clinical history..."
        />
      </div>

      {/* AI Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGetSuggestions}
        disabled={isLoading}
        className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {isLoading ? "Analyzing..." : "Get ICD Codes, Procedures & Approval Suggestions"}
      </Button>

      {/* Selected Diagnoses */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">Diagnosis Codes</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
          {diagnosisList.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1">
              {item}
              <button type="button" onClick={() => removeDiagnosis(idx)} className="ml-1 hover:text-red-600">
                <Trash2 className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {diagnosisList.length === 0 && (
            <span className="text-sm text-gray-400">No diagnosis codes added yet</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={freeTextDiagnosis}
            onChange={(e) => setFreeTextDiagnosis(e.target.value)}
            placeholder="Add custom diagnosis code or text..."
            className="flex-1"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFreeTextDiagnosis(); } }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addFreeTextDiagnosis}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Selected Procedures */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">Procedure / Package Codes</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
          {procedureList.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1">
              {item}
              <button type="button" onClick={() => removeProcedure(idx)} className="ml-1 hover:text-red-600">
                <Trash2 className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {procedureList.length === 0 && (
            <span className="text-sm text-gray-400">No procedure codes added yet</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={freeTextProcedure}
            onChange={(e) => setFreeTextProcedure(e.target.value)}
            placeholder="Add custom procedure code or text..."
            className="flex-1"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFreeTextProcedure(); } }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addFreeTextProcedure}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {suggestion && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2">
          {/* ICD Codes - Selectable */}
          {suggestion.icdCodes?.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                  <Sparkles className="w-4 h-4" />
                  Suggested ICD-10 Diagnosis Codes
                </CardTitle>
                <p className="text-xs text-blue-600">Select codes to add to diagnosis</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestion.icdCodes.map((icd, idx) => {
                  const key = `${icd.code} - ${icd.description}`;
                  const isSelected = selectedIcdCodes.has(key);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIcdCode(icd.code, icd.description)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-100 border-blue-400 ring-2 ring-blue-300"
                          : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className={`mt-1 h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <Badge variant="secondary" className="font-mono text-sm bg-blue-100 text-blue-800 mb-1">
                          {icd.code}
                        </Badge>
                        <p className="text-sm font-medium text-gray-800">{icd.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{icd.reasoning}</p>
                      </div>
                    </div>
                  );
                })}
                {selectedIcdCodes.size > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={applySelectedDiagnoses}
                    className="mt-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Add {selectedIcdCodes.size} Selected to Diagnosis
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Procedure Codes - Selectable */}
          {suggestion.procedureCodes?.length > 0 && (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-purple-800">
                  <Sparkles className="w-4 h-4" />
                  Suggested Procedure / Package Codes
                </CardTitle>
                <p className="text-xs text-purple-600">Select codes to add to procedures</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestion.procedureCodes.map((proc, idx) => {
                  const key = `${proc.code} - ${proc.description}`;
                  const isSelected = selectedProcCodes.has(key);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleProcCode(proc.code, proc.description)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-purple-100 border-purple-400 ring-2 ring-purple-300"
                          : "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                      }`}
                    >
                      <div className={`mt-1 h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300'}`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <Badge variant="secondary" className="font-mono text-sm bg-purple-100 text-purple-800 mb-1">
                          {proc.code}
                        </Badge>
                        <p className="text-sm font-medium text-gray-800">{proc.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{proc.reasoning}</p>
                      </div>
                    </div>
                  );
                })}
                {selectedProcCodes.size > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={applySelectedProcedures}
                    className="mt-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Add {selectedProcCodes.size} Selected to Procedures
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Suggested History Rewrite */}
          {suggestion.suggestedHistory && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-green-800">
                  <Lightbulb className="w-4 h-4" />
                  Suggested History for Approval
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white rounded-lg border text-sm text-gray-700 whitespace-pre-wrap">
                  {suggestion.suggestedHistory}
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={handleAcceptHistory} className="bg-green-600 hover:bg-green-700">
                    <Check className="w-3 h-3 mr-1" /> Use Suggested History
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSuggestion(null)}>
                    <X className="w-3 h-3 mr-1" /> Keep Original
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {suggestion.tips?.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-800">💡 Approval Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
                  {suggestion.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">Notes (optional)</label>
        <Textarea
          value={form.notes || ""}
          onChange={(e) => onFieldChange("notes", e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
};

export default NotesSection;
