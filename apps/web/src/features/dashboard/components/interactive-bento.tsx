'use client';

import { DragToConfirm } from '@/components/drag-to-confirm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const InteractiveBento = () => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto p-4"
      data-testid="bento-grid"
    >
      <Card className="col-span-6">
        <CardHeader>
          <CardTitle>Interactive Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-8" />
          </div>

          <DragToConfirm
            onConfirm={async () => {
              return true;
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
