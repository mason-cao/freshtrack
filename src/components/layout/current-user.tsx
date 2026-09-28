"use client";

import { createContext, useContext, type ReactNode } from "react";

// The signed-in user's display name, read once by the server layout so client
// pages can personalize copy without an extra session request.
const CurrentUserNameContext = createContext<string | null>(null);

export function CurrentUserNameProvider({
  name,
  children,
}: {
  name: string | null;
  children: ReactNode;
}) {
  return (
    <CurrentUserNameContext.Provider value={name}>{children}</CurrentUserNameContext.Provider>
  );
}

export function useCurrentUserName() {
  return useContext(CurrentUserNameContext);
}
