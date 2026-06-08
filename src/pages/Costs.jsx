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

  const startYear = project?.start_date
    ? new Date(
        project.start_date
      ).getFullYear() + 1
    : new Date().getFullYear() + 1;

  const { data: costs = [] } = useQuery({
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
