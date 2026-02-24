import { Pool } from 'pg';

/**
 * Data retention policy handler for PulseOps raw event storage.
 *
 * Deletes events, daily aggregates, and session records older than the
 * configured retention window. Runs as a low-priority background job
 * (typically nightly) to keep table sizes manageable.
 */

export interface RetentionPolicy {
  /** Organisation ID this policy applies to. */
  orgId: string;
  /** Number of days to retain raw events (0 = keep forever). */
  rawEventDays: number;
  /** Number of days to retain pre-computed daily aggregates. */
  aggregateDays: number;
  /** Number of days to retain session records. */
  sessionDays: number;
}

const DEFAULT_POLICY: Omit<RetentionPolicy, 'orgId'> = {
  rawEventDays:  90,
  aggregateDays: 365,
  sessionDays:   180,
};

export async function applyRetentionPolicy(
  db: Pool,
  policy: RetentionPolicy
): Promise<{ rawDeleted: number; aggregatesDeleted: number; sessionsDeleted: number }> {
  const merged = { ...DEFAULT_POLICY, ...policy };
  const now = new Date();

  function cutoff(days: number): string {
    if (days === 0) return '1970-01-01';
    const d = new Date(now.getTime() - days * 86400 * 1000);
    return d.toISOString().slice(0, 10);
  }

  const [rawResult, aggResult, sesResult] = await Promise.all([
    merged.rawEventDays > 0
      ? db.query(
          `DELETE FROM events
           WHERE org_id = $1 AND timestamp < $2`,
          [policy.orgId, cutoff(merged.rawEventDays)]
        )
      : { rowCount: 0 },

    merged.aggregateDays > 0
      ? db.query(
          `DELETE FROM daily_aggregates
           WHERE org_id = $1 AND date < $2`,
          [policy.orgId, cutoff(merged.aggregateDays)]
        )
      : { rowCount: 0 },

    merged.sessionDays > 0
      ? db.query(
          `DELETE FROM sessions
           WHERE org_id = $1 AND started_at < $2`,
          [policy.orgId, cutoff(merged.sessionDays)]
        )
      : { rowCount: 0 },
  ]);

  return {
    rawDeleted:        rawResult.rowCount ?? 0,
    aggregatesDeleted: aggResult.rowCount ?? 0,
    sessionsDeleted:   sesResult.rowCount ?? 0,
  };
}

/** Run retention for all orgs using their stored policies. */
export async function runGlobalRetention(
  db: Pool,
  policies: RetentionPolicy[]
): Promise<void> {
  for (const policy of policies) {
    const result = await applyRetentionPolicy(db, policy);
    console.log(
      `[retention] org=${policy.orgId} raw=${result.rawDeleted} ` +
      `agg=${result.aggregatesDeleted} sessions=${result.sessionsDeleted}`
    );
  }
}
