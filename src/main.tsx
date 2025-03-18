import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days persistence in localStorage - before cached data is deleted from localStorage
      staleTime: 1000 * 60 * 60, // 1 hour stale time - data is fresh for 1 hour then refetched
      retry: 0, // do not retry on failure
    },
  },
});

// !Persister disabled for now
// Persister is optional, but it allows you to persist the cache in localStorage
// faster loading times with old data and then refetch from API if needed
// const persister = createSyncStoragePersister({
//   storage: window.localStorage,
// });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <PersistQueryClientProvider
      onSuccess={() => queryClient.invalidateQueries()} // invalidate all queries when data loads from localStorage to refetch them
      client={queryClient}
      persistOptions={{ persister }}
    >
      <App />
      <ReactQueryDevtools initialIsOpen position="right" />
    </PersistQueryClientProvider> */}
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen position="right" />
    </QueryClientProvider>
  </StrictMode>
);
