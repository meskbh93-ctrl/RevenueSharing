import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export default function ProjectSelector() {
  const { t, lang } = useI18n();
  const { selectedProjectId, setSelectedProjectId } = useProject();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', government_entity: '', private_partner: '' });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Project.filter({ created_by: user.email }, '-created_date');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedProjectId(newProject.id);
      setOpen(false);
      setForm({ name: '', government_entity: '', private_partner: '' });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedProjectId || ''} onValueChange={setSelectedProjectId}>
        <SelectTrigger className="w-56 bg-sidebar-accent border-sidebar-border text-sidebar-foreground text-sm h-9">
          <SelectValue placeholder={t('selectProject')} />
        </SelectTrigger>
        <SelectContent>
          {projects.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createProject')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('projectName')}</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{t('governmentEntity')}</Label>
              <Input value={form.government_entity} onChange={e => setForm({ ...form, government_entity: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{t('privatePartner')}</Label>
              <Input value={form.private_partner} onChange={e => setForm({ ...form, private_partner: e.target.value })} required />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('cancel')}</Button>
              <Button type="submit">{t('save')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}