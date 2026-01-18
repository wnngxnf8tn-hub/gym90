import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import Animated, {
  Easing,
  SharedValue,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { useTheme } from "../../theme/ThemeProvider";

const { width, height } = Dimensions.get("window");
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedLine = Animated.createAnimatedComponent(Line);

export const GlitterParticles = () => {
  const theme = useTheme();
  const progress = useSharedValue(0);
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, idx) => ({
        id: idx,
        angle: (Math.PI * 2 * idx) / 14,
        distance: 70 + (idx % 4) * 14
      })),
    []
  );

  useEffect(() => {
    progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) });
  }, [progress]);

  return (
    <View style={styles.center}>
      {particles.map((particle) => (
        <ParticleDot
          key={particle.id}
          angle={particle.angle}
          distance={particle.distance}
          progress={progress}
          color={theme.colors.accentAlt}
          size={5}
        />
      ))}
    </View>
  );
};

export const RibbonSweep = () => {
  const theme = useTheme();
  const sweep = useSharedValue(-width);
  useEffect(() => {
    sweep.value = withTiming(width * 1.2, { duration: 720, easing: Easing.out(Easing.cubic) });
  }, [sweep]);
  const ribbonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweep.value }, { rotate: "-12deg" }]
  }));
  return (
    <Animated.View
      style={[
        styles.ribbon,
        {
          backgroundColor: theme.colors.accentAlt
        },
        ribbonStyle
      ]}
    />
  );
};

export const RingGlowSurge = () => {
  const theme = useTheme();
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withSequence(
      withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 420, easing: Easing.inOut(Easing.quad) })
    );
  }, [pulse]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.2 + 0.7 * pulse.value,
    transform: [{ scale: 1 + 0.2 * pulse.value }]
  }));
  return <Animated.View style={[styles.glow, { borderColor: theme.colors.accent }, style]} />;
};

export const ProgressSnap = () => {
  const theme = useTheme();
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0.6);
  useEffect(() => {
    progress.value = withSequence(
      withTiming(0.82, { duration: 160, easing: Easing.out(Easing.cubic) }),
      withTiming(0.68, { duration: 340, easing: Easing.out(Easing.exp) })
    );
  }, [progress]);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value)
  }));
  return (
    <View style={styles.center}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.ringProgress}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          fill="transparent"
        />
      </Svg>
    </View>
  );
};

export const DoneStamp = () => {
  const theme = useTheme();
  const scale = useSharedValue(0.6);
  const rotate = useSharedValue(-10);
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 200, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(1, { duration: 220 })
    );
    rotate.value = withTiming(0, { duration: 240 });
  }, [scale, rotate]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }]
  }));
  return (
    <Animated.View style={[styles.stamp, { borderColor: theme.colors.success }, style]}>
      <Text style={[styles.stampText, { color: theme.colors.success }]}>DONE</Text>
    </Animated.View>
  );
};

export const TrophyPop = () => {
  const theme = useTheme();
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withSequence(
      withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(0.92, { duration: 240 })
    );
  }, [pop]);
  const style = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: pop.value }]
  }));
  return (
    <Animated.View style={[styles.iconWrap, style]}>
      <Text style={[styles.iconText, { color: theme.colors.warning }]}>TROPHY</Text>
    </Animated.View>
  );
};

