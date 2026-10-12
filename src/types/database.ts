/**
 * Database types for the Rentless Supabase schema.
 *
 * Hand-authored to match supabase/migrations/*. Once a Supabase project is
 * linked, regenerate with:
 *   npx supabase gen types typescript --linked > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "owner" | "tenant";
export type ApartmentStatus = "vacant" | "occupied";
export type TenancyStatus = "active" | "moved_out";
export type ChargeStatus = "pending" | "partial" | "paid" | "overdue";
export type PaymentMode = "cash" | "upi" | "bank" | "other";
export type MaintenanceStatus = "open" | "in_progress" | "resolved";
export type NotificationType =
  | "rent_upcoming"
  | "rent_overdue"
  | "payment_recorded"
  | "maintenance_update"
  | "invite"
  | "system";
export type ReminderKind = "upcoming" | "overdue";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole | null;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          locale: string;
          currency: string;
          grace_period_days: number;
          onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole | null;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          locale?: string;
          currency?: string;
          grace_period_days?: number;
          onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole | null;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          locale?: string;
          currency?: string;
          grace_period_days?: number;
          onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      buildings: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "buildings_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      apartments: {
        Row: {
          id: string;
          building_id: string;
          owner_id: string;
          label: string;
          floor: number | null;
          base_rent: number;
          security_deposit: number;
          status: ApartmentStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          building_id: string;
          owner_id: string;
          label: string;
          floor?: number | null;
          base_rent?: number;
          security_deposit?: number;
          status?: ApartmentStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          building_id?: string;
          owner_id?: string;
          label?: string;
          floor?: number | null;
          base_rent?: number;
          security_deposit?: number;
          status?: ApartmentStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "apartments_building_id_fkey";
            columns: ["building_id"];
            isOneToOne: false;
            referencedRelation: "buildings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "apartments_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tenancies: {
        Row: {
          id: string;
          apartment_id: string;
          owner_id: string;
          tenant_id: string | null;
          tenant_name: string;
          tenant_phone: string | null;
          tenant_email: string | null;
          move_in_date: string;
          move_out_date: string | null;
          rent_amount: number;
          due_day: number;
          deposit_amount: number;
          deposit_settled: number | null;
          status: TenancyStatus;
          invite_token: string | null;
          invite_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          apartment_id: string;
          owner_id: string;
          tenant_id?: string | null;
          tenant_name: string;
          tenant_phone?: string | null;
          tenant_email?: string | null;
          move_in_date: string;
          move_out_date?: string | null;
          rent_amount: number;
          due_day?: number;
          deposit_amount?: number;
          deposit_settled?: number | null;
          status?: TenancyStatus;
          invite_token?: string | null;
          invite_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          apartment_id?: string;
          owner_id?: string;
          tenant_id?: string | null;
          tenant_name?: string;
          tenant_phone?: string | null;
          tenant_email?: string | null;
          move_in_date?: string;
          move_out_date?: string | null;
          rent_amount?: number;
          due_day?: number;
          deposit_amount?: number;
          deposit_settled?: number | null;
          status?: TenancyStatus;
          invite_token?: string | null;
          invite_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenancies_apartment_id_fkey";
            columns: ["apartment_id"];
            isOneToOne: false;
            referencedRelation: "apartments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenancies_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenancies_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      rent_history: {
        Row: {
          id: string;
          tenancy_id: string;
          rent_amount: number;
          effective_from: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenancy_id: string;
          rent_amount: number;
          effective_from: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenancy_id?: string;
          rent_amount?: number;
          effective_from?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rent_history_tenancy_id_fkey";
            columns: ["tenancy_id"];
            isOneToOne: false;
            referencedRelation: "tenancies";
            referencedColumns: ["id"];
          },
        ];
      };
      rent_charges: {
        Row: {
          id: string;
          tenancy_id: string;
          owner_id: string;
          tenant_id: string | null;
          period_month: string;
          amount_due: number;
          due_date: string;
          status: ChargeStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenancy_id: string;
          owner_id: string;
          tenant_id?: string | null;
          period_month: string;
          amount_due: number;
          due_date: string;
          status?: ChargeStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenancy_id?: string;
          owner_id?: string;
          tenant_id?: string | null;
          period_month?: string;
          amount_due?: number;
          due_date?: string;
          status?: ChargeStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rent_charges_tenancy_id_fkey";
            columns: ["tenancy_id"];
            isOneToOne: false;
            referencedRelation: "tenancies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rent_charges_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rent_charges_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          tenancy_id: string;
          owner_id: string;
          tenant_id: string | null;
          amount: number;
          paid_on: string;
          mode: PaymentMode;
          note: string | null;
          recorded_by: string | null;
          receipt_no: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenancy_id: string;
          owner_id: string;
          tenant_id?: string | null;
          amount: number;
          paid_on?: string;
          mode?: PaymentMode;
          note?: string | null;
          recorded_by?: string | null;
          receipt_no?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenancy_id?: string;
          owner_id?: string;
          tenant_id?: string | null;
          amount?: number;
          paid_on?: string;
          mode?: PaymentMode;
          note?: string | null;
          recorded_by?: string | null;
          receipt_no?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_tenancy_id_fkey";
            columns: ["tenancy_id"];
            isOneToOne: false;
            referencedRelation: "tenancies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      maintenance_requests: {
        Row: {
          id: string;
          tenancy_id: string;
          apartment_id: string;
          owner_id: string;
          tenant_id: string | null;
          title: string;
          description: string | null;
          photo_path: string | null;
          status: MaintenanceStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenancy_id: string;
          apartment_id: string;
          owner_id: string;
          tenant_id?: string | null;
          title: string;
          description?: string | null;
          photo_path?: string | null;
          status?: MaintenanceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenancy_id?: string;
          apartment_id?: string;
          owner_id?: string;
          tenant_id?: string | null;
          title?: string;
          description?: string | null;
          photo_path?: string | null;
          status?: MaintenanceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_tenancy_id_fkey";
            columns: ["tenancy_id"];
            isOneToOne: false;
            referencedRelation: "tenancies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "maintenance_requests_apartment_id_fkey";
            columns: ["apartment_id"];
            isOneToOne: false;
            referencedRelation: "apartments";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reminder_log: {
        Row: {
          id: string;
          tenancy_id: string;
          kind: ReminderKind;
          channel: string;
          sent_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenancy_id: string;
          kind: ReminderKind;
          channel?: string;
          sent_on?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenancy_id?: string;
          kind?: ReminderKind;
          channel?: string;
          sent_on?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminder_log_tenancy_id_fkey";
            columns: ["tenancy_id"];
            isOneToOne: false;
            referencedRelation: "tenancies";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      v_tenancy_balance: {
        Row: {
          tenancy_id: string;
          owner_id: string;
          tenant_id: string | null;
          total_charged: number;
          total_paid: number;
          pending: number;
          last_payment_on: string | null;
          next_due_date: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      fn_generate_monthly_charges: {
        Args: { p_run_date?: string };
        Returns: number;
      };
      fn_months_lived: {
        Args: { p_from: string; p_to?: string };
        Returns: string;
      };
      fn_mark_overdue: {
        Args: Record<string, never>;
        Returns: number;
      };
      fn_recompute_charge_statuses: {
        Args: { p_tenancy: string };
        Returns: undefined;
      };
      rpc_owner_dashboard: {
        Args: Record<string, never>;
        Returns: Json;
      };
      rpc_owner_monthly: {
        Args: { p_months?: number };
        Returns: { period_month: string; expected: number; collected: number }[];
      };
      rpc_tenant_home: {
        Args: Record<string, never>;
        Returns: Json;
      };
      rpc_accept_invite: {
        Args: { p_token: string };
        Returns: string;
      };
      rpc_mark_moved_out: {
        Args: {
          p_tenancy: string;
          p_move_out: string;
          p_deposit_settled?: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      apartment_status: ApartmentStatus;
      tenancy_status: TenancyStatus;
      charge_status: ChargeStatus;
      payment_mode: PaymentMode;
      maintenance_status: MaintenanceStatus;
      notification_type: NotificationType;
      reminder_kind: ReminderKind;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
