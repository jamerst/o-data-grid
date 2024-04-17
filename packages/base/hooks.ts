import React, { useCallback, useEffect, useRef, useState } from "react"
import { useTheme, Breakpoint, Theme } from "@mui/material/styles"

/**
 * Values which should vary depending on the screen size
 */
export type ResponsiveValues<P> = Partial<Record<Breakpoint, P>>

/**
 * Get the values for the current screen size from ResponsiveValues
 * @returns Values for current screen size
 */
export const useResponsive = () => {
  const theme = useTheme()
  const keys = theme.breakpoints.keys;

  const matches = useBreakpoints();

  const getResponsiveValue = useCallback(<P,>(responsiveValues: ResponsiveValues<P>) => {
    let match: Breakpoint | undefined;
    keys.forEach((breakpoint) => {
      if (matches[breakpoint] && responsiveValues[breakpoint] != null) {
        match = breakpoint;
      }
    })

    return match && responsiveValues[match]
  }, [matches, keys]);

  return getResponsiveValue;
}

export const useMountEffect = (func: React.EffectCallback) => {
  const run = useRef(false);

  useEffect(() => {
    if (!run.current) {
      run.current = true;
      return func();
    }
  }, [func]);
};

const useBreakpoints = ():Partial<Record<Breakpoint, boolean>> => {
  const theme = useTheme();
  const [matches, setMatches] = useState<Partial<Record<Breakpoint, boolean>>>(getMatches(theme.breakpoints.keys, theme));

  useEffect(() => {
    const queries: Partial<Record<Breakpoint, MediaQueryList>> = getQueries(theme.breakpoints.keys, theme);
    const listeners: Partial<Record<Breakpoint, () => void>> = {};

    const updateMatch = (b: Breakpoint) => {
      setMatches((oldMatches) => ({...oldMatches, [b]: queries[b]?.matches ?? false }));
    }

    theme.breakpoints.keys.forEach(b => {
      listeners[b] = () => updateMatch(b);
      queries[b]!.addEventListener("change", listeners[b]!);
    });

    return () => {
      theme.breakpoints.keys.forEach(b => {
        queries[b]!.removeEventListener("change", listeners[b]!)
      })
    }
  }, [theme]);

  return matches;
}

const getQueries = (breakpoints: Breakpoint[], theme: Theme) => breakpoints.reduce((acc: Partial<Record<Breakpoint, MediaQueryList>>, b) =>
  ({
    ...acc,
    [b]: window.matchMedia(theme.breakpoints.up(b).replace(/^@media( ?)/m, ''))
  }),
  {}
);

const getMatches = (breakpoints: Breakpoint[], theme: Theme) => breakpoints.reduce((acc: Partial<Record<Breakpoint, boolean>>, b) =>
  ({
    ...acc,
    [b]: window.matchMedia(theme.breakpoints.up(b).replace(/^@media( ?)/m, '')).matches
  }),
  {}
);