export const FireworkTrails = () => {
  const theme = useTheme();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) });
  }, [progress]);
  const lines = Array.from({ length: 5 }, (_, idx) => idx);
  return (
    <View style={styles.center}>
      <Svg width={200} height={200}>
        {lines.map((line) => {
          const angle = (Math.PI * 2 * line) / lines.length;
          const animatedProps = useAnimatedProps(() => ({
            x2: 100 + Math.cos(angle) * 80 * progress.value,
            y2: 100 + Math.sin(angle) * 80 * progress.value
          }));
          return (
            <AnimatedLine
              key={line}
              x1={100}
              y1={100}
              animatedProps={animatedProps}
              stroke={theme.colors.accentAlt}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    </View>
  );
};

export const StarburstRays = () => {
  const theme = useTheme();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withSequence(
      withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 360 })
    );
  }, [progress]);
  const rays = Array.from({ length: 10 }, (_, idx) => idx);
  return (
    <View style={styles.center}>
      {rays.map((ray) => {
        const angle = (360 / rays.length) * ray;
        const style = useAnimatedStyle(() => ({
          opacity: progress.value,
          transform: [{ rotate: `${angle}deg` }, { scaleX: 0.6 + 0.6 * progress.value }]
        }));
        return <Animated.View key={ray} style={[styles.ray, { backgroundColor: theme.colors.accent }, style]} />;
      })}
    </View>
  );
};

export const FloatingOrbs = () => {
  const theme = useTheme();
  const orbs = Array.from({ length: 5 }, (_, idx) => idx);
  return (
    <View style={styles.orbWrap}>
      {orbs.map((orb) => (
        <FloatingOrb key={orb} delay={orb * 120} color={theme.colors.accentAlt} />
      ))}
    </View>
  );
};

export const GradientFlash = () => {
  const theme = useTheme();
  const flash = useSharedValue(0);
  useEffect(() => {
    flash.value = withSequence(
      withTiming(1, { duration: 160 }),
      withTiming(0, { duration: 220 })
    );
  }, [flash]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.6 * flash.value
  }));
  return <Animated.View style={[styles.flash, { backgroundColor: theme.colors.tint }, style]} />;
};

export const CheckmarkDraw = () => {
  const theme = useTheme();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
  }, [progress]);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 100 * (1 - progress.value)
  }));
  return (
    <View style={styles.center}>
      <Svg width={120} height={80} viewBox="0 0 120 80">
        <AnimatedPath
          d="M10 40 L45 70 L110 10"
          stroke={theme.colors.success}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          animatedProps={animatedProps}
          fill="none"
        />
      </Svg>
    </View>
  );
};

export const CardFlipReveal = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const theme = useTheme();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(80, withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) }));
  }, [progress]);
  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(progress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 900 }, { rotateY: `${rotateY}deg` }],
      opacity: rotateY < 90 ? 1 : 0
    };
  });
  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(progress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 900 }, { rotateY: `${rotateY}deg` }],
      opacity: rotateY > 270 ? 1 : 0
    };
  });
  return (
    <View style={styles.cardWrap}>
      <Animated.View style={[styles.card, { backgroundColor: theme.colors.cardAlt }, frontStyle]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Belohnung</Text>
        <Text style={[styles.cardSubtitle, { color: theme.colors.muted }]}>90 Tage</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, { backgroundColor: theme.colors.accent }, backStyle]}>
        <Text style={[styles.cardTitle, { color: theme.colors.buttonText }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.cardSubtitle, { color: theme.colors.buttonText }]}>{subtitle}</Text>
        ) : null}
      </Animated.View>
    </View>
  );
};

export const BadgePop = ({ tier }: { tier?: "common" | "rare" | "legendary" }) => {
  const theme = useTheme();
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.back(1.7)) }),
      withTiming(0.92, { duration: 300 })
    );
  }, [pop]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
    opacity: pop.value
  }));
  const color =
    tier === "legendary"
      ? "#F6C56E"
      : tier === "rare"
      ? theme.colors.accentAlt
      : theme.colors.accent;
  return (
    <View style={styles.center}>
      <Animated.View style={[styles.badge, { borderColor: color }, style]}>
      </Animated.View>
    </View>
  );
};

export const ParticleHalo = () => {
  const theme = useTheme();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
  }, [progress]);
  const dots = Array.from({ length: 10 }, (_, idx) => idx);
  return (
    <View style={styles.center}>
      {dots.map((dot) => (
        <HaloDot
          key={dot}
          index={dot}
          progress={progress}
          color={theme.colors.accentAlt}
        />
      ))}
    </View>
  );
};

