import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useChallengeStore } from "../../store/useChallengeStore";
import { useTheme } from "../../theme/ThemeProvider";
import { RewardFallbackReason, RewardRendererPath } from "../../utils/rewardDiagnostics";
import { RewardEffect } from "../../utils/rewardEngine";
import { BadgePop, FloatingTextToast } from "./Effects";
import { skiaEffectRegistry } from "./SkiaEffects/registry";

type EffectRendererProps = {
  effects: RewardEffect[];
  subtitle?: string;
  message?: string;
  title?: string;
  badgeTier?: "common" | "rare" | "legendary";
  durationMs: number;
  seed?: number;
  onEffectDone?: () => void;
  payloadId?: string | null;
};

type SkiaStatus = {
  available: boolean;
  version: string | null;
};

const getSkiaStatus = (isWeb: boolean): SkiaStatus => {
  if (isWeb) return { available: false, version: null };
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
    return { available: false, version: null };
  }
};

export const EffectFallback = ({ reason }: { reason: RewardFallbackReason }) => {
  const theme = useTheme();
  return (
    <View style={[styles.fallback, { borderColor: theme.colors.warning, backgroundColor: theme.colors.tint }]}>
      <View style={[styles.fallbackIcon, { borderColor: theme.colors.warning }]}> 
        <Text style={[styles.fallbackIconText, { color: theme.colors.warning }]}>!</Text>
      </View>
      <Text style={[styles.fallbackLabel, { color: theme.colors.text }]}>Ersatzanzeige</Text>
      {__DEV__ ? (
        <Text style={[styles.fallbackReason, { color: theme.colors.muted }]}>{reason}</Text>
      ) : null}
    </View>
  );
};

