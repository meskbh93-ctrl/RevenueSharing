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
  Package,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import ServiceForm from '@/components/services/ServiceForm';
import ServiceCard from '@/components/services/ServiceCard';

import {
  calculateTotalRevenue,
  formatNumber,
} from '@/lib/calculations';

import { useNavigate } from 'react-router-dom';

export default function Services() {
  const { t, lang } = useI18n();

  const { selectedProjectId } =
    useProject();

  const queryClient =
    useQueryClient();

  const navigate = useNavigate();

  const isAr = lang === 'ar';

  const [formOpen, setFormOpen] =
    useState(false);

  const [
    editingService,
    setEditingService,
  ] = useState(null);

  const { data: project } = useQuery({
    queryKey: [
      'project',
      selectedProjectId,
    ],

    queryFn: () =>
      base44.entities.Project.list().then(
        (list) =>
          list.find(
            (p) =>
              p.id === selectedProjectId
          )
      ),

    enabled: !!selectedProjectId,
  });

  const { data: services = [] } =
    useQuery({
      queryKey: [
        'services',
        selectedProjectId,
      ],

      queryFn: () =>
        base44.entities.Service.filter({
          project_id:
            selectedProjectId,
        }),

      enabled: !!selectedProjectId,
    });

  const startYear = project?.start_date
    ? new Date(
        project.start_date
      ).getFullYear() + 1
    : new Date().getFullYear() + 1;

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Service.create({
        ...data,
        project_id:
          selectedProjectId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'services',
          selectedProjectId,
        ],
      });

      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.Service.update(
        id,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'services',
          selectedProjectId,
        ],
      });

      setEditingService(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.Service.delete(id),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [
          'services',
          selectedProjectId,
        ],
      }),
  });

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <Package className="w-16 h-16 opacity-20" />

        <p className="text-lg font-medium">
          {lang === 'ar'
            ? 'لم يتم اختيار مشروع'
            : 'No project selected'}
        </p>

        <p className="text-sm opacity-70">
          {lang === 'ar'
            ? 'يرجى اختيار مشروع أو إنشاء مشروع جديد'
            : 'Please select or create a project'}
        </p>
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
            <Package className="w-6 h-6" />

            {t('services')}
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'ar'
              ? 'إدارة الخدمات والإيرادات'
              : 'Manage services and revenues'}
          </p>
        </div>

        <Button
          onClick={() =>
            setFormOpen(true)
          }
          className="bg-accent hover:bg-accent/90 text-white gap-1.5"
        >
          <Plus className="w-4 h-4" />

          {isAr
            ? 'إضافة خدمة'
            : 'Add Service'}
        </Button>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            startYear={startYear}
            onEdit={() =>
              setEditingService(service)
            }
            onDelete={() =>
              deleteMutation.mutate(
                service.id
              )
            }
          />
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-primary" />

          <h3 className="font-bold">
            {isAr
              ? 'إجمالي الإيرادات'
              : 'Total Revenue'}
          </h3>
        </div>

        <p className="text-2xl font-bold text-primary">
          {formatNumber(
            calculateTotalRevenue(
              services
            )
          )}{' '}
          SAR
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={() =>
            navigate('/introduction')
          }
          className="gap-2"
        >
          {isAr ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <ArrowLeft className="w-4 h-4" />
          )}

          {isAr ? 'رجوع' : 'Back'}
        </Button>

        <Button
          onClick={() =>
            navigate('/costs')
          }
          className="gap-2"
        >
          {isAr ? 'التالي' : 'Next'}

          {isAr ? (
            <ArrowLeft className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      <ServiceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(data) =>
          createMutation.mutate(data)
        }
      />

      <ServiceForm
        open={!!editingService}
        onOpenChange={() =>
          setEditingService(null)
        }
        initialData={editingService}
        onSubmit={(data) =>
          updateMutation.mutate({
            id: editingService.id,
            data,
          })
        }
      />
    </div>
  );
}