export const ShimmerOverlay = () => {
  const theme = useTheme();
  const shimmer = useSharedValue(-width);
  useEffect(() => {
    shimmer.value = withTiming(width * 1.2, { duration: 800, easing: Easing.out(Easing.quad) });
  }, [shimmer]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value }, { rotate: "14deg" }]
  }));
  return <Animated.View style={[styles.shimmer, { backgroundColor: theme.colors.accentAlt }, style]} />;
};

export const FloatingTextToast = ({ text }: { text: string }) => {
  const theme = useTheme();
  const rise = useSharedValue(0);
  useEffect(() => {
    rise.value = withSequence(
      withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 520 })
    );
  }, [rise]);
  const style = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: -40 * rise.value }]
  }));
  return (
    <Animated.View style={[styles.toast, style]}>
      <Text style={[styles.toastText, { color: theme.colors.text }]}>{text}</Text>
    </Animated.View>
  );
};

export const StreakFlame = () => {
  const theme = useTheme();
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 320 })
    );
  }, [pulse]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.8 * pulse.value,
    transform: [{ scale: 1 + 0.2 * pulse.value }]
  }));
  return (
    <Animated.View style={[styles.iconWrap, style]}>
      <Text style={[styles.iconText, { color: theme.colors.warning }]}>FLAME</Text>
    </Animated.View>
  );
};

export const CrownPop = () => {
  const theme = useTheme();
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withSequence(
      withTiming(1, { duration: 240, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(0.95, { duration: 280 })
    );
  }, [pop]);
  const style = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: pop.value }]
  }));
  return (
    <Animated.View style={[styles.iconWrap, style]}>
      <Text style={[styles.iconText, { color: theme.colors.warning }]}>CROWN</Text>
    </Animated.View>
  );
};

export const BonusLightning = () => {
  const theme = useTheme();
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withSequence(
      withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.7)) }),
      withTiming(0.9, { duration: 260 })
    );
  }, [pop]);
  const style = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: pop.value }]
  }));
  return (
    <Animated.View style={[styles.iconWrap, style]}>
      <Text style={[styles.iconText, { color: theme.colors.accentAlt }]}>BOLT</Text>
    </Animated.View>
  );
};

export const PulseGrid = () => {
  const theme = useTheme();
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withSequence(
      withTiming(1, { duration: 240 }),
      withTiming(0, { duration: 420 })
    );
  }, [pulse]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.18 + 0.4 * pulse.value
  }));
  return (
    <Animated.View style={[styles.gridWrap, style]}>
      {Array.from({ length: 5 }, (_, idx) => (
        <View key={`h-${idx}`} style={[styles.gridLine, { backgroundColor: theme.colors.accent }]} />
      ))}
      {Array.from({ length: 4 }, (_, idx) => (
        <View key={`v-${idx}`} style={[styles.gridLineVertical, { backgroundColor: theme.colors.accent }]} />
      ))}
    </Animated.View>
  );
};

export const SoftHearts = () => {
  const theme = useTheme();
  const hearts = Array.from({ length: 4 }, (_, idx) => idx);
  return (
    <View style={styles.orbWrap}>
      {hearts.map((heart) => (
        <FloatingOrb key={heart} delay={heart * 160} color={theme.colors.accent} />
      ))}
    </View>
  );
};

export const SparkleRain = () => {
  const theme = useTheme();
  const drops = Array.from({ length: 8 }, (_, idx) => idx);
  return (
    <View style={styles.orbWrap}>
      {drops.map((drop) => (
        <SparkleDrop key={drop} delay={drop * 120} color={theme.colors.accentAlt} />
      ))}
    </View>
  );
};

