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

  const { lang } = useI18n();

  const {
    selectedProjectId,
  } = useProject();

  const queryClient =
    useQueryClient();

  const navigate =
    useNavigate();

  const isAr =
    lang === 'ar';

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

      enabled:
        !!selectedProjectId,
    });

  const createMutation =
    useMutation({
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

  const updateMutation =
    useMutation({
      mutationFn: ({
        id,
        data,
      }) =>
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

  const deleteMutation =
    useMutation({
      mutationFn: (id) =>
        base44.entities.Cost.delete(id),

      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: [
            'costs',
            selectedProjectId,
          ],
        }),
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

  const totalCosts =
    totals.reduce(
      (sum, item) =>
        sum + item.total,
      0
    );

  const operationalCosts =
    costs
      .filter(
        (c) =>
          c.type ===
          'operational'
      )
      .reduce(
        (s, c) =>
          s + (c.amount || 0),
        0
      );

  const capitalCosts =
    costs
      .filter(
        (c) =>
          c.type ===
          'capital'
      )
      .reduce(
        (s, c) =>
          s + (c.amount || 0),
        0
      );

  const years = [
    2027,
    2028,
    2029,
    2030,
    2031,
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-3xl font-bold flex items-center gap-2">

            <DollarSign className="w-7 h-7" />

            {isAr
              ? 'التكاليف'
              : 'Costs'}

          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? 'إدارة التكاليف مع نسب النمو السنوية'
              : 'Manage project costs'}
          </p>

        </div>

        <Button
          onClick={() =>
            setFormOpen(true)
          }
          className="
            gap-2
            bg-accent
            hover:bg-accent/90
            text-white
          "
        >

          <Plus className="w-4 h-4" />

          {isAr
            ? 'إضافة تكلفة'
            : 'Add Cost'}

        </Button>

      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 shadow-sm">

          <p className="text-sm text-muted-foreground mb-2">
            {isAr
              ? 'إجمالي التكاليف'
              : 'Total Costs'}
          </p>

          <h3 className="text-4xl font-bold">
            {formatNumber(
              totalCosts
            )}{' '}
            ريال
          </h3>

        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 shadow-sm">

          <p className="text-sm text-yellow-400 mb-2">
            {isAr
              ? 'التكاليف الرأسمالية'
              : 'Capital Costs'}
          </p>

          <h3 className="text-4xl font-bold text-yellow-400">
            {formatNumber(
              capitalCosts
            )}{' '}
            ريال
          </h3>

        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 shadow-sm">

          <p className="text-sm text-blue-400 mb-2">
            {isAr
              ? 'التكاليف التشغيلية'
              : 'Operational Costs'}
          </p>

          <h3 className="text-4xl font-bold text-blue-400">
            {formatNumber(
              operationalCosts
            )}{' '}
            ريال
          </h3>

        </div>

      </div>

      {/* Costs Table */}

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-border">

          <h3 className="text-xl font-bold">
            {isAr
              ? `بنود التكاليف (${costs.length})`
              : `Cost Items (${costs.length})`}
          </h3>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-muted/20">

              <tr className="text-sm text-muted-foreground">

                <th className="p-4 text-center">
                  {isAr ? 'الاسم' : 'Name'}
                </th>

                <th className="p-4 text-center">
                  {isAr ? 'النوع' : 'Type'}
                </th>

                {years.map((year) => (
                  <th
                    key={year}
                    className="p-4 text-center"
                  >
                    {year}
                  </th>
                ))}

                <th className="p-4 text-center">
                  {isAr ? 'إجراءات' : 'Actions'}
                </th>

              </tr>

            </thead>

            <tbody>

              {costs.map((cost) => (

                <tr
                  key={cost.id}
                  className="
                    border-t
                    border-border
                    text-sm
                  "
                >

                  <td className="p-4 text-center font-semibold">
                    {cost.name}
                  </td>

                  <td className="p-4 text-center">

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-medium
                        ${
                          cost.type ===
                          'capital'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }
                      `}
                    >
                      {cost.type ===
                      'capital'
                        ? isAr
                          ? 'رأسمالية'
                          : 'Capital'
                        : isAr
                        ? 'تشغيلية'
                        : 'Operational'}
                    </span>

                  </td>

                  {years.map((year) => (

                    <td
                      key={year}
                      className="p-4 text-center"
                    >

                      <div className="font-bold">
                        {formatNumber(
                          cost.amount || 0
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        +0%
                      </div>

                    </td>

                  ))}

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setEditingCost(cost)
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() =>
                          deleteMutation.mutate(
                            cost.id
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Empty State */}

      {costs.length === 0 && (
        <div
          className="
            bg-card/90
            backdrop-blur
            border
            border-dashed
            border-border
            rounded-2xl
            p-12
            text-center
          "
        >

          <DollarSign className="w-14 h-14 mx-auto mb-4 opacity-20" />

          <h3 className="text-lg font-bold mb-2">
            {isAr
              ? 'لا توجد تكاليف'
              : 'No Costs Yet'}
          </h3>

          <p className="text-sm text-muted-foreground">
            {isAr
              ? 'ابدأ بإضافة أول تكلفة للمشروع'
              : 'Start by adding your first cost'}
          </p>

        </div>
      )}

      {/* Navigation */}

      <div className="flex justify-between pt-2">

        <Button
          variant="outline"
          onClick={() =>
            navigate('/services')
          }
          className="gap-2"
        >

          {isAr ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <ArrowLeft className="w-4 h-4" />
          )}

          {isAr
            ? 'رجوع'
            : 'Back'}

        </Button>

        <Button
          onClick={() =>
            navigate(
              '/income-sharing'
            )
          }
          className="
            gap-2
            bg-accent
            hover:bg-accent/90
            text-white
          "
        >

          {isAr
            ? 'التالي'
            : 'Next'}

          {isAr ? (
            <ArrowLeft className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}

        </Button>

      </div>

      <CostForm
        open={formOpen}
        onClose={() =>
          setFormOpen(false)
        }
        onSave={(data) =>
          createMutation.mutate(data)
        }
      />

      <CostForm
        open={!!editingCost}
        onClose={() =>
          setEditingCost(null)
        }
        initialData={editingCost}
        onSave={(data) =>
          updateMutation.mutate({
            id: editingCost.id,
            data,
          })
        }
      />

    </div>
  );
}
