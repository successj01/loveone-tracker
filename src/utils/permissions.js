export function canViewHistory(permission) {
  return permission === "history";
}

export function canViewLive(permission) {
  return permission === "history" || permission === "live";
}

export function permissionLabel(permission) {
  if (permission === "history") return "Live + history";
  if (permission === "live") return "Live only";
  return "Live only";
}