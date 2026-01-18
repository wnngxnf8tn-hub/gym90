import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { useTheme } from "../../theme/ThemeProvider";
import { RewardPayload } from "../../utils/rewardEngine";
import { addDaysIso } from "../../utils/dates";
import { computeStreak } from "../../utils/challenge";
import { useChallengeStore } from "../../store/useChallengeStore";
import { EffectFallback, EffectRenderer } from "./EffectRenderer";
import { createRng } from "../../utils/random";

type RewardModalProps = {
  visible: boolean;
  payload: RewardPayload | null;
  onClaim: () => void;
  onClose: () => void;
  debug?: boolean;
};

const AnimatedView = Animated.createAnimatedComponent(View);
const MIN_ANIMATION_MS = 2500;
const MAX_ANIMATION_MS = 4000;

class EffectErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error) => void;
    resetKey?: string | null;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  componentDidUpdate(prevProps: { resetKey?: string | null }) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

const decodeRewardMessage = (message?: string) => {
  if (!message) return message;
  let text = message;
  while (text.includes("\\\\u")) {
    text = text.replace(/\\\\u/g, "\\u");
  }
  if (!text.includes("\\u")) return text;
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
    const code = Number.parseInt(hex, 16);
    if (Number.isNaN(code)) return match;
    return String.fromCharCode(code);
  });
};

