import React, { useCallback, useEffect, useState } from "react"
import { useTheme, Breakpoint, Theme } from "@mui/material/styles"

export type ResponsiveValues<P> = Partial<Record<Breakpoint, P>>

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

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (func: React.EffectCallback) => useEffect(func, []);

export const useBreakpoints = ():Partial<Record<Breakpoint, boolean>> => {
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