import NetInfo from '@react-native-community/netinfo';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Pause queries while offline and resume when the connection returns.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected));
  }),
);

// Refetch stale data when the app comes back to the foreground.
AppState.addEventListener('change', (status: AppStateStatus) => {
  focusManager.setFocused(status === 'active');
});

export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  mealsForDate: (date: string) => ['meals', 'date', date] as const,
  meal: (id: string) => ['meals', 'detail', id] as const,
  latestQueue: ['queue', 'latest'] as const,
  queueHistory: (date: string) => ['queue', 'history', date] as const,
  messLocations: ['mess-locations'] as const,
  feedbackList: ['feedback', 'list'] as const,
  feedback: (id: string) => ['feedback', 'detail', id] as const,
  feedbackForMeal: (mealId: string) => ['feedback', 'meal', mealId] as const,
};
