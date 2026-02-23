import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GameProvider } from "@/contexts/GameContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameHistoryProvider } from "@/contexts/GameHistoryContext";
import { Colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" options={{ animation: "fade" }} />
      <Stack.Screen name="setup" />
      <Stack.Screen name="lobby" />
      <Stack.Screen name="game" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="results"
        options={{ gestureEnabled: false, animation: "fade" }}
      />
      <Stack.Screen
        name="profile"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="subscription"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="history" />
      <Stack.Screen name="history-detail" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <LanguageProvider>
          <AuthProvider>
            <GameHistoryProvider>
              <GameProvider>
                <RootLayoutNav />
              </GameProvider>
            </GameHistoryProvider>
          </AuthProvider>
        </LanguageProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
