export type KV = { key: string; value: string };

export type ConditionUI = {
  op: string;
  left: string;
  right: string | string[];
};

export type FieldRow = {
  target: string;
  source?: string;
  required?: boolean;
  opts?: {
    trim?: boolean;
    lowercase?: boolean;
    to_number?: { decimal?: string; thousands?: string };
    value_map_kv?: KV[];
    derive?: {
      when: ConditionUI[];
      then: string | number | boolean;
      else?: string | number | boolean;
    };
  };
};

export type Rule = { when: ConditionUI[]; set: KV[] };
export type DropIfUI = { empty_any_of?: string[] };

export type ProfileFormRHF = {
  input: "csv" | "json";
  row_selector?: string | null;
  fields: FieldRow[];
  required: string[];
  defaults_kv: KV[];
  rules?: Rule[];
  drop_if?: DropIfUI;
};

export const INTERNAL_FIELDS = [
  "name",
  "gtin",
  "partnumber",
  "price",
  "stock",
  "description",
  "brand",
  "category",
  "weight",
  "mpn",
  "image_url",
  "status",
] as const;
