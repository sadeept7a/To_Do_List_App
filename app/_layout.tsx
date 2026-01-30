import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";
import { convex } from "../convexClient";
import { ThemeProvider } from "../hooks/useTheme";

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </ConvexProvider>
  );
}