export const CoinBurst = ({ text = "Streak +1" }: { text?: string }) => {
  const theme = useTheme();
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.back(1.7)) }),
      withTiming(0.9, { duration: 260 })
    );
  }, [pop]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
    opacity: pop.value
  }));
  return (
    <View style={styles.center}>
      <Animated.View style={[styles.coin, { borderColor: theme.colors.accent }, style]}>
        <Text style={[styles.coinText, { color: theme.colors.accent }]}>{text}</Text>
      </Animated.View>
    </View>
  );
};

const ParticleDot = ({
  angle,
  distance,
  progress,
  color,
  size
}: {
  angle: number;
  distance: number;
  progress: SharedValue<number>;
  color: string;
  size: number;
}) => {
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: Math.cos(angle) * distance * progress.value },
      { translateY: Math.sin(angle) * distance * progress.value },
      { scale: 1 - 0.3 * progress.value }
    ]
  }));
  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
        style
      ]}
    />
  );
};

const FloatingOrb = ({ delay, color }: { delay: number; color: string }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, [progress, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: -80 * progress.value }, { scale: 0.8 + 0.4 * progress.value }]
  }));
  return <Animated.View style={[styles.orb, { backgroundColor: color }, style]} />;
};

const HaloDot = ({
  index,
  progress,
  color
}: {
  index: number;
  progress: SharedValue<number>;
  color: string;
}) => {
  const angle = (Math.PI * 2 * index) / 10;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: Math.cos(angle) * 60 },
      { translateY: Math.sin(angle) * 60 },
      { scale: 1 - 0.4 * progress.value }
    ]
  }));
  return <Animated.View style={[styles.haloDot, { backgroundColor: color }, style]} />;
};

const SparkleDrop = ({ delay, color }: { delay: number; color: string }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }));
  }, [progress, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: 80 * progress.value }, { scale: 0.8 + 0.2 * progress.value }]
  }));
  return <Animated.View style={[styles.sparkle, { backgroundColor: color }, style]} />;
};

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width,
    height
  },
  ribbon: {
    position: "absolute",
    width: width * 0.6,
    height: 80,
    borderRadius: 40,
    top: height / 2 - 40,
    left: width / 2 - width * 0.3,
    opacity: 0.24
  },
  glow: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    alignSelf: "center"
  },
  stamp: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 2,
    alignSelf: "center"
  },
  stampText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1.4
  },
  iconWrap: {
    position: "absolute",
    width: 120,
    height: 120,
    top: height / 2 - 60,
    left: width / 2 - 60,
    alignItems: "center",
    justifyContent: "center"
  },
  iconText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.2
  },
  ray: {
    position: "absolute",
    width: 4,
    height: 60,
    borderRadius: 4
  },
  orbWrap: {
    position: "absolute",
    width,
    height,
    justifyContent: "center",
    alignItems: "center"
  },
  orb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.4,
    position: "absolute",
    top: height / 2,
    left: width / 2
  },
  flash: {
    ...StyleSheet.absoluteFillObject
  },
  badge: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignSelf: "center"
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2
  },
  haloDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3
  },
  shimmer: {
    position: "absolute",
    width: width * 0.6,
    height: 120,
    opacity: 0.16,
    top: height / 2 - 60,
    left: width / 2 - width * 0.3
  },
  toast: {
    position: "absolute",
    bottom: 120,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  toastText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.6
  },
  cardWrap: {
    width: 220,
    height: 140,
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    position: "absolute",
    width: 220,
    height: 140,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }
  },
  cardBack: {
    shadowOpacity: 0.3
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.6
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  gridWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  gridLine: {
    width,
    height: 1,
    opacity: 0.2,
    marginVertical: 12
  },
  gridLineVertical: {
    position: "absolute",
    width: 1,
    height,
    opacity: 0.15,
    marginHorizontal: 40
  },
  particle: {
    position: "absolute"
  },
  sparkle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5
  },
  coin: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  coinText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1
  },
});
