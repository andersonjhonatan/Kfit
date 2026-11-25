-- Passo 1 dos 5: TRAVA EM TODA TABELA.
--
-- A aplicação conversa com o banco por dois papéis:
--   * dono das tabelas (DATABASE_URL): migrations e operações de sistema antes do login
--     (conferir senha, mandar código, limites de uso). Ignora RLS por ser o dono.
--   * kfit_app (DATABASE_APP_URL): usado em TODA rota depois do login. Não ignora RLS.
--
-- Em cada requisição a API abre uma transação e define:
--   SELECT set_config('app.tenant_id',  '<studio>', true);
--   SELECT set_config('app.student_id', '<aluno>',  true);  -- só no app do aluno
-- Sem essas variáveis, kfit_app não enxerga nenhuma linha.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kfit_app') THEN
    CREATE ROLE kfit_app LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO kfit_app;

CREATE OR REPLACE FUNCTION app_tenant_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app_student_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.student_id', true), '')::uuid
$$;

-- studio: só enxerga a si mesmo
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY isolamento ON tenants USING (id = app_tenant_id()) WITH CHECK (id = app_tenant_id());

-- equipe: só o próprio studio, e nunca a partir do app do aluno
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY isolamento ON staff
  USING (tenant_id = app_tenant_id() AND app_student_id() IS NULL)
  WITH CHECK (tenant_id = app_tenant_id() AND app_student_id() IS NULL);

-- alunos: o studio vê os seus; o aluno vê só a si mesmo
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY isolamento ON students
  USING (tenant_id = app_tenant_id() AND (app_student_id() IS NULL OR id = app_student_id()))
  WITH CHECK (tenant_id = app_tenant_id() AND (app_student_id() IS NULL OR id = app_student_id()));

-- biblioteca: exercícios do KFit (tenant nulo) para todos; os do studio só para ele
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY leitura ON exercises FOR SELECT USING (tenant_id IS NULL OR tenant_id = app_tenant_id());
CREATE POLICY escrita ON exercises FOR ALL
  USING (tenant_id = app_tenant_id() AND app_student_id() IS NULL)
  WITH CHECK (tenant_id = app_tenant_id() AND app_student_id() IS NULL);

-- tabelas com aluno: travam por studio e, no app do aluno, pelo próprio aluno
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['workouts','workout_items','training_sessions','set_logs','item_feedback',
                           'assessments','payments','bookings','coach_notes']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY isolamento ON %I USING (tenant_id = app_tenant_id() AND (app_student_id() IS NULL OR student_id = app_student_id())) '
      'WITH CHECK (tenant_id = app_tenant_id() AND (app_student_id() IS NULL OR student_id = app_student_id()))', t);
  END LOOP;
END
$$;

-- horários do studio: o aluno lê, só o personal altera
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY leitura ON slots FOR SELECT USING (tenant_id = app_tenant_id());
CREATE POLICY escrita ON slots FOR ALL
  USING (tenant_id = app_tenant_id() AND app_student_id() IS NULL)
  WITH CHECK (tenant_id = app_tenant_id() AND app_student_id() IS NULL);

-- tabelas técnicas: RLS ligada e NENHUMA permissão para kfit_app (só o servidor, como dono)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- permissões do papel da aplicação
GRANT SELECT, UPDATE ON tenants TO kfit_app;
GRANT SELECT, INSERT, UPDATE ON staff TO kfit_app;
GRANT SELECT, INSERT, UPDATE ON students TO kfit_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON exercises, workouts, workout_items, training_sessions, set_logs,
  item_feedback, assessments, payments, slots, bookings, coach_notes TO kfit_app;

-- integridade que o código não pode furar
ALTER TABLE item_feedback ADD CONSTRAINT pse_valido CHECK (pse BETWEEN 0 AND 10);
ALTER TABLE payments ADD CONSTRAINT valor_valido CHECK (amount_cents >= 0);
ALTER TABLE students ADD CONSTRAINT vencimento_valido CHECK (due_day BETWEEN 1 AND 28);
