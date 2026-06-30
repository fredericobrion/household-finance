import { useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors, Radius } from '@/theme/colors';

const THUMB = 22;
const TRACK_H = 6;
const LABEL_W = 44;

interface GoalSliderProps {
  label: string;
  color: string;
  value: number; // 0–100
  onChange: (value: number) => void;
}

export function GoalSlider({ label, color, value, onChange }: GoalSliderProps) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);

  function setFromX(x: number) {
    const w = widthRef.current;
    if (w <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / w));
    onChange(Math.round(ratio * 100));
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => setFromX(e.nativeEvent.locationX),
      onPanResponderMove: (e) => setFromX(e.nativeEvent.locationX),
    }),
  ).current;

  const ratio = Math.max(0, Math.min(1, value / 100));
  const fillWidth = width * ratio;
  const thumbX = Math.max(THUMB / 2, Math.min(width - THUMB / 2, fillWidth || 0));
  const labelLeft = Math.max(0, Math.min(width - LABEL_W, thumbX - LABEL_W / 2));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { left: labelLeft }]}>{value}%</Text>
      </View>

      <View
        style={styles.trackArea}
        onLayout={(e: LayoutChangeEvent) => {
          const w = e.nativeEvent.layout.width;
          setWidth(w);
          widthRef.current = w;
        }}
        {...pan.panHandlers}>
        <View style={styles.trackBg} />
        <View style={[styles.trackFill, { width: fillWidth, backgroundColor: color }]} />
        <View style={[styles.thumb, { left: thumbX - THUMB / 2, backgroundColor: color }]} />
      </View>

      <View style={styles.ends}>
        <Text style={styles.endText}>0%</Text>
        <Text style={styles.endText}>100%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  valueRow: {
    height: 20,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  value: {
    position: 'absolute',
    width: LABEL_W,
    textAlign: 'center',
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  trackArea: {
    height: THUMB,
    justifyContent: 'center',
    marginTop: 2,
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_H,
    borderRadius: Radius.pill,
    backgroundColor: Colors.text,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: TRACK_H,
    borderRadius: Radius.pill,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  ends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  endText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
