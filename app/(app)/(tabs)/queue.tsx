import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { QueueStatusCard } from '@/components/QueueStatusCard';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { StatusBadge } from '@/components/StatusBadge';
import { useLatestQueue, useQueueHistoryToday } from '@/hooks/useQueue';
import { colors, spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';
import { formatClock, queueLevelLabel, waitLabel } from '@/utils/format';

export default function QueueScreen() {
  const latest = useLatestQueue();
  const history = useQueueHistoryToday();

  const refresh = () => {
    latest.refetch();
    history.refetch();
  };

  if (latest.isPending) {
    return (
      <Screen scroll={false}>
        <LoadingState message="Checking the queue…" />
      </Screen>
    );
  }

  if (latest.isError) {
    return (
      <Screen scroll={false}>
        <ErrorState message={toFriendlyMessage(latest.error)} onRetry={refresh} retrying={latest.isRefetching} />
      </Screen>
    );
  }

  return (
    <Screen refreshing={latest.isRefetching || history.isRefetching} onRefresh={refresh}>
      <Text style={typography.title}>Queue status</Text>

      {latest.data ? (
        <QueueStatusCard report={latest.data} />
      ) : (
        <EmptyState
          icon="people-outline"
          title="No queue reports yet"
          message="The mess hasn't reported the queue. Pull down to check again."
        />
      )}

      <Text style={typography.heading}>Today's updates</Text>
      {history.isError ? (
        <ErrorState message={toFriendlyMessage(history.error)} onRetry={() => history.refetch()} />
      ) : history.data && history.data.length > 0 ? (
        <Card>
          {history.data.map((report) => {
            const level = queueLevelLabel[report.status];
            return (
              <View key={report.id} style={styles.historyRow}>
                <Text style={styles.time}>{formatClock(report.reported_at)}</Text>
                <StatusBadge label={level.label} tone={level.tone} />
                <Text style={styles.wait}>{waitLabel(report.wait_min, report.wait_max)}</Text>
              </View>
            );
          })}
        </Card>
      ) : history.isPending ? (
        <LoadingState />
      ) : (
        <Text style={typography.caption}>No other updates today.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  time: { ...typography.label, width: 72 },
  wait: { ...typography.caption, marginLeft: 'auto' },
});
