import { Haptics, ImpactStyle } from "@capacitor/haptics";

/**
 * Global haptic feedback enabled flag
 * Check this before firing haptics - if false, skip haptic calls
 */
export let hapticEnabled = true;

/**
 * Enable or disable haptic feedback globally
 */
export function setHapticEnabled(enabled: boolean): void {
    hapticEnabled = enabled;
}

/**
 * Fire a light haptic impact - wrapped in try/catch for safe execution
 * on desktop browsers where haptics are not available
 */
export async function triggerHaptic(): Promise<void> {
    if (!hapticEnabled) {
        return;
    }

    try {
        await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
        // Silently fail on desktop browsers or devices without haptic support
    }
}

/**
 * Fire a medium haptic impact for more emphasis
 */
export async function triggerMediumHaptic(): Promise<void> {
    if (!hapticEnabled) {
        return;
    }

    try {
        await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
        // Silently fail on desktop browsers
    }
}