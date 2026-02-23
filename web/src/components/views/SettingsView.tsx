import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Key, Link2, Server } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../stores/uiStore';
import { copyToClipboard, downloadCsv } from '../../lib/export';

export function SettingsView() {
  const { orgId, projectId } = useProjectStore();
  const { addNotification, exportIntent, clearExportIntent } = useUIStore();
  const [checking, setChecking] = useState(false);

  const handleCopy = async (value: string, label: string) => {
    await copyToClipboard(value);
    addNotification({
      type: 'success',
      title: 'Copied to clipboard',
      message: `${label} copied successfully.`,
    });
  };

  const runHealthChecks = async () => {
    setChecking(true);
    const targets = [
      { label: 'GraphQL API', url: 'http://localhost:3002/health' },
      { label: 'Ingest API', url: 'http://localhost:3001/health' },
    ];

    const results = await Promise.allSettled(
      targets.map(async (target) => {
        const response = await fetch(target.url);
        if (!response.ok) throw new Error(`${target.label} unavailable`);
        return target.label;
      })
    );

    results.forEach((result, index) => {
      const label = targets[index].label;
      if (result.status === 'fulfilled') {
        addNotification({
          type: 'success',
          title: `${label} healthy`,
          message: 'Connection confirmed.',
        });
      } else {
        addNotification({
          type: 'warning',
          title: `${label} unavailable`,
          message: 'Start the service and retry.',
        });
      }
    });

    setChecking(false);
  };

  useEffect(() => {
    if (!exportIntent || exportIntent.view !== 'settings') return;
    const rows = [
      { key: 'org_id', value: orgId },
      { key: 'project_id', value: projectId },
      { key: 'graphql_endpoint', value: 'http://localhost:3002/graphql' },
      { key: 'ingest_endpoint', value: 'http://localhost:3001/api/v1/events' },
    ];
    downloadCsv('pulseops-settings', rows);
    addNotification({
      type: 'success',
      title: 'Settings exported',
      message: 'Workspace configuration saved as CSV.',
    });
    clearExportIntent();
  }, [exportIntent, orgId, projectId, addNotification, clearExportIntent]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <section>
        <p className="kicker">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">Workspace configuration</h2>
        <p className="mt-2 text-sm text-muted">Manage project identifiers, keys, and connectivity checks.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="panel-header">
            <div>
              <p className="kicker">Identifiers</p>
              <h3 className="text-base font-semibold text-ink">Org + Project</h3>
            </div>
            <Activity size={18} className="text-soft" />
          </div>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2">
              <p className="text-xs text-soft">Organization ID</p>
              <p className="mt-1 font-semibold text-ink">{orgId}</p>
            </div>
            <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2">
              <p className="text-xs text-soft">Project ID</p>
              <p className="mt-1 font-semibold text-ink">{projectId}</p>
            </div>
            <button
              onClick={() => handleCopy(`${orgId}:${projectId}`, 'Org + Project IDs')}
              className="flex items-center justify-between rounded-lg border border-subtle bg-elevated px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)]"
            >
              Copy IDs
              <Link2 size={14} />
            </button>
          </div>
        </div>

        <div className="panel p-6">
          <div className="panel-header">
            <div>
              <p className="kicker">Endpoints</p>
              <h3 className="text-base font-semibold text-ink">API destinations</h3>
            </div>
            <Server size={18} className="text-soft" />
          </div>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2">
              <p className="text-xs text-soft">GraphQL API</p>
              <p className="mt-1 font-semibold text-ink">http://localhost:3002/graphql</p>
            </div>
            <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2">
              <p className="text-xs text-soft">Ingest API</p>
              <p className="mt-1 font-semibold text-ink">http://localhost:3001/api/v1/events</p>
            </div>
            <button
              onClick={() => handleCopy('http://localhost:3002/graphql', 'GraphQL URL')}
              className="flex items-center justify-between rounded-lg border border-subtle bg-elevated px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)]"
            >
              Copy GraphQL URL
              <Link2 size={14} />
            </button>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="panel-header">
          <div>
            <p className="kicker">Diagnostics</p>
            <h3 className="text-base font-semibold text-ink">Connection checks</h3>
          </div>
          <Key size={18} className="text-soft" />
        </div>
        <p className="mt-3 text-sm text-muted">Verify that ingest and query services are reachable from the dashboard.</p>
        <button
          onClick={runHealthChecks}
          disabled={checking}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-subtle bg-elevated px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)] disabled:opacity-60"
        >
          {checking ? 'Checking...' : 'Run health checks'}
        </button>
      </section>
    </motion.div>
  );
}
