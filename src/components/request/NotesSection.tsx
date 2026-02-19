
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { RequestFormData } from "@/types/request";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Check, X, Loader2, Lightbulb, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import VoiceDictationButton from "./VoiceDictationButton";

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

interface AutocompleteItem {
  code: string;
  description: string;
  relevant: boolean;
}

interface DiagnosisEntry {
  text: string;
  relevant: boolean;
}

// Custom hook for debounced autocomplete
function useCodeAutocomplete(type: "diagnosis" | "procedure", history: string, specialty: string) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("code-autocomplete", {
        body: { query: q, type, history, specialty },
      });
      if (!error && data?.suggestions) {
        setSuggestions(data.suggestions);
        setShowDropdown(data.suggestions.length > 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [type, history, specialty]);

  const onQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value), 500);
  }, [search]);

  const close = useCallback(() => {
    setShowDropdown(false);
  }, []);

  return { query, setQuery, suggestions, loading, showDropdown, onQueryChange, close, setShowDropdown };
}

const NotesSection = ({ form, onFieldChange }: NotesSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [selectedIcdCodes, setSelectedIcdCodes] = useState<Set<string>>(new Set());
  const [selectedProcCodes, setSelectedProcCodes] = useState<Set<string>>(new Set());
  // Track relevance per entry
  const [diagnosisRelevance, setDiagnosisRelevance] = useState<Map<string, boolean>>(new Map());
  const [procedureRelevance, setProcedureRelevance] = useState<Map<string, boolean>>(new Map());
  const { toast } = useToast();

  const diagAutocomplete = useCodeAutocomplete("diagnosis", form.history || "", form.specialty || "");
  const procAutocomplete = useCodeAutocomplete("procedure", form.history || "", form.specialty || "");

  const diagDropdownRef = useRef<HTMLDivElement>(null);
  const procDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (diagDropdownRef.current && !diagDropdownRef.current.contains(e.target as Node)) {
        diagAutocomplete.close();
      }
      if (procDropdownRef.current && !procDropdownRef.current.contains(e.target as Node)) {
        procAutocomplete.close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

      if (error) {
        // Check for specific error status codes
        const errorBody = error?.context?.body ? await error.context.body.json?.().catch(() => null) : null;
        const errorMsg = errorBody?.error || data?.error || "AI service temporarily unavailable. Please try again in a few moments.";
        toast({ title: "AI Error", description: errorMsg, variant: "destructive" });
        return;
      }
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
    // All AI-suggested items are relevant
    const newRelevance = new Map(diagnosisRelevance);
    newItems.forEach(item => newRelevance.set(item, true));
    setDiagnosisRelevance(newRelevance);
    updateDiagnosis([...diagnosisList, ...newItems]);
    setSelectedIcdCodes(new Set());
    toast({ title: "Added", description: `${newItems.length} diagnosis code(s) added.` });
  };

  const applySelectedProcedures = () => {
    const newItems = Array.from(selectedProcCodes).filter(item => !procedureList.includes(item));
    const newRelevance = new Map(procedureRelevance);
    newItems.forEach(item => newRelevance.set(item, true));
    setProcedureRelevance(newRelevance);
    updateProcedures([...procedureList, ...newItems]);
    setSelectedProcCodes(new Set());
    toast({ title: "Added", description: `${newItems.length} procedure code(s) added.` });
  };

  const addFromAutocomplete = (item: AutocompleteItem, type: "diagnosis" | "procedure") => {
    const text = `${item.code} - ${item.description}`;
    if (type === "diagnosis") {
      if (!diagnosisList.includes(text)) {
        const newRelevance = new Map(diagnosisRelevance);
        newRelevance.set(text, item.relevant);
        setDiagnosisRelevance(newRelevance);
        updateDiagnosis([...diagnosisList, text]);
      }
      diagAutocomplete.setQuery("");
      diagAutocomplete.close();
    } else {
      if (!procedureList.includes(text)) {
        const newRelevance = new Map(procedureRelevance);
        newRelevance.set(text, item.relevant);
        setProcedureRelevance(newRelevance);
        updateProcedures([...procedureList, text]);
      }
      procAutocomplete.setQuery("");
      procAutocomplete.close();
    }
  };

  const addFreeTextDiagnosis = () => {
    if (!diagAutocomplete.query.trim()) return;
    const text = diagAutocomplete.query.trim();
    if (!diagnosisList.includes(text)) {
      // Free text without AI check = unknown relevance, mark as not relevant (red)
      const newRelevance = new Map(diagnosisRelevance);
      newRelevance.set(text, false);
      setDiagnosisRelevance(newRelevance);
      updateDiagnosis([...diagnosisList, text]);
    }
    diagAutocomplete.setQuery("");
    diagAutocomplete.close();
  };

  const addFreeTextProcedure = () => {
    if (!procAutocomplete.query.trim()) return;
    const text = procAutocomplete.query.trim();
    if (!procedureList.includes(text)) {
      const newRelevance = new Map(procedureRelevance);
      newRelevance.set(text, false);
      setProcedureRelevance(newRelevance);
      updateProcedures([...procedureList, text]);
    }
    procAutocomplete.setQuery("");
    procAutocomplete.close();
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

  const getBadgeClasses = (item: string, relevanceMap: Map<string, boolean>, baseColor: string, unrelevantColor: string) => {
    const isRelevant = relevanceMap.get(item);
    // If relevance is unknown (not in map), treat as neutral
    if (isRelevant === undefined) return `${baseColor} px-3 py-1`;
    if (isRelevant) return `${baseColor} px-3 py-1`;
    return `${unrelevantColor} px-3 py-1 border border-red-300`;
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Clinical Details & AI Assistance</h3>

      {/* History */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">History</label>
        <div className="relative">
          <Textarea
            value={form.history || ""}
            onChange={(e) => onFieldChange("history", e.target.value)}
            rows={3}
            placeholder="Enter patient clinical history or use voice dictation..."
          />
          <VoiceDictationButton
            currentValue={form.history || ""}
            onResult={(text) => onFieldChange("history", text)}
            append={true}
            className="absolute top-1 right-1"
          />
        </div>
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

      {/* Diagnosis Codes with Autocomplete */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">Diagnosis Codes</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
          {diagnosisList.map((item, idx) => {
            const isRelevant = diagnosisRelevance.get(item);
            const badgeBg = isRelevant === false ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";
            return (
              <Badge key={idx} variant="secondary" className={`flex items-center gap-1 ${badgeBg} px-3 py-1 ${isRelevant === false ? 'border border-red-300' : ''}`}>
                {isRelevant === false && <X className="w-3 h-3 text-red-500 mr-0.5" />}
                {item}
                <button type="button" onClick={() => removeDiagnosis(idx)} className="ml-1 hover:text-red-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          {diagnosisList.length === 0 && (
            <span className="text-sm text-gray-400">No diagnosis codes added yet</span>
          )}
        </div>
        <div className="relative" ref={diagDropdownRef}>
          <div className="flex gap-2">
            <Input
              value={diagAutocomplete.query}
              onChange={(e) => diagAutocomplete.onQueryChange(e.target.value)}
              onFocus={() => { if (diagAutocomplete.suggestions.length > 0) diagAutocomplete.setShowDropdown(true); }}
              placeholder="Type to search ICD-10 codes or add custom text..."
              className="flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFreeTextDiagnosis(); } }}
            />
            {diagAutocomplete.loading && <Loader2 className="w-4 h-4 animate-spin absolute right-14 top-2.5 text-gray-400" />}
            <Button type="button" variant="outline" size="sm" onClick={addFreeTextDiagnosis}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {diagAutocomplete.showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {diagAutocomplete.suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addFromAutocomplete(item, "diagnosis")}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 border-b last:border-0 ${
                    !item.relevant ? "bg-red-50/50" : ""
                  }`}
                >
                  <Badge variant="secondary" className={`font-mono text-xs shrink-0 ${item.relevant ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                    {item.code}
                  </Badge>
                  <span className="text-sm text-gray-700 flex-1">{item.description}</span>
                  {!item.relevant && (
                    <span className="text-xs text-red-500 shrink-0">Not related</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Procedure Codes with Autocomplete */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">Procedure / Package Codes</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
          {procedureList.map((item, idx) => {
            const isRelevant = procedureRelevance.get(item);
            const badgeBg = isRelevant === false ? "bg-red-100 text-red-800" : "bg-purple-100 text-purple-800";
            return (
              <Badge key={idx} variant="secondary" className={`flex items-center gap-1 ${badgeBg} px-3 py-1 ${isRelevant === false ? 'border border-red-300' : ''}`}>
                {isRelevant === false && <X className="w-3 h-3 text-red-500 mr-0.5" />}
                {item}
                <button type="button" onClick={() => removeProcedure(idx)} className="ml-1 hover:text-red-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          {procedureList.length === 0 && (
            <span className="text-sm text-gray-400">No procedure codes added yet</span>
          )}
        </div>
        <div className="relative" ref={procDropdownRef}>
          <div className="flex gap-2">
            <Input
              value={procAutocomplete.query}
              onChange={(e) => procAutocomplete.onQueryChange(e.target.value)}
              onFocus={() => { if (procAutocomplete.suggestions.length > 0) procAutocomplete.setShowDropdown(true); }}
              placeholder="Type to search procedure/package codes or add custom text..."
              className="flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFreeTextProcedure(); } }}
            />
            {procAutocomplete.loading && <Loader2 className="w-4 h-4 animate-spin absolute right-14 top-2.5 text-gray-400" />}
            <Button type="button" variant="outline" size="sm" onClick={addFreeTextProcedure}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {procAutocomplete.showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {procAutocomplete.suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addFromAutocomplete(item, "procedure")}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 border-b last:border-0 ${
                    !item.relevant ? "bg-red-50/50" : ""
                  }`}
                >
                  <Badge variant="secondary" className={`font-mono text-xs shrink-0 ${item.relevant ? "bg-purple-100 text-purple-800" : "bg-red-100 text-red-800"}`}>
                    {item.code}
                  </Badge>
                  <span className="text-sm text-gray-700 flex-1">{item.description}</span>
                  {!item.relevant && (
                    <span className="text-xs text-red-500 shrink-0">Not related</span>
                  )}
                </button>
              ))}
            </div>
          )}
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
        <div className="relative">
          <Textarea
            value={form.notes || ""}
            onChange={(e) => onFieldChange("notes", e.target.value)}
            rows={2}
          />
          <VoiceDictationButton
            currentValue={form.notes || ""}
            onResult={(text) => onFieldChange("notes", text)}
            append={true}
            className="absolute top-1 right-1"
          />
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
