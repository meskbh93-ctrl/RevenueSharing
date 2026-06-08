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

import {
  Plus,
  DollarSign,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import CostForm from '@/components/costs/CostForm';

import {
  calculateTotalCosts,
  formatNumber,
} from '@/lib/calculations';

import { useNavigate } from 'react-router-dom';

export default function Costs() {
  const { t, lang } = useI18n();

  const { selectedProjectId } =
    useProject();

  const queryClient =
    useQueryClient();

  const navigate = useNavigate();

  const isAr = lang === 'ar';

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingCost, setEditingCost] =
    useState(null);

  const { data: costs = [] } =
    useQuery({
      queryKey: [
        'costs',
        selectedProjectId,
      ],

      queryFn: () =>
        base44.entities.Cost.filter({
          project_id:
            selectedProjectId,
        }),

      enabled: !!selectedProjectId,
    });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Cost.create({
        ...data,
        project_id:
          selectedProjectId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'costs',
          selectedProjectId,
        ],
      });

      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.Cost.update(
        id,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'costs',
          selectedProjectId,
        ],
      });

      setEditingCost(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.Cost.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'costs',
          selectedProjectId,
        ],
      });
    },
  });

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground">
        <DollarSign className="w-12 h-12 mb-3 opacity-30" />

        <p>
          {isAr
            ? 'اختر مشروعاً أولاً'
            : 'Select a project first'}
        </p>
      </div>
    );
  }

  const totals =
    calculateTotalCosts(costs);

  const totalCosts = totals.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />

            {isAr
              ? 'التكاليف'
              : 'Costs'}
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? 'إدارة التكاليف'
              : 'Manage project costs'}
          </p>
        </div>

        <Button
          onClick={() =>
            setFormOpen(true)
          }
          className="gap-2"
        >
          <Plus className="w-4 h-4" />

          {isAr
            ? 'إضافة تكلفة'
            : 'Add Cost'}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm text-muted-foreground mb-1">
          {isAr
            ? 'إجمالي التكاليف'
            : 'Total Costs'}
        </p>

        <p className="text-3xl font-bold">
          {formatNumber(totalCosts)} SAR
        </p>
      </div>

      <div className="grid gap-4">
        {costs.map((cost) => (
          <div
            key={cost.id}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">
                  {cost.name}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {formatNumber(
                    cost.amount || 0
                  )}{' '}
                  SAR
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setEditingCost(cost)
                  }
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() =>
                    deleteMutation.mutate(
                      cost.id
                    )
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() =>
            navigate('/services')
          }
        >
          {isAr ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <ArrowLeft className="w-4 h-4" />
          )}
        </Button>

        <Button
          onClick={() =>
            navigate('/dashboard')
          }
        >
          {isAr ? (
            <ArrowLeft className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      <CostForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(data) =>
          createMutation.mutate(data)
        }
      />

      <CostForm
        open={!!editingCost}
        onOpenChange={() =>
          setEditingCost(null)
        }
        initialData={editingCost}
        onSubmit={(data) =>
          updateMutation.mutate({
            id: editingCost.id,
            data,
          })
        }
      />
    </div>
  );
}
