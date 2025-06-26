--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: user_status; Type: TYPE; Schema: public; Owner: crispr_user
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'disabled',
    'invited'
);


ALTER TYPE public.user_status OWNER TO crispr_user;

--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: crispr_user
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_set_timestamp() OWNER TO crispr_user;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: crispr_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO crispr_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    account_id text NOT NULL,
    provider_id text NOT NULL,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at timestamp with time zone,
    refresh_token_expires_at timestamp with time zone,
    scope text,
    password text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.accounts OWNER TO crispr_user;

--
-- Name: COLUMN accounts.id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.id IS 'Unique identifier for each account';


--
-- Name: COLUMN accounts.user_id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.user_id IS 'The id of the user';


--
-- Name: COLUMN accounts.account_id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.account_id IS 'The id of the account as provided by the SSO or equal to user_id for credential accounts';


--
-- Name: COLUMN accounts.provider_id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.provider_id IS 'The id of the provider';


--
-- Name: COLUMN accounts.access_token; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.access_token IS 'The access token of the account. Returned by the provider';


--
-- Name: COLUMN accounts.refresh_token; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.refresh_token IS 'The refresh token of the account. Returned by the provider';


--
-- Name: COLUMN accounts.id_token; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.id_token IS 'The id token returned from the provider';


--
-- Name: COLUMN accounts.access_token_expires_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.access_token_expires_at IS 'The time when the access token expires';


--
-- Name: COLUMN accounts.refresh_token_expires_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.refresh_token_expires_at IS 'The time when the refresh token expires';


--
-- Name: COLUMN accounts.scope; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.scope IS 'The scope of the account. Returned by the provider';


--
-- Name: COLUMN accounts.password; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.password IS 'The password of the account. Mainly used for email and password authentication';


--
-- Name: COLUMN accounts.created_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.created_at IS 'The time when the account was created';


--
-- Name: COLUMN accounts.updated_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.accounts.updated_at IS 'The time when the account was last updated';


--
-- Name: analysis_results; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.analysis_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    experiment_id uuid NOT NULL,
    analysis_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    results_data jsonb,
    error_message text,
    algorithm_used character varying(50),
    parameters jsonb,
    computation_time_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.analysis_results OWNER TO crispr_user;

--
-- Name: credentials; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider text NOT NULL,
    provider_account_id text,
    email text,
    label text,
    tokens jsonb NOT NULL,
    "primary" boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.credentials OWNER TO crispr_user;

--
-- Name: COLUMN credentials.id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials.id IS 'Unique identifier for each credential';


--
-- Name: COLUMN credentials.user_id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials.user_id IS 'The id of the user who owns this credential';


--
-- Name: COLUMN credentials.provider; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials.provider IS 'The authentication provider name';


--
-- Name: COLUMN credentials.provider_account_id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials.provider_account_id IS 'The account id from the provider';


--
-- Name: COLUMN credentials.email; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials.email IS 'The email associated with this credential';


--
-- Name: COLUMN credentials.label; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials.label IS 'A user-friendly label for this credential';


--
-- Name: COLUMN credentials.tokens; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials.tokens IS 'JSON object containing provider tokens';


--
-- Name: COLUMN credentials."primary"; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials."primary" IS 'Whether this is the primary credential for the user';


--
-- Name: COLUMN credentials.created_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials.created_at IS 'The time when the credential was created';


--
-- Name: COLUMN credentials.updated_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.credentials.updated_at IS 'The time when the credential was last updated';


--
-- Name: experiments; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.experiments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    target_organism character varying(100),
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    experiment_type character varying(50) DEFAULT 'knockout'::character varying,
    status character varying(20) DEFAULT 'draft'::character varying
);


ALTER TABLE public.experiments OWNER TO crispr_user;

--
-- Name: guide_rnas; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.guide_rnas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sequence_id uuid NOT NULL,
    guide_sequence character varying(23) NOT NULL,
    pam_sequence character varying(8) NOT NULL,
    target_position integer NOT NULL,
    strand character(1) NOT NULL,
    efficiency_score numeric(5,4),
    specificity_score numeric(5,4),
    on_target_score numeric(5,4),
    gc_content numeric(5,2),
    algorithm_used character varying(50),
    algorithm_version character varying(20),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT guide_rnas_strand_check CHECK ((strand = ANY (ARRAY['+'::bpchar, '-'::bpchar]))),
    CONSTRAINT valid_guide_sequence CHECK (((guide_sequence)::text ~ '^[ATCG]+$'::text)),
    CONSTRAINT valid_pam CHECK (((pam_sequence)::text ~ '^[ATCG]+$'::text)),
    CONSTRAINT valid_scores CHECK ((((efficiency_score IS NULL) OR ((efficiency_score >= (0)::numeric) AND (efficiency_score <= (1)::numeric))) AND ((specificity_score IS NULL) OR ((specificity_score >= (0)::numeric) AND (specificity_score <= (1)::numeric))) AND ((on_target_score IS NULL) OR ((on_target_score >= (0)::numeric) AND (on_target_score <= (1)::numeric))) AND ((gc_content IS NULL) OR ((gc_content >= (0)::numeric) AND (gc_content <= (100)::numeric)))))
);


