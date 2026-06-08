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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  PieChart as PieChartIcon,
  Save,
  ArrowLeft,
  ArrowRight,
  Clock,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  calculateIncomeDistribution,
  formatNumber,
} from '@/lib/calculations';

import { motion } from 'framer-motion';

const COLORS = [
  'hsl(46, 100%, 50%)',
  'hsl(210, 15%, 75%)',
];

export default function IncomeSharing() {
  const { t, lang } = useI18n();

  const {
    selectedProjectId,
    selectedProject,
  } = useProject();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const isAr = lang === 'ar';

  const [uniform, setUniform] =
    useState(true);

  const [govShares, setGovShares] =
    useState([50, 50, 50, 50, 50]);

  const [
    partnerShares,
    setPartnerShares,
  ] = useState([50, 50, 50, 50, 50]);

  const { data: project } = useQuery({
    queryKey: ['project', selectedProjectId],

    queryFn: () =>
      base44.entities.Project.list().then(
        (list) =>
          list.find(
            (p) => p.id === selectedProjectId
          )
      ),

    enabled: !!selectedProjectId,
  });

  const startYear = project?.start_date
    ? new Date(
        project.start_date
      ).getFullYear()
    : new Date().getFullYear();

  const yearLabels = [0, 1, 2, 3, 4].map(
    (i) => String(startYear + 1 + i)
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
      setUniform(
        sharing.uniform_rate !== false
      );

      setGovShares(
        sharing.government_shares || [
          50,
          50,
          50,
          50,
          50,
        ]
      );

      setPartnerShares(
        sharing.partner_shares || [
          50,
          50,
          50,
          50,
          50,
        ]
      );
    }
  }, [sharing]);

  const createMutation = useMutation({
    mutationFn: (data) =>
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
      base44.entities.IncomeSharing.update(
        id,
        data
      ),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['sharing', selectedProjectId],
      }),
  });

  const handleGovShareChange = (
    index,
    value
  ) => {
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

  const toggleUniform = (val) => {
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

  const totalGov =
    distribution.reduce(
      (s, d) => s + d.governmentAmount,
      0
    );

  const totalPartner =
    distribution.reduce(
      (s, d) => s + d.partnerAmount,
      0
    );

  const pieData = [
    {
      name: t(
        'governmentShare',
        selectedProject
      ),
      value: Math.max(0, totalGov),
    },

    {
      name: t(
        'partnerShare',
        selectedProject
      ),
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
        dir={isAr ? 'rtl' : 'ltr'}
        className="text-start"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />

          {t('incomeSharing')}
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          {lang === 'ar'
            ? 'توزيع الدخل بين الحكومة والشريك الخاص على مدار 5 سنوات'
            : 'Distribute income between government and private partner over 5 years'}
        </p>
      </div>
    </div>
  );
}
