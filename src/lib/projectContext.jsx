import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userKey, setUserKey] = useState(null);

  // Get current user and use their email as a unique storage key
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.email) {
        const key = `selected_project_id_${user.email}`;
        setUserKey(key);
        const stored = localStorage.getItem(key);
        if (stored) setSelectedProjectId(stored);
      }
    }).catch(() => {});
  }, []);

  // Load full project data whenever selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      base44.entities.Project.list().then(list => {
        const project = list.find(p => p.id === selectedProjectId);
        setSelectedProject(project || null);
      }).catch(() => setSelectedProject(null));
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectId]);

  const handleSetSelectedProjectId = (id) => {
    setSelectedProjectId(id);
    if (userKey) {
      if (id) {
        localStorage.setItem(userKey, id);
      } else {
        localStorage.removeItem(userKey);
      }
    }
  };

  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId: handleSetSelectedProjectId, selectedProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}