ALTER TABLE public.guide_rnas OWNER TO crispr_user;

--
-- Name: off_target_sites; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.off_target_sites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guide_rna_id uuid NOT NULL,
    chromosome character varying(10),
    "position" bigint,
    strand character(1),
    sequence character varying(23) NOT NULL,
    mismatch_count integer DEFAULT 0 NOT NULL,
    mismatch_positions integer[],
    binding_score numeric(5,4),
    cutting_score numeric(5,4),
    annotation character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT off_target_sites_strand_check CHECK ((strand = ANY (ARRAY['+'::bpchar, '-'::bpchar]))),
    CONSTRAINT valid_off_target_scores CHECK ((((binding_score IS NULL) OR ((binding_score >= (0)::numeric) AND (binding_score <= (1)::numeric))) AND ((cutting_score IS NULL) OR ((cutting_score >= (0)::numeric) AND (cutting_score <= (1)::numeric))))),
    CONSTRAINT valid_off_target_sequence CHECK (((sequence)::text ~ '^[ATCG]+$'::text))
);


ALTER TABLE public.off_target_sites OWNER TO crispr_user;

--
-- Name: pgmigrations; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.pgmigrations OWNER TO crispr_user;

--
-- Name: pgmigrations_id_seq; Type: SEQUENCE; Schema: public; Owner: crispr_user
--

CREATE SEQUENCE public.pgmigrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pgmigrations_id_seq OWNER TO crispr_user;

--
-- Name: pgmigrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crispr_user
--

ALTER SEQUENCE public.pgmigrations_id_seq OWNED BY public.pgmigrations.id;


--
-- Name: sequences; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.sequences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    experiment_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    sequence text NOT NULL,
    sequence_type character varying(20) DEFAULT 'genomic'::character varying,
    organism character varying(100),
    chromosome character varying(10),
    start_position bigint,
    end_position bigint,
    strand character(1),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sequences_strand_check CHECK ((strand = ANY (ARRAY['+'::bpchar, '-'::bpchar]))),
    CONSTRAINT valid_positions CHECK (((start_position IS NULL) OR (end_position IS NULL) OR (start_position <= end_position))),
    CONSTRAINT valid_sequence CHECK ((sequence ~ '^[ATCGN]+$'::text))
);


ALTER TABLE public.sequences OWNER TO crispr_user;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sessions OWNER TO crispr_user;

--
-- Name: COLUMN sessions.id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.sessions.id IS 'Unique identifier for each session';


--
-- Name: COLUMN sessions.user_id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.sessions.user_id IS 'The id of the user';


--
-- Name: COLUMN sessions.token; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.sessions.token IS 'The unique session token';


--
-- Name: COLUMN sessions.expires_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.sessions.expires_at IS 'The time when the session expires';


--
-- Name: COLUMN sessions.ip_address; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.sessions.ip_address IS 'The IP address of the device';


--
-- Name: COLUMN sessions.user_agent; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.sessions.user_agent IS 'The user agent information of the device';


--
-- Name: COLUMN sessions.created_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.sessions.created_at IS 'The time when the session was created';


--
-- Name: COLUMN sessions.updated_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.sessions.updated_at IS 'The time when the session was last updated';


--
-- Name: users; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    name text,
    email text,
    email_verified boolean DEFAULT false NOT NULL,
    image text,
    last_interaction_at timestamp with time zone,
    time_zone text
);


ALTER TABLE public.users OWNER TO crispr_user;

--
-- Name: COLUMN users.id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.id IS 'Unique identifier for each user';


--
-- Name: COLUMN users.created_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.created_at IS 'The time when the user was created';


--
-- Name: COLUMN users.updated_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.updated_at IS 'The time when the user was last updated';


--
-- Name: COLUMN users.status; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.status IS 'The current status of the user account';


--
-- Name: COLUMN users.name; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.name IS 'The display name of the user';


--
-- Name: COLUMN users.email; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.email IS 'The email address of the user';


--
-- Name: COLUMN users.email_verified; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.email_verified IS 'Whether the user email is verified';


--
-- Name: COLUMN users.image; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.image IS 'The image URL of the user';


--
-- Name: COLUMN users.last_interaction_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.last_interaction_at IS 'The time when the user last interacted with the system';


--
-- Name: COLUMN users.time_zone; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.users.time_zone IS 'The user preferred timezone';


--
-- Name: verifications; Type: TABLE; Schema: public; Owner: crispr_user
--

CREATE TABLE public.verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.verifications OWNER TO crispr_user;

--
-- Name: COLUMN verifications.id; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.verifications.id IS 'Unique identifier for each verification';


--
-- Name: COLUMN verifications.identifier; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.verifications.identifier IS 'The identifier for the verification request';


--
-- Name: COLUMN verifications.value; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.verifications.value IS 'The value to be verified';


