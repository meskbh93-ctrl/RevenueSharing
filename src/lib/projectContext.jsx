import React, { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return localStorage.getItem('selected_project_id') || null;
  });
  const [selectedProject, setSelectedProject] = useState(null);

  const handleSetSelectedProjectId = (id) => {
    setSelectedProjectId(id);
    if (id) {
      localStorage.setItem('selected_project_id', id);
    } else {
      localStorage.removeItem('selected_project_id');
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
