-- NOVAPROJE danışan ve yönetim paneli şeması
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin','client')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  temp_password_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON users (lower(email)) WHERE email IS NOT NULL AND email <> '';

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Diğer',
  location TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planlama' CHECK (status IN ('planlama','proje','ruhsat','insaat','devreye-alma','tamamlandi','beklemede')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  start_date DATE,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'bekliyor' CHECK (status IN ('bekliyor','devam','tamam')),
  completed_at DATE,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS updates (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS installments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  no INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount_kurus BIGINT NOT NULL CHECK (amount_kurus > 0),
  paid_at DATE,
  note TEXT
);

-- uploaded files are stored in the database (max 10 MB each)
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  data BYTEA NOT NULL,
  client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  public BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'taslak' CHECK (status IN ('taslak','gonderildi','revizyon','imzalandi','tamamlandi','iptal')),
  version INTEGER NOT NULL DEFAULT 1,
  attachment_id UUID REFERENCES files(id) ON DELETE SET NULL,
  revise_note TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  client_sign JSONB,
  admin_sign JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS contract_audit (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  who TEXT NOT NULL,
  what TEXT NOT NULL,
  ip TEXT
);

CREATE TABLE IF NOT EXISTS doc_requests (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  note TEXT,
  due_date DATE,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'bekliyor' CHECK (status IN ('bekliyor','yuklendi','onaylandi','reddedildi')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS doc_files (
  request_id INTEGER NOT NULL REFERENCES doc_requests(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (request_id, file_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('client','admin')),
  author TEXT NOT NULL,
  auto BOOLEAN NOT NULL DEFAULT FALSE,
  topic TEXT NOT NULL DEFAULT 'Genel',
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS messages_client_idx ON messages (client_id, created_at);
CREATE TABLE IF NOT EXISTS message_files (
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (message_id, file_id)
);

CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT,
  url TEXT,
  description TEXT,
  logo_id UUID REFERENCES files(id) ON DELETE SET NULL,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  facility TEXT,
  parcel TEXT,
  capacity TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'yeni' CHECK (status IN ('yeni','incelendi','teklif-verildi','kapandi')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS activity (
  id SERIAL PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  who TEXT NOT NULL,
  what TEXT NOT NULL
);

-- Nova Usta: how the assistant addresses a person (never guessed)
ALTER TABLE users ADD COLUMN IF NOT EXISTS salutation TEXT CHECK (salutation IN ('Bey','Hanım'));

-- Taşeron (alt yüklenici) paneli
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin','client','manager','contractor'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;
CREATE TABLE IF NOT EXISTS work_packages (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trade TEXT NOT NULL,
  title TEXT NOT NULL,
  scope TEXT,
  start_date DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'atandi' CHECK (status IN ('atandi','devam','tamamlandi','iptal')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS work_packages_contractor ON work_packages(contractor_id);
CREATE INDEX IF NOT EXISTS work_packages_project ON work_packages(project_id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS package_id INTEGER REFERENCES work_packages(id) ON DELETE SET NULL;
ALTER TABLE doc_requests ADD COLUMN IF NOT EXISTS package_id INTEGER REFERENCES work_packages(id) ON DELETE SET NULL;
