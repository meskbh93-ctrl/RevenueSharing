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

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const isAr = lang === 'ar';

  const { data: project } = useQuery({
    queryKey: ['project', selectedProjectId],

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

  const [form, setForm] = useState({
    name: '',
    government_entity: '',
    private_partner: '',
    description: '',
  });

  useEffect(() => {
    setForm({
      name: '',
      government_entity: '',
      private_partner: '',
      description: '',
    });
  }, [selectedProjectId]);

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
    mutationFn: (data) =>
      base44.entities.Project.create(data),

    onSuccess: (newProject) => {
      queryClient.invalidateQueries({
        queryKey: ['projects'],
      });

      setSelectedProjectId(
        newProject.id
      );

      navigate('/services');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.Project.update(
        id,
        data
      ),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [
          'project',
          selectedProjectId,
        ],
      }),
  });

  const handleNext = () => {
    if (project) {
      updateMutation.mutate(
        {
          id: project.id,
          data: form,
        },
        {
          onSuccess: () =>
            navigate('/services'),
        }
      );
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto space-y-6"
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
            ? 'تحديد تفاصيل المشروع'
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
                    name: e.target.value,
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
                      ? 'مثال: شركة تك'
                      : 'e.g. Tech Company'
                  }
                  className="bg-background/50 text-base"
                />
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button
                onClick={handleNext}
                className="bg-accent hover:bg-accent/90 text-white gap-2"
                disabled={
                  updateMutation.isPending ||
                  createMutation.isPending
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
        </div>
      </motion.div>
    </div>
  );
}
