/**
 * Alert notification dispatcher for PulseOps.
 *
 * Evaluates alert conditions against fresh aggregate metrics and
 * dispatches notifications through configured channels (Slack, email,
 * webhook). Each channel is tried independently so a single failure
 * does not block the others.
 */

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertRule {
  id: string;
  orgId: string;
  projectId: string;
  metric: string;
  condition: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  severity: AlertSeverity;
  channels: NotificationChannel[];
  cooldownMinutes: number; // minimum gap between repeat notifications
  lastFiredAt?: Date;
}

export type NotificationChannel =
  | { type: 'slack'; webhookUrl: string }
  | { type: 'email'; to: string[] }
  | { type: 'webhook'; url: string; secret?: string };

export interface AlertFiredEvent {
  rule: AlertRule;
  metricValue: number;
  firedAt: Date;
}

function evaluateCondition(value: number, condition: AlertRule['condition'], threshold: number): boolean {
  switch (condition) {
    case '>':  return value > threshold;
    case '<':  return value < threshold;
    case '>=': return value >= threshold;
    case '<=': return value <= threshold;
    case '==': return value === threshold;
    case '!=': return value !== threshold;
  }
}

async function sendSlack(url: string, event: AlertFiredEvent): Promise<void> {
  const emoji = event.rule.severity === 'critical' ? '🔴' : event.rule.severity === 'warning' ? '🟡' : 'ℹ️';
  const text = `${emoji} *PulseOps Alert* [${event.rule.severity.toUpperCase()}]\n`
    + `Metric \`${event.rule.metric}\` = ${event.metricValue} `
    + `(threshold ${event.rule.condition} ${event.rule.threshold})\n`
    + `Project: ${event.rule.projectId}`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(8000),
  });
}

async function sendWebhook(url: string, event: AlertFiredEvent): Promise<void> {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ruleId: event.rule.id,
      orgId: event.rule.orgId,
      projectId: event.rule.projectId,
      metric: event.rule.metric,
      value: event.metricValue,
      severity: event.rule.severity,
      firedAt: event.firedAt.toISOString(),
    }),
    signal: AbortSignal.timeout(8000),
  });
}

export async function dispatchAlertNotifications(event: AlertFiredEvent): Promise<void> {
  await Promise.allSettled(
    event.rule.channels.map((channel) => {
      if (channel.type === 'slack') return sendSlack(channel.webhookUrl, event);
      if (channel.type === 'webhook') return sendWebhook(channel.url, event);
      // email: would call an email service (SES, SendGrid, etc.)
      return Promise.resolve();
    })
  );
}

export function checkAlertRules(
  rules: AlertRule[],
  metrics: Record<string, number>
): AlertFiredEvent[] {
  const now = new Date();
  const fired: AlertFiredEvent[] = [];

  for (const rule of rules) {
    const value = metrics[rule.metric];
    if (value === undefined) continue;
    if (!evaluateCondition(value, rule.condition, rule.threshold)) continue;

    // Respect cooldown
    if (rule.lastFiredAt) {
      const elapsedMs = now.getTime() - rule.lastFiredAt.getTime();
      if (elapsedMs < rule.cooldownMinutes * 60 * 1000) continue;
    }

    fired.push({ rule, metricValue: value, firedAt: now });
  }

  return fired;
}
