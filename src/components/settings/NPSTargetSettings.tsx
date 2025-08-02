import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NPSTargets {
  customerCare: number;
  inPatient: number;
  overall: number;
  quarterly: number;
}

export default function NPSTargetSettings() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [targets, setTargets] = useState<NPSTargets>({
    customerCare: 75,
    inPatient: 80,
    overall: 70,
    quarterly: 72
  });

  // Load saved targets on component mount
  useEffect(() => {
    const savedTargets = localStorage.getItem('npsTargets');
    if (savedTargets) {
      try {
        setTargets(JSON.parse(savedTargets));
      } catch (error) {
        console.error('Error loading NPS targets:', error);
      }
    }
  }, []);

  const handleSave = () => {
    // Validate targets (should be between -100 and 100)
    const isValid = Object.values(targets).every(target => 
      target >= -100 && target <= 100
    );

    if (!isValid) {
      toast({
        title: "Invalid Target",
        description: "NPS targets must be between -100 and 100",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('npsTargets', JSON.stringify(targets));
    setIsEditing(false);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('npsTargetsUpdated', { 
      detail: targets 
    }));

    toast({
      title: "NPS Targets Updated",
      description: "Target settings have been saved successfully.",
    });
  };

  const handleCancel = () => {
    // Reload from localStorage
    const savedTargets = localStorage.getItem('npsTargets');
    if (savedTargets) {
      setTargets(JSON.parse(savedTargets));
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof NPSTargets, value: string) => {
    const numValue = parseInt(value) || 0;
    setTargets(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const getTargetStatus = (target: number) => {
    if (target >= 70) return { color: "bg-green-100 text-green-800", label: "Excellent" };
    if (target >= 50) return { color: "bg-blue-100 text-blue-800", label: "Good" };
    if (target >= 30) return { color: "bg-yellow-100 text-yellow-800", label: "Fair" };
    return { color: "bg-red-100 text-red-800", label: "Needs Improvement" };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle>NPS Target Configuration</CardTitle>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Targets
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                Edit Targets
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Care NPS Target */}
          <div className="space-y-3">
            <Label htmlFor="customerCare" className="text-sm font-semibold">
              Customer Care NPS Target
            </Label>
            {isEditing ? (
              <Input
                id="customerCare"
                type="number"
                min="-100"
                max="100"
                value={targets.customerCare}
                onChange={(e) => handleInputChange('customerCare', e.target.value)}
                className="text-lg font-medium"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-600">
                  {targets.customerCare}
                </span>
                <Badge className={getTargetStatus(targets.customerCare).color}>
                  {getTargetStatus(targets.customerCare).label}
                </Badge>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Target for customer care survey responses
            </p>
          </div>

          {/* In-Patient NPS Target */}
          <div className="space-y-3">
            <Label htmlFor="inPatient" className="text-sm font-semibold">
              In-Patient NPS Target
            </Label>
            {isEditing ? (
              <Input
                id="inPatient"
                type="number"
                min="-100"
                max="100"
                value={targets.inPatient}
                onChange={(e) => handleInputChange('inPatient', e.target.value)}
                className="text-lg font-medium"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-green-600">
                  {targets.inPatient}
                </span>
                <Badge className={getTargetStatus(targets.inPatient).color}>
                  {getTargetStatus(targets.inPatient).label}
                </Badge>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Target for in-patient experience surveys
            </p>
          </div>

          {/* Overall NPS Target */}
          <div className="space-y-3">
            <Label htmlFor="overall" className="text-sm font-semibold">
              Overall NPS Target
            </Label>
            {isEditing ? (
              <Input
                id="overall"
                type="number"
                min="-100"
                max="100"
                value={targets.overall}
                onChange={(e) => handleInputChange('overall', e.target.value)}
                className="text-lg font-medium"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-purple-600">
                  {targets.overall}
                </span>
                <Badge className={getTargetStatus(targets.overall).color}>
                  {getTargetStatus(targets.overall).label}
                </Badge>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Overall organizational NPS target
            </p>
          </div>

          {/* Quarterly NPS Target */}
          <div className="space-y-3">
            <Label htmlFor="quarterly" className="text-sm font-semibold">
              Quarterly NPS Target
            </Label>
            {isEditing ? (
              <Input
                id="quarterly"
                type="number"
                min="-100"
                max="100"
                value={targets.quarterly}
                onChange={(e) => handleInputChange('quarterly', e.target.value)}
                className="text-lg font-medium"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-orange-600">
                  {targets.quarterly}
                </span>
                <Badge className={getTargetStatus(targets.quarterly).color}>
                  {getTargetStatus(targets.quarterly).label}
                </Badge>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Quarterly performance target
            </p>
          </div>
        </div>

        {/* NPS Scale Reference */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            NPS Score Interpretation
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>70-100: Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>50-69: Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>30-49: Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>10-29: Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>-10-9: Poor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>-100--11: Very Poor</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}