class EffectBoundary extends React.Component<
  {
    effect: RewardEffect;
    payloadId?: string | null;
    onError?: (effect: RewardEffect, payloadId?: string | null, error?: Error) => void;
    fallback?: React.ReactNode;
    children: React.ReactNode;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(this.props.effect, this.props.payloadId, error);
  }

  componentDidUpdate(prevProps: { payloadId?: string | null }) {
    if (this.state.hasError && prevProps.payloadId !== this.props.payloadId) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export const EffectRenderer = ({
  effects,
  message,
  badgeTier,
  durationMs,
  seed,
  onEffectDone,
  payloadId
}: EffectRendererProps) => {
  const isWeb = Platform.OS === "web";
  const skiaStatus = useMemo(() => getSkiaStatus(isWeb), [isWeb]);
  const finishRef = useRef(false);
  const effectDoneCountRef = useRef(0);
  const startedOnceRef = useRef(false);
  const disabledForPayloadRef = useRef<Record<string, Set<RewardEffect>>>({});
  const diagnosticsKeyRef = useRef<string | null>(null);
  const [disabledTick, setDisabledTick] = useState(0);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const setRewardDiagnostics = useChallengeStore((state) => state.setRewardDiagnostics);

  const handleEffectDone = useCallback(() => {
    if (finishRef.current) return;
    finishRef.current = true;
    effectDoneCountRef.current += 1;
    if (__DEV__) {
      console.log("[RewardEffect] onEffectDone", {
        payloadId,
        effect: effects[0],
        count: effectDoneCountRef.current
      });
    }
    setTimeout(() => {
      onEffectDone?.();
    }, 0);
  }, [effects, onEffectDone, payloadId]);

  useEffect(() => {
    finishRef.current = false;
    effectDoneCountRef.current = 0;
    startedOnceRef.current = false;
  }, [effects, durationMs]);

  const markEffectDisabled = useCallback(
    (effect: RewardEffect, effectPayloadId?: string | null, error?: Error) => {
      if (!effectPayloadId) return;
      if (!disabledForPayloadRef.current[effectPayloadId]) {
        disabledForPayloadRef.current[effectPayloadId] = new Set();
      }
      if (disabledForPayloadRef.current[effectPayloadId].has(effect)) return;
      setTimeout(() => {
        disabledForPayloadRef.current[effectPayloadId].add(effect);
        if (__DEV__) {
          console.log("[RewardEffect] disabled", { payloadId: effectPayloadId, effect, error: error?.message });
        }
        setDisabledTick((tick) => tick + 1);
      }, 0);
    },
    []
  );

  const isEffectDisabled = useCallback(
    (effect: RewardEffect) => {
      if (!payloadId) return false;
      return disabledForPayloadRef.current[payloadId]?.has(effect) ?? false;
    },
    [payloadId, disabledTick]
  );

  const resolvedWidth = windowWidth;
  const resolvedHeight = windowHeight;
  const hasValidCanvas =
    Number.isFinite(resolvedWidth) && resolvedWidth > 0 && Number.isFinite(resolvedHeight) && resolvedHeight > 0;

  const renderSkia = (effect: RewardEffect) => {
    const EffectComponent = skiaEffectRegistry[effect as keyof typeof skiaEffectRegistry];
    if (!EffectComponent) return null;
    return <EffectComponent durationMs={durationMs} onFinish={handleEffectDone} seed={seed} />;
  };

  const selectedEffect = effects[0] ?? null;

  const renderDecision = useMemo(() => {
    let rendererPath: RewardRendererPath | null = null;
    let fallbackReason: RewardFallbackReason | null = null;
    let node: React.ReactNode = null;

    if (!selectedEffect) {
      return { node, rendererPath, fallbackReason };
    }

    if (isEffectDisabled(selectedEffect)) {
      rendererPath = "fallback";
      fallbackReason = "EFFECT_CRASHED";
      node = <EffectFallback reason={fallbackReason} />;
      return { node, rendererPath, fallbackReason };
    }

    if (!hasValidCanvas) {
      if (__DEV__) {
        console.log("[RewardEffect] fallback", { payloadId, effect: selectedEffect, reason: "CANVAS_ZERO" });
      }
      rendererPath = "fallback";
      fallbackReason = "CANVAS_ZERO";
      node = <EffectFallback reason={fallbackReason} />;
      return { node, rendererPath, fallbackReason };
    }

    if (isWeb) {
      rendererPath = "fallback";
      fallbackReason = "PLATFORM_WEB";
      node = <EffectFallback reason={fallbackReason} />;
      return { node, rendererPath, fallbackReason };
    }

    if (!skiaStatus.available) {
      rendererPath = "fallback";
      fallbackReason = "SKIA_HOOK_MISSING";
      node = <EffectFallback reason={fallbackReason} />;
      return { node, rendererPath, fallbackReason };
    }

    const skiaNode = renderSkia(selectedEffect);
    if (!skiaNode) {
      rendererPath = "fallback";
      fallbackReason = "EFFECT_NOT_FOUND";
      node = <EffectFallback reason={fallbackReason} />;
      return { node, rendererPath, fallbackReason };
    }

    rendererPath = "skia";
    node = skiaNode;
    return { node, rendererPath, fallbackReason };
  }, [
    durationMs,
    handleEffectDone,
    hasValidCanvas,
    isEffectDisabled,
    isWeb,
    seed,
    selectedEffect,
    skiaStatus.available
  ]);

  const usesSkia = renderDecision.rendererPath === "skia";

  useEffect(() => {
    if (!__DEV__) return;
    const nextKey = [
      selectedEffect ?? "none",
      renderDecision.rendererPath ?? "none",
      renderDecision.fallbackReason ?? "none",
      skiaStatus.available ? "1" : "0",
      skiaStatus.version ?? "none",
      Math.round(resolvedWidth),
      Math.round(resolvedHeight)
    ].join("|");
    if (diagnosticsKeyRef.current === nextKey) return;
    diagnosticsKeyRef.current = nextKey;
    const timer = setTimeout(() => {
      setRewardDiagnostics({
        selectedEffect,
        rendererPath: renderDecision.rendererPath,
        fallbackReason: renderDecision.fallbackReason,
        skiaAvailable: skiaStatus.available,
        skiaVersion: skiaStatus.version,
        canvasSize: {
          width: resolvedWidth,
          height: resolvedHeight
        }
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [
    renderDecision.fallbackReason,
    renderDecision.rendererPath,
    resolvedHeight,
    resolvedWidth,
    selectedEffect,
    setRewardDiagnostics,
    skiaStatus.available,
    skiaStatus.version
  ]);

  useEffect(() => {
    if (usesSkia) return;
    if (!durationMs) return;
    const timer = setTimeout(handleEffectDone, durationMs);
    return () => clearTimeout(timer);
  }, [usesSkia, durationMs, handleEffectDone]);

  useEffect(() => {
    if (!__DEV__) return;
    if (!selectedEffect) return;
    if (!startedOnceRef.current) {
      startedOnceRef.current = true;
    }
    console.log("[RewardEffect] mount", {
      payloadId,
      effect: selectedEffect,
      startedOnce: startedOnceRef.current,
      started: finishRef.current
    });
    return () => {
      console.log("[RewardEffect] unmount", { payloadId, effect: selectedEffect });
    };
  }, [payloadId, selectedEffect]);

  return (
    <View style={styles.renderer}>
      {selectedEffect && renderDecision.node ? (
        <View key={selectedEffect} style={styles.centerWrap}>
          <EffectBoundary
            effect={selectedEffect}
            payloadId={payloadId}
            onError={markEffectDisabled}
            fallback={<EffectFallback reason="EFFECT_CRASHED" />}
          >
            {renderDecision.node}
          </EffectBoundary>
        </View>
      ) : null}
      {message ? <FloatingTextToast text={message} /> : null}
      {badgeTier ? <BadgePop tier={badgeTier} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  renderer: {
    ...StyleSheet.absoluteFillObject
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  fallback: {
    minWidth: 180,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6
  },
  fallbackIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  fallbackIconText: {
    fontSize: 16,
    fontWeight: "800"
  },
  fallbackLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  fallbackReason: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  }
});
