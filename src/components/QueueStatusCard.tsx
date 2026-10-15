import { StyleSheet, Text, View } from 'react-native';

import { spacing, toneColors, typography } from '@/theme';
import type { QueueReport } from '@/types/models';
import {
  QUEUE_STALE_MINUTES,
  minutesSince,
  queueLevelLabel,
  timeAgo,
  waitLabel,
} from '@/utils/format';

import { Card } from './Card';
import { FormMessage } from './StateViews';

export function QueueStatusCard({ report, onPress }: { report: QueueReport; onPress?: () => void }) {
  const level = queueLevelLabel[report.status];
  const isStale = minutesSince(report.reported_at) > QUEUE_STALE_MINUTES;

  return (
    <Card tone={level.tone} onPress={onPress} accessibilityLabel={`Queue ${level.label}`}>
      <Text style={typography.label}>Current queue · {report.mess_locations?.name ?? 'Mess'}</Text>
      <Text style={[styles.level, { color: toneColors[level.tone].fg }]}>{level.label}</Text>
      <View>
        <Text style={typography.caption}>Estimated wait</Text>
        <Text style={typography.heading}>{waitLabel(report.wait_min, report.wait_max)}</Text>
      </View>
      {report.note ? <Text style={typography.body}>{report.note}</Text> : null}
      <Text style={typography.caption}>Updated {timeAgo(report.reported_at)}</Text>
      {isStale ? (
        <FormMessage
          tone="danger"
          message="This report is over an hour old and may be outdated."
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  level: { fontSize: 28, fontWeight: '700', marginTop: spacing.xs },
});
