import React, {
  useRef,
  useState,
} from 'react';

import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { base44 } from '@/api/base44Client';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';

import {
  LayoutDashboard,
  Printer,
  Coins,
  Landmark,
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import {
  calculateTotalRevenue,
  calculateTotalCosts,
  calculateIncomeDistribution,
  formatNumber,
} from '@/lib/calculations';

const COLORS = [
  '#facc15',
  '#94a3b8',
];

function StatCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        shadow-sm
        backdrop-blur
        ${color}
      `}
    >

      <div className="flex items-start justify-between mb-3">

        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {title}
          </p>

          <h3 className="text-2xl font-bold">
            {value}
          </h3>
        </div>

        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
          {icon}
        </div>

      </div>

    </div>
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

  const isAr =
    lang === 'ar';

  const { data: project } =
    useQuery({
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

      enabled:
        !!selectedProjectId,
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

    enabled:
      !!selectedProjectId,
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

      enabled:
        !!selectedProjectId,
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

    enabled:
      !!selectedProjectId,
  });

  const sharing =
    sharings[0];

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
      (s, r) =>
        s + r.revenue,
      0
    );

  const totalCost =
    costData.reduce(
      (s, c) =>
        s + c.total,
      0
    );

  const totalNet =
    totalRev - totalCost;

  const totalGov =
    distribution.reduce(
      (s, d) =>
        s +
        d.governmentAmount,
      0
    );

  const totalPartner =
    distribution.reduce(
      (s, d) =>
        s +
        d.partnerAmount,
      0
    );

  const chartData =
    distribution.map(
      (d, i) => ({
        year:
          2027 + i,

        government:
          d.governmentAmount,

        partner:
          d.partnerAmount,

        costs:
          costData[i]?.total || 0,

        revenue:
          revenueData[i]
            ?.revenue || 0,
      })
    );

  const pieData = [
    {
      name:
        isAr
          ? 'الحكومة'
          : 'Government',

      value: totalGov,
    },

    {
      name:
        isAr
          ? 'الشريك'
          : 'Partner',

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
              backgroundColor:
                '#020817',
            }
          );

        const imgData =
          canvas.toDataURL(
            'image/png'
          );

        const pdf =
          new jsPDF(
            'p',
            'mm',
            'a4'
          );

        const width =
          pdf.internal.pageSize.getWidth();

        const height =
          (canvas.height *
            width) /
          canvas.width;

        pdf.addImage(
          imgData,
          'PNG',
          0,
          0,
          width,
          height
        );

        pdf.save(
          'dashboard.pdf'
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
      className="
        max-w-7xl
        mx-auto
        space-y-6
      "
    >

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-3xl font-bold flex items-center gap-2">

            <LayoutDashboard className="w-7 h-7" />

            {isAr
              ? 'لوحة البيانات'
              : 'Dashboard'}

          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? 'المؤشرات المالية وتحليل المشروع'
              : 'Project financial analytics'}
          </p>

        </div>

        <Button
          onClick={
            handleDownloadPDF
          }
          disabled={
            pdfLoading
          }
          className="
            gap-2
            bg-accent
            hover:bg-accent/90
            text-white
          "
        >

          <Printer className="w-4 h-4" />

          {isAr
            ? 'طباعة PDF'
            : 'Export PDF'}

        </Button>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">

        <StatCard
          title={
            isAr
              ? 'الإيرادات'
              : 'Revenue'
          }
          value={`${formatNumber(totalRev)} ريال`}
          icon={
            <Coins className="w-5 h-5 text-yellow-400" />
          }
          color="bg-card/90 border-border"
        />

        <StatCard
          title={
            isAr
              ? 'صافي الدخل'
              : 'Net Income'
          }
          value={`${formatNumber(totalNet)} ريال`}
          icon={
            <Wallet className="w-5 h-5 text-green-400" />
          }
          color="bg-card/90 border-border"
        />

        <StatCard
          title={
            isAr
              ? 'الحكومة'
              : 'Government'
          }
          value={`${formatNumber(totalGov)} ريال`}
          icon={
            <Landmark className="w-5 h-5 text-yellow-400" />
          }
          color="bg-card/90 border-border"
        />

        <StatCard
          title={
            isAr
              ? 'الشريك'
              : 'Partner'
          }
          value={`${formatNumber(totalPartner)} ريال`}
          icon={
            <Building2 className="w-5 h-5 text-slate-300" />
          }
          color="bg-card/90 border-border"
        />

        <StatCard
          title={
            isAr
              ? 'إجمالي التكاليف'
              : 'Costs'
          }
          value={`${formatNumber(totalCost)} ريال`}
          icon={
            <TrendingDown className="w-5 h-5 text-blue-400" />
          }
          color="bg-blue-500/10 border-blue-500/20"
        />

        <StatCard
          title={
            isAr
              ? 'التكاليف الرأسمالية'
              : 'Capital'
          }
          value={`0 ريال`}
          icon={
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          }
          color="bg-yellow-500/10 border-yellow-500/20"
        />

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Revenue */}

        <div className="bg-card/90 border border-border rounded-2xl p-5">

          <h3 className="font-bold mb-4">
            {isAr
              ? 'تحليل الإيرادات'
              : 'Revenue Analysis'}
          </h3>

          <ResponsiveContainer
            width="100%"
            height={280}
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
                fill="#facc15"
                radius={[
                  5,
                  5,
                  0,
                  0,
                ]}
              />

              <Bar
                dataKey="partner"
                fill="#94a3b8"
                radius={[
                  5,
                  5,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* Costs */}

        <div className="bg-card/90 border border-border rounded-2xl p-5">

          <h3 className="font-bold mb-4">
            {isAr
              ? 'تحليل التكاليف'
              : 'Costs Analysis'}
          </h3>

          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <BarChart
              data={chartData}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="year" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="costs"
                fill="#3b82f6"
                radius={[
                  5,
                  5,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* Pie */}

        <div className="bg-card/90 border border-border rounded-2xl p-5">

          <h3 className="font-bold mb-4">
            {isAr
              ? 'توزيع الدخل النهائي'
              : 'Income Split'}
          </h3>

          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={70}
                outerRadius={100}
              >

                {pieData.map(
                  (
                    entry,
                    index
                  ) => (
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
              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* Revenue Distribution */}

        <div className="bg-card/90 border border-border rounded-2xl p-5">

          <h3 className="font-bold mb-4">
            {isAr
              ? 'توزيع الدخل'
              : 'Revenue Split'}
          </h3>

          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <BarChart
              data={chartData}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="year" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="government"
                stackId="a"
                fill="#facc15"
              />

              <Bar
                dataKey="partner"
                stackId="a"
                fill="#94a3b8"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Table */}

      <div className="bg-card/90 border border-border rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-border">

          <h3 className="font-bold text-lg">
            {isAr
              ? 'الملخص'
              : 'Summary'}
          </h3>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-muted/20">

              <tr className="text-sm text-muted-foreground">

                <th className="p-4">
                  {isAr
                    ? 'السنة'
                    : 'Year'}
                </th>

                <th className="p-4">
                  {isAr
                    ? 'الإيرادات'
                    : 'Revenue'}
                </th>

                <th className="p-4">
                  {isAr
                    ? 'التكاليف'
                    : 'Costs'}
                </th>

                <th className="p-4">
                  {isAr
                    ? 'صافي الدخل'
                    : 'Net'}
                </th>

                <th className="p-4">
                  {isAr
                    ? 'الحكومة'
                    : 'Government'}
                </th>

                <th className="p-4">
                  {isAr
                    ? 'الشريك'
                    : 'Partner'}
                </th>

              </tr>

            </thead>

            <tbody>

              {chartData.map(
                (
                  row,
                  index
                ) => (

                  <tr
                    key={index}
                    className="border-t border-border text-sm"
                  >

                    <td className="p-4 text-center">
                      {row.year}
                    </td>

                    <td className="p-4 text-center text-yellow-400 font-bold">
                      {formatNumber(
                        row.revenue
                      )}
                    </td>

                    <td className="p-4 text-center text-blue-400 font-bold">
                      {formatNumber(
                        row.costs
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {formatNumber(
                        row.revenue -
                          row.costs
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {formatNumber(
                        row.government
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {formatNumber(
                        row.partner
                      )}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
