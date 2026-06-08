import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react';
import {
  calculateTotalRevenue,
  calculateTotalCosts,
  calculateIncomeDistribution,
  formatNumber
} from '@/lib/calculations';

import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot() {
  const { t, lang } = useI18n();
  const { selectedProjectId } = useProject();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  const { data: project } = useQuery({
    queryKey: ['project', selectedProjectId],
    queryFn: () =>
      base44.entities.Project.list().then((list) =>
        list.find((p) => p.id === selectedProjectId)
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildContext = () => {
    const sharing = sharings[0];

    const revenue = calculateTotalRevenue(services);
    const costTotals = calculateTotalCosts(costs);
    const distribution = calculateIncomeDistribution(
      services,
      costs,
      sharing
    );

    return `
Project: ${project?.name || 'N/A'}
Government Entity: ${project?.government_entity || 'N/A'}
Private Partner: ${project?.private_partner || 'N/A'}

Services:
${services
  .map(
    (s) =>
      `${s.name} - Base Price: ${s.base_price} - Qty: ${s.base_quantity}`
  )
  .join(', ')}

Revenue:
${revenue
  .map((r) => `Year ${r.year}: ${formatNumber(r.revenue)} SAR`)
  .join(', ')}

Costs:
${costTotals
  .map(
    (c) =>
      `Year ${c.year}: Operational ${formatNumber(
        c.operational
      )} - Capital ${formatNumber(c.capital)}`
  )
  .join(', ')}

Distribution:
${distribution
  .map(
    (d) =>
      `Year ${d.year}: Net ${formatNumber(
        d.netIncome
      )} - Gov ${formatNumber(
        d.governmentAmount
      )} - Partner ${formatNumber(d.partnerAmount)}`
  )
  .join(', ')}
`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

