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
        ${color}
      `}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500 mb-1">
            {title}
          </p>

          <h3 className="text-3xl font-bold">
            {value}
          </h3>

          <p className="text-xs text-slate-400 mt-2">
            إجمالي 5 سنوات
          </p>

        </div>

        <div className="w-11 h-11 rounded-xl bg-black/10 flex items-center justify-center">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default function Dashboard() {

  const { lang } =
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
                p.id ===
                selectedProjectId
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

  const governmentName =
    project?.government_entity ||
    'الحكومة';

  const partnerName =
    project?.private_partner ||
    'الشريك';

  const operationalCosts =
    costs
      .filter(
        (c) =>
          c.type === 'operational'
      )
      .reduce(
        (s, c) =>
          s + (c.amount || 0),
        0
      );

  const capitalCosts =
    costs
      .filter(
        (c) =>
          c.type === 'capital'
      )
      .reduce(
        (s, c) =>
          s + (c.amount || 0),
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

        net:
          (revenueData[i]
            ?.revenue || 0) -
          (costData[i]?.total || 0),

        operational:
          operationalCosts,

        capital:
          capitalCosts,
      })
    );

  const pieData = [
    {
      name:
        governmentName,
      value:
        totalGov,
    },
    {
      name:
        partnerName,
      value:
        totalPartner,
    },
  ];

  const handleDownloadPDF =
    async () => {

      setPdfLoading(true);

      try {

        const element =
          dashboardRef.current;

        const canvas =
          await html2canvas(
            element,
            {
              scale: 3,
              useCORS: true,
              backgroundColor:
                '#ffffff',
            }
          );

        const imgData =
          canvas.toDataURL(
            'image/png',
            1.0
          );

        const pdf =
          new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
          });

        const pageWidth =
          pdf.internal.pageSize.getWidth();

        const pageHeight =
          pdf.internal.pageSize.getHeight();

        const margin = 5;

        const imgWidth =
          pageWidth -
          margin * 2;

        const imgHeight =
          (canvas.height *
            imgWidth) /
          canvas.width;

        let heightLeft =
          imgHeight;

        let position =
          margin;

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -=
          pageHeight;

        while (
          heightLeft > 0
        ) {

          position =
            heightLeft -
            imgHeight +
            margin;

          pdf.addPage();

          pdf.addImage(
            imgData,
            'PNG',
            margin,
            position,
            imgWidth,
            imgHeight
          );

          heightLeft -=
            pageHeight;
        }

        pdf.save(
          'dashboard-report.pdf'
        );

      } catch (error) {

        console.error(error);

      }

      setPdfLoading(false);
    };

  return (
    <div
      ref={dashboardRef}
      className="
        bg-white
        text-black
        p-6
        space-y-6
        max-w-7xl
        mx-auto
      "
    >

      {/* Header */}

      <div className="flex items-start justify-between">

        <Button
          onClick={
            handleDownloadPDF
          }
          disabled={
            pdfLoading
          }
          className="
            bg-yellow-400
            hover:bg-yellow-500
            text-black
            gap-2
            font-bold
          "
        >

          <Printer className="w-4 h-4" />

          طباعة التقرير PDF

        </Button>

        <div className="text-right">

          <h2 className="text-4xl font-black flex items-center gap-2 justify-end">

            <LayoutDashboard className="w-8 h-8" />

            لوحة البيانات

          </h2>

          <p className="text-slate-500 mt-2">
            المشاركة في الدخل — نظرة عامة وتحليلات
          </p>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        <StatCard
          title="إجمالي الدخل"
          value={`${formatNumber(totalRev)} ريال`}
          icon={<Coins className="w-5 h-5 text-yellow-400" />}
          color="bg-white border-slate-200"
        />

        <StatCard
          title={governmentName}
          value={`${formatNumber(totalGov)} ريال`}
          icon={<Landmark className="w-5 h-5 text-yellow-400" />}
          color="bg-white border-slate-200"
        />

        <StatCard
          title={partnerName}
          value={`${formatNumber(totalPartner)} ريال`}
          icon={<Building2 className="w-5 h-5 text-yellow-400" />}
          color="bg-white border-slate-200"
        />

        <StatCard
          title="إجمالي التكاليف"
          value={`${formatNumber(totalCost)} ريال`}
          icon={<Wallet className="w-5 h-5 text-slate-500" />}
          color="bg-white border-slate-200"
        />

        <StatCard
          title="التكاليف الرأسمالية"
          value={`${formatNumber(capitalCosts)} ريال`}
          icon={<TrendingUp className="w-5 h-5 text-yellow-400" />}
          color="bg-yellow-50 border-yellow-200"
        />

        <StatCard
          title="التكاليف التشغيلية"
          value={`${formatNumber(operationalCosts)} ريال`}
          icon={<TrendingDown className="w-5 h-5 text-blue-500" />}
          color="bg-blue-50 border-blue-200"
        />

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Revenue */}

        <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-5">

          <h3 className="text-white font-bold mb-5">
            تحليل الإيرادات
          </h3>

          <ResponsiveContainer width="100%" height={280}>

            <BarChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis dataKey="year" stroke="#94a3b8" />

              <YAxis stroke="#94a3b8" />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="revenue"
                fill="#facc15"
                name="الإيرادات"
              />

              <Bar
                dataKey="net"
                fill="#94a3b8"
                name="صافي الدخل"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* Costs */}

        <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-5">

          <h3 className="text-white font-bold mb-5">
            تحليل التكاليف
          </h3>

          <ResponsiveContainer width="100%" height={280}>

            <BarChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis dataKey="year" stroke="#94a3b8" />

              <YAxis stroke="#94a3b8" />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="operational"
                fill="#facc15"
                name="التكاليف التشغيلية"
              />

              <Bar
                dataKey="capital"
                fill="#94a3b8"
                name="التكاليف الرأسمالية"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Summary Table */}

      <div className="border border-slate-200 rounded-2xl overflow-hidden">

        <div className="bg-[#0f172a] px-6 py-4">

          <h3 className="font-bold text-xl text-white">
            الملخص
          </h3>

        </div>

        <table className="w-full">

          <thead className="bg-[#0f172a] text-yellow-400">

            <tr>

              <th className="p-4">السنة</th>
              <th className="p-4">الإيرادات</th>
              <th className="p-4">التكاليف</th>
              <th className="p-4">صافي الدخل</th>
              <th className="p-4">{governmentName}</th>
              <th className="p-4">{partnerName}</th>

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
                  className="border-b border-slate-200"
                >

                  <td className="p-4 text-center font-bold">
                    {row.year}
                  </td>

                  <td className="p-4 text-center text-yellow-500 font-bold">
                    {formatNumber(row.revenue)}
                  </td>

                  <td className="p-4 text-center">
                    {formatNumber(row.costs)}
                  </td>

                  <td className="p-4 text-center">
                    {formatNumber(row.net)}
                  </td>

                  <td className="p-4 text-center text-yellow-600 font-bold">
                    {formatNumber(row.government)}
                  </td>

                  <td className="p-4 text-center text-slate-600 font-bold">
                    {formatNumber(row.partner)}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
