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
import { calculateTotalRevenue, calculateTotalCosts, calculateIncomeDistribution, formatNumber } from '@/lib/calculations';
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
    queryFn: () => base44.entities.Project.list().then(list => list.find(p => p.id === selectedProjectId)),
    enabled: !!selectedProjectId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', selectedProjectId],
    queryFn: () => base44.entities.Service.filter({ project_id: selectedProjectId }),
    enabled: !!selectedProjectId,
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs', selectedProjectId],
    queryFn: () => base44.entities.Cost.filter({ project_id: selectedProjectId }),
    enabled: !!selectedProjectId,
  });

  const { data: sharings = [] } = useQuery({
    queryKey: ['sharing', selectedProjectId],
    queryFn: () => base44.entities.IncomeSharing.filter({ project_id: selectedProjectId }),
    enabled: !!selectedProjectId,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildContext = () => {
    const sharing = sharings[0];
    const rev = calculateTotalRevenue(services);
    const costTotals = calculateTotalCosts(costs);
    const dist = calculateIncomeDistribution(services, costs, sharing);

    return `Project: ${project?.name || 'N/A'}
Government Entity: ${project?.government_entity || 'N/A'}
Private Partner: ${project?.private_partner || 'N/A'}
Services (${services.length}): ${services.map(s => `${s.name} (Base Price: ${s.base_price}, Qty: ${s.base_quantity})`).join(', ')}
Revenue by Year: ${rev.map(r => `Y${r.year}: ${formatNumber(r.revenue)} SAR`).join(', ')}
Costs by Year: ${costTotals.map(c => `Y${c.year}: Op ${formatNumber(c.operational)}, Cap ${formatNumber(c.capital)}, Total ${formatNumber(c.total)} SAR`).join(', ')}
Income Distribution by Year: ${dist.map(d => `Y${d.year}: Net ${formatNumber(d.netIncome)}, Gov ${formatNumber(d.governmentAmount)} (${d.governmentPercent}%), Partner ${formatNumber(d.partnerAmount)} (${d.partnerPercent}%)`).join(', ')}
Total Revenue (5Y): ${formatNumber(rev.reduce((s, r) => s + r.revenue, 0))} SAR
Total Costs (5Y): ${formatNumber(costTotals.reduce((s, c) => s + c.total, 0))} SAR
Total Net Income (5Y): ${formatNumber(dist.reduce((s, d) => s + d.netIncome, 0))} SAR`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const context = buildContext();
    const systemPrompt = lang === 'ar'
      ? `أنت مساعد ذكي متخصص في عقود المشاركة في الدخل بين الجهات الحكومية والقطاع الخاص في السعودية. أجب باللغة العربية. هذه بيانات المشروع الحالي:\n${context}`
      : `You are a smart assistant specializing in income sharing contracts between government entities and the private sector in Saudi Arabia. Here is the current project data:\n${context}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nUser question: ${userMsg}`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground">
        <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
        <p>{t('selectProject')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">{t('chatbot')}</h2>
      </div>

      <Card className="h-[calc(100vh-280px)] flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{lang === 'ar' ? 'اسألني أي سؤال عن المشروع' : 'Ask me anything about the project'}</p>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <CardContent className="p-3 border-t">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