--
-- Name: COLUMN verifications.expires_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.verifications.expires_at IS 'The time when the verification request expires';


--
-- Name: COLUMN verifications.created_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.verifications.created_at IS 'The time when the verification was created';


--
-- Name: COLUMN verifications.updated_at; Type: COMMENT; Schema: public; Owner: crispr_user
--

COMMENT ON COLUMN public.verifications.updated_at IS 'The time when the verification was last updated';


--
-- Name: pgmigrations id; Type: DEFAULT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.pgmigrations ALTER COLUMN id SET DEFAULT nextval('public.pgmigrations_id_seq'::regclass);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: analysis_results analysis_results_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_pkey PRIMARY KEY (id);


--
-- Name: credentials credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_pkey PRIMARY KEY (id);


--
-- Name: experiments experiments_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_pkey PRIMARY KEY (id);


--
-- Name: guide_rnas guide_rnas_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.guide_rnas
    ADD CONSTRAINT guide_rnas_pkey PRIMARY KEY (id);


--
-- Name: off_target_sites off_target_sites_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.off_target_sites
    ADD CONSTRAINT off_target_sites_pkey PRIMARY KEY (id);


--
-- Name: pgmigrations pgmigrations_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.pgmigrations
    ADD CONSTRAINT pgmigrations_pkey PRIMARY KEY (id);


--
-- Name: sequences sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.sequences
    ADD CONSTRAINT sequences_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key UNIQUE (token);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_pkey PRIMARY KEY (id);


--
-- Name: idx_analysis_results_analysis_type; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_analysis_results_analysis_type ON public.analysis_results USING btree (analysis_type);


--
-- Name: idx_analysis_results_experiment_id; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_analysis_results_experiment_id ON public.analysis_results USING btree (experiment_id);


--
-- Name: idx_analysis_results_status; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_analysis_results_status ON public.analysis_results USING btree (status);


--
-- Name: idx_experiments_created_by; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_experiments_created_by ON public.experiments USING btree (created_by);


--
-- Name: idx_experiments_status; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_experiments_status ON public.experiments USING btree (status);


--
-- Name: idx_guide_rnas_efficiency_score; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_guide_rnas_efficiency_score ON public.guide_rnas USING btree (efficiency_score DESC);


--
-- Name: idx_guide_rnas_sequence_id; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_guide_rnas_sequence_id ON public.guide_rnas USING btree (sequence_id);


--
-- Name: idx_guide_rnas_specificity_score; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_guide_rnas_specificity_score ON public.guide_rnas USING btree (specificity_score DESC);


--
-- Name: idx_off_target_sites_binding_score; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_off_target_sites_binding_score ON public.off_target_sites USING btree (binding_score DESC);


--
-- Name: idx_off_target_sites_chromosome_position; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_off_target_sites_chromosome_position ON public.off_target_sites USING btree (chromosome, "position");


--
-- Name: idx_off_target_sites_guide_rna_id; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_off_target_sites_guide_rna_id ON public.off_target_sites USING btree (guide_rna_id);


--
-- Name: idx_sequences_experiment_id; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_sequences_experiment_id ON public.sequences USING btree (experiment_id);


--
-- Name: idx_sequences_organism; Type: INDEX; Schema: public; Owner: crispr_user
--

CREATE INDEX idx_sequences_organism ON public.sequences USING btree (organism);


--
-- Name: accounts set_timestamp_accounts; Type: TRIGGER; Schema: public; Owner: crispr_user
--

CREATE TRIGGER set_timestamp_accounts BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: sessions set_timestamp_sessions; Type: TRIGGER; Schema: public; Owner: crispr_user
--

CREATE TRIGGER set_timestamp_sessions BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: users set_timestamp_users; Type: TRIGGER; Schema: public; Owner: crispr_user
--

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: verifications set_timestamp_verifications; Type: TRIGGER; Schema: public; Owner: crispr_user
--

CREATE TRIGGER set_timestamp_verifications BEFORE UPDATE ON public.verifications FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: credentials update_credentials_timestamp; Type: TRIGGER; Schema: public; Owner: crispr_user
--

CREATE TRIGGER update_credentials_timestamp BEFORE UPDATE ON public.credentials FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: experiments update_experiments_updated_at; Type: TRIGGER; Schema: public; Owner: crispr_user
--

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON public.experiments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: analysis_results analysis_results_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiments(id) ON DELETE CASCADE;


--
-- Name: credentials credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: experiments experiments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: guide_rnas guide_rnas_sequence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.guide_rnas
    ADD CONSTRAINT guide_rnas_sequence_id_fkey FOREIGN KEY (sequence_id) REFERENCES public.sequences(id) ON DELETE CASCADE;


--
-- Name: off_target_sites off_target_sites_guide_rna_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.off_target_sites
    ADD CONSTRAINT off_target_sites_guide_rna_id_fkey FOREIGN KEY (guide_rna_id) REFERENCES public.guide_rnas(id) ON DELETE CASCADE;


--
-- Name: sequences sequences_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.sequences
    ADD CONSTRAINT sequences_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiments(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crispr_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

