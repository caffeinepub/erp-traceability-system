import { useQuery } from "@tanstack/react-query";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function useAuth() {
  const { identity, login, clear, loginStatus, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const adminQuery = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !isLoggedIn) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
    staleTime: 30_000,
  });

  return {
    identity,
    login,
    logout: clear,
    loginStatus,
    isInitializing,
    isLoggingIn,
    isLoggedIn,
    isAdmin: adminQuery.data ?? false,
    isAdminLoading: adminQuery.isLoading,
    principal: identity?.getPrincipal().toString(),
  };
}
