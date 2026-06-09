import React, { useRef, useState } from 'react';

import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { base44 } from '@/api/base44Client';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';

import {
  LayoutDashboard,
  Printer,
} from 'lucide-react';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  calculateTotalRevenue,
  calculateTotalCosts,
  calculateIncomeDistribution,
  formatNumber,
} from '@/lib/calculations';

import { motion } from 'framer-motion';

const COLORS = [
  '#EAB308',
  '#94A3B8',
];

function StatCard({
  title,
  value,
  subtitle,
  delay,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{ delay }}
    >
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm text-muted-foreground mb-2">
          {title}
        </p>

        <p className="text-2xl font-bold">
          {value}
        </p>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { t, lang } =
    useI18n();

  const {
    selectedProjectId,
  } = useProject();

  const dashboardRef =
    useRef();

  const [pdfLoading, setPdfLoading] =
    useState(false);

  const isAr = lang === 'ar';

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
              p.id ===
              selectedProjectId
          )
      ),

    enabled: !!selectedProjectId,
  });

  const {
    data: services = [],
  } = useQuery({
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

  const {
    data: sharings = [],
  } = useQuery({
    queryKey: [
      'sharing',
      selectedProjectId,
    ],

    queryFn: () =>
      base44.entities.IncomeSharing.filter(
        {
          project_id:
            selectedProjectId,
        }
      ),

    enabled: !!selectedProjectId,
  });

  const sharing = sharings[0];

  const revenueData =
    calculateTotalRevenue(
      services
    );

  const costData =
    calculateTotalCosts(costs);

  const distribution =
    calculateIncomeDistribution(
      services,
      costs,
      sharing
    );

  const totalRev =
    revenueData.reduce(
      (s, r) => s + r.revenue,
      0
    );

  const totalCost =
    costData.reduce(
      (s, c) => s + c.total,
      0
    );

  const totalNet =
    totalRev - totalCost;

  const totalGov =
    distribution.reduce(
      (s, d) =>
        s + d.governmentAmount,
      0
    );

  const totalPartner =
    distribution.reduce(
      (s, d) =>
        s + d.partnerAmount,
      0
    );

  const chartData =
    distribution.map((d, i) => ({
      year:
        new Date().getFullYear() +
        i +
        1,

      government:
        d.governmentAmount,

      partner: d.partnerAmount,
    }));

  const pieData = [
    {
      name:
        project?.government_entity ||
        (isAr
          ? 'الجهة الحكومية'
          : 'Government'),

      value: totalGov,
    },

    {
      name:
        project?.private_partner ||
        (isAr
          ? 'الشريك الخاص'
          : 'Private Partner'),

      value: totalPartner,
    },
  ];

  const handleDownloadPDF =
    async () => {
      setPdfLoading(true);

      try {
        const canvas =
          await html2canvas(
            dashboardRef.current,
            {
              scale: 2,
              useCORS: true,
            }
          );

        const imgData =
          canvas.toDataURL(
            'image/png'
          );

        const pdf = new jsPDF(
          'p',
          'mm',
          'a4'
        );

        const pdfWidth =
          pdf.internal.pageSize.getWidth();

        const pdfHeight =
          (canvas.height *
            pdfWidth) /
          canvas.width;

        pdf.addImage(
          imgData,
          'PNG',
          0,
          0,
          pdfWidth,
          pdfHeight
        );

        pdf.save(
          `dashboard-${
            project?.name ||
            'report'
          }.pdf`
        );
      } catch (error) {
        console.error(error);
      }

      setPdfLoading(false);
    };

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground">
        <LayoutDashboard className="w-12 h-12 mb-3 opacity-30" />

        <p>
          {t('selectProject')}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={dashboardRef}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex items-start justify-between">
        <div
          dir={
            isAr ? 'rtl' : 'ltr'
          }
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />

            {t('dashboard')}
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? 'لوحة التحكم والتحليلات'
              : 'Dashboard & Analytics'}
          </p>
        </div>

        <Button
          onClick={
            handleDownloadPDF
          }
          disabled={pdfLoading}
          className="gap-2"
        >
          <Printer className="w-4 h-4" />

          {pdfLoading
            ? 'Loading...'
            : isAr
            ? 'تصدير PDF'
            : 'Export PDF'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={
            isAr
              ? 'الإيرادات'
              : 'Revenue'
          }
          value={`${formatNumber(
            totalRev
          )} SAR`}
          delay={0}
        />

        <StatCard
          title={
            isAr
              ? 'التكاليف'
              : 'Costs'
          }
          value={`${formatNumber(
            totalCost
          )} SAR`}
          delay={0.1}
        />

        <StatCard
          title={
            isAr
              ? 'صافي الدخل'
              : 'Net Income'
          }
          value={`${formatNumber(
            totalNet
          )} SAR`}
          delay={0.2}
        />

        <StatCard
          title={
            project?.government_entity ||
            (isAr
              ? 'الجهة الحكومية'
              : 'Government Share')
          }
          value={`${formatNumber(
            totalGov
          )} SAR`}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold mb-4">
            {isAr
              ? 'توزيع الدخل'
              : 'Income Distribution'}
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart
              data={chartData}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="year" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="government"
                fill={COLORS[0]}
                name={
                  project?.government_entity ||
                  'Government'
                }
              />

              <Bar
                dataKey="partner"
                fill={COLORS[1]}
                name={
                  project?.private_partner ||
                  'Partner'
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold mb-4">
            {isAr
              ? 'النسب الإجمالية'
              : 'Total Split'}
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {pieData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[index]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
