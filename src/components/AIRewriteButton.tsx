import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Wand2, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIRewriteButtonProps {
  text: string;
  onAccept: (rewrittenText: string) => void;
  context?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export default function AIRewriteButton({ text, onAccept, context, className, size = "sm" }: AIRewriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [rewritten, setRewritten] = useState("");
  const [changes, setChanges] = useState<string[]>([]);
  const { toast } = useToast();

  const handleRewrite = async () => {
    if (!text || text.trim().length === 0) {
      toast({ title: "No text", description: "Please enter some text first", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-rewrite", {
        body: { text, context },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setRewritten(data.rewritten || text);
      setChanges(data.changes || []);
      setShowDialog(true);
    } catch (err: any) {
      toast({ title: "AI Rewrite Failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={size}
        onClick={handleRewrite}
        disabled={isLoading || !text?.trim()}
        className={`text-purple-600 hover:text-purple-700 hover:bg-purple-50 ${className || ""}`}
      >
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
        AI Rewrite
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              AI Suggested Rewrite
            </DialogTitle>
            <DialogDescription>Compare and choose between the original and AI-improved version</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">Original Text</h4>
              <div className="p-3 bg-gray-50 rounded-lg text-sm border whitespace-pre-wrap">{text}</div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-purple-600 mb-1">AI Improved Version</h4>
              <div className="p-3 bg-purple-50 rounded-lg text-sm border border-purple-200 whitespace-pre-wrap">{rewritten}</div>
            </div>

            {changes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Changes Made</h4>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                  {changes.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => { onAccept(rewritten); setShowDialog(false); }}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Check className="w-4 h-4 mr-1" /> Use AI Version
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" /> Keep Original
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
