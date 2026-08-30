-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.families (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT families_pkey PRIMARY KEY (id)
);
CREATE TABLE public.members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  family_id uuid,
  user_id uuid,
  name character varying NOT NULL,
  role character varying DEFAULT 'member'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT members_pkey PRIMARY KEY (id),
  CONSTRAINT members_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  family_id uuid,
  name character varying NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['income'::character varying, 'expense'::character varying]::text[])),
  icon character varying,
  color character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);
CREATE TABLE public.accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  family_id uuid,
  name character varying NOT NULL,
  type character varying NOT NULL,
  institution character varying,
  owner_member_id uuid,
  opening_balance numeric DEFAULT 0.00,
  currency character varying DEFAULT 'USD'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT accounts_owner_member_id_fkey FOREIGN KEY (owner_member_id) REFERENCES public.members(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  family_id uuid,
  account_id uuid,
  member_id uuid,
  category_id uuid,
  transaction_type character varying NOT NULL CHECK (transaction_type::text = ANY (ARRAY['income'::character varying, 'expense'::character varying, 'transfer'::character varying]::text[])),
  amount numeric NOT NULL,
  transaction_date date NOT NULL,
  description text,
  attachment_url text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  goal_id uuid,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT transactions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id),
  CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT transactions_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.goals(id),
  CONSTRAINT fk_transactions_goal_id FOREIGN KEY (goal_id) REFERENCES public.goals(id)
);
CREATE TABLE public.budgets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  family_id uuid,
  category_id uuid,
  amount numeric NOT NULL,
  period_type character varying NOT NULL CHECK (period_type::text = ANY (ARRAY['DAILY'::character varying, 'WEEKLY'::character varying, 'MONTHLY'::character varying, 'YEARLY'::character varying]::text[])),
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT budgets_pkey PRIMARY KEY (id),
  CONSTRAINT budgets_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  family_id uuid,
  name character varying NOT NULL,
  description text,
  target_amount numeric DEFAULT 0.00,
  current_amount numeric DEFAULT 0.00,
  target_date date,
  monthly_target numeric,
  linked_account_id uuid,
  status character varying DEFAULT 'ACTIVE'::character varying CHECK (status::text = ANY (ARRAY['ACTIVE'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT goals_pkey PRIMARY KEY (id),
  CONSTRAINT goals_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT goals_linked_account_id_fkey FOREIGN KEY (linked_account_id) REFERENCES public.accounts(id)
);
CREATE TABLE public.attachments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  family_id uuid,
  transaction_id uuid,
  file_name character varying NOT NULL,
  storage_path text NOT NULL,
  mime_type character varying,
  file_size integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attachments_pkey PRIMARY KEY (id),
  CONSTRAINT attachments_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT attachments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
CREATE TABLE public.recurring_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  family_id uuid,
  account_id uuid,
  category_id uuid,
  member_id uuid,
  name character varying NOT NULL,
  transaction_type character varying NOT NULL CHECK (transaction_type::text = ANY (ARRAY['income'::character varying, 'expense'::character varying]::text[])),
  amount numeric NOT NULL,
  frequency character varying NOT NULL CHECK (frequency::text = ANY (ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'yearly'::character varying]::text[])),
  start_date date NOT NULL,
  end_date date,
  next_due_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recurring_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT recurring_transactions_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT recurring_transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT recurring_transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT recurring_transactions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id)
);