export const RewardModal = ({ visible, payload, onClaim, onClose, debug }: RewardModalProps) => {
  const theme = useTheme();
  const fade = useSharedValue(0);
  const claimPulse = useSharedValue(1);
  const xpPop = useSharedValue(1);
  const claimPress = useSharedValue(1);
  const claimHighlight = useSharedValue(0);
  const cardFlash = useSharedValue(0);
  const effectFade = useSharedValue(1);
  const cardSlide = useSharedValue(12);
  const cardOpacity = useSharedValue(0);
  const [phase, setPhase] = useState<"animating" | "claim" | "closing">("animating");
  const [claiming, setClaiming] = useState(false);
  const lastOpenedPayloadIdRef = useRef<string | null>(null);
  const payloadRef = useRef<RewardPayload | null>(null);
  const animationDoneRef = useRef(false);
  const animationStartRef = useRef(0);
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startOnceRef = useRef(false);
  const lastPayloadIdRef = useRef<string | null>(null);
  const isDark = theme.variant === "premiumDark" || theme.variant === "gamifiedNeon";
  const isWeb = Platform.OS === "web";
  const CardWrapper = isWeb ? View : BlurView;
  const { width: windowWidth } = useWindowDimensions();
  const { startDateIso, selectedDayIso, rewardQueue, celebratedDays, checksByDay } = useChallengeStore((state) => ({
    startDateIso: state.startDateIso,
    selectedDayIso: state.selectedDayIso,
    rewardQueue: state.rewardQueue,
    celebratedDays: state.celebratedDays,
    checksByDay: state.checksByDay
  }));

  const animationDuration = useMemo(() => {
    if (!payload) return MIN_ANIMATION_MS;
    const rng = createRng(payload.debug?.seed ?? Date.now());
    return Math.floor(MIN_ANIMATION_MS + rng() * (MAX_ANIMATION_MS - MIN_ANIMATION_MS));
  }, [payload?.id, payload?.debug?.seed]);
  const payloadId = payload?.id ?? null;
  const skiaStatus = useMemo(() => {
    if (isWeb) return { available: false, version: null as string | null };
    try {
      const skia = require("@shopify/react-native-skia") as { Canvas?: unknown };
      let version: string | null = null;
      try {
        version = require("@shopify/react-native-skia/package.json").version ?? null;
      } catch {
        version = null;
      }
      return { available: Boolean(skia?.Canvas), version };
    } catch {
      return { available: false, version: null as string | null };
    }
  }, [isWeb]);
  const skiaAvailable = skiaStatus.available;
  if (payload) {
    payloadRef.current = payload;
  }

  const handleEffectError = useCallback((_error: Error) => {
    // Swallow effect errors here; effect boundary handles fallback rendering.
  }, []);

  const clearTimers = () => {
    if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    if (minTimeoutRef.current) clearTimeout(minTimeoutRef.current);
    if (coinTimeoutRef.current) clearTimeout(coinTimeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  useEffect(() => {
    if (!payloadId || !visible) {
      startOnceRef.current = false;
      lastPayloadIdRef.current = payloadId;
      return;
    }
    if (lastPayloadIdRef.current !== payloadId) {
      lastPayloadIdRef.current = payloadId;
      startOnceRef.current = false;
    }
    if (startOnceRef.current) return;
    startOnceRef.current = true;
    if (!payloadRef.current) return;
    lastOpenedPayloadIdRef.current = payloadId;
    if (__DEV__) {
      console.log("[RewardModal] start", {
        payloadId,
        effect: payload?.effects?.[0] ?? null,
        started: startOnceRef.current
      });
    }
    clearTimers();
    animationStartRef.current = Date.now();
    animationDoneRef.current = false;
    setPhase((prev) => (prev === "animating" ? prev : "animating"));
    setClaiming((prev) => (prev ? false : prev));
    fade.value = withTiming(1, { duration: 160 });
    claimPulse.value = 1;
    xpPop.value = 1;
    claimPress.value = 1;
    claimHighlight.value = 0;
    cardFlash.value = 0;
    effectFade.value = withTiming(1, { duration: 220 });
    cardOpacity.value = 0;
    cardSlide.value = 12;
    maxTimeoutRef.current = setTimeout(() => {
      setPhase((prev) => (prev === "claim" ? prev : "claim"));
    }, animationDuration);
    return () => {
      clearTimers();
    };
  }, [visible, payloadId, animationDuration]);

  useEffect(() => {
    if (phase === "claim") {
      effectFade.value = withTiming(0.25, { duration: 260 });
      cardOpacity.value = withTiming(1, { duration: 220 });
      cardSlide.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
    }
    if (phase === "closing") {
      effectFade.value = withTiming(0, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [phase, effectFade, cardOpacity, cardSlide]);

  const maybeAdvanceToClaim = useCallback(() => {
    if (phase !== "animating") return;
    if (animationDoneRef.current) return;
    animationDoneRef.current = true;
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }
    const elapsed = Date.now() - animationStartRef.current;
    const remaining = Math.max(0, MIN_ANIMATION_MS - elapsed);
    if (minTimeoutRef.current) {
      clearTimeout(minTimeoutRef.current);
    }
    minTimeoutRef.current = setTimeout(() => {
      setPhase((prev) => (prev === "claim" ? prev : "claim"));
    }, remaining);
  }, [phase]);

  const handleEffectDone = useCallback(() => {
    setTimeout(() => {
      maybeAdvanceToClaim();
    }, 0);
  }, [maybeAdvanceToClaim]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: fade.value
  }));

  const claimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: claimPulse.value }]
  }));

  const xpStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpPop.value }]
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: claimPress.value }]
  }));

  const pressHighlightStyle = useAnimatedStyle(() => ({
    opacity: claimHighlight.value
  }));

  const flashStyle = useAnimatedStyle(() => {
    const width = windowWidth * 0.9;
    const translateX = -width + cardFlash.value * width * 2;
    const opacity = 0.6 * (1 - Math.abs(cardFlash.value - 0.5) * 2);
    return {
      opacity,
      transform: [{ translateX }]
    };
  }, [windowWidth]);

  const effectStyle = useAnimatedStyle(() => ({
    opacity: effectFade.value
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardSlide.value }]
  }));

  const rewardItem = useMemo(() => {
    if (!payloadId) return null;
    return rewardQueue.find((item) => item.id === payloadId) ?? null;
  }, [payloadId, rewardQueue]);
  const decodedPayloadMessage = useMemo(() => decodeRewardMessage(payload?.message), [payload?.message]);
  const rewardDateIso = rewardItem?.dateIso || selectedDayIso;
  const toStreak = useMemo(() => {
    if (!rewardDateIso || !startDateIso) return 0;
    return computeStreak(celebratedDays, startDateIso, rewardDateIso);
  }, [celebratedDays, rewardDateIso, startDateIso]);
  const fromStreak = useMemo(() => {
    if (!rewardDateIso || !startDateIso) return 0;
    const previousIso = addDaysIso(rewardDateIso, -1);
    return computeStreak(celebratedDays, startDateIso, previousIso);
  }, [celebratedDays, rewardDateIso, startDateIso]);
  const dayLabel = `Streak ${fromStreak} \u2192 ${toStreak}`;
  const tookPill = rewardItem?.pillChecked ?? checksByDay[rewardDateIso]?.pill;
  const showPillMessage = theme.variant === "softPastel" && Boolean(tookPill);
  const pillMessage = decodedPayloadMessage ?? "Wuhuuu, nicht schwanger 😎";
  const effectBadgeTier = phase === "animating" ? payload?.badgeTier : undefined;

  if (!payload) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <View style={styles.scrim} />
        <Animated.View style={[styles.effectLayer, effectStyle]} pointerEvents="none">
          <EffectErrorBoundary
            resetKey={payload.id}
            onError={handleEffectError}
            fallback={<EffectFallback reason="EFFECT_CRASHED" />}
          >
            <EffectRenderer
              effects={payload.effects}
              subtitle={payload.subtitle}
              message={decodedPayloadMessage}
              title={payload.title}
              badgeTier={effectBadgeTier}
              durationMs={animationDuration}
              seed={payload.debug?.seed}
              onEffectDone={handleEffectDone}
              payloadId={payload.id}
            />
          </EffectErrorBoundary>
        </Animated.View>
        {phase !== "animating" ? (
          <Animated.View style={[styles.modalWrap, cardStyle]}>
            <CardWrapper
              {...(isWeb ? {} : { intensity: 40, tint: isDark ? "dark" : "light" })}
              style={[styles.card, { borderColor: theme.colors.border }]}
            >
              <LinearGradient colors={[theme.colors.cardAlt, theme.colors.card]} style={styles.cardInner}>
                <Animated.Text style={[styles.xp, { color: theme.colors.text }, xpStyle]}>{dayLabel}</Animated.Text>
                {showPillMessage ? (
                  <Text style={[styles.message, { color: theme.colors.text }]}>{pillMessage}</Text>
                ) : null}
                <Animated.View pointerEvents="none" style={[styles.flashSweep, flashStyle]}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,0.35)", "rgba(255,255,255,0.0)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.flashGradient}
                  />
                </Animated.View>
                {phase === "claim" ? (
                  <Pressable
                    style={styles.claimButton}
                    onPressIn={() => {
                      claimPress.value = withTiming(0.98, { duration: 120 });
                      claimHighlight.value = withTiming(1, { duration: 120 });
                    }}
                    onPressOut={() => {
                      claimPress.value = withTiming(1, { duration: 140 });
                      claimHighlight.value = withTiming(0, { duration: 180 });
                    }}
                    onPress={() => {
                      if (claiming) return;
                      setClaiming(true);
                      claimPulse.value = withSequence(
                        withTiming(1.08, { duration: 120, easing: Easing.out(Easing.cubic) }),
                        withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) })
                      );
                      xpPop.value = withSequence(
                        withTiming(1.12, { duration: 140, easing: Easing.out(Easing.cubic) }),
                        withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) })
                      );
                      cardFlash.value = 0;
                      cardFlash.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
                      cardOpacity.value = withDelay(240, withTiming(0, { duration: 180 }));
                      coinTimeoutRef.current = setTimeout(() => {
                        setPhase("closing");
                        onClaim();
                      }, 480);
                    }}
                  >
                    <Animated.View style={pressStyle}>
                      <LinearGradient
                        colors={[theme.colors.accent, theme.colors.accentAlt]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.claimButtonInner}
                      >
                        <Animated.Text style={[styles.claimText, { color: theme.colors.buttonText }, claimStyle]}>
                          Abholen
                        </Animated.Text>
                        <Animated.View style={[styles.claimHighlight, pressHighlightStyle]} />
                      </LinearGradient>
                    </Animated.View>
                  </Pressable>
                ) : null}
              </LinearGradient>
            </CardWrapper>
          </Animated.View>
        ) : null}
        {debug ? (
          <View style={styles.debug}>
            <Text style={[styles.debugText, { color: theme.colors.text }]}>Effekte: {payload.effects.join(", ")}</Text>
            <Text style={[styles.debugText, { color: theme.colors.text }]}>Stufe: {payload.debug?.tier ?? "-"}</Text>
            <Text style={[styles.debugText, { color: theme.colors.text }]}>Seed: {payload.debug?.seed ?? "-"}</Text>
            {!skiaAvailable ? (
              <Text style={[styles.debugText, { color: theme.colors.text }]}>Skia nicht verf\u00fcgbar</Text>
            ) : null}
            {skiaStatus.version ? (
              <Text style={[styles.debugText, { color: theme.colors.text }]}>Skia v{skiaStatus.version}</Text>
            ) : null}
          </View>
        ) : null}
      </AnimatedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  effectLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3
  },
  modalWrap: {
    width: "86%",
    zIndex: 2
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden"
  },
  cardInner: {
    padding: 24,
    gap: 6,
    alignItems: "center"
  },
  xp: {
    marginTop: 4,
    fontSize: 36,
    fontWeight: "700",
    alignSelf: "center",
    textAlign: "center"
  },
  message: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center"
  },
  claimButton: {
    marginTop: 18,
    borderRadius: 18,
    overflow: "hidden"
  },
  claimButtonInner: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: "center",
    borderRadius: 18
  },
  claimText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.6
  },
  claimHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  flashSweep: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none"
  },
  flashGradient: {
    width: "40%",
    height: "100%",
    transform: [{ skewX: "-12deg" }]
  },
  debug: {
    position: "absolute",
    bottom: 40,
    left: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.35)"
  },
  debugText: {
    fontSize: 9
  }
});
