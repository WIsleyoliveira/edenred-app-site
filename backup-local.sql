--
-- PostgreSQL database dump
--

\restrict xtOjtnqINyIIgMc5Sj3csTkQ1Z8Ud4X2Ui3xKlQxteXRl0Azf4wpN6SqlutTvYc

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_companies_dataSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_companies_dataSource" AS ENUM (
    'RECEITA_FEDERAL',
    'MANUAL',
    'API_EXTERNA'
);


ALTER TYPE public."enum_companies_dataSource" OWNER TO postgres;

--
-- Name: enum_companies_porte; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_companies_porte AS ENUM (
    'MEI',
    'ME',
    'EPP',
    'MEDIO',
    'GRANDE'
);


ALTER TYPE public.enum_companies_porte OWNER TO postgres;

--
-- Name: enum_companies_regimeTributario; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_companies_regimeTributario" AS ENUM (
    'SIMPLES',
    'PRESUMIDO',
    'REAL'
);


ALTER TYPE public."enum_companies_regimeTributario" OWNER TO postgres;

--
-- Name: enum_companies_situacao; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_companies_situacao AS ENUM (
    'ATIVA',
    'BAIXADA',
    'SUSPENSA',
    'INAPTA'
);


ALTER TYPE public.enum_companies_situacao OWNER TO postgres;

--
-- Name: enum_consultations_produto; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_consultations_produto AS ENUM (
    'FLEET',
    'TICKET_RESTAURANT',
    'PAY',
    'ALIMENTA',
    'ABASTECIMENTO',
    'OUTRAS'
);


ALTER TYPE public.enum_consultations_produto OWNER TO postgres;

--
-- Name: enum_consultations_source; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_consultations_source AS ENUM (
    'RECEITA_FEDERAL',
    'CACHE',
    'API_EXTERNA'
);


ALTER TYPE public.enum_consultations_source OWNER TO postgres;

--
-- Name: enum_consultations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_consultations_status AS ENUM (
    'PENDING',
    'SUCCESS',
    'ERROR',
    'NOT_FOUND'
);


ALTER TYPE public.enum_consultations_status OWNER TO postgres;

--
-- Name: enum_landscapes_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_landscapes_category AS ENUM (
    'landscape',
    'urban',
    'nature',
    'architecture',
    'portrait',
    'abstract',
    'other'
);


ALTER TYPE public.enum_landscapes_category OWNER TO postgres;

--
-- Name: enum_landscapes_metadataFormat; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_landscapes_metadataFormat" AS ENUM (
    'jpeg',
    'jpg',
    'png',
    'webp',
    'gif'
);


ALTER TYPE public."enum_landscapes_metadataFormat" OWNER TO postgres;

--
-- Name: enum_landscapes_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_landscapes_status AS ENUM (
    'active',
    'inactive',
    'pending',
    'rejected'
);


ALTER TYPE public.enum_landscapes_status OWNER TO postgres;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    cnpj character varying(18) NOT NULL,
    "razaoSocial" character varying(200) NOT NULL,
    "nomeFantasia" character varying(200),
    "naturezaJuridica" character varying(100),
    situacao public.enum_companies_situacao DEFAULT 'ATIVA'::public.enum_companies_situacao,
    "dataAbertura" timestamp with time zone,
    "capitalSocial" numeric(15,2),
    "cnaePrincipal" character varying(10),
    "cnaePrincipalDescricao" character varying(255),
    porte public.enum_companies_porte DEFAULT 'ME'::public.enum_companies_porte,
    "regimeTributario" public."enum_companies_regimeTributario" DEFAULT 'SIMPLES'::public."enum_companies_regimeTributario",
    "addressStreet" character varying(255),
    "addressNumber" character varying(20),
    "addressComplement" character varying(100),
    "addressNeighborhood" character varying(100),
    "addressCity" character varying(100),
    "addressState" character varying(2),
    "addressZipCode" character varying(10),
    "addressCountry" character varying(50) DEFAULT 'Brasil'::character varying,
    "contactPhone" character varying(20),
    "contactEmail" character varying(255),
    "contactWebsite" character varying(255),
    "lastUpdated" timestamp with time zone,
    "dataSource" public."enum_companies_dataSource" DEFAULT 'RECEITA_FEDERAL'::public."enum_companies_dataSource",
    tags json DEFAULT '[]'::json,
    notes text,
    "isFavorite" boolean DEFAULT false,
    "addedBy" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: consultations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultations (
    id integer NOT NULL,
    cnpj character varying(18) NOT NULL,
    "userId" integer NOT NULL,
    "companyId" integer,
    status public.enum_consultations_status DEFAULT 'PENDING'::public.enum_consultations_status,
    source public.enum_consultations_source DEFAULT 'RECEITA_FEDERAL'::public.enum_consultations_source,
    "responseTime" integer,
    result json,
    error json,
    "isFavorite" boolean DEFAULT false,
    tags json DEFAULT '[]'::json,
    notes character varying(500),
    metadata json DEFAULT '{}'::json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    produto public.enum_consultations_produto NOT NULL,
    "isActive" boolean DEFAULT true
);


ALTER TABLE public.consultations OWNER TO postgres;

--
-- Name: consultations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consultations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.consultations_id_seq OWNER TO postgres;

--
-- Name: consultations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consultations_id_seq OWNED BY public.consultations.id;


