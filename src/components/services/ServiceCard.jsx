import React from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { calculateServiceRevenue, formatNumber } from '@/lib/calculations';
import { motion } from 'framer-motion';

export default function ServiceCard({ service, onEdit, onDelete, index, startYear = new Date().getFullYear() + 1 }) {
  const { t, lang } = useI18n();
  const revenue = calculateServiceRevenue(service);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="shadow-sm hover:shadow-md transition-shadow" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-start">{service.name}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(service)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(service.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-start">
            {t('basePrice')}: {formatNumber(service.base_price)} {t('sar')} | {t('baseQuantity')}: {formatNumber(service.base_quantity)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs py-2 text-start">{t('year')}</TableHead>
                  <TableHead className="text-xs py-2 text-start">{t('price')}</TableHead>
                  <TableHead className="text-xs py-2 text-start">{t('quantity')}</TableHead>
                  <TableHead className="text-xs py-2 text-start">{lang === 'ar' ? 'الدخل' : 'Income'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenue.map((r, i) => (
                  <TableRow key={r.year}>
                    <TableCell className="text-xs py-1.5 font-medium text-start">{startYear + i}</TableCell>
                    <TableCell className="text-xs py-1.5 text-start">{formatNumber(r.price)}</TableCell>
                    <TableCell className="text-xs py-1.5 text-start">{formatNumber(r.quantity)}</TableCell>
                    <TableCell className="text-xs py-1.5 font-semibold text-primary text-start">{formatNumber(r.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}