import { useAuthContext, AuthContextRef } from "@/context/AuthContext";

export function useAuth() {
  return useAuthContext();
}

export { AuthContextRef };