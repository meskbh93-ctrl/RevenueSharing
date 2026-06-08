import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { base44 } from '@/api/base44Client';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Plus,
  DollarSign,
  Pencil,
  Trash2,
  TrendingDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import {
  calculateCostOverYears,
  calculateTotalCosts,
  formatNumber,
} from '@/lib/calculations';

import CostForm from '@/components/costs/CostForm';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Costs() {
  const { t, lang } = useI18n();
  const { selectedProjectId } = useProject();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAr = lang === 'ar';

  const [formOpen, setFormOpen] = useState(false);
  const [editingCost, setEditingCost] = useState(null);

  const { data: project } = useQuery({
    queryKey: ['project', selectedProjectId],
    queryFn: () =>
      base44.entities.Project.list().then((list) =>
        list.find((p) => p.id === selectedProjectId)
      ),
    enabled: !!selectedProjectId,
  });

  const startYear = project?.start_date
    ? new Date(project.start_date).getFullYear() + 1
    : new Date().getFullYear() + 1;

  const { data: costs = [] } = useQuery({
    queryKey: ['costs', selectedProjectId],
    queryFn: () =>
      base44.entities.Cost.filter({
        project_id: selectedProjectId,
      }),
    enabled: !!selectedProjectId,
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Cost.create({
        ...data,
        project_id: selectedProjectId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['costs', selectedProjectId],
      });

      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.Cost.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['costs', selectedProjectId],
      });

      setEditingCost(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.Cost.delete(id),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['costs', selectedProjectId],
      }),
  });

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground">
        <DollarSign className="w-12 h-12 mb-3 opacity-30" />

        <p>{t('selectProject')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="text-start"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />

            {t('costs')}
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? 'إدارة التكاليف مع نسب النمو السنوية لـ 5 سنوات'
              : 'Manage costs with annual growth rates for 5 years'}
          </p>
        </div>

        <Button
          onClick={() => setFormOpen(true)}
          className="bg-accent hover:bg-accent/90 text-white gap-1.5"
        >
          <Plus className="w-4 h-4" />

          {t('addCost')}
        </Button>
      </div>

      {costs.length > 0 &&
        (() => {
          const costData =
            calculateTotalCosts(costs);

          const totalOp = costData.reduce(
            (s, c) => s + c.operational,
            0
          );

          const totalCap = costData.reduce(
            (s, c) => s + c.capital,
            0
          );

          const total = totalOp + totalCap;

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-bold text-blue-300 mb-2">
                    {isAr
                      ? 'التكاليف التشغيلية'
                      : 'Operational Costs'}
                  </p>

                  <p className="text-2xl font-bold text-blue-400">
                    {formatNumber(totalOp)}{' '}
                    {isAr ? 'ريال' : 'SAR'}
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
