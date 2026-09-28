import { useCallback, useEffect, useState } from 'react';
import { AUTH_STORAGE_KEYS } from '../mock/auth.mock';
import { formatCountdownTime } from '../utils/formatters';

export interface IUseCountdownReturn {
  secondsLeft: number;
  formattedTime: string;
  isActive: boolean;
  progressPercent: number;
  startCountdown: (customSeconds?: number) => void;
  resetCountdown: () => void;
}

/**
 * [S1-01] Custom hook useCountdown(15 * 60) for 15-minute account lockout.
 * Persists lockout target timestamp in localStorage to survive page reloads.
 */
export function useCountdown(defaultDurationSeconds: number = 15 * 60): IUseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const savedUntil = window.localStorage.getItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
    if (!savedUntil) return 0;
    const targetMs = Number(savedUntil);
    if (Number.isNaN(targetMs)) return 0;
    const remaining = Math.ceil((targetMs - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  const [isActive, setIsActive] = useState<boolean>(() => secondsLeft > 0);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) {
      if (secondsLeft <= 0) {
        setIsActive(false);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
      }
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const savedUntil = window.localStorage.getItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
      if (savedUntil) {
        const remaining = Math.max(0, Math.ceil((Number(savedUntil) - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          setIsActive(false);
          window.localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
          window.localStorage.removeItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
        }
      } else {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isActive, secondsLeft]);

  const startCountdown = useCallback(
    (customSeconds?: number): void => {
      const duration = customSeconds ?? defaultDurationSeconds;
      const unlockTimestamp = Date.now() + duration * 1000;
      window.localStorage.setItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL, String(unlockTimestamp));
      setSecondsLeft(duration);
      setIsActive(true);
    },
    [defaultDurationSeconds]
  );

  const resetCountdown = useCallback((): void => {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
    setSecondsLeft(0);
    setIsActive(false);
  }, []);

  const progressPercent =
    defaultDurationSeconds > 0
      ? Math.min(100, Math.max(0, (secondsLeft / defaultDurationSeconds) * 100))
      : 0;

  return {
    secondsLeft,
    formattedTime: formatCountdownTime(secondsLeft),
    isActive,
    progressPercent,
    startCountdown,
    resetCountdown,
  };
}
