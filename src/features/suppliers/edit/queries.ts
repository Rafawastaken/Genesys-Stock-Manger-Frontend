import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersClient } from "@/api/suppliers";
import { supplierKeys } from "../queries";
import type {
  SupplierCreate,
  SupplierFeedCreate,
  MapperValidateIn,
  MapperValidateOut,
} from "@/api/suppliers";
import { toast } from "sonner";

type OnSuccessCb = () => void | Promise<void>;

export function useUpdateSupplierOnly(
  supplierId: number,
  onSuccess?: OnSuccessCb
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierCreate) =>
      suppliersClient.updateSupplierOnly(supplierId, payload),
    onSuccess: async () => {
      toast.success("Fornecedor atualizado com sucesso.");
      await qc.invalidateQueries({ queryKey: supplierKeys.root });
      if (onSuccess) await onSuccess();
    },
    onError: (err: any) => {
      toast.error("Falha ao atualizar fornecedor.", {
        description: err?.message ?? "Tente novamente.",
      });
    },
  });
}

export function useUpdateSupplierFeed(
  supplierId: number,
  onSuccess?: OnSuccessCb
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierFeedCreate) =>
      suppliersClient.updateSupplierFeed(supplierId, payload),
    onSuccess: async () => {
      toast.success("Feed atualizado com sucesso.");
      await qc.invalidateQueries({ queryKey: supplierKeys.root });
      if (onSuccess) await onSuccess();
    },
    onError: (err: any) => {
      toast.error("Falha ao atualizar feed.", {
        description: err?.message ?? "Verifique os campos e tente novamente.",
      });
    },
  });
}

export function useValidateMapper(feedId?: number) {
  return useMutation({
    mutationFn: (payload: MapperValidateIn) => {
      if (!feedId) throw new Error("Sem feed para validar.");
      return suppliersClient.validateMapper(feedId, payload);
    },
    onSuccess: (res: MapperValidateOut) => {
      if (res.ok) {
        toast.success("Mapper válido.");
      } else {
        toast.warning("Validação concluída com avisos/erros.");
      }
    },
    onError: (err: any) => {
      toast.error("Falha na validação do mapper.", {
        description: err?.message ?? "Tente novamente.",
      });
    },
  });
}

export function useUpdateSupplierMapper(
  supplierId: number,
  onSuccess?: OnSuccessCb
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      profile: Record<string, any>;
      bump_version?: boolean;
    }) => suppliersClient.updateSupplierMapper(supplierId, payload),
    onSuccess: async () => {
      toast.success("Mapper guardado com sucesso.");
      await qc.invalidateQueries({ queryKey: supplierKeys.root });
      if (onSuccess) await onSuccess();
    },
    onError: (err: any) => {
      toast.error("Falha ao guardar o mapper.", {
        description: err?.message ?? "Tente novamente.",
      });
    },
  });
}
