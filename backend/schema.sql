-- =============================================================================
-- ORACULOUS BET — Schema Supabase
-- Cole este arquivo inteiro no SQL Editor do Supabase e execute.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS games (
  id            SERIAL PRIMARY KEY,
  external_id   VARCHAR(100) UNIQUE NOT NULL,
  league        VARCHAR(100) NOT NULL,
  country       VARCHAR(50),
  home_team     VARCHAR(100) NOT NULL,
  away_team     VARCHAR(100) NOT NULL,
  home_logo     TEXT,
  away_logo     TEXT,
  datetime      TIMESTAMPTZ NOT NULL,
  status        VARCHAR(30) DEFAULT 'scheduled',
  home_score    INTEGER,
  away_score    INTEGER,
  clock         VARCHAR(20),
  period        INTEGER DEFAULT 0,
  home_possession   DECIMAL(5,2),
  away_possession   DECIMAL(5,2),
  home_shots        INTEGER DEFAULT 0,
  away_shots        INTEGER DEFAULT 0,
  home_corners      INTEGER DEFAULT 0,
  away_corners      INTEGER DEFAULT 0,
  home_yellow_cards INTEGER DEFAULT 0,
  away_yellow_cards INTEGER DEFAULT 0,
  has_odds      BOOLEAN DEFAULT FALSE,
  odds_home     DECIMAL(6,2),
  odds_draw     DECIMAL(6,2),
  odds_away     DECIMAL(6,2),
  source        VARCHAR(30),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analyses (
  id                  SERIAL PRIMARY KEY,
  game_id             INTEGER REFERENCES games(id) ON DELETE CASCADE,
  resultado_previsto  VARCHAR(20),
  confianca           VARCHAR(10),
  resultado_json      JSONB NOT NULL,
  gols_json           JSONB,
  escanteios_json     JSONB,
  cartoes_json        JSONB,
  placar_json         JSONB,
  combinacoes_json    JSONB,
  prompt_usado        TEXT,
  resposta_bruta      TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verified_results (
  id                  SERIAL PRIMARY KEY,
  analysis_id         INTEGER REFERENCES analyses(id) ON DELETE CASCADE,
  game_id             INTEGER REFERENCES games(id) ON DELETE CASCADE,
  resultado_real      VARCHAR(20),
  gols_real           INTEGER,
  acertou_resultado   BOOLEAN,
  acertou_gols        BOOLEAN,
  acertou_escanteios  BOOLEAN,
  acertou_cartoes     BOOLEAN,
  verified_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bingos (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  category        VARCHAR(30),
  tier            VARCHAR(30),
  total_odd       DECIMAL(12,2),
  confidence_pct  INTEGER,
  selections      JSONB NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_alerts (
  id            SERIAL PRIMARY KEY,
  game_id       INTEGER REFERENCES games(id) ON DELETE CASCADE,
  market        VARCHAR(50),
  signal        TEXT,
  confidence    VARCHAR(10),
  pressure_data JSONB,
  triggered_at  TIMESTAMPTZ DEFAULT NOW(),
  is_active     BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(50) NOT NULL,
  description   TEXT,
  price_cents   INTEGER NOT NULL,
  interval      VARCHAR(20) NOT NULL,
  module_access JSONB DEFAULT '{"jogos":true,"aovivo":true,"bingos":true,"segmentos":true}',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id          SERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id     INTEGER REFERENCES subscription_plans(id),
  status      VARCHAR(20) DEFAULT 'active',
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,
  payment_ref VARCHAR(200)
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_games_datetime  ON games(datetime);
CREATE INDEX IF NOT EXISTS idx_games_status    ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_league    ON games(league);
CREATE INDEX IF NOT EXISTS idx_analyses_game   ON analyses(game_id);
CREATE INDEX IF NOT EXISTS idx_verified_game   ON verified_results(game_id);
CREATE INDEX IF NOT EXISTS idx_live_alerts_game ON live_alerts(game_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE games              ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE bingos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_alerts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Leitura pública autenticada
CREATE POLICY "Autenticados leem jogos"
  ON games FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados leem analises"
  ON analyses FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados leem bingos"
  ON bingos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados leem alertas ao vivo"
  ON live_alerts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Planos são públicos"
  ON subscription_plans FOR SELECT USING (TRUE);

CREATE POLICY "Usuário vê própria assinatura"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Escrita pelo service_role (backend FastAPI)
CREATE POLICY "Service insere jogos"
  ON games FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service atualiza jogos"
  ON games FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service insere analises"
  ON analyses FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service insere resultados verificados"
  ON verified_results FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service gerencia bingos"
  ON bingos FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service gerencia alertas"
  ON live_alerts FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service gerencia planos"
  ON subscription_plans FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service gerencia assinaturas"
  ON user_subscriptions FOR ALL USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Planos iniciais (opcional — rode após criar as tabelas)
-- ---------------------------------------------------------------------------

INSERT INTO subscription_plans (name, description, price_cents, interval) VALUES
  ('Semanal',   'Acesso completo por 7 dias',  1990, 'weekly'),
  ('Quinzenal', 'Acesso completo por 15 dias', 2990, 'biweekly'),
  ('Mensal',    'Acesso completo por 30 dias', 4990, 'monthly')
ON CONFLICT DO NOTHING;
