import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart as PieChartIcon, Save, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateIncomeDistribution, formatNumber } from '@/lib/calculations';
import { motion } from 'framer-motion';

const COLORS = ['hsl(46, 100%, 50%)', 'hsl(210, 15%, 75%)'];

export default function IncomeSharing() {
  const { t, lang } = useI18n();
  const { selectedProjectId } = useProject();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAr = lang === 'ar';

  const [uniform, setUniform] = useState(true);
  const [govShares, setGovShares] = useState([50, 50, 50, 50, 50]);
  const [partnerShares, setPartnerShares] = useState([50, 50, 50, 50, 50]);

  const { data: project } = useQuery({
    queryKey: ['project', selectedProjectId],
    queryFn: () =>
      base44.entities.Project.list().then(
        list => list.find(p => p.id === selectedProjectId)
      ),
    enabled: !!selectedProjectId,
  });

  const startYear = project?.start_date
    ? new Date(project.start_date).getFullYear()
    : new Date().getFullYear();

  const yearLabels = [0, 1, 2, 3, 4].map(i =>
    String(startYear + 1 + i)
  );

  const { data: services = [] } = useQuery({
    queryKey: ['services', selectedProjectId],
    queryFn: () =>
      base44.entities.Service.filter({
        project_id: selectedProjectId,
      }),
    enabled: !!selectedProjectId,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs', selectedProjectId],
    queryFn: () =>
      base44.entities.Cost.filter({
        project_id: selectedProjectId,
      }),
    enabled: !!selectedProjectId,
  });

  const { data: sharings = [] } = useQuery({
    queryKey: ['sharing', selectedProjectId],
    queryFn: () =>
      base44.entities.IncomeSharing.filter({
        project_id: selectedProjectId,
      }),
    enabled: !!selectedProjectId,
  });

  const sharing = sharings[0];

  useEffect(() => {
    if (sharing) {
      setUniform(sharing.uniform_rate !== false);

      setGovShares(
        sharing.government_shares || [50, 50, 50, 50, 50]
      );

      setPartnerShares(
        sharing.partner_shares || [50, 50, 50, 50, 50]
      );
    }
  }, [sharing]);

  const createMutation = useMutation({
    mutationFn: data =>
      base44.entities.IncomeSharing.create({
        ...data,
        project_id: selectedProjectId,
      }),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['sharing', selectedProjectId],
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.IncomeSharing.update(id, data),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['sharing', selectedProjectId],
      }),
  });

  const handleGovShareChange = (index, value) => {
    const val = Math.min(
      100,
      Math.max(0, Number(value) || 0)
    );

    let newGov;
    let newPartner;

    if (uniform) {
      newGov = [val, val, val, val, val];

      newPartner = [
        100 - val,
        100 - val,
        100 - val,
        100 - val,
        100 - val,
      ];
    } else {
      newGov = [...govShares];
      newPartner = [...partnerShares];

      newGov[index] = val;
      newPartner[index] = 100 - val;
    }

    setGovShares(newGov);
    setPartnerShares(newPartner);

    const payload = {
      uniform_rate: uniform,
      government_shares: newGov,
      partner_shares: newPartner,
    };

    if (sharing) {
      updateMutation.mutate({
        id: sharing.id,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleUniform = val => {
    setUniform(val);

    if (val) {
      const v = govShares[0];

      const newGov = [v, v, v, v, v];

      const newPartner = [
        100 - v,
        100 - v,
        100 - v,
        100 - v,
        100 - v,
      ];

      setGovShares(newGov);
      setPartnerShares(newPartner);

      const payload = {
        uniform_rate: true,
        government_shares: newGov,
        partner_shares: newPartner,
      };

      if (sharing) {
        updateMutation.mutate({
          id: sharing.id,
          data: payload,
        });
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  const distribution =
    calculateIncomeDistribution(
      services,
      costs,
      {
        government_shares: govShares,
        partner_shares: partnerShares,
      }
    );

  const totalGov = distribution.reduce(
    (s, d) => s + d.governmentAmount,
    0
  );

  const totalPartner = distribution.reduce(
    (s, d) => s + d.partnerAmount,
    0
  );

  const pieData = [
    {
      name:
        project?.government_entity ||
        (isAr
          ? 'الجهة الحكومية'
          : 'Government'),

      value: Math.max(0, totalGov),
    },

    {
      name:
        project?.private_partner ||
        (isAr
          ? 'الشريك الخاص'
          : 'Private Partner'),

      value: Math.max(0, totalPartner),
    },
  ];

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground">
        <PieChartIcon className="w-12 h-12 mb-3 opacity-30" />
        <p>{t('selectProject')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="text-start"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Revenue Sharing
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          {lang === 'ar'
            ? 'توزيع الدخل بين الحكومة والشريك الخاص على مدار 5 سنوات'
            : 'Distribute income between government and private partner over 5 years'}
        </p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div
          className="bg-card border border-border rounded-xl p-5"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold">
              {isAr ? 'توزيع الدخل' : 'Income Distribution'}
            </span>

            <div className="flex items-center gap-2">
              <Label className="text-sm">
                {isAr
                  ? 'نسبة موحدة لجميع السنوات'
                  : 'Uniform Rate for All Years'}
              </Label>

              <Switch
                checked={uniform}
                onCheckedChange={toggleUniform}
              />
            </div>
          </div>

          {(uniform ? [0] : [0, 1, 2, 3, 4]).map(i => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-4 mb-3 pb-3 border-b border-border/50 last:border-0 last:mb-0 last:pb-0"
            >
              <span className="text-sm font-medium w-16 text-start">
                {yearLabels[i]}
              </span>

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={govShares[i]}
                  onChange={e =>
                    handleGovShareChange(i, e.target.value)
                  }
                  className="h-9 text-center w-24"
                />

                <span className="text-xs text-muted-foreground">
                  {project?.government_entity ||
                    (isAr
                      ? 'الجهة الحكومية'
                      : 'Government')}{' '}
                  %
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={partnerShares[i]}
                  disabled
                  className="h-9 text-center w-24 bg-muted"
                />

                <span className="text-xs text-muted-foreground">
                  {project?.private_partner ||
                    (isAr
                      ? 'الشريك الخاص'
                      : 'Private Partner')}{' '}
                  %
                </span>
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-4 pt-4 border-t border-border">
            <Button
              className="bg-accent hover:bg-accent/90 text-white gap-2"
              onClick={() => {
                const payload = {
                  uniform_rate: uniform,
                  government_shares: govShares,
                  partner_shares: partnerShares,
                };

                if (sharing) {
                  updateMutation.mutate({
                    id: sharing.id,
                    data: payload,
                  });
                } else {
                  createMutation.mutate(payload);
                }
              }}
            >
              <Save className="w-4 h-4" />
              {isAr ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">

        <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {lang === 'ar'
              ? 'إجمالي الدخل (5 سنوات)'
              : 'Total Income (5yr)'}
          </p>

          <p className="text-xl font-bold">
            {formatNumber(
              distribution.reduce(
                (s, d) => s + d.netIncome,
                0
              )
            )}{' '}
            {isAr ? 'ريال' : 'SAR'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {project?.government_entity ||
              (isAr
                ? 'الجهة الحكومية'
                : 'Government')}{' '}
            ({isAr ? '5 سنوات' : '5yr'})
          </p>

          <p className="text-xl font-bold text-primary">
            {formatNumber(totalGov)}{' '}
            {isAr ? 'ريال' : 'SAR'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {project?.private_partner ||
              (isAr
                ? 'الشريك الخاص'
                : 'Private Partner')}{' '}
            ({isAr ? '5 سنوات' : '5yr'})
          </p>

          <p className="text-xl font-bold text-accent">
            {formatNumber(totalPartner)}{' '}
            {isAr ? 'ريال' : 'SAR'}
          </p>
        </div>

      </div>
    </div>
  );
}
