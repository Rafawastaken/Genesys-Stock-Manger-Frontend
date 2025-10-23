import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

type Kind = "http" | "ftp";

export default function FeedOrigin({
  tabKind,
  setTabKind,
}: {
  tabKind: Kind;
  setTabKind: (k: Kind) => void;
}) {
  const form = useFormContext();
  const format = form.watch("format") as "csv" | "json" | "xml" | undefined;

  useEffect(() => {
    if (format === "csv") {
      const cur = form.getValues("csv_delimiter");
      if (!cur) form.setValue("csv_delimiter", ",", { shouldDirty: true });
    } else {
      form.setValue("csv_delimiter", null, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-medium">Conexão do feed</h3>
          <p className="text-xs text-muted-foreground">
            Configura a origem e testa antes de guardar.
          </p>
        </div>

        <Tabs
          value={tabKind}
          onValueChange={(v) => {
            setTabKind(v as Kind);
            form.setValue("kind", v as Kind, { shouldDirty: true });
          }}
        >
          <TabsList>
            <TabsTrigger value="http">HTTP</TabsTrigger>
            <TabsTrigger value="ftp">FTP</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-9">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  URL
                  <span className="text-xs text-muted-foreground">
                    CSV/JSON (e XML para referência). Confirma o delimitador
                    quando CSV.
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-10"
                    placeholder={
                      tabKind === "http"
                        ? "https://exemplo.com/feed.csv"
                        : "ftp://host/path/ficheiro.csv"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-3 flex items-end">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Estado</FormLabel>
                <div className="h-10 w-full rounded-md border px-3 flex items-center justify-between">
                  <span className="text-sm">Ativo</span>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formato</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="csv/json" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {format === "csv" && (
          <FormField
            control={form.control}
            name="csv_delimiter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delimitador</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ","}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-10 w-[120px]">
                      <SelectValue placeholder="delim" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">,</SelectItem>
                      <SelectItem value=";">;</SelectItem>
                      <SelectItem value="|">|</SelectItem>
                      <SelectItem value="\t">tab</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </section>
  );
}
