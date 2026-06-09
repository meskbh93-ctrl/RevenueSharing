import React, {
  useState,
  useEffect,
} from 'react';

import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { base44 } from '@/api/base44Client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import {
  Scale,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Introduction() {
  const { lang } = useI18n();

  const {
    selectedProjectId,
    setSelectedProjectId,
  } = useProject();

  const queryClient =
    useQueryClient();

  const navigate = useNavigate();

  const isAr = lang === 'ar';

  const [form, setForm] =
    useState({
      name: '',
      government_entity: '',
      private_partner: '',
      description: '',
    });

  const { data: project } = useQuery({
    queryKey: [
      'project',
      selectedProjectId,
    ],

    queryFn: async () => {
      try {
        if (
          !base44?.entities?.Project
        ) {
          return null;
        }

        const list =
          await base44.entities.Project.list();

        return list.find(
          (p) =>
            p.id === selectedProjectId
        );
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    enabled: !!selectedProjectId,
  });

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name || '',
        government_entity:
          project.government_entity ||
          '',

        private_partner:
          project.private_partner ||
          '',

        description:
          project.description || '',
      });
    }
  }, [project]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Project.create(
        data
      );
    },

    onSuccess: (newProject) => {
      queryClient.invalidateQueries({
        queryKey: ['projects'],
      });

      if (newProject?.id) {
        setSelectedProjectId(
          newProject.id
        );
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }) => {
      return await base44.entities.Project.update(
        id,
        data
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'project',
          selectedProjectId,
        ],
      });
    },
  });

  const handleNext = async () => {
    try {
      if (!form.name.trim()) {
        alert(
          isAr
            ? 'يرجى إدخال اسم المشروع'
            : 'Please enter project name'
        );

        return;
      }

      const payload = {
        name: form.name,
        government_entity:
          form.government_entity ||
          '',

        private_partner:
          form.private_partner ||
          '',

        description:
          form.description || '',

        start_date:
          new Date()
            .toISOString()
            .split('T')[0],
      };

      if (project?.id) {
        await updateMutation.mutateAsync(
          {
            id: project.id,
            data: payload,
          }
        );
      } else {
        const newProject =
          await createMutation.mutateAsync(
            payload
          );

        if (newProject?.id) {
          setSelectedProjectId(
            newProject.id
          );
        }
      }

      navigate('/services');
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
          (isAr
            ? 'حدث خطأ أثناء إنشاء المشروع'
            : 'Failed to create project')
      );
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto space-y-6"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <h1 className="text-3xl font-bold text-center mb-1">
          {isAr
            ? 'المقدمة'
            : 'Introduction'}
        </h1>

        <p className="text-sm text-muted-foreground text-center">
          {isAr
            ? 'تحديد تفاصيل المشروع ونسب تقاسم الدخل'
            : 'Define project details'}
        </p>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-foreground" />

            <h2 className="text-base font-bold">
              {isAr
                ? 'معلومات المشروع'
                : 'Project Information'}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-base font-semibold">
                {isAr
                  ? 'اسم المشروع'
                  : 'Project Name'}
              </Label>

              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name:
                      e.target.value,
                  })
                }
                placeholder={
                  isAr
                    ? 'مثال: مشروع المدينة الذكية'
                    : 'e.g. Smart City Project'
                }
                className="bg-background/50 text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-base font-semibold">
                  {isAr
                    ? 'الجهة الحكومية'
                    : 'Government Entity'}
                </Label>

                <Input
                  value={
                    form.government_entity
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      government_entity:
                        e.target.value,
                    })
                  }
                  placeholder={
                    isAr
                      ? 'مثال: وزارة المالية'
                      : 'e.g. Ministry of Finance'
                  }
                  className="bg-background/50 text-base"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-base font-semibold">
                  {isAr
                    ? 'الشريك الخاص'
                    : 'Private Partner'}
                </Label>

                <Input
                  value={
                    form.private_partner
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      private_partner:
                        e.target.value,
                    })
                  }
                  placeholder={
                    isAr
                      ? 'مثال: شركة تقنية'
                      : 'e.g. Tech Company'
                  }
                  className="bg-background/50 text-base"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Scale className="w-5 h-5 text-foreground" />

            <h2 className="text-lg font-bold">
              {isAr
                ? 'القواعد المنظمة للمشاركة في الدخل'
                : 'Income Sharing Rules'}
            </h2>
          </div>

          <div className="bg-muted/30 rounded-xl p-5 text-sm leading-9 text-center">
            <p>
              قرار وزير المالية رقم
              (1877) وتاريخ
              24/12/1444هـ
              بموجب المرسوم الملكي
              رقم 33 تم السماح
              للجهات الحكومية
              بالتعاقد وفق أسلوب
              المشاركة في الدخل
              كأحد أساليب التعاقد
              ضمن نظام المنافسات
              والمشتريات الحكومية.
            </p>
          </div>

          <div className="space-y-4 mt-6 text-sm leading-8">
            <div>
              <span className="font-bold text-primary">
                أولاً:
              </span>
              {' '}
              ألا تتجاوز مدة العقد
              (خمس) سنوات،
              وتجوز زيادتها في
              العقود التي تتطلب
              طبيعتها ذلك.
            </div>

            <div>
              <span className="font-bold text-primary">
                ثانياً:
              </span>
              {' '}
              يقوم المشغل بالانتفاع
              من المنصات والأنظمة
              والأصول ملكيتها
              للجهة الحكومية.
            </div>

            <div>
              <span className="font-bold text-primary">
                ثالثاً:
              </span>
              {' '}
              ألا يكون مصدر الدخل
              الناتج عن العقد
              مدعوماً من الدولة.
            </div>

            <div>
              <span className="font-bold text-primary">
                رابعاً:
              </span>
              {' '}
              ألا يتضمن العقد
              تقديم الدولة للشريك
              الخاص أي شكل من أشكال
              الضمان أو الدعم.
            </div>
          </div>

          <div className="border-t border-border mt-6 pt-4 text-sm text-muted-foreground text-center leading-7">
            على أن يتم التنسيق مع
            مركز تنمية الإيرادات غير
            النفطية في مرحلة دراسة
            الجدوى أو قبل توقيع
            العقد أو تجديد العقود.
          </div>
        </div>
      </motion.div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleNext}
          className="bg-accent hover:bg-accent/90 text-white gap-2"
          disabled={
            createMutation.isPending ||
            updateMutation.isPending
          }
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
    </div>
  );
}
