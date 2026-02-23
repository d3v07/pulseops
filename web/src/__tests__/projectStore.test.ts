import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectStore } from '../store/projectStore';

describe('projectStore', () => {
    beforeEach(() => {
        // Reset store to initial state
        useProjectStore.setState({
            orgId: '00000000-0000-0000-0000-000000000001',
            projectId: '00000000-0000-0000-0000-000000000002',
        });
    });

    it('has default orgId and projectId', () => {
        const { result } = renderHook(() => useProjectStore());

        expect(result.current.orgId).toBe('00000000-0000-0000-0000-000000000001');
        expect(result.current.projectId).toBe('00000000-0000-0000-0000-000000000002');
    });

    it('updates orgId', () => {
        const { result } = renderHook(() => useProjectStore());

        act(() => {
            result.current.setOrgId('new-org-id');
        });

        expect(result.current.orgId).toBe('new-org-id');
    });

    it('updates projectId', () => {
        const { result } = renderHook(() => useProjectStore());

        act(() => {
            result.current.setProjectId('new-project-id');
        });

        expect(result.current.projectId).toBe('new-project-id');
    });
});
