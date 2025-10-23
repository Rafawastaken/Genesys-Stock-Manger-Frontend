import { useFormContext, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import KVEditor from "./kv-editor";
import type { KV } from "../utils";

type AuthKind =
  | "none"
  | "basic"
  | "bearer"
  | "api_key"
  | "oauth_password"
  | "ftp_password";

const sig = (list?: KV[] | null) =>
  JSON.stringify((list || []).map(({ key, value }) => [key, value]));

export default function FeedAdvanced() {
  const form = useFormContext();

  const kind = useWatch({ control: form.control, name: "kind" }) as
    | "http"
    | "ftp";
  const authKind =
    (useWatch({ control: form.control, name: "auth_kind" }) as AuthKind) ??
    "none";
  const headers_kv =
    (useWatch({ control: form.control, name: "headers_kv" }) as KV[]) || [];
  const params_kv =
    (useWatch({ control: form.control, name: "params_kv" }) as KV[]) || [];
  const auth_kv =
    (useWatch({ control: form.control, name: "auth_kv" }) as KV[]) || [];

  const allowedAuth: AuthKind[] =
    kind === "ftp"
      ? ["none", "ftp_password"]
      : ["none", "basic", "bearer", "api_key", "oauth_password"];

  const showCreds =
    authKind && authKind !== "none" && allowedAuth.includes(authKind);

  const headersKey = `hdr-${sig(headers_kv)}`;
  const paramsKey = `par-${sig(params_kv)}`;
  const authKey = `auth-${authKind}-${sig(auth_kv)}`;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="mb-3 block">Headers</Label>
          <KVEditor
            key={headersKey}
            value={headers_kv}
            onChange={(v) =>
              form.setValue("headers_kv", v, { shouldDirty: true })
            }
            keyPlaceholder="Header"
            valPlaceholder="Valor"
          />
        </div>
        <div>
          <Label className="mb-3 block">Query params</Label>
          <KVEditor
            key={paramsKey}
            value={params_kv}
            onChange={(v) =>
              form.setValue("params_kv", v, { shouldDirty: true })
            }
            keyPlaceholder="param"
            valPlaceholder="valor"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-6 border-t">
        <FormField
          control={form.control}
          name="auth_kind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Autenticação</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(v) => field.onChange(v as AuthKind)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedAuth.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2">
          {showCreds ? (
            <KVEditor
              key={authKey}
              value={auth_kv}
              onChange={(v) =>
                form.setValue("auth_kv", v, { shouldDirty: true })
              }
              keyPlaceholder="campo"
              valPlaceholder="valor"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
