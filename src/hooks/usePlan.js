"use client";

import { useCallback, useEffect, useState } from "react";
import * as billingService from "@/services/billingService";

const EMPTY = { plan: "free", isPremium: false, loading: true, error: null };

export function usePlan() {
  const [state, setState] = useState(EMPTY);

  const refresh = useCallback(async () => {
    try {
      const data = await billingService.getPlan();
      setState({
        plan: data.plan,
        isPremium: data.isPremium,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({ plan: "free", isPremium: false, loading: false, error: error.message });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}