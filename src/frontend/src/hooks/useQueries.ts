import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Material } from "../backend";
import { useAuth } from "../lib/auth";
import { useActor } from "./useActor";

export function useAllMaterials() {
  const { actor, isFetching } = useActor();
  return useQuery<Material[]>({
    queryKey: ["materials"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMaterials();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOrUpdateMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      code,
      description,
      weight,
      minWeight,
      maxWeight,
      quantity,
    }: {
      code: string;
      description: string;
      weight: number;
      minWeight: number;
      maxWeight: number;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addOrUpdateMaterial(
        code,
        description,
        weight,
        minWeight,
        maxWeight,
        quantity,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useDeleteMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteMaterial(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useBulkImportMaterials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (materials: Material[]) => {
      if (!actor) throw new Error("Not connected");
      return actor.bulkImportMaterials(materials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useGenerateLabel() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      materialCode,
      actualWeight,
    }: {
      materialCode: string;
      actualWeight: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.generateLabel(materialCode, actualWeight);
    },
  });
}

export function useAllLabelLogs() {
  const { actor, isFetching } = useActor();
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: ["labelLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLabelLogs();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}
