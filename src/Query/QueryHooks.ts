import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  AddParticipantsRequest,
  AuthResponse,
  ChangePasswordRequest,
  Conversation,
  CreateGroupConversationRequest,
  GetMessagesParams,
  LoginRequest,
  MarkAsReadResponse,
  Message,
  MessageResponse,
  RegisterRequest,
  SearchMessagesParams,
  SendMessageRequest,
  UnreadCountResponse,
  UpdateConversationRequest,
  UpdatesCheckResponse,
  UpdateUserRequest,
  User,
  VerifyResponse,
  // New types for UploadResponse, created in types.ts
  UploadResponse,
} from "./types";

export const apiHost = `https://${location.hostname}/api`;










export const useUploadFile = (
  options?: UseMutationOptions<UploadResponse, Error, File>
) => {
  return useMutation<UploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiHost}/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error - POST /upload, status: ${response.status}`);
      }
      return response.json();
    },
    ...options,
  });
};

















// end of new code

// General purpose API query hook
export const useApiQuery = <TData = unknown>(
  route: string,
  params: Record<string, string | number | undefined> = {},
  options?: Partial<UseQueryOptions<TData, Error, TData, QueryKey>>
) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const url = `${route}${queryString ? `?${queryString}` : ""}`;

  return useQuery<TData, Error>({
    queryKey: [route, params],
    queryFn: async () => {
      const response = await fetch(`${apiHost}${url}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        // if response is json
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(
          `API fetch error - method: GET, route: ${route}, status: ${response.status}, text: ${errorJson.message}`
          );
        } catch (e) {
          // if response is not json
          throw new Error(
            `API fetch error - method: GET, route: ${route}, status: ${response.status}, text: ${errorText}`
          );
        }
      }
      const data = await response.json();
      return data as TData;
    },
    ...options,
  });
};

