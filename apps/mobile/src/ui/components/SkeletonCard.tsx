import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const palette = {
  surface: "#F7F4F8",
  shimmerFrom: "#EAE3EE",
  shimmerTo: "#F4EDF6",
};

export function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const backgroundColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.shimmerFrom, palette.shimmerTo],
  });

  return (
    <Animated.View style={[styles.card, { backgroundColor }]} accessibilityRole="progressbar" aria-busy>
      <View style={styles.lineWide} />
      <View style={styles.line} />
      <View style={styles.line} />
      <View style={styles.buttonRow}>
        <View style={styles.button} />
        <View style={styles.button} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    gap: 10,
  },
  lineWide: {
    height: 18,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.06)",
    width: "72%",
  },
  line: {
    height: 12,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    width: "90%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  button: {
    height: 32,
    flex: 1,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
});
