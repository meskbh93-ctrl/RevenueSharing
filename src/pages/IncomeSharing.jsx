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
  <div className="space-y-6 max-w-7xl mx-auto">

    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="text-start"
    >
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Clock className="w-7 h-7" />
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
        className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 shadow-sm"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between mb-5">

          <span className="text-base font-bold">
            {isAr
              ? 'توزيع الدخل'
              : 'Income Distribution'}
          </span>

          <div className="flex items-center gap-2">
            <Label className="text-sm">
              {isAr
                ? 'نسبة موحدة لجميع السنوات'
                : 'Uniform Rate'}
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
            className="
              flex
              flex-wrap
              items-center
              gap-4
              mb-3
              pb-3
              border-b
              border-border/50
              last:border-0
            "
          >
            <span className="text-sm font-bold w-20">
              {yearLabels[i]}
            </span>

            <div className="flex items-center gap-2">

              <Input
                type="text"
                inputMode="decimal"
                value={govShares[i]}
                onChange={e =>
                  handleGovShareChange(
                    i,
                    e.target.value
                  )
                }
                className="h-10 text-center w-28"
              />

              <span className="text-xs text-muted-foreground">
                {project?.government_entity ||
                  'Government'} %
              </span>

            </div>

            <div className="flex items-center gap-2">

              <Input
                type="text"
                value={partnerShares[i]}
                disabled
                className="h-10 text-center w-28 bg-muted"
              />

              <span className="text-xs text-muted-foreground">
                {project?.private_partner ||
                  'Partner'} %
              </span>

            </div>
          </div>
        ))}

        <div className="flex justify-end mt-5 pt-5 border-t border-border">

          <Button
            className="
              bg-accent
              hover:bg-accent/90
              text-white
              gap-2
            "
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

    {/* Summary Cards */}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-5 text-center shadow-sm">
        <p className="text-xs text-muted-foreground mb-2">
          {isAr
            ? 'إجمالي صافي الدخل'
            : 'Total Net Income'}
        </p>

        <p className="text-2xl font-bold">
          {formatNumber(
            distribution.reduce(
              (s, d) => s + d.netIncome,
              0
            )
          )}{' '}
          SAR
        </p>
      </div>

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-5 text-center shadow-sm">
        <p className="text-xs text-muted-foreground mb-2">
          {project?.government_entity ||
            'Government'}
        </p>

        <p className="text-2xl font-bold text-primary">
          {formatNumber(totalGov)} SAR
        </p>
      </div>

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-5 text-center shadow-sm">
        <p className="text-xs text-muted-foreground mb-2">
          {project?.private_partner ||
            'Partner'}
        </p>

        <p className="text-2xl font-bold text-accent">
          {formatNumber(totalPartner)} SAR
        </p>
      </div>

    </div>

    {/* Charts */}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-5 shadow-sm">

        <h3 className="font-bold text-lg mb-4 text-center">
          {isAr
            ? 'التوزيع السنوي'
            : 'Annual Distribution'}
        </h3>

        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <LineChart
            data={distribution.map((d, i) => ({
              ...d,
              yearLabel: yearLabels[i],
            }))}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <XAxis dataKey="yearLabel" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="governmentAmount"
              name={
                project?.government_entity ||
                'Government'
              }
              stroke={COLORS[0]}
              strokeWidth={3}
              dot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="partnerAmount"
              name={
                project?.private_partner ||
                'Partner'
              }
              stroke={COLORS[1]}
              strokeWidth={3}
              dot={{ r: 5 }}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-5 shadow-sm">

        <h3 className="font-bold text-lg mb-4 text-center">
          {isAr
            ? 'التوزيع الإجمالي'
            : 'Total Split'}
        </h3>

        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <PieChart>

            <Pie
              data={pieData}
              dataKey="value"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              label
            >
              {pieData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>

    {/* Table */}

    <div className="bg-card/90 backdrop-blur border border-border rounded-2xl overflow-hidden shadow-sm">

      <div className="p-5 border-b border-border">
        <h3 className="font-bold text-center">
          {isAr
            ? 'ملخص التوزيع'
            : 'Distribution Summary'}
        </h3>
      </div>

      <div className="overflow-x-auto">

        <Table>

          <TableHeader>
            <TableRow className="bg-muted/40">

              <TableHead>
                {t('year')}
              </TableHead>

              <TableHead>
                {t('netIncome')}
              </TableHead>

              <TableHead>
                {project?.government_entity ||
                  'Government'}
              </TableHead>

              <TableHead>
                {project?.private_partner ||
                  'Partner'}
              </TableHead>

            </TableRow>
          </TableHeader>

          <TableBody>

            {distribution.map((d, i) => (
              <TableRow key={i}>

                <TableCell>
                  {yearLabels[i]}
                </TableCell>

                <TableCell>
                  {formatNumber(d.netIncome)}
                </TableCell>

                <TableCell className="text-primary font-semibold">
                  {formatNumber(
                    d.governmentAmount
                  )}
                </TableCell>

                <TableCell className="text-accent font-semibold">
                  {formatNumber(
                    d.partnerAmount
                  )}
                </TableCell>

              </TableRow>
            ))}

          </TableBody>

        </Table>

      </div>

    </div>

    {/* Navigation */}

    <div className="flex justify-between pt-2">

      <Button
        variant="outline"
        onClick={() => navigate('/costs')}
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
        onClick={() => navigate('/dashboard')}
        className="
          gap-2
          bg-accent
          hover:bg-accent/90
          text-white
        "
      >
        {isAr ? 'التالي' : 'Next'}

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
