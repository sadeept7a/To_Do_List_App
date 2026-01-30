import { ThemeProvider } from "@/hooks/useTheme";
import TodoProvider, { USE_CONVEX } from "@/todoStore";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";

if (USE_CONVEX && !process.env.EXPO_PUBLIC_CONVEX_URL) {
  throw new Error("EXPO_PUBLIC_CONVEX_URL is missing. Set it or disable USE_CONVEX.");
}

const convex = USE_CONVEX
  ? new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL ?? "", {
      unsavedChangesWarning: false,
    })
  : null;

export default function RootLayout() {
  const content = (
    <ThemeProvider>
      <TodoProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </TodoProvider>
    </ThemeProvider>
  );

  return USE_CONVEX && convex ? <ConvexProvider client={convex}>{content}</ConvexProvider> : content;
}
