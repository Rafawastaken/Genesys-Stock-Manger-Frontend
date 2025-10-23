import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import ErrorNote from "./error-note";
import { useCreateSupplier } from "../queries";
import type { Supplier } from "@/api/suppliers";

type SupplierForm = {
  name: string;
  country: string;
  margin: number;
  active: boolean;
  logo_image?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
};

function FieldMsg({ name }: { name: keyof SupplierForm }) {
  const { formState } = useFormContext<SupplierForm>();
  const msg = formState?.errors?.[name]?.message as string | undefined;
  if (!msg) return null;
  return <p className="text-xs text-destructive">{msg}</p>;
}

export default function StepSupplier({
  onCancel,
  onNext,
}: {
  onCancel: () => void;
  onNext: (supplier: Supplier) => void;
}) {
  const form = useForm<SupplierForm>({
    defaultValues: {
      name: "",
      country: "PT",
      margin: 0.1,
      active: true,
      logo_image: "",
      contact_name: "",
      contact_phone: "",
      contact_email: "",
    },
    mode: "onBlur",
  });

  const createM = useCreateSupplier();
  const logo = (form.watch("logo_image") as string) || "";

  return (
    <>
      <CardHeader className="p-0">
        <CardTitle>Fornecedor</CardTitle>
        <CardDescription>Dados gerais de fornecedor</CardDescription>
      </CardHeader>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(async (vals) => {
            const payload = {
              ...vals,
              country: (vals.country || "").toUpperCase().slice(0, 2),
              logo_image: vals.logo_image?.trim() || undefined,
              contact_name: vals.contact_name?.trim() || undefined,
              contact_phone: vals.contact_phone?.trim() || undefined,
              contact_email: vals.contact_email?.trim() || undefined,
            };
            const created = await createM.mutateAsync(payload);
            onNext(created);
          })}
        >
          <CardContent className="space-y-6 p-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-1">
                <Label>Nome</Label>
                <Input
                  placeholder="Fornecedor X"
                  {...form.register("name", {
                    required: "Nome obrigatório",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  })}
                />
                <FieldMsg name="name" />
              </div>
              <div className="md:col-span-4 space-y-1">
                <Label>País (ISO-2)</Label>
                <Input
                  maxLength={2}
                  className="uppercase"
                  placeholder="PT"
                  {...form.register("country", {
                    required: "País obrigatório",
                    validate: (v) =>
                      (v || "").length === 2 || "Usa código ISO-2",
                  })}
                />
                <FieldMsg name="country" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 space-y-1">
                <Label>
                  Margem{" "}
                  <span className="text-xs text-gray-600 italic">
                    (Ex.: 0.10 = 10%)
                  </span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  placeholder="0.10"
                  {...form.register("margin", {
                    valueAsNumber: true,
                    min: { value: 0, message: ">= 0" },
                    max: { value: 1, message: "<= 1" },
                    validate: (v) =>
                      !Number.isNaN(v) || "Número inválido (ex.: 0.10)",
                  })}
                />
              </div>

              <div className="md:col-span-6 space-y-1">
                <Label className="">Ativo</Label>
                <div className="flex h-9 items-center rounded-md border px-3">
                  <Switch
                    checked={!!form.watch("active")}
                    onCheckedChange={(v) => form.setValue("active", v)}
                  />
                  <span className="ml-2 text-sm">
                    {form.watch("active") ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Logo (URL)</Label>
              <Input
                type="url"
                placeholder="https://..."
                {...form.register("logo_image")}
              />
              {logo ? (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img
                    src={logo}
                    className="h-12 w-auto max-w-[260px] rounded object-contain border"
                  />
                  <span className="text-xs text-muted-foreground">
                    Pré-visualização
                  </span>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-1">
                <Label>Contacto (nome)</Label>
                <Input
                  placeholder="Nome do contacto"
                  {...form.register("contact_name")}
                />
              </div>
              <div className="md:col-span-4 space-y-1">
                <Label>Contacto (telefone)</Label>
                <Input
                  placeholder="9xxxxxxxx"
                  {...form.register("contact_phone", {
                    pattern: {
                      value: /^[\d\s+().-]{6,}$/,
                      message: "Telefone inválido",
                    },
                  })}
                />
                <FieldMsg name="contact_phone" />
              </div>
              <div className="md:col-span-4 space-y-1">
                <Label>Contacto (email)</Label>
                <Input
                  type="email"
                  placeholder="nome@exemplo.com"
                  {...form.register("contact_email", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email inválido",
                    },
                  })}
                />
                <FieldMsg name="contact_email" />
              </div>
            </div>

            <ErrorNote error={createM.error} />
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-6 p-0 mt-5">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createM.isPending}>
              {createM.isPending ? "A guardar…" : "Guardar e continuar"}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </>
  );
}
