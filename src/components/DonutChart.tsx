import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { Colors } from '@/theme/colors';

export interface DonutSlice {
  key: string;
  color: string;
  value: number;
}

interface DonutChartProps {
  data: DonutSlice[];
  centerLabel?: string;
  centerValue: string;
  size?: number;
  strokeWidth?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 200,
  strokeWidth = 26,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const slices = data.filter((d) => d.value > 0);
  const total = slices.reduce((acc, s) => acc + s.value, 0);

  let cursor = 0;
  const segments = slices.map((s) => {
    const startAngle = (cursor / total) * 360;
    cursor += s.value;
    const endAngle = (cursor / total) * 360;
    return { ...s, startAngle, endAngle };
  });

  const single = segments.length === 1;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* anel de fundo */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={Colors.surfaceAlt}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <G>
          {total > 0 && single ? (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={segments[0].color}
              strokeWidth={strokeWidth}
              fill="none"
            />
          ) : (
            segments.map((seg) => (
              <Path
                key={seg.key}
                d={arcPath(cx, cy, radius, seg.startAngle, seg.endAngle)}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="butt"
              />
            ))
          )}
        </G>
      </Svg>

      <View style={styles.center} pointerEvents="none">
        <Text style={styles.centerValue}>{centerValue}</Text>
        {centerLabel ? <Text style={styles.centerLabel}>{centerLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  centerLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
