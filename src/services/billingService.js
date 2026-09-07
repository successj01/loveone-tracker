import { apiRequest } from "@/lib/apiClient";

export { API_BASE } from "@/lib/apiClient";

export async function getPlans() {
  return apiRequest("/billing/plans");
}

export async function getPlan() {
  return apiRequest("/billing");
}

export async function startCheckout(mode = "month") {
  const data = await apiRequest("/billing/checkout", {
    method: "POST",
    body: { mode: mode === "year" ? "year" : "month" },
  });
  return data.url;
}

export async function openPortal() {
  const data = await apiRequest("/billing/portal", { method: "POST" });
  return data.url;
}