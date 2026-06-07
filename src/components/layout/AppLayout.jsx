import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { useI18n } from '@/lib/i18n.jsx';
import { cn } from '@/lib/utils.js';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isRTL } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          isRTL
            ? collapsed
              ? 'mr-16'
              : 'mr-64'
            : collapsed
            ? 'ml-16'
            : 'ml-64'
        )}
      >
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/chatbot')}
        className="fixed bottom-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        style={isRTL ? { left: '1.5rem', right: 'auto' } : { right: '1.5rem' }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
