'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { SecretKey } from './secret-key';

type ApiKey = {
  id: string;
  name: string;
  secretKey: string;
  created: string;
  lastUsed: string;
  createdBy: string;
  permissions: string;
};

export const ApiKeysManager = () => {
  // This would typically come from an API call
  const apiKeys: ApiKey[] = [
    {
      id: '1',
      name: 'LESSONS',
      secretKey: 'sk-...AJYA',
      created: '11 Nov 2024',
      lastUsed: '15 Nov 2024',
      createdBy: 'Doug Silkstone',
      permissions: 'All',
    },
    {
      id: '2',
      name: 'n8n',
      secretKey: 'sk-...0vsA',
      created: '10 Nov 2024',
      lastUsed: '12 Nov 2024',
      createdBy: 'Doug Silkstone',
      permissions: 'All',
    },
  ];

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">API Keys</h1>
          <span className="text-sm text-muted-foreground">
            Manage your API keys and access tokens.
          </span>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create New API Key
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NAME</TableHead>
              <TableHead>SECRET KEY</TableHead>
              <TableHead>CREATED</TableHead>
              <TableHead>LAST USED</TableHead>
              <TableHead>CREATED BY</TableHead>
              <TableHead>PERMISSIONS</TableHead>
              <TableHead className="w-[100px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>{key.name}</TableCell>
                <TableCell>
                  <SecretKey value={key.secretKey} />
                </TableCell>
                <TableCell>{key.created}</TableCell>
                <TableCell>{key.lastUsed}</TableCell>
                <TableCell>{key.createdBy}</TableCell>
                <TableCell>{key.permissions}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