--
-- Name: landscapes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.landscapes (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description character varying(1000),
    "imageUrl" character varying(500) NOT NULL,
    "imagePublicId" character varying(255),
    "thumbnailUrl" character varying(500),
    "locationName" character varying(255),
    "locationLatitude" numeric(10,8),
    "locationLongitude" numeric(11,8),
    "locationCountry" character varying(50) DEFAULT 'Brasil'::character varying,
    "locationState" character varying(50),
    "locationCity" character varying(100),
    "metadataFileSize" integer,
    "metadataDimensionsWidth" integer,
    "metadataDimensionsHeight" integer,
    "metadataFormat" public."enum_landscapes_metadataFormat",
    "metadataExif" json,
    tags json DEFAULT '[]'::json,
    category public.enum_landscapes_category DEFAULT 'landscape'::public.enum_landscapes_category,
    "isPublic" boolean DEFAULT true,
    "isFeatured" boolean DEFAULT false,
    "uploadedBy" integer NOT NULL,
    likes json DEFAULT '[]'::json,
    comments json DEFAULT '[]'::json,
    views integer DEFAULT 0,
    status public.enum_landscapes_status DEFAULT 'active'::public.enum_landscapes_status,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.landscapes OWNER TO postgres;

--
-- Name: landscapes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.landscapes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.landscapes_id_seq OWNER TO postgres;

--
-- Name: landscapes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.landscapes_id_seq OWNED BY public.landscapes.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public.enum_users_role DEFAULT 'user'::public.enum_users_role,
    avatar character varying(500),
    "isActive" boolean DEFAULT true,
    "lastLogin" timestamp with time zone,
    preferences json DEFAULT '{"theme":"light","notifications":true}'::json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: consultations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultations ALTER COLUMN id SET DEFAULT nextval('public.consultations_id_seq'::regclass);


--
-- Name: landscapes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landscapes ALTER COLUMN id SET DEFAULT nextval('public.landscapes_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, cnpj, "razaoSocial", "nomeFantasia", "naturezaJuridica", situacao, "dataAbertura", "capitalSocial", "cnaePrincipal", "cnaePrincipalDescricao", porte, "regimeTributario", "addressStreet", "addressNumber", "addressComplement", "addressNeighborhood", "addressCity", "addressState", "addressZipCode", "addressCountry", "contactPhone", "contactEmail", "contactWebsite", "lastUpdated", "dataSource", tags, notes, "isFavorite", "addedBy", "createdAt", "updatedAt") FROM stdin;
65	12.345.678/0001-90	ANTONIO DISTRIBUIÇÃO LTDA	Antonio Distribuidora	Sociedade Empresária Limitada	ATIVA	2010-01-14 21:00:00-03	500000.00	4610-7/01	Distribuição de Alimentos	MEDIO	SIMPLES	Rua das Flores	123		Centro	São Paulo	SP	01234-567	Brasil	(11) 97463-2014	contato@antonio.com.br	\N	2025-10-23 18:13:54.037-03	RECEITA_FEDERAL	[]	\N	f	1	2025-10-23 18:13:54.135-03	2025-10-23 18:13:54.135-03
66	98.765.432/0001-10	ELIANE SERVIÇOS E CONSULTORIA LTDA	Eliane Consultoria	Sociedade Empresária Limitada	ATIVA	2015-02-09 21:00:00-03	100000.00	7020-4/00	Consultoria Empresarial	EPP	SIMPLES	Av. Paulista	456	Sala 301	Bela Vista	São Paulo	SP	01310-100	Brasil	(11) 85642-2013	eliane@consultoria.com.br	\N	2025-10-23 18:13:54.037-03	RECEITA_FEDERAL	[]	\N	f	1	2025-10-23 18:13:54.141-03	2025-10-23 18:13:54.141-03
67	11.222.333/0001-44	LEA TECNOLOGIA E INOVAÇÃO S.A.	Lea Tech	Sociedade Anônima	ATIVA	2018-03-04 21:00:00-03	2000000.00	6201-5/00	Desenvolvimento de Software	GRANDE	SIMPLES	Rua do Ouvidor	789	Andar 15	Centro	Rio de Janeiro	RJ	20040-020	Brasil	(21) 87547-3921	contato@leatech.com.br	\N	2025-10-23 18:13:54.037-03	RECEITA_FEDERAL	[]	\N	f	1	2025-10-23 18:13:54.143-03	2025-10-23 18:13:54.143-03
68	55.666.777/0001-88	ERIC INDÚSTRIAS METALÚRGICAS LTDA	Eric Metais	Sociedade Empresária Limitada	SUSPENSA	2012-04-11 21:00:00-03	800000.00	2511-0/00	Metalurgia	MEDIO	SIMPLES	Distrito Industrial	1000		Industrial	Campinas	SP	13100-000	Brasil	(19) 99999-9999	eric@metalurgica.com.br	\N	2025-10-23 18:13:54.037-03	RECEITA_FEDERAL	[]	\N	f	1	2025-10-23 18:13:54.144-03	2025-10-23 18:13:54.144-03
70	09346601000125	B3 S.A. - BRASIL, BOLSA, BALCAO	B3 S.A. BRASIL, BOLSA, BALCAO	204-6 - Sociedade Anônima Aberta	ATIVA	2007-12-20 21:00:00-03	12898655563.88	\N	\N	GRANDE	SIMPLES	PC ANTONIO PRADO	48	ANDAR 7	CENTRO	SAO PAULO	SP	01010901	Brasil	(11) 2565-4000	societariob3@b3.com.br	\N	2025-11-02 01:16:56.179-03	API_EXTERNA	[]	\N	f	45	2025-11-02 01:16:56.178-03	2025-11-02 01:16:56.178-03
71	48642645000154	ARKAMA INTERMEDIACOES & NEGOCIOS DIGITAIS LTDA	ARKAMA INTERMEDIACOES & NEGOCIOS DIGITAIS LTDA	206-2 - Sociedade Empresária Limitada	ATIVA	2022-11-16 21:00:00-03	1000000.00	\N	\N	GRANDE	SIMPLES	R CALIXTO MACHADO	21	\N	PIRES FACANHA	EUSEBIO	CE	61775060	Brasil	(85) 9966-6768	juridico@arkama.com.br	\N	2025-11-02 03:15:05.916-03	API_EXTERNA	[]	\N	f	45	2025-11-02 01:20:48.064-03	2025-11-02 03:15:05.915-03
74	48.642.645/0001-54	ARKAMA INTERMEDIACOES & NEGOCIOS DIGITAIS LTDA	ARKAMA INTERMEDIACOES & NEGOCIOS DIGITAIS LTDA	206-2 - Sociedade Empresária Limitada	ATIVA	2022-11-16 21:00:00-03	1000000.00	\N	\N	ME	SIMPLES	R CALIXTO MACHADO	21	\N	PIRES FACANHA	EUSEBIO	CE	61775060	Brasil	(85) 9966-6768	juridico@arkama.com.br	\N	2025-11-25 09:45:54.446-03	RECEITA_FEDERAL	[]	\N	f	45	2025-11-02 03:04:19.796-03	2025-11-25 09:45:54.445-03
69	09.346.601/0001-25	B3 S.A. - BRASIL, BOLSA, BALCAO	B3 S.A. BRASIL, BOLSA, BALCAO	204-6 - Sociedade Anônima Aberta	ATIVA	2007-12-20 21:00:00-03	12898655563.88	\N	\N	ME	SIMPLES	PC ANTONIO PRADO	48	ANDAR 7	CENTRO	SAO PAULO	SP	01010901	Brasil	(11) 2565-4000	societariob3@b3.com.br	\N	2025-11-25 10:39:53.746-03	RECEITA_FEDERAL	[]	\N	f	2	2025-10-23 18:27:03.335-03	2025-11-25 10:39:53.745-03
\.


--
-- Data for Name: consultations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultations (id, cnpj, "userId", "companyId", status, source, "responseTime", result, error, "isFavorite", tags, notes, metadata, "createdAt", "updatedAt", produto, "isActive") FROM stdin;
35	99.999.999/0001-00	1	\N	SUCCESS	RECEITA_FEDERAL	\N	\N	\N	f	[]	\N	{}	2025-10-23 21:28:59.533-03	2025-10-23 21:28:59.533-03	ABASTECIMENTO	t
97	09.346.601/0001-25	50	69	SUCCESS	CACHE	\N	{"id":69,"cnpj":"09.346.601/0001-25","razaoSocial":"B3 S.A. - BRASIL, BOLSA, BALCAO","nomeFantasia":"B3 S.A. BRASIL, BOLSA, BALCAO","naturezaJuridica":"204-6 - Sociedade Anônima Aberta","situacao":"ATIVA","dataAbertura":"2007-12-21T00:00:00.000Z","capitalSocial":"12898655563.88","cnaePrincipal":null,"cnaePrincipalDescricao":null,"porte":"ME","regimeTributario":"SIMPLES","addressStreet":"PC ANTONIO PRADO","addressNumber":"48","addressComplement":"ANDAR 7","addressNeighborhood":"CENTRO","addressCity":"SAO PAULO","addressState":"SP","addressZipCode":"01010901","addressCountry":"Brasil","contactPhone":"(11) 2565-4000","contactEmail":"societariob3@b3.com.br","contactWebsite":null,"lastUpdated":"2025-11-25T13:39:53.746Z","dataSource":"RECEITA_FEDERAL","tags":[],"notes":null,"isFavorite":false,"addedBy":2,"createdAt":"2025-10-23T21:27:03.335Z","updatedAt":"2025-11-25T13:39:53.745Z"}	\N	f	[]	\N	{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15","ipAddress":"::1"}	2025-11-25 11:08:59.062-03	2025-11-25 11:08:59.068-03	OUTRAS	t
10	74.629.854/0001-78	2	\N	ERROR	RECEITA_FEDERAL	\N	\N	"Falha em todas as APIs de consulta: ReceitaWS: CNPJ rejeitado pela Receita Federal; BrasilAPI: Request failed with status code 404"	f	[]	\N	{"userAgent":"curl/8.7.1","ipAddress":"::1"}	2025-10-19 12:57:59.143-03	2025-10-19 12:58:00.254-03	OUTRAS	t
9	59.945.840/0001-70	2	\N	SUCCESS	RECEITA_FEDERAL	\N	{"cnpj":"59.945.840/0001-70","razaoSocial":"4. TABELIONATO DE PROTESTO DE TITULOS","nomeFantasia":"4 TABELIONATO DE PROTESTO","situacao":"ATIVA","dataAbertura":"1989-01-31T00:00:00.000Z","capitalSocial":0,"cnae":{"principal":{"codigo":"69.12-5-00","descricao":"Cartórios"},"secundarias":[{"codigo":"00.00-0-00","descricao":"Não informada"}]},"address":{"street":"AV BRIGADEIRO LUIZ ANTONIO","number":"319","complement":"","neighborhood":"BELA VISTA","city":"SAO PAULO","state":"SP","zipCode":"01.006-030","country":"Brasil"},"contact":{"phone":"(11) 3186-7254","email":"oficios@quartoprotestosp.com.br"},"naturezaJuridica":"303-4 - Serviço Notarial e Registral (Cartório)","porte":"ME","dataSource":"RECEITA_FEDERAL","lastUpdated":"2025-10-19T15:56:25.384Z"}	\N	f	[]	\N	{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15","ipAddress":"::1"}	2025-10-19 12:56:24.972-03	2025-10-19 12:56:25.388-03	OUTRAS	t
12	09.614.276/0001-34	2	\N	SUCCESS	RECEITA_FEDERAL	\N	{"cnpj":"09.614.276/0001-34","razaoSocial":"M4 PRODUTOS E SERVICOS LTDA.","nomeFantasia":"M4 PRODUTOS E SERVICOS LTDA.","situacao":"ATIVA","dataAbertura":"2008-06-04T00:00:00.000Z","capitalSocial":11017500000,"cnae":{"principal":{"codigo":"62.01-5-01","descricao":"Desenvolvimento de programas de computador sob encomenda"},"secundarias":[{"codigo":"62.04-0-00","descricao":"Consultoria em tecnologia da informação"}]},"address":{"street":"AVENIDA BARAO DE TEFE","number":"00027","complement":"SAL 1301 SUP AV VEN 154","neighborhood":"SAUDE","city":"RIO DE JANEIRO","state":"RJ","zipCode":"20.220-460","country":"Brasil"},"contact":{"phone":"(21) 2546-4050 / (21) 2253-4242","email":"suprimentos-m4p@m4u.com.br"},"naturezaJuridica":"206-2 - Sociedade Empresária Limitada","porte":"ME","dataSource":"RECEITA_FEDERAL","lastUpdated":"2025-10-19T16:00:16.367Z"}	\N	f	[]	\N	{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15","ipAddress":"::1"}	2025-10-19 13:00:15.95-03	2025-10-19 13:00:16.371-03	OUTRAS	t
94	09.346.601/0001-25	50	69	SUCCESS	API_EXTERNA	\N	\N	\N	f	[]	\N	{}	2025-11-25 10:39:53.751-03	2025-11-25 10:39:53.751-03	FLEET	t
13	48.642.645/0001-54	2	\N	SUCCESS	RECEITA_FEDERAL	\N	{"cnpj":"48.642.645/0001-54","razaoSocial":"ARKAMA INTERMEDIACOES & NEGOCIOS DIGITAIS LTDA","nomeFantasia":"ARKAMA INTERMEDIACOES & NEGOCIOS DIGITAIS LTDA","situacao":"ATIVA","dataAbertura":"2022-11-17T00:00:00.000Z","capitalSocial":100000000,"cnae":{"principal":{"codigo":"74.90-1-04","descricao":"Atividades de intermediação e agenciamento de serviços e negócios em geral, exceto imobiliários"},"secundarias":[{"codigo":"62.01-5-01","descricao":"Desenvolvimento de programas de computador sob encomenda"},{"codigo":"62.04-0-00","descricao":"Consultoria em tecnologia da informação"},{"codigo":"63.19-4-00","descricao":"Portais, provedores de conteúdo e outros serviços de informação na internet"},{"codigo":"64.99-9-99","descricao":"Outras atividades de serviços financeiros não especificadas anteriormente"},{"codigo":"66.19-3-02","descricao":"Correspondentes de instituições financeiras"},{"codigo":"66.19-3-99","descricao":"Outras atividades auxiliares dos serviços financeiros não especificadas anteriormente"},{"codigo":"82.11-3-00","descricao":"Serviços combinados de escritório e apoio administrativo"},{"codigo":"82.30-0-01","descricao":"Serviços de organização de feiras, congressos, exposições e festas"},{"codigo":"82.91-1-00","descricao":"Atividades de cobrança e informações cadastrais"}]},"address":{"street":"RUA CALIXTO MACHADO","number":"21","complement":"","neighborhood":"PIRES FACANHA","city":"EUSEBIO","state":"CE","zipCode":"61.775-060","country":"Brasil"},"contact":{"phone":"(85) 9966-6768","email":"juridico@arkama.com.br"},"naturezaJuridica":"206-2 - Sociedade Empresária Limitada","porte":"ME","dataSource":"RECEITA_FEDERAL","lastUpdated":"2025-10-21T13:37:51.547Z"}	\N	f	[]	\N	{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15","ipAddress":"::1"}	2025-10-21 10:37:51.126-03	2025-10-21 10:37:51.554-03	OUTRAS	t
14	18.236.120/0001-58	2	\N	SUCCESS	RECEITA_FEDERAL	\N	{"cnpj":"18.236.120/0001-58","razaoSocial":"NU PAGAMENTOS S.A. - INSTITUICAO DE PAGAMENTO","nomeFantasia":"NU PAGAMENTOS S.A. - INSTITUICAO DE PAGAMENTO","situacao":"ATIVA","dataAbertura":"2013-06-04T00:00:00.000Z","capitalSocial":865856013983,"cnae":{"principal":{"codigo":"66.13-4-00","descricao":"Administração de cartões de crédito"},"secundarias":[{"codigo":"59.13-8-00","descricao":"Distribuição cinematográfica, de vídeo e de programas de televisão"},{"codigo":"62.09-1-00","descricao":"Suporte técnico, manutenção e outros serviços em tecnologia da informação"},{"codigo":"74.90-1-04","descricao":"Atividades de intermediação e agenciamento de serviços e negócios em geral, exceto imobiliários"},{"codigo":"82.99-7-02","descricao":"Emissão de vales-alimentação, vales-transporte e similares"},{"codigo":"82.99-7-99","descricao":"Outras atividades de serviços prestados principalmente às empresas não especificadas anteriormente"}]},"address":{"street":"R CAPOTE VALENTE","number":"120","complement":"ANDAR 01 AO 8 E 9 ANDAR CONJ 902 E 16 ANDAR","neighborhood":"PINHEIROS","city":"SAO PAULO","state":"SP","zipCode":"05.409-000","country":"Brasil"},"contact":{"phone":"(11) 1111-1111","email":""},"naturezaJuridica":"205-4 - Sociedade Anônima Fechada","porte":"ME","dataSource":"RECEITA_FEDERAL","lastUpdated":"2025-10-21T13:49:44.560Z"}	\N	f	[]	\N	{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15","ipAddress":"::1"}	2025-10-21 10:49:44.232-03	2025-10-21 10:49:44.565-03	OUTRAS	t
95	09.346.601/0001-25	50	69	SUCCESS	CACHE	\N	{"id":69,"cnpj":"09.346.601/0001-25","razaoSocial":"B3 S.A. - BRASIL, BOLSA, BALCAO","nomeFantasia":"B3 S.A. BRASIL, BOLSA, BALCAO","naturezaJuridica":"204-6 - Sociedade Anônima Aberta","situacao":"ATIVA","dataAbertura":"2007-12-21T00:00:00.000Z","capitalSocial":"12898655563.88","cnaePrincipal":null,"cnaePrincipalDescricao":null,"porte":"ME","regimeTributario":"SIMPLES","addressStreet":"PC ANTONIO PRADO","addressNumber":"48","addressComplement":"ANDAR 7","addressNeighborhood":"CENTRO","addressCity":"SAO PAULO","addressState":"SP","addressZipCode":"01010901","addressCountry":"Brasil","contactPhone":"(11) 2565-4000","contactEmail":"societariob3@b3.com.br","contactWebsite":null,"lastUpdated":"2025-11-25T13:39:53.746Z","dataSource":"RECEITA_FEDERAL","tags":[],"notes":null,"isFavorite":false,"addedBy":2,"createdAt":"2025-10-23T21:27:03.335Z","updatedAt":"2025-11-25T13:39:53.745Z"}	\N	f	[]	\N	{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15","ipAddress":"::1"}	2025-11-25 10:40:22.917-03	2025-11-25 10:40:22.922-03	TICKET_RESTAURANT	t
19	12345678000190	1	\N	SUCCESS	RECEITA_FEDERAL	\N	{"test":"data"}	\N	f	[]	\N	{}	2025-10-23 18:18:55.619-03	2025-10-23 18:18:55.619-03	FLEET	t
96	09.346.601/0001-25	50	69	SUCCESS	CACHE	\N	{"id":69,"cnpj":"09.346.601/0001-25","razaoSocial":"B3 S.A. - BRASIL, BOLSA, BALCAO","nomeFantasia":"B3 S.A. BRASIL, BOLSA, BALCAO","naturezaJuridica":"204-6 - Sociedade Anônima Aberta","situacao":"ATIVA","dataAbertura":"2007-12-21T00:00:00.000Z","capitalSocial":"12898655563.88","cnaePrincipal":null,"cnaePrincipalDescricao":null,"porte":"ME","regimeTributario":"SIMPLES","addressStreet":"PC ANTONIO PRADO","addressNumber":"48","addressComplement":"ANDAR 7","addressNeighborhood":"CENTRO","addressCity":"SAO PAULO","addressState":"SP","addressZipCode":"01010901","addressCountry":"Brasil","contactPhone":"(11) 2565-4000","contactEmail":"societariob3@b3.com.br","contactWebsite":null,"lastUpdated":"2025-11-25T13:39:53.746Z","dataSource":"RECEITA_FEDERAL","tags":[],"notes":null,"isFavorite":false,"addedBy":2,"createdAt":"2025-10-23T21:27:03.335Z","updatedAt":"2025-11-25T13:39:53.745Z"}	\N	f	[]	\N	{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15","ipAddress":"::1"}	2025-11-25 10:52:00.408-03	2025-11-25 10:52:00.419-03	ALIMENTA	t
\.


--
-- Data for Name: landscapes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.landscapes (id, title, description, "imageUrl", "imagePublicId", "thumbnailUrl", "locationName", "locationLatitude", "locationLongitude", "locationCountry", "locationState", "locationCity", "metadataFileSize", "metadataDimensionsWidth", "metadataDimensionsHeight", "metadataFormat", "metadataExif", tags, category, "isPublic", "isFeatured", "uploadedBy", likes, comments, views, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, avatar, "isActive", "lastLogin", preferences, "createdAt", "updatedAt") FROM stdin;
1	Usuario Teste	teste@edenred.com	$2a$12$l0391mIz2EDTpWkTdykuNe7dTN/bm8VWeliC1aVtmx17XThu84d6m	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-14 20:56:47.381-03	2025-10-14 20:56:47.381-03
3	Consultor Edenred	consultor@edenred.com.br	$2a$12$E.AOVay0V9Cl25h/n3a./OjITVstwB5A7Y2OnQQK2PxR9DaP9l/GW	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-14 20:57:19.913-03	2025-10-14 20:57:19.913-03
17	Test User	test16@example.com	$2a$12$R0umizdy.5b2DHTdn1VaKulMMl0089ldKeNSRqrelblcjcAIUfq82	user	\N	t	2025-10-23 12:35:37.891-03	{"theme":"light","notifications":true}	2025-10-23 11:24:03.096-03	2025-10-23 12:35:37.892-03
2	Admin Edenred	admin@edenred.com.br	$2a$12$Nv.j3kKsVZ7QXj0ZUz40KuDSlxAeGgSzDpDE5q05HxCs.Q3BghKQK	admin	\N	t	2025-11-16 23:01:19.951-03	{"theme":"light","notifications":true}	2025-10-14 20:57:19.654-03	2025-11-16 23:01:19.951-03
4	Test User	test@example.com	$2a$12$DkhTjrFygpQDvbHYjLmcR.dEAODQt6Ng4xjiXYQXYgbZVVbbbTRaO	user	\N	t	2025-10-23 10:35:33.873-03	{"theme":"light","notifications":true}	2025-10-23 10:35:27.994-03	2025-10-23 10:35:33.874-03
5	Test User	test3@example.com	$2a$12$lPJel/W37wqlOTO2nvdcaOFq0dK4ZSh9SImOJF9jrMU9Ba7pfXh5u	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 10:38:15.594-03	2025-10-23 10:38:15.594-03
6	Test User	test4@example.com	$2a$12$wnRM6/sprjBw7q8ZO0vX..9go2zJjZmavXFolwiKUgl3bUmmMB3Wa	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 10:39:59.278-03	2025-10-23 10:39:59.278-03
7	Test User	test5@example.com	$2a$12$zMzj/n6n4Zs8B709HfWjn./nk7SQh5tV4rzJ8Fp2zU0ihPv0n9rny	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 10:40:41.841-03	2025-10-23 10:40:41.841-03
8	Test User	test6@example.com	$2a$12$k3DXDn.luQn7StSzUROy3OYm3H.E/dGw00wUEYHxEIxyTD6ojQ1b6	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 10:41:05.672-03	2025-10-23 10:41:05.672-03
9	Wisley	wisley353@gmail.com	$2a$12$LjOYhMyoZPG2w4J2JR2y/uuP7HjO8v05GFttTLCfkmunzPH.PoSNe	user	\N	t	2025-10-23 10:41:49.155-03	{"theme":"light","notifications":true}	2025-10-23 10:41:23.446-03	2025-10-23 10:41:49.155-03
10	Test User	test7@example.com	$2a$12$kizIFlxT.OqcOxB3op2houD2tMoA.r9mT8gyK02otgR2xFwcI2GgO	user	\N	t	2025-10-23 11:20:32.541-03	{"theme":"light","notifications":true}	2025-10-23 11:20:22.903-03	2025-10-23 11:20:32.541-03
11	Test User	test8@example.com	$2a$12$K4vRQjIAuERrr1VFFEW08OnmzuxnqXpqaxS.ufvsO0sHrpOSgEzii	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:22:06.486-03	2025-10-23 11:22:06.486-03
12	Test User	test10@example.com	$2a$12$H6T74Lwmkbf.ug8M1ahZ3udLCQHRjHLjlhHmlGbF22vDj.0zv1mGi	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:22:36.069-03	2025-10-23 11:22:36.069-03
13	Test User	test12@example.com	$2a$12$Qx.lVB5hIKVVnC5ZPhUso.LCAuzOHO9pPyDCfDR/KlG7ZZfQR41Wm	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:23:03.821-03	2025-10-23 11:23:03.821-03
14	Test User	test13@example.com	$2a$12$lY.jknqeH5HeSz8TmocFeeqL/s7onxlu.EULGMkJ30pCHpRCU/D.a	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:23:19.261-03	2025-10-23 11:23:19.261-03
15	Test User	test14@example.com	$2a$12$aCVc3s2Yk3WQIMqCeSzOS.tYYY/HumwxuWtPlWut/Pm9Gp9yMWty6	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:23:34.08-03	2025-10-23 11:23:34.08-03
16	Test User	test15@example.com	$2a$12$V.wT4sE6WGWzJwxGZuG7u.e/NdirqjfwVvOWTxAu7J0eK9Sgi35JG	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:23:49.154-03	2025-10-23 11:23:49.154-03
18	Test User	test17@example.com	$2a$12$uECvdch8a2JoJQby5Qs9SOowVYJ6ZX7MUEVV7CPpbPHRVFUITbgSW	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:24:16.921-03	2025-10-23 11:24:16.921-03
19	Test User	test18@example.com	$2a$12$dS1UVvutY/AfqJgXBfyYn.fDpP8nfN.u8QN0IuZXLYq.DhwvTtuLS	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:24:32.576-03	2025-10-23 11:24:32.576-03
20	Test User	test19@example.com	$2a$12$j6TeJBKL/iwlBH9vxkjSxu28jlTIKWOBAFZRYjkRxNTaLLDsdOxpu	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:24:47.151-03	2025-10-23 11:24:47.151-03
21	Test User	test20@example.com	$2a$12$8MKV2Op1k6rc1ry5w9hrx.Fvod9buNckHMzgAIVIE0pxoXxL8SWe.	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 11:25:02.036-03	2025-10-23 11:25:02.036-03
22	batman	batman@gmail.com	$2a$12$j8HVXdmt/fY9QdkaFglAj.9EGofhnm9wyjF55S42MqqvB8oe5MnLG	user	\N	t	2025-10-23 11:26:26.819-03	{"theme":"light","notifications":true}	2025-10-23 11:26:07.441-03	2025-10-23 11:26:26.819-03
23	Joao	joao@gmail.com	$2a$12$xAp.X7SQfGT.94bMk29IU.0kDtXVIpCle6zRIRA/j7HXxE5Wp/iva	user	\N	t	2025-10-23 11:28:18.812-03	{"theme":"light","notifications":true}	2025-10-23 11:28:01.457-03	2025-10-23 11:28:18.812-03
24	jorge	jorge@gmail.com	$2a$12$lfsOMhgJQOPEsxs4EEIOr.uOruFUqt4HIAU7i.uTckQbJ8dohNiKu	user	\N	t	2025-10-23 11:33:51-03	{"theme":"light","notifications":true}	2025-10-23 11:33:28.268-03	2025-10-23 11:33:51-03
25	jangi	jangi@gmail.com	$2a$12$MmjfOD/w7O8QJqJCt/bTdON9Fky0rY90YmBRE9g3ppqH4N05u71wK	user	\N	t	2025-10-23 11:37:59.18-03	{"theme":"light","notifications":true}	2025-10-23 11:37:52.158-03	2025-10-23 11:37:59.18-03
26	Diogo	diogo@gmail.com	$2a$12$TwfZvqEp2LJdUnajAVwLLu4g6tolJxhbg/pYZ1uGZ9lnH9yuKp2Cm	user	\N	t	2025-10-23 12:06:05.128-03	{"theme":"light","notifications":true}	2025-10-23 12:06:00.118-03	2025-10-23 12:06:05.128-03
27	Gb	gb@gmail.com	$2a$12$hRngJU5mgaLwuP7hvO71seyx1Ko5fWZJYgCiRa1A9fsBjjXun6u/W	user	\N	t	2025-10-23 12:23:58.037-03	{"theme":"light","notifications":true}	2025-10-23 12:23:52.624-03	2025-10-23 12:23:58.037-03
28	paulo	paulo@gmail.com	$2a$12$UJ0LoB37/PQsq6UlWgsgRuAvL33q5s.RKn8xHY/5pdmItC5xLKdmi	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 12:24:48.055-03	2025-10-23 12:24:48.055-03
29	Test User	test21@example.com	$2a$12$z4U.2OdzE4eHi2dDrKFcre8utpQeb9Y1Jfz/y3fV/1FO7mkguLu/y	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 12:41:18.618-03	2025-10-23 12:41:18.618-03
30	mau	mau@gmail.com	$2a$12$613hb0wbKhFTh3sy3EBON.JlzkMPnS2RJ15ZcWg.YcTPvhxuSlLE2	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 12:46:34.025-03	2025-10-23 12:46:34.025-03
31	mah	mah@gmail.com	$2a$12$M56318IqNjbtMibXh7QPE.YyzlOOW6WS73mdqHcfNP/c5gFD/XS42	user	\N	t	2025-10-23 12:49:16.842-03	{"theme":"light","notifications":true}	2025-10-23 12:49:07.08-03	2025-10-23 12:49:16.842-03
32	Suzana	suzana@gmail.com	$2a$12$r7Su9EhlAFEPrGwukMmTeuHjHH4jluDmzDEzdLLjy3psG9NWgImkq	user	\N	t	2025-10-23 12:52:31.468-03	{"theme":"light","notifications":true}	2025-10-23 12:51:25.709-03	2025-10-23 12:52:31.468-03
33	YASHU	yashu@gmail.com	$2a$12$/DrSrSBH7RFrq.qdJJ/Pa.WF2Kp1If7fDQzDBXRjIu9bTlTkwhmDu	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 13:17:48.846-03	2025-10-23 13:17:48.846-03
34	GBfirmose	gbfirmose@gmail.com	$2a$12$z1LB98D857AJm7oI6OHVOubuhofiUGOTafZbI1dfEs8ckHLcSKqzO	user	\N	t	\N	{"theme":"light","notifications":true}	2025-10-23 13:20:50.626-03	2025-10-23 13:20:50.626-03
36	maria	mariaclara@gmail.com	$2a$12$tbgPB/LPNsfqWliyzFKu8u/T4h9etvWg1MS7fUKzmJYnkOvytoC8q	user	\N	t	2025-10-23 17:20:22.976-03	{"theme":"light","notifications":true}	2025-10-23 17:19:47.794-03	2025-10-23 17:20:22.976-03
35	RAfinha	rafinha@gmail.com	$2a$12$Npl2atoIwjI4Xs13Z5/BYOOlF0iDED1XmmrndIaL3PiFYGCUfQSTa	user	\N	t	2025-10-23 17:18:39.074-03	{"theme":"light","notifications":true}	2025-10-23 13:21:59.052-03	2025-10-23 17:18:39.074-03
40	Issac	isaacc@gmail.com	$2a$12$CLo6eQ2tFPdEJ6QKNUhTaO9/t9t9iudEYWkIndCSPEVrdQUUVMvki	user	\N	t	2025-10-24 10:10:47.547-03	{"theme":"light","notifications":true}	2025-10-24 10:09:57.215-03	2025-10-24 10:10:47.547-03
37	qwdhqd	desativado@gmail.com	$2a$12$CscrqpJVZdV4T8uz31pxf.gtc0CZFPNtBC5CsLKPK8XmJ7ty3w5DO	user	\N	t	2025-10-23 17:22:32.02-03	{"theme":"light","notifications":true}	2025-10-23 17:21:34.273-03	2025-10-23 17:22:32.02-03
51	MIAU	mm@gmail.com	$2b$10$7NXrgas1c0b7zDSLtWQ/uefVY2fqTJ3Ai5S0LQilhgXvpbTxfxOj2	user	\N	t	\N	{"theme":"light","notifications":true}	2025-11-25 10:44:45.173-03	2025-11-25 10:44:45.173-03
45	Wisley	wisleygabriel@gmail.com	$2b$10$2kU2EXYMWk03/UAVKYsgaO8ALdbnDGSnF5.AjcJs4kQkV4Ecg7A6i	user	\N	t	2025-11-04 10:12:38.915-03	{"theme":"light","notifications":true}	2025-11-01 16:59:01.807-03	2025-11-04 10:12:38.916-03
46	Suzana1	suzana1@gmail.com	$2b$10$8RGXIn0xrOuGNQzYbrj3mupnGHGntOL2HlTGIe8YIMlnUJX216R/2	user	\N	t	\N	{"theme":"light","notifications":true}	2025-11-05 09:38:22.494-03	2025-11-05 09:38:22.494-03
47	BRENIOIO	Brenno1@gmail.com	$2b$10$sJTIoIJ01HLPjiVQaCAW3u1MlnmYh9Ueg4misfAHUWzCZN4WeEeIe	user	\N	t	\N	{"theme":"light","notifications":true}	2025-11-05 10:16:35.237-03	2025-11-05 10:16:35.237-03
41	Vanessa	vanessa@gmail.com	$2a$12$v91BASjs.1SI48e1.79Jwec/ifRkrwCieCUSxc/TPU/P78nOg4im6	user	\N	t	2025-10-25 16:44:29.292-03	{"theme":"light","notifications":true}	2025-10-25 16:41:03.221-03	2025-10-25 16:44:29.293-03
38	xablau	xablau@gmail.com	$2a$12$ss5YTiKT57U6HuCz701p2.UnIs7YKca/lRjJXNKEYvLwPvrBEunYO	user	\N	t	2025-10-23 21:43:15.209-03	{"theme":"light","notifications":true}	2025-10-23 20:34:23.68-03	2025-10-23 21:43:15.209-03
42	Novoeu	novoeu@gmail.com	$2a$12$L7mvzbiF1zTLz7zcpvsM7OVSXW0yPKZoYPaaOvyRxZCUn4E/2N7fa	user	\N	t	2025-10-28 10:08:07.889-03	{"theme":"light","notifications":true}	2025-10-28 10:07:39.847-03	2025-10-28 10:08:07.89-03
39	DIOGO	diogo1@gmail.com	$2a$12$HtceooqHAMAWNDPTMyVCVOCH1wIXStsPxXV20REa3JncIcjFGtD7m	user	\N	t	2025-10-24 08:16:34.38-03	{"theme":"light","notifications":true}	2025-10-24 08:15:27.463-03	2025-10-24 08:16:34.38-03
50	Mikael	mikael@gmail.com	$2a$12$VI/pJwHkOi0/6dFYFXxgEOS1J30xrjmg8ufhX7ZIrY9YCv8nc0w4m	user	\N	t	2025-11-25 11:07:55.732-03	{"theme":"light","notifications":true}	2025-11-25 09:28:44.47-03	2025-11-25 11:07:55.732-03
43	GABRIEL	gabriele@gmail.com	$2a$12$jeWdTuWYZ8HH.hvOaqJp.uNGfSsRsrn8mV3H9v2Rz8Ldk/qRGNb6G	user	\N	t	2025-10-28 10:53:02.169-03	{"theme":"light","notifications":true}	2025-10-28 10:52:00.639-03	2025-10-28 10:53:02.169-03
44	Usuário Teste	teste@teste.com	$2b$10$GOayfgwV0s.h8tu2J4vt1.axNvevS/HlUfwMQswzMy4R7y5TppzhC	user	\N	t	\N	{"theme":"light","notifications":true}	2025-11-01 16:48:45.718-03	2025-11-01 16:48:45.718-03
48	Brennoooosso	brenno1@gmail.com	$2b$10$S54phYVkGQ191P910Mrz4.PbmH26oK88K/u4ucA7wrqye.mxxm7d.	user	\N	t	2025-11-05 10:28:03.198-03	{"theme":"light","notifications":true}	2025-11-05 10:20:56.761-03	2025-11-05 10:28:03.198-03
49	Vamessa	vamessa1@gmail.com	$2a$12$wlmmcmEQIEVC1pMjA0TqCOjSpSS.AHYsixPYvfw.PsGl1i0wDglDi	user	\N	t	2025-11-16 23:20:49.645-03	{"theme":"light","notifications":true}	2025-11-16 23:20:37.065-03	2025-11-16 23:20:49.646-03
\.


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 92, true);


--
-- Name: consultations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consultations_id_seq', 97, true);


--
-- Name: landscapes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.landscapes_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 51, true);


--
-- Name: companies companies_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key1 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key10 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key11 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key12 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key13 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key2 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key3 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key4 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key5 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key6 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key7 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key8 UNIQUE (cnpj);


--
-- Name: companies companies_cnpj_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_cnpj_key9 UNIQUE (cnpj);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: consultations consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_pkey PRIMARY KEY (id);


--
-- Name: landscapes landscapes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landscapes
    ADD CONSTRAINT landscapes_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- Name: users users_email_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key12 UNIQUE (email);


--
-- Name: users users_email_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key13 UNIQUE (email);


--
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: companies_added_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX companies_added_by ON public.companies USING btree ("addedBy");


--
-- Name: companies_cnae_principal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX companies_cnae_principal ON public.companies USING btree ("cnaePrincipal");


--
-- Name: companies_cnpj; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX companies_cnpj ON public.companies USING btree (cnpj);


--
-- Name: companies_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX companies_created_at ON public.companies USING btree ("createdAt");


--
-- Name: companies_razao_social; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX companies_razao_social ON public.companies USING btree ("razaoSocial");


--
-- Name: companies_situacao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX companies_situacao ON public.companies USING btree (situacao);


--
-- Name: consultations_cnpj; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX consultations_cnpj ON public.consultations USING btree (cnpj);


--
-- Name: consultations_cnpj_produto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX consultations_cnpj_produto ON public.consultations USING btree (cnpj, produto);


--
-- Name: consultations_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX consultations_created_at ON public.consultations USING btree ("createdAt");


--
-- Name: consultations_is_favorite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX consultations_is_favorite ON public.consultations USING btree ("isFavorite");


--
-- Name: consultations_produto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX consultations_produto ON public.consultations USING btree (produto);


--
-- Name: consultations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX consultations_status ON public.consultations USING btree (status);


--
-- Name: consultations_user_id_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX consultations_user_id_created_at ON public.consultations USING btree ("userId", "createdAt");


--
-- Name: landscapes_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX landscapes_category ON public.landscapes USING btree (category);


--
-- Name: landscapes_is_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX landscapes_is_featured ON public.landscapes USING btree ("isFeatured");


--
-- Name: landscapes_is_public_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX landscapes_is_public_status ON public.landscapes USING btree ("isPublic", status);


--
-- Name: landscapes_location_latitude_location_longitude; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX landscapes_location_latitude_location_longitude ON public.landscapes USING btree ("locationLatitude", "locationLongitude");


--
-- Name: landscapes_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX landscapes_title ON public.landscapes USING btree (title);


--
-- Name: landscapes_uploaded_by_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX landscapes_uploaded_by_created_at ON public.landscapes USING btree ("uploadedBy", "createdAt");


--
-- Name: users_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_created_at ON public.users USING btree ("createdAt");


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email ON public.users USING btree (email);


--
-- Name: companies companies_addedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consultations consultations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT "consultations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: consultations consultations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT "consultations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: landscapes landscapes_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landscapes
    ADD CONSTRAINT "landscapes_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xtOjtnqINyIIgMc5Sj3csTkQ1Z8Ud4X2Ui3xKlQxteXRl0Azf4wpN6SqlutTvYc