// General purpose API mutation hook (fixing the previous implementation to use useMutation)
export const useApiMutation = <TData, TVariables = unknown>(
  route: string,
  method: "POST" | "PUT" | "DELETE",
  options?: Partial<UseMutationOptions<TData, Error, TVariables>>
) => {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const response = await fetch(`${apiHost}${route}`, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: variables ? JSON.stringify(variables) : undefined,
      });
      if (!response.ok) {
        throw new Error(
          `API fetch error -  method: ${method}, route: ${route}, status: ${response.status} text: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data as TData;
    },
    ...options,
  });
};

// Helper function to create a route with path parameters
const createRoute = (basePath: string, params: Record<string, string> = {}) => {
  let route = basePath;
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });
  return route;
};

// Auth Hooks
export const useRegister = (
  options?: UseMutationOptions<AuthResponse, Error, RegisterRequest>
) => {
  return useApiMutation<AuthResponse, RegisterRequest>(
    "/auth/register",
    "POST",
    options
  );
};

export const useLogin = (
  options?: UseMutationOptions<AuthResponse, Error, LoginRequest>
) => {
  return useApiMutation<AuthResponse, LoginRequest>(
    "/auth/login",
    "POST",
    options
  );
};

export const useLogout = (
  options?: UseMutationOptions<MessageResponse, Error, void>
) => {
  return useApiMutation<MessageResponse, void>("/auth/logout", "POST", options);
};

export const useVerifyAuth = (
  options?: UseQueryOptions<VerifyResponse, Error>
) => {
  return useApiQuery<VerifyResponse>("/auth/verify", {}, options);
};

// User Hooks
export const useGetCurrentUser = (
  options?: Partial<UseQueryOptions<User, Error>>
) => {
  return useApiQuery<User>("/users/me", {}, options);
};

export const useUpdateCurrentUser = (
  options?: UseMutationOptions<User, Error, UpdateUserRequest>
) => {
  return useApiMutation<User, UpdateUserRequest>("/users/me", "PUT", options);
};

export const useChangePassword = (
  options?: UseMutationOptions<MessageResponse, Error, ChangePasswordRequest>
) => {
  return useApiMutation<MessageResponse, ChangePasswordRequest>(
    "/users/password",
    "PUT",
    options
  );
};

export const useSearchUsers = (
  query: string,
  options?: Partial< UseQueryOptions<User[], Error>>
) => {
  return useApiQuery<User[]>("/users/search", { query }, options);
};

export const useGetUserById = (
  userId: string,
  options?: UseQueryOptions<User, Error>
) => {
  return useApiQuery<User>(`/users/${userId}`, {}, options);
};

// Friend Hooks
export const useGetFriends = (options?: UseQueryOptions<User[], Error>) => {
  return useApiQuery<User[]>("/friends", {}, options);
};

export const useSendFriendRequest = (
  options?: UseMutationOptions<MessageResponse, Error, { userId: string }>
) => {
  return useMutation<MessageResponse, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const route = `/friends/requests/${userId}`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(
          `API error - POST ${route}, status: ${response.status}`
        );
      }
      return response.json();
    },
    ...options,
  });
};

export const useGetFriendRequests = (
  options?: UseQueryOptions<User[], Error>
) => {
  return useApiQuery<User[]>("/friends/requests", {}, options);
};

export const useAcceptFriendRequest = (
  options?: UseMutationOptions<MessageResponse, Error, { userId: string }>
) => {
  return useMutation<MessageResponse, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const route = `/friends/requests/${userId}/accept`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`API error - PUT ${route}, status: ${response.status}`);
      }
      return response.json();
    },
    ...options,
  });
};

export const useDeclineFriendRequest = (
  options?: UseMutationOptions<MessageResponse, Error, { userId: string }>
) => {
  return useMutation<MessageResponse, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const route = `/friends/requests/${userId}/decline`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`API error - PUT ${route}, status: ${response.status}`);
      }
      return response.json();
    },
    ...options,
  });
};

export const useRemoveFriend = (
  options?: UseMutationOptions<MessageResponse, Error, { userId: string }>
) => {
  return useMutation<MessageResponse, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const route = `/friends/${userId}`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          `API error - DELETE ${route}, status: ${response.status}`
        );
      }
      return response.json();
    },
    ...options,
  });
};

// Conversation Hooks
export const useGetRecentConversations = (
  options?: UseQueryOptions<Conversation[], Error>
) => {
  return useApiQuery<Conversation[]>("/conversations", {}, options);
};

export const useCreateDirectConversation = (
  options?: UseMutationOptions<Conversation, Error, { userId: string }>
) => {
  return useMutation<Conversation, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const route = `/conversations/direct/${userId}`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(
          `API error - POST ${route}, status: ${response.status}`
        );
      }
      return response.json();
    },
    ...options,
  });
};

export const useCreateGroupConversation = (
  options?: UseMutationOptions<
    Conversation,
    Error,
    CreateGroupConversationRequest
  >
) => {
  return useApiMutation<Conversation, CreateGroupConversationRequest>(
    "/conversations/group",
    "POST",
    options
  );
};

export const useGetConversation = (
  conversationId: string,
  options?: UseQueryOptions<Conversation, Error>
) => {
  return useApiQuery<Conversation>(
    `/conversations/${conversationId}`,
    {},
    options
  );
};

export const useUpdateConversation = (
  options?: UseMutationOptions<
    Conversation,
    Error,
    { id: string; data: UpdateConversationRequest }
  >
) => {
  return useMutation<
    Conversation,
    Error,
    { id: string; data: UpdateConversationRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const route = `/conversations/${id}`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`API error - PUT ${route}, status: ${response.status}`);
      }
      return response.json();
    },
    ...options,
  });
};

export const useDeleteConversation = (
  options?: UseMutationOptions<MessageResponse, Error, { id: string }>
) => {
  return useMutation<MessageResponse, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const route = `/conversations/${id}`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          `API error - DELETE ${route}, status: ${response.status}`
        );
      }
      return response.json();
    },
    ...options,
  });
};

export const useAddConversationParticipants = (
  options?: UseMutationOptions<
    Conversation,
    Error,
    { id: string; data: AddParticipantsRequest }
  >
) => {
  return useMutation<
    Conversation,
    Error,
    { id: string; data: AddParticipantsRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const route = `/conversations/${id}/participants`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(
          `API error - POST ${route}, status: ${response.status}`
        );
      }
      return response.json();
    },
    ...options,
  });
};

export const useRemoveConversationParticipant = (
  options?: UseMutationOptions<
    Conversation,
    Error,
    { conversationId: string; userId: string }
  >
) => {
  return useMutation<
    Conversation,
    Error,
    { conversationId: string; userId: string }
  >({
    mutationFn: async ({ conversationId, userId }) => {
      const route = `/conversations/${conversationId}/participants/${userId}`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          `API error - DELETE ${route}, status: ${response.status}`
        );
      }
      return response.json();
    },
    ...options,
  });
};

// Message Hooks
export const useGetMessages = (
  conversationId: string,
  params: GetMessagesParams = {},
  options?: UseQueryOptions<Message[], Error>
) => {
  return useApiQuery<Message[]>(
    `/messages/conversations/${conversationId}/messages`,
    params as Record<string, string>,
    options
  );
};

export const useSendMessage = (
  options?: UseMutationOptions<Message, Error, { conversationId: string; data: SendMessageRequest }>
) => {
  return useMutation<Message, Error, { conversationId: string; data: SendMessageRequest }>({
    mutationFn: async ({ conversationId, data }) => {
      console.log("Sending message data:", data);  // Add this log to inspect the data

      const route = `/messages/conversations/${conversationId}/messages`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(
          `API error - POST ${route}, status: ${response.status}`
        );
      }
      return response.json();
    },
    ...options,
  });
};

export const useMarkMessageAsRead = (
  options?: UseMutationOptions<MessageResponse, Error, { messageId: string }>
) => {
  return useMutation<MessageResponse, Error, { messageId: string }>({
    mutationFn: async ({ messageId }) => {
      const route = `/messages/${messageId}/read`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`API error - PUT ${route}, status: ${response.status}`);
      }
      return response.json();
    },
    ...options,
  });
};

export const useMarkConversationAsRead = (
  options?: UseMutationOptions<
    MarkAsReadResponse,
    Error,
    { conversationId: string }
  >
) => {
  return useMutation<MarkAsReadResponse, Error, { conversationId: string }>({
    mutationFn: async ({ conversationId }) => {
      const route = `/messages/conversations/${conversationId}/read`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`API error - PUT ${route}, status: ${response.status}`);
      }
      return response.json();
    },
    ...options,
  });
};

export const useDeleteMessage = (
  options?: UseMutationOptions<MessageResponse, Error, { messageId: string }>
) => {
  return useMutation<MessageResponse, Error, { messageId: string }>({
    mutationFn: async ({ messageId }) => {
      const route = `/messages/${messageId}`;
      const response = await fetch(`${apiHost}${route}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          `API error - DELETE ${route}, status: ${response.status}`
        );
      }
      return response.json();
    },
    ...options,
  });
};

export const useGetUnreadMessageCounts = (
  options?: UseQueryOptions<UnreadCountResponse, Error>
) => {
  return useApiQuery<UnreadCountResponse>("/messages/unread", {}, options);
};

export const useSearchMessages = (
  params: SearchMessagesParams,
  options?: UseQueryOptions<Message[], Error>
) => {
  return useApiQuery<Message[]>(
    "/messages/search",
    params as unknown as Record<string, string>,
    options
  );
};

// Updates Hooks
export const useCheckUpdates = (
  options?: UseQueryOptions<UpdatesCheckResponse, Error>
) => {
  return useApiQuery<UpdatesCheckResponse>("/updates/check", {}, options);
};
