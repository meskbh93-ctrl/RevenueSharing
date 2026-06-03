import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const defaultForm = {
  name: '',
  base_price: '',
  base_quantity: '',
  price_growth_rates: [0, 0, 0, 0, 0],
  quantity_growth_rates: [0, 0, 0, 0, 0],
  description: '',
};

export default function ServiceForm({ open, onClose, onSave, initialData }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const { selectedProjectId } = useProject();

  const [form, setForm] = useState(initialData ? { ...defaultForm, ...initialData } : defaultForm);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...defaultForm, ...initialData } : defaultForm);
    }
  }, [open, initialData]);

  // Fetch project to get start_date
  const { data: project } = useQuery({
    queryKey: ['project', selectedProjectId],
    queryFn: () => base44.entities.Project.list().then(list => list.find(p => p.id === selectedProjectId)),
    enabled: !!selectedProjectId,
  });

  // Build year labels from start_date or fallback to current year
  const startYear = project?.start_date
    ? new Date(project.start_date).getFullYear()
    : new Date().getFullYear();

  // Growth rates start from the year AFTER the project start year
  const yearLabels = [0, 1, 2, 3, 4].map(i => String(startYear + 1 + i));

  const handleGrowthChange = (field, index, value) => {
    const arr = [...(form[field] || [0, 0, 0, 0, 0])];
    arr[index] = Number(value) || 0;
    setForm({ ...form, [field]: arr });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      base_price: Number(form.base_price),
      base_quantity: Number(form.base_quantity),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {initialData ? (isAr ? 'تعديل خدمة' : 'Edit Service') : (isAr ? 'إضافة خدمة' : 'Add Service')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">

          {/* Service Name */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-sm">{isAr ? 'اسم الخدمة' : 'Service Name'}</Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={isAr ? 'مثال: استضافة سحابية' : 'e.g. Cloud Hosting'}
              required
            />
          </div>

          {/* Base Price */}
          <div className="bg-muted/40 rounded-lg p-4 space-y-1.5">
            <Label className="font-bold text-sm">
              {isAr ? 'خط الأساس — المقابل المالي (السعر)' : 'Baseline — Financial Value (Price)'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr ? 'القيمة المرجعية قبل تطبيق نسب النمو' : 'Reference value before applying growth rates'}
            </p>
            <Input
              type="text"
              inputMode="decimal"
              value={form.base_price}
              onChange={e => setForm({ ...form, base_price: e.target.value })}
              className="text-end"
              required
            />
          </div>

          {/* Price Growth Rates */}
          <div className="space-y-2">
            <Label className="font-bold text-sm">
              {isAr ? 'نسب نمو المقابل المالي (السعر) (%)' : 'Price Growth Rates (%)'}
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-1">
                  <span className="text-xs text-muted-foreground block text-center">{yearLabels[i]}</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={form.price_growth_rates?.[i] ?? 0}
                    onChange={e => handleGrowthChange('price_growth_rates', i, e.target.value)}
                    className="text-center text-sm h-9"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Base Quantity */}
          <div className="bg-muted/40 rounded-lg p-4 space-y-1.5">
            <Label className="font-bold text-sm">
              {isAr ? 'خط الأساس — الكمية' : 'Baseline — Quantity'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr ? 'القيمة المرجعية قبل تطبيق نسب النمو' : 'Reference value before applying growth rates'}
            </p>
            <Input
              type="text"
              inputMode="decimal"
              value={form.base_quantity}
              onChange={e => setForm({ ...form, base_quantity: e.target.value })}
              className="text-end"
              required
            />
          </div>

          {/* Quantity Growth Rates */}
          <div className="space-y-2">
            <Label className="font-bold text-sm">
              {isAr ? 'نسب نمو الكمية (%)' : 'Quantity Growth Rates (%)'}
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-1">
                  <span className="text-xs text-muted-foreground block text-center">{yearLabels[i]}</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={form.quantity_growth_rates?.[i] ?? 0}
                    onChange={e => handleGrowthChange('quantity_growth_rates', i, e.target.value)}
                    className="text-center text-sm h-9"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="font-bold text-sm">{isAr ? 'الوصف' : 'Description'}</Label>
            <Textarea
              value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder={isAr ? 'وصف اختياري' : 'Optional description'}
              className="h-20 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-white">
              {initialData ? (isAr ? 'حفظ' : 'Save') : (isAr ? 'إضافة' : 'Add')}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}