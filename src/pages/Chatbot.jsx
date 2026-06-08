import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import { useI18n } from '@/lib/i18n.jsx';
import { useProject } from '@/lib/projectContext.jsx';
import { base44 } from '@/api/base44Client';

import { useQuery } from '@tanstack/react-query';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
} from 'lucide-react';

import {
  calculateTotalRevenue,
  calculateTotalCosts,
  calculateIncomeDistribution,
  formatNumber,
} from '@/lib/calculations';

import ReactMarkdown from 'react-markdown';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

export default function Chatbot() {
  const { t, lang } = useI18n();

  const { selectedProjectId } =
    useProject();

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const scrollRef = useRef(null);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildContext = () => {
    const sharing = sharings[0];

    const revenue =
      calculateTotalRevenue(
        services
      );

    const costTotals =
      calculateTotalCosts(costs);

    const distribution =
      calculateIncomeDistribution(
        services,
        costs,
        sharing
      );

    return `
Project: ${project?.name || 'N/A'}

Government Entity:
${project?.government_entity || 'N/A'}

Private Partner:
${project?.private_partner || 'N/A'}

Services:
${services
  .map(
    (s) =>
      `${s.name} - Price: ${s.base_price}`
  )
  .join(', ')}

Revenue:
${revenue
  .map(
    (r) =>
      `Year ${r.year}: ${formatNumber(
        r.revenue
      )}`
  )
  .join(', ')}

Costs:
${costTotals
  .map(
    (c) =>
      `Year ${c.year}: ${formatNumber(
        c.total
      )}`
  )
  .join(', ')}

Distribution:
${distribution
  .map(
    (d) =>
      `Year ${d.year}: Government ${formatNumber(
        d.governmentAmount
      )} - Partner ${formatNumber(
        d.partnerAmount
      )}`
  )
  .join(', ')}
`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading)
      return;

    const userMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setLoading(true);

    try {
      const context = buildContext();

      const reply = `
### ${
        lang === 'ar'
          ? 'ملخص المشروع'
          : 'Project Summary'
      }

${context}

### ${
        lang === 'ar'
          ? 'رد المساعد'
          : 'Assistant Response'
      }

${input}
`;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch (error) {
      console.error(error);
    }

    setInput('');
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
    <div className="max-w-4xl mx-auto">
      <Card className="border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Bot className="w-5 h-5" />

          <h2 className="font-bold">
            {lang === 'ar'
              ? 'المساعد الذكي'
              : 'AI Assistant'}
          </h2>
        </div>

        <CardContent className="p-0">
          <ScrollArea
            className="h-[500px] p-4"
            ref={scrollRef}
          >
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map(
                  (message, index) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className={`flex ${
                        message.role ===
                        'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          message.role ===
                          'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {message.role ===
                          'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}

                          <span className="font-medium">
                            {message.role ===
                            'user'
                              ? lang ===
                                'ar'
                                ? 'أنت'
                                : 'You'
                              : lang ===
                                'ar'
                              ? 'المساعد'
                              : 'Assistant'}
                          </span>
                        </div>

                        <ReactMarkdown>
                          {
                            message.content
                          }
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />

                    {lang === 'ar'
                      ? 'جاري التفكير...'
                      : 'Thinking...'}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4 flex gap-2">
            <Input
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              placeholder={
                lang === 'ar'
                  ? 'اكتب سؤالك...'
                  : 'Ask anything...'
              }
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter'
                ) {
                  handleSend();
                }
              }}
            />

            <Button
              onClick={handleSend}
              disabled={loading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
