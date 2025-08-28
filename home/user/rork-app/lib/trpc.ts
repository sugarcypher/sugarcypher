import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../backend/trpc/app-router';

// React tRPC client for use in components
export const trpc = createTRPCReact<AppRouter>();

// Vanilla tRPC client for use outside of React components
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
      // You can pass any HTTP headers here
      async headers() {
        return {
          // authorization: getAuthCookie(),
        };
      },
    }),
  ],
});