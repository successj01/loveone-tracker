"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <LocationProvider>{children}</LocationProvider>
    </AuthProvider>
  );
}