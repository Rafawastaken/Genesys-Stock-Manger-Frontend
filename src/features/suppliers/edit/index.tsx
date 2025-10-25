import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSupplierDetail } from "../queries";
import { suppliersClient } from "@/api/suppliers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierKeys } from "../queries";

type FormValues = {
  name: string;
  active: boolean;
  logo_image: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  margin: number | null;
  country: string | null;
};

export default function SupplierEditPage() {
  const { id } = useParams<{ id: string }>();
  const supplierId = id ? Number(id) : NaN;
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useSupplierDetail(
    Number.isFinite(supplierId) ? supplierId : undefined
  );

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      active: true,
      logo_image: null,
      contact_name: null,
      contact_phone: null,
      contact_email: null,
      margin: null,
      country: null,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!data) return;
    const s = data.supplier;
    form.reset(
      {
        name: s.name ?? "",
        active: !!s.active,
        logo_image: s.logo_image ?? null,
        contact_name: s.contact_name ?? null,
        contact_phone: s.contact_phone ?? null,
        contact_email: s.contact_email ?? null,
        margin: typeof s.margin === "number" ? s.margin : null,
        country: s.country ?? null,
      },
      { keepDirty: false, keepTouched: false }
    );
  }, [data, form]);

  const updateM = useMutation({
    mutationFn: (payload: FormValues) =>
      suppliersClient.updateSupplierOnly(supplierId, {
        name: payload.name,
        active: payload.active,
        logo_image: emptyToNull(payload.logo_image),
        contact_name: emptyToNull(payload.contact_name),
        contact_phone: emptyToNull(payload.contact_phone),
        contact_email: emptyToNull(payload.contact_email),
        margin: payload.margin ?? 0,
        country: emptyToNull(payload.country),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierKeys.root });
      nav("/suppliers");
    },
  });

  const onSubmit = (vals: FormValues) => {
    updateM.mutate(vals);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              {data
                ? `Editar fornecedor: ${data.supplier.name}`
                : "Editar fornecedor"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Atualize os dados do fornecedor.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 space-y-1">
              <Label>Nome</Label>
              <Input
                placeholder="Nome do fornecedor"
                {...form.register("name", { required: true })}
                disabled={isLoading || updateM.isPending}
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <Label>País</Label>
              <Input
                placeholder="PT"
                {...form.register("country")}
                disabled={isLoading || updateM.isPending}
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <Label className="block">Ativo</Label>
              <div className="h-10 flex items-center">
                <Switch
                  checked={!!form.watch("active")}
                  onCheckedChange={(v) =>
                    form.setValue("active", v, { shouldDirty: true })
                  }
                  disabled={isLoading || updateM.isPending}
                />
              </div>
            </div>

            <div className="md:col-span-6 space-y-1">
              <Label>Logo (URL)</Label>
              <Input
                placeholder="https://…"
                value={form.watch("logo_image") ?? ""}
                onChange={(e) =>
                  form.setValue("logo_image", e.target.value || null, {
                    shouldDirty: true,
                  })
                }
                disabled={isLoading || updateM.isPending}
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <Label>Margem (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="10"
                value={form.watch("margin") ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  form.setValue("margin", v === "" ? null : Number(v), {
                    shouldDirty: true,
                  });
                }}
                disabled={isLoading || updateM.isPending}
              />
            </div>
          </section>

          <Separator />

          <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-1">
              <Label>Contacto (nome)</Label>
              <Input
                placeholder="Nome do contacto"
                value={form.watch("contact_name") ?? ""}
                onChange={(e) =>
                  form.setValue("contact_name", e.target.value || null, {
                    shouldDirty: true,
                  })
                }
                disabled={isLoading || updateM.isPending}
              />
            </div>
            <div className="md:col-span-4 space-y-1">
              <Label>Contacto (telefone)</Label>
              <Input
                placeholder="+351…"
                value={form.watch("contact_phone") ?? ""}
                onChange={(e) =>
                  form.setValue("contact_phone", e.target.value || null, {
                    shouldDirty: true,
                  })
                }
                disabled={isLoading || updateM.isPending}
              />
            </div>
            <div className="md:col-span-4 space-y-1">
              <Label>Contacto (email)</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={form.watch("contact_email") ?? ""}
                onChange={(e) =>
                  form.setValue("contact_email", e.target.value || null, {
                    shouldDirty: true,
                  })
                }
                disabled={isLoading || updateM.isPending}
              />
            </div>
          </section>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => nav("/suppliers")}
              disabled={updateM.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateM.isPending}>
              {updateM.isPending ? "A guardar…" : "Guardar alterações"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function emptyToNull<T extends string | null | undefined>(v: T): string | null {
  if (v === undefined || v === null) return null;
  return v.trim() === "" ? null : v;
}
