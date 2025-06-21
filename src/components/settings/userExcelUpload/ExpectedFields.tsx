
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { expectedFields } from './types';

export default function ExpectedFields() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Expected Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {expectedFields.map((field, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {field}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
