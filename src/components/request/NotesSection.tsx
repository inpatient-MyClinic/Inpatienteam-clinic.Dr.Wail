
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestFormData } from "@/types/request";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Check, X, Loader2, Copy, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NotesSectionProps {
  form: Partial<RequestFormData>;
  onFieldChange: (key: string, value: string) => void;
}

interface ICDCode {
  code: string;
  description: string;
  reasoning: string;
}

interface AISuggestion {
  icdCodes: ICDCode[];
  suggestedHistory: string;
  tips: string[];
}

const NotesSection = ({ form, onFieldChange }: NotesSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const { toast } = useToast();

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
        toast({
          title: "AI Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setSuggestion(data as AISuggestion);
      toast({
        title: "Suggestions Ready",
        description: "AI has generated ICD codes and history suggestions.",
      });
    } catch (err) {
      console.error("AI suggestion error:", err);
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptHistory = () => {
    if (suggestion?.suggestedHistory) {
      onFieldChange("history", suggestion.suggestedHistory);
      toast({ title: "Accepted", description: "Suggested history has been applied." });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: `ICD code ${code} copied to clipboard.` });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Information</h3>

      <div>
        <label className="block font-medium text-gray-600 mb-1">History</label>
        <Textarea
          value={form.history || ""}
          onChange={(e) => onFieldChange("history", e.target.value)}
          rows={3}
          placeholder="Enter patient clinical history..."
        />
      </div>

      {/* AI Suggestion Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGetSuggestions}
        disabled={isLoading}
        className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isLoading ? "Analyzing..." : "Get ICD Codes & Approval Suggestions"}
      </Button>

      {/* AI Suggestions Panel */}
      {suggestion && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2">
          {/* ICD Codes */}
          {suggestion.icdCodes?.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                  <Sparkles className="w-4 h-4" />
                  Suggested ICD-10 Codes (CHI Saudi & European Guidelines)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestion.icdCodes.map((icd, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="font-mono text-sm bg-blue-100 text-blue-800">
                          {icd.code}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(icd.code)}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{icd.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{icd.reasoning}</p>
                    </div>
                  </div>
                ))}
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
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAcceptHistory}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3 h-3" />
                    Use Suggested History
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSuggestion(null)}
                    className="flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Keep Original
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
