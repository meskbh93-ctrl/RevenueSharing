import React, { useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { base44 } from '@/api/base44Client';

import { useQuery } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import {
  LayoutDashboard,
  DollarSign,
  Building2,
  Handshake,
  Wrench,
  Landmark,
  Calculator,
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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  delay,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div
            className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          <p className="text-sm font-bold text-center flex-1">
            {title}
          </p>
        </div>

        <p className="text-2xl font-bold text-center">
          {value}
        </p>

        {subtitle && (
          <p className="text-xs text-muted-foreground text-center mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { t, lang } = useI18n();

  const {
    selectedProjectId,
    selectedProject,
  } = useProject();

  const dashboardRef = useRef();

  const chartRef1 = useRef();
  const chartRef2 = useRef();
  const chartRef3 = useRef();
  const chartRef4 = useRef();

  const [pdfLoading, setPdfLoading] =
    useState(false);

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

  const revenueData =
    calculateTotalRevenue(services);

  const costData =
    calculateTotalCosts(costs);

  const distribution =
    calculateIncomeDistribution(
      services,
      costs,
      sharing
    );

  const totalRev = revenueData.reduce(
    (s, r) => s + r.revenue,
    0
  );

  const totalCost = costData.reduce(
    (s, c) => s + c.total,
    0
  );

  const totalNet = totalRev - totalCost;

  const totalGov =
    distribution.reduce(
const handleDownloadPDF = async () => {
    setPdfLoading(true);

    try {
      const canvas = await html2canvas(
        dashboardRef.current,
        {
          scale: 2,
          useCORS: true,
        }
      );

      const imgData =
        canvas.toDataURL('image/png');

      const pdf = new jsPDF(
        'p',
        'mm',
        'a4'
      );

      const pdfWidth =
        pdf.internal.pageSize.getWidth();

      const pdfHeight =
        (canvas.height * pdfWidth) /
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
        `dashboard-${project?.name || 'report'}.pdf`
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

        <p>{t('selectProject')}</p>
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
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="text-start"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />

            {t('dashboard')}
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'ar'
              ? 'المشاركة في الدخل — نظرة عامة وتحليلات'
              : 'Income Sharing — Overview & Analytics'}
          </p>
        </div>

        <Button
