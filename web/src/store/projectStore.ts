import { create } from 'zustand';

interface ProjectStore {
    orgId: string;
    projectId: string;
    setOrgId: (orgId: string) => void;
    setProjectId: (projectId: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    orgId: '00000000-0000-0000-0000-000000000001',
    projectId: '00000000-0000-0000-0000-000000000002',
    setOrgId: (orgId) => set({ orgId }),
    setProjectId: (projectId) => set({ projectId }),
}));
