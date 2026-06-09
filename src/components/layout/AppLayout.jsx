import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';

import { useI18n } from '@/lib/i18n.jsx';
import { cn } from '@/lib/utils.js';

import { MessageCircle } from 'lucide-react';

import { motion } from 'framer-motion';

export default function AppLayout() {
  const [collapsed, setCollapsed] =
    useState(false);

  const { isRTL } =
    useI18n();

  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen
        bg-background
        text-foreground
        relative
        overflow-hidden
      "
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="
            absolute
            top-0
            left-0
            w-[500px]
            h-[500px]
            bg-primary/5
            blur-3xl
            rounded-full
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-0
            w-[400px]
            h-[400px]
            bg-blue-500/5
            blur-3xl
            rounded-full
          "
        />
      </div>

      <Sidebar
        collapsed={collapsed}
        onToggle={() =>
          setCollapsed(!collapsed)
        }
      />

      <main
        className={cn(
          `
          relative
          z-10
          transition-all
          duration-300
          min-h-screen
          `,
          isRTL
            ? collapsed
              ? 'mr-20'
              : 'mr-72'
            : collapsed
            ? 'ml-20'
            : 'ml-72'
        )}
      >
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <motion.button
        initial={{
          scale: 0,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.95,
        }}
        transition={{
          duration: 0.25,
        }}
        onClick={() =>
          navigate('/chatbot')
        }
        className="
          fixed
          bottom-6
          z-50
          w-16
          h-16
          rounded-full
          bg-primary
          text-primary-foreground
          shadow-2xl
          flex
          items-center
          justify-center
          border
          border-primary/30
        "
        style={
          isRTL
            ? {
                left: '1.5rem',
                right: 'auto',
              }
            : {
                right: '1.5rem',
              }
        }
      >
        <MessageCircle className="w-7 h-7" />
      </motion.button>
    </div>
  );
}
