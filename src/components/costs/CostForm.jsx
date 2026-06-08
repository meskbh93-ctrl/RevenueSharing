import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const defaultForm = {
  name: '',
  type: 'operational',
  base_amount: '',
  growth_rates: [0, 0, 0, 0, 0],
  description: '',
};

export default function CostForm({ open, onClose, onSave, initialData }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const startYear = new Date().getFullYear();
  const yearLabels = [0, 1, 2, 3, 4].map(i => String(startYear + 1 + i));

  const [form, setForm] = useState(initialData ? { ...defaultForm, ...initialData } : defaultForm);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...defaultForm, ...initialData } : { ...defaultForm });
    }
  }, [open]);

  const handleGrowthChange = (index, value) => {
    const arr = [...(form.growth_rates || [0, 0, 0, 0, 0])];
    arr[index] = Number(value) || 0;
    setForm({ ...form, growth_rates: arr });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, base_amount: Number(form.base_amount) });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {initialData ? (isAr ? 'تعديل تكلفة' : 'Edit Cost') : (isAr ? 'إضافة تكلفة' : 'Add Cost')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <Label className="font-semibold text-sm">{isAr ? 'اسم التكلفة' : 'Cost Name'}</Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={isAr ? 'مثال: صيانة الخادم' : 'e.g. Server Maintenance'}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-sm">{isAr ? 'النوع' : 'Type'}</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">{isAr ? 'تشغيلي' : 'Operational'}</SelectItem>
                <SelectItem value="capital">{isAr ? 'رأسمالي' : 'Capital'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/40 rounded-lg p-4 space-y-1.5">
            <Label className="font-bold text-sm">{isAr ? 'خط الأساس' : 'Baseline'}</Label>
            <p className="text-xs text-muted-foreground">
              {isAr ? 'المبلغ المرجعي قبل تطبيق أي نسبة نمو' : 'Reference amount before applying any growth rate'}
            </p>
            <Input
              type="text"
              inputMode="decimal"
              value={form.base_amount}
              onChange={e => setForm({ ...form, base_amount: e.target.value })}
              className="text-end"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-sm">
              {isAr ? 'نسب النمو السنوية (%)' : 'Annual Growth Rates (%)'}
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-1">
                  <span className="text-xs text-muted-foreground block text-center">{yearLabels[i]}</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={form.growth_rates?.[i] ?? 0}
                    onChange={e => handleGrowthChange(i, e.target.value)}
                    className="text-center text-sm h-9"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-sm">{isAr ? 'الوصف' : 'Description'}</Label>
            <Textarea
              value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder={isAr ? 'وصف اختياري' : 'Optional description'}
              className="h-20 resize-none"
            />
          </div>

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
