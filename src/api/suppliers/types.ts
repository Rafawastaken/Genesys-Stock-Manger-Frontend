// src/api/suppliers/types.ts
// Types para fornecedores

export type Supplier = {
  id: number;
  name: string;
  active: boolean;
  logo_image?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  margin: number;
  country: string;
  created_at: string;
  updated_at: string;
};

export type SupplierListResponse = {
  items: Supplier[];
  total: number;
  page: number;
  page_size: number;
};
