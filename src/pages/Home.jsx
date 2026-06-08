import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useI18n } from '@/lib/i18n.jsx';
import { base44 } from '@/api/base44Client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  Building2,
  Calendar,
  Users,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { motion } from 'framer-motion';

import { useProject } from '@/lib/projectContext.jsx';

export default function Home() {
  const { lang } = useI18n();

  const navigate = useNavigate();

  const isAr = lang === 'ar';

  const { setSelectedProjectId } =
    useProject();

  const queryClient =
    useQueryClient();

  const {
    data: projects = [],
    isLoading,
  } = useQuery({
    queryKey: ['projects-home'],

    queryFn: () =>
      base44.entities.Project.list(
        '-created_date'
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.Project.delete(id),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['projects-home'],
      }),
  });

  return (
    <div
      className="min-h-screen py-10 px-4"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {isAr
            ? 'المشاركة في الدخل'
            : 'Income Sharing'}
        </h1>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">
            {isAr
              ? 'المشاريع'
              : 'Projects'}
          </h2>

          <Button
            onClick={() => {
              setSelectedProjectId(
                null
              );

              navigate(
                '/introduction'
              );
            }}
            className="gap-2 rounded-full"
          >
            <Plus className="w-4 h-4" />

            {isAr
              ? 'مشروع جديد'
              : 'New Project'}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-5 animate-pulse h-40"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Building2 className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />

            <p className="text-muted-foreground text-sm mb-4">
              {isAr
                ? 'لا توجد مشاريع بعد'
                : 'No projects yet'}
            </p>

            <Button
              onClick={() => {
                setSelectedProjectId(
                  null
                );

                navigate(
                  '/introduction'
                );
              }}
              className="gap-2 rounded-full"
            >
              <Plus className="w-4 h-4" />

              {isAr
                ? 'أنشئ مشروعاً'
                : 'Create a Project'}
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(
              (project, i) => (
                <motion.div
                  key={project.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: i * 0.06,
                  }}
                  onClick={() => {
                    setSelectedProjectId(
                      project.id
                    );

                    navigate(
                      '/introduction'
                    );
                  }}
                  className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();

                        if (
                          confirm(
                            isAr
                              ? 'هل أنت متأكد من حذف هذا المشروع؟'
                              : 'Delete this project?'
                          )
                        ) {
                          deleteMutation.mutate(
                            project.id
                          );
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-1 leading-tight">
                    {project.name}
                  </h3>

                  <div className="space-y-1 mt-3">
                    {project.government_entity && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3 flex-shrink-0" />

                        <span className="truncate">
                          {
                            project.government_entity
                          }
                        </span>
                      </div>
                    )}

                    {project.private_partner && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3 flex-shrink-0" />

                        <span className="truncate">
                          {
                            project.private_partner
                          }
                        </span>
                      </div>
                    )}

                    {project.start_date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 flex-shrink-0" />

                        <span>
                          {
                            project.start_date
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-muted-foreground group-hover:text-primary transition-colors">
                    {isAr ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </div>
                </motion.div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
