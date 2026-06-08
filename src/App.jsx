import { Toaster } from "@/components/ui/toaster.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client.js";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import PageNotFound from "./lib/PageNotFound.jsx";

import { I18nProvider } from "@/lib/i18n.jsx";
import { ThemeProvider } from "@/lib/theme.jsx";
import { ProjectProvider } from "@/lib/projectContext.jsx";

import AppLayout from "@/components/layout/AppLayout.jsx";

import Home from "@/pages/Home.jsx";
import Introduction from "@/pages/Introduction.jsx";
import Services from "@/pages/Services.jsx";
import Costs from "@/pages/Costs.jsx";
import IncomeSharing from "@/pages/IncomeSharing.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import Chatbot from "@/pages/Chatbot.jsx";

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <I18nProvider>
        <ThemeProvider>
          <ProjectProvider>
            <Router>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/introduction" element={<Introduction />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/costs" element={<Costs />} />
                  <Route path="/income-sharing" element={<IncomeSharing />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
            <Toaster />
          </ProjectProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
