// ARQUIVO GERADO por scripts/sync-prototipo.mjs — edite prototipo/kfit.dc.html
/* eslint-disable */
// @ts-nocheck
import { DCLogic } from './runtime';

export default class Component extends DCLogic {
  constructor(props) {
    super(props);
    var studs = this.seedStudents();
    // acesso de cada aluno ao app (Ana Clara e Elaine ainda não fizeram o primeiro acesso)
    var accSeed = [
      { status: 'pendente', pass: null, last: null },
      { status: 'ativo', pass: 'bruno123', created: 'em set/2026', last: 'ontem, 18:20' },
      { status: 'ativo', pass: 'carla123', created: 'em out/2026', last: 'hoje, 06:40' },
      { status: 'ativo', pass: 'diego123', created: 'em ago/2026', last: 'há 9 dias' },
      { status: 'pendente', pass: null, last: null },
      { status: 'ativo', pass: 'felipe123', created: 'em ago/2026', last: 'hoje, 07:05' }
    ];
    studs = studs.map(function (st, i) { return Object.assign({}, st, { acc: accSeed[i] || { status: 'pendente', pass: null, last: null } }); });
    this.state = {
      mode: 'personal', screen: 'hoje', student: 0, tab: 'ficha',
      done: {}, day: 1, slot: null,
      video: null, playing: false,
      q: '', sheet: null, ctx: null,
      assigned: {}, removedBusy: {},
      extraEx: {}, request: null, accepted: null,
      aval: null, avalWeight: '78.4', avalWaist: '85',
      paid: {}, charged: {}, toast: null,
      wa: 'off', aiAgent: true,
      autos: { lembrete: true, confirma: true, cobranca: true, sumido: true, aniversario: false, posTreino: false, avaliacao: true },
      autoOpen: null,
      libQ: '', libGroup: 'Todos', custom: [], customName: '',
      chat: [], typing: false, askText: '', insightDone: false, savedPlan: false, sentSumidos: false,
      sets: {}, openEx: 0, pse: {}, rest: null, rated: 0, prs: {},
      water: 3, sleep: null, protein: 40,
      skTri: '18', skSup: '20', skCox: '28', scanStep: 0,
      turmaOpen: 1, checkins: {}, promoted: {},
      tvMode: 'amrap', tvRunning: false, tvSec: 0, tvRounds: { 0: 3, 1: 2, 2: 2, 3: 1 },
      riskSent: {},
      students: studs, avals: this.seedAvals(studs), form: null, cmpBase: {}, novo: null, rx: {}, rxEdit: null, removedEx: {}, feelAsk: null,
      auth: {
        personal: { step: 'login', phone: '(87) 99900-1234', pass: 'kfit123', pw: '', trusted: false, pin: null, tries: 0, pinTyped: '' },
        aluno: { step: 'phone', phone: '(87) 99812-4410', idx: null, pw: '', tries: 0 }
      },
      sec: { lockAfter: '1', bio: true, alertNew: true, devices: [
        { name: 'Este celular', info: 'Android · Ibimirim-PE · agora', current: true },
        { name: 'Notebook', info: 'Chrome · ontem, 21:14' },
        { name: 'TV do studio', info: 'Modo TV · 20/11' }
      ] },
      brand: { name: 'Lucas Martins Personal', slogan: 'Funcional e musculação', color: '#2563EB', mono: 'LM', shape: 'round' }
    };
  }

  // ── Cadastro de alunos e avaliações (dados de exemplo) ──
  seedStudents() {
    return [
      { name: 'Ana Clara', phone: '(87) 99812-4410', sex: 'F', age: 28, height: 165, goal: 'Emagrecimento', payKind: 'ok', dueDay: 5, plan: 'Mensal', price: 'R$ 180,00', ficha: 'A_inf', since: 'jun/2026', health: true, contract: true, modal: 'Presencial' },
      { name: 'Bruno Lima', phone: '(87) 99655-0231', sex: 'M', age: 31, height: 178, goal: 'Hipertrofia', payKind: 'warn', dueDay: 25, plan: 'Mensal', price: 'R$ 180,00', ficha: 'C_costas', since: 'set/2026', health: true, contract: true, modal: 'Presencial' },
      { name: 'Carla Souza', phone: '(87) 99740-1188', sex: 'F', age: 35, height: 160, goal: 'Condicionamento', payKind: 'ok', dueDay: 10, plan: 'Trimestral', price: 'R$ 480,00', ficha: 'func', since: 'out/2026', health: true, contract: true, modal: 'Presencial' },
      { name: 'Diego Alves', phone: '(87) 99903-5512', sex: 'M', age: 26, height: 182, goal: 'Hipertrofia', payKind: 'late', dueDay: 5, plan: 'Mensal', price: 'R$ 180,00', ficha: 'A_peito', since: 'ago/2026', health: true, contract: true, modal: 'Presencial' },
      { name: 'Elaine Rocha', phone: '(87) 99611-7720', sex: 'F', age: 52, height: 158, goal: 'Saúde e postura', payKind: 'warn', dueDay: 28, plan: 'Mensal', price: 'R$ 180,00', ficha: 'mob', since: 'out/2026', health: true, contract: true, modal: 'Presencial' },
      { name: 'Felipe Nunes', phone: '(87) 99877-3049', sex: 'M', age: 40, height: 175, goal: 'Emagrecimento', payKind: 'ok', dueDay: 15, plan: 'Semestral', price: 'R$ 900,00', ficha: 'B_sup', since: 'ago/2026', health: true, contract: true, modal: 'Presencial' }
    ];
  }

  protSites(sex, prot) {
    if (prot === 'p3') return sex === 'M' ? ['peito', 'abd', 'coxa'] : ['tri', 'supra', 'coxa'];
    if (prot === 'p7') return ['peito', 'axilar', 'tri', 'subesc', 'abd', 'supra', 'coxa'];
    return [];
  }

  // Jackson & Pollock (3 e 7 dobras) + fórmula de Siri
  bodyFat(sex, age, prot, dob) {
    var sites = this.protSites(sex, prot);
    if (!sites.length) return null;
    var S = 0;
    for (var i = 0; i < sites.length; i++) {
      var v = parseFloat(String(dob[sites[i]] === undefined || dob[sites[i]] === null ? '' : dob[sites[i]]).replace(',', '.'));
      if (!(v > 0)) return null;
      S += v;
    }
    var a = age || 30;
    var D;
    if (prot === 'p3') D = sex === 'M' ? 1.10938 - 0.0008267 * S + 0.0000016 * S * S - 0.0002574 * a
                                       : 1.0994921 - 0.0009929 * S + 0.0000023 * S * S - 0.0001392 * a;
    else D = sex === 'M' ? 1.112 - 0.00043499 * S + 0.00000055 * S * S - 0.00028826 * a
                         : 1.097 - 0.00046971 * S + 0.00000056 * S * S - 0.00012828 * a;
    var bf = 495 / D - 450;
    return { sum: S, dens: D, bf: bf };
  }

  dobFor(st, prot, bf) {
    var sites = this.protSites(st.sex, prot);
    var share = { peito: 0.1, axilar: 0.12, tri: 0.14, subesc: 0.16, abd: 0.2, supra: 0.14, coxa: 0.14 };
    if (prot === 'p3') share = st.sex === 'M' ? { peito: 0.24, abd: 0.42, coxa: 0.34 } : { tri: 0.28, supra: 0.3, coxa: 0.42 };
    var lo = 5, hi = 400;
    for (var it = 0; it < 40; it++) {
      var mid = (lo + hi) / 2;
      var tmp = {};
      sites.forEach(function (k) { tmp[k] = mid * share[k]; });
      var r = this.bodyFat(st.sex, st.age, prot, tmp);
      if (r.bf < bf) lo = mid; else hi = mid;
    }
    var out = {};
    sites.forEach(function (k) { out[k] = Math.round(lo * share[k] * 10) / 10; });
    return out;
  }

  seedAvals(students) {
    var self = this;
    var mk = function (i, months, dates, from, to, prot, ws, pa) {
      var st = students[i];
      var n = months.length;
      return months.map(function (m, k) {
        var t = n === 1 ? 1 : k / (n - 1);
        var lerp = function (a, b) { return Math.round((a + (b - a) * t) * 10) / 10; };
        var per = {};
        Object.keys(from.per).forEach(function (key) { per[key] = Math.round(lerp(from.per[key], to.per[key]) * 2) / 2; });
        var bf = lerp(from.bf, to.bf);
        return { date: dates[k], m: m, w: ws ? ws[k] : lerp(from.w, to.w), h: st.height, per: per, prot: prot,
          dob: self.dobFor(st, prot, bf), pa: pa || '120/80', fc: String(Math.round(lerp(from.fc, to.fc))), obs: '' };
      });
    };
    var P = function (a) { return { pescoco: a[0], ombro: a[1], torax: a[2], braco: a[3], bracoC: a[4], antebraco: a[5], cintura: a[6], abdomen: a[7], quadril: a[8], coxa: a[9], panturrilha: a[10] }; };
    return {
      0: mk(0, ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'], ['02/06/2026', '01/07/2026', '04/08/2026', '02/09/2026', '01/10/2026', '03/11/2026'],
        { w: 84.2, bf: 31, fc: 82, per: P([34, 104, 98, 31, 32, 25, 92, 98, 104, 60, 38]) },
        { w: 79.1, bf: 26, fc: 74, per: P([33, 102, 95, 30, 31.5, 24.5, 86, 91, 100, 58, 37.5]) }, 'p3', [84.2, 83.1, 82.4, 81.0, 80.2, 79.1]),
      1: mk(1, ['Set', 'Out', 'Nov'], ['08/09/2026', '06/10/2026', '05/11/2026'],
        { w: 74.0, bf: 16, fc: 68, per: P([38, 116, 98, 34, 36, 28, 82, 84, 96, 56, 37]) },
        { w: 76.8, bf: 14.8, fc: 64, per: P([39, 119.5, 101, 36, 38.5, 29, 82.5, 84, 97, 58.5, 38]) }, 'p7'),
      2: mk(2, ['Out', 'Nov'], ['14/10/2026', '11/11/2026'],
        { w: 62.5, bf: 24, fc: 70, per: P([32, 98, 88, 27, 28, 23, 72, 78, 98, 55, 35]) },
        { w: 61.8, bf: 22.5, fc: 66, per: P([32, 98, 88, 27.5, 28.5, 23, 70.5, 76, 97, 55, 35]) }, 'p3'),
      3: mk(3, ['Ago'], ['12/08/2026'],
        { w: 81.5, bf: 18, fc: 70, per: P([40, 118, 102, 36, 38, 30, 86, 88, 99, 57, 38]) },
        { w: 81.5, bf: 18, fc: 70, per: P([40, 118, 102, 36, 38, 30, 86, 88, 99, 57, 38]) }, 'p3'),
      4: mk(4, ['Out', 'Nov'], ['07/10/2026', '04/11/2026'],
        { w: 70.2, bf: 33, fc: 76, per: P([35, 100, 96, 30, 31, 24, 88, 94, 106, 58, 36]) },
        { w: 69.4, bf: 32, fc: 72, per: P([35, 100, 95.5, 30, 31, 24, 86.5, 92, 105, 57.5, 36]) }, 'p3', null, '130/85'),
      5: mk(5, ['Ago', 'Set', 'Out', 'Nov'], ['10/08/2026', '09/09/2026', '08/10/2026', '06/11/2026'],
        { w: 98.0, bf: 28, fc: 80, per: P([42, 120, 112, 36, 37, 30, 104, 108, 110, 62, 40]) },
        { w: 93.0, bf: 24.5, fc: 72, per: P([41, 118, 108, 35, 36.5, 29.5, 98, 101, 106, 60, 39.5]) }, 'p3')
    };
  }

  setForm(group, key, val) {
    var f = Object.assign({}, this.state.form);
    if (group) { f[group] = Object.assign({}, f[group]); f[group][key] = val; } else f[key] = val;
    this.setState({ form: f });
  }

  setNovo(key, val) {
    var n = Object.assign({}, this.state.novo);
    n[key] = val;
    n.error = '';
    this.setState({ novo: n });
  }

  emptyNovo(fromAssign) {
    return { name: '', phone: '', birth: '', height: '', sex: '', goal: '', days: {}, modal: 'Presencial', plan: 'Mensal', price: '', due: '10',
      sendApp: true, sendAnam: true, sendContrato: true, error: '', fromAssign: !!fromAssign };
  }

  componentWillUnmount() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.aiTimer) clearTimeout(this.aiTimer);
    if (this.restTimer) clearInterval(this.restTimer);
    if (this.tvTimer) clearInterval(this.tvTimer);
    if (this.scanTimer) clearTimeout(this.scanTimer);
  }

  startRest(sec) {
    var self = this;
    if (this.restTimer) clearInterval(this.restTimer);
    this.setState({ rest: { left: sec, total: sec } });
    this.restTimer = setInterval(function () {
      var r = self.state.rest;
      if (!r || r.left <= 1) {
        clearInterval(self.restTimer); self.restTimer = null;
        self.setState({ rest: null });
        if (r) self.notify('Descanso acabou. Próxima série!');
        return;
      }
      self.setState({ rest: { left: r.left - 1, total: r.total } });
    }, 1000);
  }

  stopRest() {
    if (this.restTimer) clearInterval(this.restTimer);
    this.restTimer = null;
    this.setState({ rest: null });
  }

  toggleTv() {
    var self = this;
    if (this.state.tvRunning) {
      clearInterval(this.tvTimer); this.tvTimer = null;
      this.setState({ tvRunning: false });
      return;
    }
    this.setState({ tvRunning: true });
    this.tvTimer = setInterval(function () { self.setState({ tvSec: self.state.tvSec + 1 }); }, 1000);
  }

  resetTv() {
    if (this.tvTimer) clearInterval(this.tvTimer);
    this.tvTimer = null;
    this.setState({ tvRunning: false, tvSec: 0 });
  }

  ask(kind, text) {
    var self = this;
    if (this.state.typing) return;
    var chat = this.state.chat.concat([{ who: 'me', text: text }]);
    this.setState({ chat: chat, typing: true, askText: '', mode: 'personal', screen: 'ia' });
    this.aiTimer = setTimeout(function () {
      self.setState({ chat: self.state.chat.concat([{ who: 'ai', kind: kind }]), typing: false });
    }, 1300);
  }

  notify(text) {
    var self = this;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.setState({ toast: text });
    this.toastTimer = setTimeout(function () { self.setState({ toast: null }); }, 2600);
  }

  // ── Acesso: login do aluno (código no WhatsApp → senha) e do personal (senha + código + PIN) ──
  authView() {
    var self = this;
    var s = this.state;
    var A = s.auth;
    var mode = s.mode;
    var P = A[mode];
    var isAl = mode === 'aluno';
    var upd = function (patch) {
      var a = Object.assign({}, self.state.auth);
      a[mode] = Object.assign({}, a[mode], patch);
      self.setState({ auth: a });
    };
    var dig = function (x) { return String(x || '').replace(/\D/g, ''); };
    var tail = function (x) { var d = dig(x); return d.slice(-10); };
    var masked = function (x) { var d = dig(x); return '(' + d.slice(-11, -9) + ') 9••••-' + d.slice(-4); };
    var newCode = function () { return String(Math.floor(100000 + Math.random() * 900000)); };
    var sendCode = function (purpose, extra) {
      upd(Object.assign({ step: 'code', purpose: purpose, code: newCode(), typed: '', err: '', tries: 0, sentN: (self.state.auth[mode].sentN || 0) + 1 }, extra || {}));
    };
    var setStudentAcc = function (i, patch) {
      var studs = self.state.students.slice();
      studs[i] = Object.assign({}, studs[i], { acc: Object.assign({}, studs[i].acc, patch) });
      self.setState({ students: studs });
    };
    var weakPass = function (p, phone) {
      var bad = ['123456', '1234567', '12345678', '654321', '000000', '111111', 'senha123', 'abc123'];
      return bad.indexOf(String(p).toLowerCase()) >= 0 || (dig(p).length >= 6 && dig(phone).indexOf(dig(p)) >= 0);
    };
    var field = function (o) {
      return {
        label: o.label, type: o.type || 'text', mode: o.mode || 'text', val: o.val || '', ph: o.ph || '', on: o.on, ac: o.ac || 'off', max: o.max || 60,
        style: 'width: 100%; box-sizing: border-box; height: ' + (o.big ? 60 : 50) + 'px; border-radius: 14px; border: 1px solid ' + (P.err ? 'rgba(252,165,165,0.6)' : 'rgba(255,255,255,0.15)') + '; background: #141418; color: #F5F5F7; padding: 0 14px; ' +
          (o.big ? 'font-size: 26px; font-weight: 700; letter-spacing: 0.5em; text-align: center; font-variant-numeric: tabular-nums' : 'font-size: 16px')
      };
    };
    var btn = function (label, act, ok) {
      return {
        label: label, act: ok === false ? function () {} : act, disabled: ok === false,
        style: 'width: 100%; height: 54px; border-radius: 14px; border: 0; font-size: 16px; font-weight: 700; ' +
          (ok === false ? 'background: rgba(255,255,255,0.06); color: #71717A' : 'background: #2563EB; color: #FFFFFF')
      };
    };
    var link = function (label, act) { return { label: label, act: act }; };

    var v = {
      show: P.step !== 'in', title: '', sub: '', fields: [], rules: [], links: [], keypad: false, dots: [], keys: [],
      err: P.err || '', note: '', banner: false, bFrom: '', bText: '', primary: null,
      iLock: false, iMono: false, iChat: false, iShield: false, mono: s.brand.mono
    };

    // teclado numérico do PIN
    var pinPad = function (len, typed, onFull, bio) {
      v.keypad = true;
      for (var d = 0; d < len; d++) {
        v.dots.push({ style: 'width: 16px; height: 16px; border-radius: 999px; ' + (d < typed.length ? 'background: #3B82F6' : 'border: 2px solid rgba(255,255,255,0.3)') + (P.err ? '; animation: kfitShake .35s ease' : '') });
      }
      var press = function (k) {
        return function () {
          var cur = self.state.auth[mode].pinTyped || '';
          if (k === 'del') return upd({ pinTyped: cur.slice(0, -1), err: '' });
          if (cur.length >= len) return;
          var nx = cur + k;
          if (nx.length < len) return upd({ pinTyped: nx, err: '' });
          upd({ pinTyped: nx, err: '' });
          setTimeout(function () { onFull(nx); }, 160);
        };
      };
      var keyStyle = 'height: 62px; border-radius: 999px; border: 0; background: #17171B; color: #F5F5F7; font-size: 24px; font-weight: 600; display: flex; align-items: center; justify-content: center';
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'].forEach(function (k) {
        if (k === 'bio') {
          v.keys.push({ isNum: false, isDel: false, isBio: !!bio, isGap: !bio, label: '', aria: 'Entrar com a digital', act: bio || function () {}, style: bio ? keyStyle.replace('#17171B', 'rgba(59,130,246,0.14)') : 'height: 62px; background: none; border: 0' });
        } else if (k === 'del') {
          v.keys.push({ isNum: false, isDel: true, isBio: false, isGap: false, label: '', aria: 'Apagar', act: press('del'), style: keyStyle.replace('#17171B', 'transparent') });
        } else {
          v.keys.push({ isNum: true, isDel: false, isBio: false, isGap: false, label: k, aria: k, act: press(k), style: keyStyle });
        }
      });
    };

    var studentsRaw = s.students;
    var stI = P.idx !== undefined && P.idx !== null ? studentsRaw[P.idx] : null;
    var first = function (n) { return String(n || '').split(' ')[0]; };

    // senha nova (primeiro acesso do aluno, ou recuperação)
    var createStep = function () {
      var p1 = P.p1 || '', p2 = P.p2 || '';
      var phone = isAl ? (stI && stI.phone) : A.personal.phone;
      var r1 = p1.length >= 6, r2 = /[a-zA-Z]/.test(p1) && /\d/.test(p1), r3 = p1.length > 0 && p1 === p2, r4 = p1.length > 0 && !weakPass(p1, phone);
      var rule = function (ok, t) { return { text: t, style: 'display: flex; align-items: center; gap: 8px; font-size: 13px; color: ' + (ok ? '#6EE7B7' : '#A1A1AA'), dot: 'width: 8px; height: 8px; border-radius: 999px; flex: none; background: ' + (ok ? '#6EE7B7' : 'rgba(255,255,255,0.2)') }; };
      v.iShield = true;
      v.title = P.purpose === 'reset' ? 'Crie uma senha nova' : 'Crie sua senha';
      v.sub = isAl ? 'Daqui pra frente você entra só com o telefone e essa senha. Não precisa mais de código.' : 'Use uma senha que só você sabe. Ela protege os dados de todos os seus alunos.';
      v.fields = [
        field({ label: 'Senha', type: 'password', val: p1, ac: 'new-password', on: function (e) { upd({ p1: e.target.value, err: '' }); } }),
        field({ label: 'Repita a senha', type: 'password', val: p2, ac: 'new-password', on: function (e) { upd({ p2: e.target.value, err: '' }); } })
      ];
      v.rules = [rule(r1, 'Pelo menos 6 caracteres'), rule(r2, 'Letras e números'), rule(r4, 'Nada fácil, como 123456 ou o seu telefone'), rule(r3, 'As duas senhas iguais')];
      v.primary = btn(isAl ? 'Criar senha e entrar' : 'Salvar senha', function () {
        if (isAl) {
          setStudentAcc(P.idx, { status: 'ativo', pass: p1, last: 'agora', created: P.purpose === 'reset' ? (stI.acc.created || 'hoje') : 'hoje' });
          upd({ step: 'in', p1: '', p2: '', err: '', tries: 0, code: null });
          self.setState({ screen: 'inicio' });
          self.notify(P.purpose === 'reset' ? 'Senha trocada. Pronto, você entrou!' : 'Senha criada! Na próxima, é só telefone e senha.');
        } else {
          var a = Object.assign({}, self.state.auth);
          a.personal = Object.assign({}, a.personal, { pass: p1, p1: '', p2: '', err: '', tries: 0, code: null, trusted: true, step: a.personal.pin ? 'in' : 'pinNew', pinTyped: '' });
          self.setState({ auth: a });
          if (a.personal.pin) self.notify('Senha trocada. Os outros aparelhos foram desconectados.');
        }
      }, r1 && r2 && r3 && r4);
      v.note = isAl ? 'A senha é guardada embaralhada (criptografada). Nem o personal nem a Tresk conseguem ver.' : 'A senha é guardada embaralhada (criptografada). Nem a Tresk consegue ver.';
    };

    if (P.step === 'code') {
      v.iChat = true;
      v.title = 'Digite o código';
      v.sub = 'Mandamos 6 números no WhatsApp ' + masked(isAl ? (stI && stI.phone) : A.personal.phone) + '.';
      if (P.code) {
        v.banner = true;
        v.bFrom = isAl ? s.brand.name : 'KFit · Segurança';
        v.bText = (P.purpose === '2fa' ? 'Alguém está entrando na sua conta num celular novo. ' : '') + 'Seu código é ' + P.code.slice(0, 3) + ' ' + P.code.slice(3) + '. Vale por 10 minutos. Não passe para ninguém.';
      }
      v.fields = [field({ label: 'Código de 6 números', mode: 'numeric', big: true, max: 6, val: P.typed, ac: 'one-time-code', ph: '••••••', on: function (e) { upd({ typed: dig(e.target.value).slice(0, 6), err: '' }); } })];
      v.primary = btn('Confirmar', function () {
        var C = self.state.auth[mode];
        if (!C.code) return upd({ err: 'Esse código não vale mais. Peça um novo.' });
        if (C.typed === C.code) {
          if (C.purpose === '2fa') {
            var a = Object.assign({}, self.state.auth);
            a.personal = Object.assign({}, a.personal, { trusted: true, code: null, typed: '', err: '', tries: 0, step: a.personal.pin ? 'in' : 'pinNew', pinTyped: '' });
            self.setState({ auth: a });
            return;
          }
          return upd({ step: 'create', code: null, typed: '', err: '', p1: '', p2: '' });
        }
        var t = (C.tries || 0) + 1;
        if (t >= 5) return upd({ tries: t, code: null, typed: '', err: 'Código errado 5 vezes. Por segurança, esse código foi cancelado. Peça um novo.' });
        upd({ tries: t, typed: '', err: 'Código errado. Restam ' + (5 - t) + ' tentativas.' });
      }, (P.typed || '').length === 6);
      v.links = [
        link('Não chegou? Mandar de novo', function () { sendCode(self.state.auth[mode].purpose); self.notify('Código novo enviado no WhatsApp'); }),
        link('Voltar', function () { upd({ step: isAl ? 'phone' : 'login', code: null, typed: '', err: '' }); })
      ];
      v.note = 'O código só serve uma vez. Ninguém do ' + (isAl ? 'seu personal' : 'KFit') + ' vai pedir esse código para você.';
    } else if (P.step === 'create') {
      createStep();
    } else if (isAl) {
      if (P.step === 'phone') {
        v.iMono = true;
        v.title = 'Entrar no app';
        v.sub = 'Treinos do ' + s.brand.name + '. Digite o número de WhatsApp que você passou para o seu personal.';
        v.fields = [field({ label: 'Seu WhatsApp', type: 'tel', mode: 'tel', val: P.phone, ac: 'tel', ph: '(87) 9 0000-0000', on: function (e) { upd({ phone: e.target.value, err: '' }); } })];
        v.primary = btn('Continuar', function () {
          var ph = tail(self.state.auth.aluno.phone);
          if (ph.length < 10) return upd({ err: 'Digite o número com DDD.' });
          var idx = -1;
          self.state.students.forEach(function (st, i) { if (tail(st.phone) === ph) idx = i; });
          if (idx < 0) return upd({ err: 'Esse número não está cadastrado. Só entra no app quem o personal cadastrou. Fale com ele.' });
          var acc = self.state.students[idx].acc || {};
          if (acc.status === 'pausado') return upd({ err: 'Seu acesso está pausado pelo personal. Fale com ele para liberar.' });
          if (!acc.pass) return sendCode('first', { idx: idx });
          upd({ step: 'pass', idx: idx, pw: '', err: '', tries: 0 });
        }, dig(P.phone).length >= 10);
        v.note = 'Primeira vez? Vamos mandar um código no seu WhatsApp para confirmar que o número é seu.';
      } else if (P.step === 'pass') {
        v.iMono = true;
        v.title = 'Oi, ' + first(stI && stI.name) + '!';
        v.sub = 'Digite sua senha para entrar · ' + masked(stI && stI.phone);
        v.fields = [field({ label: 'Senha', type: 'password', val: P.pw, ac: 'current-password', on: function (e) { upd({ pw: e.target.value, err: '' }); } })];
        v.primary = btn('Entrar', function () {
          var C = self.state.auth.aluno;
          var acc = self.state.students[C.idx].acc || {};
          if (acc.status === 'pausado') return upd({ err: 'Seu acesso está pausado pelo personal. Fale com ele para liberar.' });
          if (!acc.pass) return sendCode('first', { idx: C.idx });
          if (C.pw === acc.pass) {
            setStudentAcc(C.idx, { last: 'agora' });
            upd({ step: 'in', pw: '', err: '', tries: 0 });
            self.setState({ screen: 'inicio' });
            return self.notify('Bom treino, ' + first(self.state.students[C.idx].name) + '!');
          }
          var t = (C.tries || 0) + 1;
          if (t >= 5) return upd({ step: 'blocked', tries: t, pw: '', err: '' });
          upd({ tries: t, pw: '', err: 'Senha errada. Restam ' + (5 - t) + ' tentativas.' });
        }, (P.pw || '').length > 0);
        v.links = [
          link('Esqueci minha senha', function () { sendCode('reset', { idx: self.state.auth.aluno.idx }); }),
          link('Não é você? Trocar número', function () { upd({ step: 'phone', idx: null, pw: '', err: '' }); })
        ];
      } else if (P.step === 'blocked') {
        v.iLock = true;
        v.title = 'Login travado por 15 minutos';
        v.sub = 'Erraram a senha 5 vezes. Para proteger seus dados, ninguém entra agora. Se foi você, recupere pelo WhatsApp.';
        v.primary = btn('Recuperar pelo WhatsApp', function () { sendCode('reset', { idx: self.state.auth.aluno.idx }); });
        v.links = [link('Voltar', function () { upd({ step: 'phone', err: '' }); })];
      }
    } else {
      if (P.step === 'login') {
        v.iLock = true;
        v.title = 'Entrar no KFit';
        v.sub = 'Área do personal. Aqui ficam os dados de todos os seus alunos, por isso a entrada é protegida.';
        v.fields = [
          field({ label: 'Seu WhatsApp', type: 'tel', mode: 'tel', val: P.phone, ac: 'tel', on: function (e) { upd({ phone: e.target.value, err: '' }); } }),
          field({ label: 'Senha', type: 'password', val: P.pw, ac: 'current-password', on: function (e) { upd({ pw: e.target.value, err: '' }); } })
        ];
        v.primary = btn('Entrar', function () {
          var C = self.state.auth.personal;
          if (C.lockedOut) return upd({ step: 'blocked' });
          if (tail(C.phone) === tail('(87) 99900-1234') && C.pw === C.pass) {
            if (!C.trusted) return sendCode('2fa', { pw: '' });
            return upd({ step: C.pin ? 'in' : 'pinNew', pw: '', err: '', tries: 0, pinTyped: '' });
          }
          var t = (C.tries || 0) + 1;
          if (t >= 5) return upd({ step: 'blocked', tries: t, pw: '', err: '' });
          upd({ tries: t, pw: '', err: 'Telefone ou senha incorretos. Restam ' + (5 - t) + ' tentativas.' });
        }, (P.pw || '').length > 0 && dig(P.phone).length >= 10);
        v.links = [link('Esqueci minha senha', function () { sendCode('reset'); })];
        v.note = 'Demonstração: a senha é ' + P.pass + '. Num celular novo, o app também pede um código no seu WhatsApp.';
      } else if (P.step === 'blocked') {
        v.iLock = true;
        v.title = 'Conta protegida por 15 minutos';
        v.sub = 'Erraram a senha 5 vezes. Avisamos no seu WhatsApp. Se não foi você, troque a senha agora.';
        v.primary = btn('Trocar senha pelo WhatsApp', function () { sendCode('reset'); });
      } else if (P.step === 'pinNew' || P.step === 'pinConfirm') {
        var conf = P.step === 'pinConfirm';
        v.iShield = true;
        v.title = conf ? 'Repita o PIN' : 'Crie um PIN de 4 números';
        v.sub = conf ? 'Só para confirmar.' : 'O app vai pedir esse PIN sempre que for aberto. Se alguém pegar seu celular, não vê os dados dos alunos.';
        pinPad(4, P.pinTyped || '', function (pin) {
          var C = self.state.auth.personal;
          if (!conf) {
            if (['1234', '0000', '1111', '4321', '2222', '1212', '9999'].indexOf(pin) >= 0) return upd({ pinTyped: '', err: 'PIN fácil demais. Escolha outro.' });
            return upd({ step: 'pinConfirm', pinFirst: pin, pinTyped: '', err: '' });
          }
          if (pin !== C.pinFirst) return upd({ step: 'pinNew', pinTyped: '', pinFirst: null, err: 'Os PINs não bateram. Comece de novo.' });
          upd({ step: 'in', pin: pin, pinFirst: null, pinTyped: '', err: '', pinTries: 0 });
          self.notify('PIN criado. O app vai pedir sempre que abrir.');
        });
      } else if (P.step === 'pin') {
        v.iMono = false; v.iLock = true;
        v.title = 'Lucas Martins';
        v.sub = 'App bloqueado. Digite seu PIN.';
        pinPad(4, P.pinTyped || '', function (pin) {
          var C = self.state.auth.personal;
          if (pin === C.pin) return upd({ step: 'in', pinTyped: '', err: '', pinTries: 0 });
          var t = (C.pinTries || 0) + 1;
          if (t >= 3) return upd({ step: 'login', pinTyped: '', pinTries: 0, pw: '', err: 'PIN errado 3 vezes. Por segurança, entre com a senha.' });
          upd({ pinTyped: '', pinTries: t, err: 'PIN errado. Restam ' + (3 - t) + ' tentativas.' });
        }, s.sec.bio ? function () { upd({ step: 'in', pinTyped: '', err: '', pinTries: 0 }); self.notify('Digital reconhecida'); } : null);
        v.links = [link('Esqueci o PIN · entrar com a senha', function () { upd({ step: 'login', pin: null, pinTyped: '', pw: '', err: '' }); })];
      }
    }

    var iconBox = 'width: 64px; height: 64px; border-radius: ' + (v.iMono ? (s.brand.shape === 'round' ? '999px' : '18px') : '20px') + '; display: flex; align-items: center; justify-content: center; ' +
      (v.iMono ? 'background: linear-gradient(145deg, #3B82F6, #1D4ED8); color: #FFFFFF; font-family: \'Exo 2\', Inter, sans-serif; font-style: italic; font-size: 22px; font-weight: 800' : 'background: rgba(59,130,246,0.14); color: #93C5FD');
    v.iconBox = iconBox;
    v.hasErr = !!v.err;
    v.hasNote = !!v.note;
    v.hasRules = v.rules.length > 0;
    v.hasPrimary = !!v.primary;
    if (!v.primary) v.primary = { label: '', act: function () {}, style: '', disabled: true };
    v.wrap = 'position: absolute; left: 0; right: 0; top: 82px; bottom: 0; z-index: 30; background: #0B0B0C; overflow-y: auto; padding: 20px 20px 28px; display: flex; flex-direction: column; gap: 16px; animation: kfitFade .25s ease both';
    v.heroStyle = 'display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; margin-top: ' + (v.banner ? '4px' : v.keypad ? '8px' : '28px');

    // botão do topo: bloquear (personal) ou sair (aluno)
    var lockBtn = {
      show: P.step === 'in', isLock: !isAl, isOut: isAl,
      label: isAl ? 'Sair da conta' : 'Bloquear o app',
      act: function () {
        if (isAl) { upd({ step: 'phone', idx: null, pw: '', err: '' }); return; }
        upd({ step: self.state.auth.personal.pin ? 'pin' : 'login', pinTyped: '', err: '' });
      }
    };

    // cartão "Acesso ao app" na ficha do aluno (visão do personal)
    var cur = studentsRaw[s.student] || studentsRaw[0];
    var ac = cur.acc || { status: 'pendente' };
    var stIdx = s.student;
    var chip = function (bg, fg) { return 'font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: ' + bg + '; color: ' + fg; };
    var acc = {
      status: ac.status === 'ativo' ? 'Ativo' : ac.status === 'pausado' ? 'Pausado' : 'Primeiro acesso pendente',
      chip: ac.status === 'ativo' ? chip('rgba(110,231,183,0.14)', '#6EE7B7') : ac.status === 'pausado' ? chip('rgba(252,165,165,0.14)', '#FCA5A5') : chip('rgba(201,206,214,0.14)', '#C9CED6'),
      line: ac.status === 'ativo' ? 'Senha criada ' + (ac.created || 'em out/2026') + ' · último acesso ' + (ac.last || '—') :
        ac.status === 'pausado' ? 'Não consegue entrar no app até você liberar.' :
        'Ainda não entrou. No primeiro acesso, recebe um código no WhatsApp e cria a senha.',
      b1: ac.status === 'ativo' ? 'Zerar senha' : ac.status === 'pausado' ? 'Liberar acesso' : 'Reenviar convite',
      b2: ac.status === 'pausado' ? '' : 'Pausar acesso',
      hasB2: ac.status !== 'pausado',
      act1: function () {
        if (ac.status === 'ativo') { setStudentAcc(stIdx, { pass: null, status: 'pendente' }); self.notify('Senha zerada. No próximo acesso ' + first(cur.name) + ' recebe um código.'); }
        else if (ac.status === 'pausado') { setStudentAcc(stIdx, { status: ac.pass ? 'ativo' : 'pendente' }); self.notify('Acesso de ' + first(cur.name) + ' liberado'); }
        else self.notify('Convite com link do app enviado no WhatsApp de ' + first(cur.name));
      },
      act2: function () {
        setStudentAcc(stIdx, { status: 'pausado' });
        // se o aluno estiver logado neste protótipo, cai fora na hora
        if (self.state.auth.aluno.step === 'in' && self.state.auth.aluno.idx === stIdx) {
          var a = Object.assign({}, self.state.auth); a.aluno = Object.assign({}, a.aluno, { step: 'phone', err: '' }); self.setState({ auth: a });
        }
        self.notify('Acesso pausado. ' + first(cur.name) + ' foi desconectado(a).');
      }
    };

    // tela Segurança (personal)
    var S = s.sec;
    var setSec = function (patch) { self.setState({ sec: Object.assign({}, self.state.sec, patch) }); };
    var track = function (on) { return 'width: 50px; height: 30px; flex: none; border-radius: 999px; border: 0; padding: 3px; display: flex; justify-content: ' + (on ? 'flex-end' : 'flex-start') + '; background: ' + (on ? '#2563EB' : 'rgba(255,255,255,0.15)'); };
    var knob = 'width: 24px; height: 24px; border-radius: 999px; background: #FFFFFF; display: block';
    var secToggles = [
      { k: 'bio', t: 'Entrar com a digital', d: 'Além do PIN, o celular aceita sua digital ou rosto.' },
      { k: 'alertNew', t: 'Avisar quando entrarem num aparelho novo', d: 'Chega uma mensagem no seu WhatsApp na hora.' }
    ].map(function (o) { return { title: o.t, desc: o.d, on: !!S[o.k], track: track(!!S[o.k]), knob: knob, toggle: function () { var p = {}; p[o.k] = !self.state.sec[o.k]; setSec(p); } }; });
    var lockOpts = [['0', 'Na hora'], ['1', '1 min'], ['5', '5 min'], ['15', '15 min']].map(function (o) {
      var on = S.lockAfter === o[0];
      return { label: o[1], on: on, pick: function () { setSec({ lockAfter: o[0] }); }, style: 'flex: 1; height: 40px; border-radius: 10px; font-size: 13px; font-weight: 600; ' + (on ? 'border: 0; background: #2563EB; color: #FFFFFF' : 'border: 1px solid rgba(255,255,255,0.12); background: none; color: #D4D4D8') };
    });
    var devices = S.devices.map(function (d, i) {
      return {
        name: d.name, info: d.info, current: !!d.current, other: !d.current,
        out: function () { var ds = self.state.sec.devices.filter(function (_, j) { return j !== i; }); setSec({ devices: ds }); self.notify(d.name + ' desconectado'); }
      };
    });
    var accessLog = [
      { when: 'Hoje, 06:58', what: 'Entrou com PIN · este celular', bad: false },
      { when: 'Ontem, 21:14', what: 'Entrou com senha + código · Notebook', bad: false },
      { when: '22/11, 13:40', what: 'Senha errada 5 vezes · login travado 15 min', bad: true }
    ].map(function (l) { return { when: l.when, what: l.what, style: 'font-size: 13px; color: ' + (l.bad ? '#FCA5A5' : '#D4D4D8') }; });
    var alunosAtivos = studentsRaw.filter(function (x) { return x.acc && x.acc.status === 'ativo'; }).length;
    var alunosPend = studentsRaw.filter(function (x) { return !x.acc || x.acc.status === 'pendente'; }).length;

    return {
      lg: v, lockBtn: lockBtn, acc: acc,
      sec: {
        toggles: secToggles, lockOpts: lockOpts, devices: devices, log: accessLog,
        hasOthers: S.devices.length > 1,
        pinLine: A.personal.pin ? 'Ligado · pede sempre que abrir o app' : 'Desligado',
        alunosLine: alunosAtivos + ' alunos com senha · ' + alunosPend + ' aguardando o primeiro acesso',
        changePin: function () { var a = Object.assign({}, self.state.auth); a.personal = Object.assign({}, a.personal, { step: 'pinNew', pinTyped: '', err: '' }); self.setState({ auth: a }); },
        outOthers: function () { setSec({ devices: self.state.sec.devices.filter(function (d) { return d.current; }) }); self.notify('Todos os outros aparelhos foram desconectados'); },
        lockNow: function () { var a = Object.assign({}, self.state.auth); a.personal = Object.assign({}, a.personal, { step: a.personal.pin ? 'pin' : 'login', pinTyped: '', err: '' }); self.setState({ auth: a }); },
        logout: function () { var a = Object.assign({}, self.state.auth); a.personal = Object.assign({}, a.personal, { step: 'login', pw: '', pinTyped: '', err: '' }); self.setState({ auth: a, screen: 'hoje' }); }
      }
    };
  }

  renderVals() {
    var self = this;
    var s = this.state;
    var set = function (patch) { return function () { self.setState(patch); }; };

    var seg = function (on) {
      return 'border: 0; border-radius: 999px; padding: 8px 14px; min-height: 36px; font-size: 13px; font-weight: 600; ' +
        (on ? 'background: #2563EB; color: #FFFFFF' : 'background: transparent; color: #A1A1AA');
    };
    var tab = function (on) {
      return 'border: 0; border-radius: 10px; height: 40px; font-size: 13px; font-weight: 600; ' +
        (on ? 'background: #2563EB; color: #FFFFFF' : 'background: transparent; color: #A1A1AA');
    };
    var chip = function (kind) {
      var base = 'font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 999px; white-space: nowrap; ';
      if (kind === 'ok') return base + 'background: rgba(110,231,183,0.12); color: #6EE7B7';
      if (kind === 'warn') return base + 'background: rgba(201,206,214,0.14); color: #C9CED6';
      if (kind === 'late') return base + 'background: rgba(252,165,165,0.14); color: #FCA5A5';
      return base + 'background: rgba(59,130,246,0.15); color: #93C5FD';
    };
    var initials = function (n) { return n.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2); };

    // ── Dados de exemplo ──
    var studentsRaw = s.students;
    var payKindOf = function (i) { return s.paid[i] ? 'ok' : studentsRaw[i].payKind; };
    var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var payText = function (i) {
      var k = payKindOf(i);
      if (s.paid[i]) return 'Pago';
      if (studentsRaw[i].isNew && k === 'warn') return '1º pagamento';
      return k === 'ok' ? 'Em dia' : k === 'warn' ? 'Vence ' + pad2(studentsRaw[i].dueDay) + '/11' : 'Atrasado';
    };
    // ── Modelos de treino (cada aluno tem a sua ficha) ──
    var tip0 = 'Postura firme, movimento controlado na ida e na volta. O vídeo mostra a execução correta.';
    var TPL = {
      A_inf: { title: 'Treino A · Inferiores', ex: [
        { name: 'Agachamento livre', sets: '4 × 10', rest: 'descanso 90 s', load: '60 kg', tip: 'Pés na largura dos ombros, desça até a coxa ficar paralela ao chão e mantenha o peito aberto.' },
        { name: 'Leg press 45°', sets: '4 × 12', rest: 'descanso 60 s', load: '140 kg', tip: 'Não estique o joelho por completo no final e mantenha a lombar apoiada no banco.' },
        { name: 'Cadeira extensora', sets: '3 × 15', rest: 'descanso 45 s', load: '35 kg', tech: 'Drop set na última', tip: 'Segure 1 segundo no alto e desça devagar, controlando o peso.' },
        { name: 'Stiff com halteres', sets: '3 × 12', rest: 'descanso 60 s', load: '14 kg cada', tip: 'Joelhos levemente flexionados, quadril para trás e coluna neutra o tempo todo.' },
        { name: 'Elevação pélvica', sets: '4 × 12', rest: 'descanso 60 s', load: '50 kg', tech: 'Bi-set com panturrilha', tip: 'Contraia o glúteo no alto e mantenha o queixo levemente para baixo.' },
        { name: 'Panturrilha em pé', sets: '4 × 20', rest: 'descanso 30 s', load: '40 kg', tip: 'Amplitude completa: desça bem o calcanhar e suba na ponta dos pés.' }
      ] },
      B_sup: { title: 'Treino B · Superiores', ex: [
        { name: 'Supino reto com halteres', sets: '4 × 10', rest: 'descanso 75 s', load: '18 kg cada', tip: 'Escápulas encaixadas no banco e cotovelos a 45° do tronco.' },
        { name: 'Puxada frontal aberta', sets: '4 × 10', rest: 'descanso 75 s', load: '45 kg', tip: 'Puxe a barra até o alto do peito, sem jogar o tronco para trás.' },
        { name: 'Desenvolvimento com halteres', sets: '3 × 12', rest: 'descanso 60 s', load: '12 kg cada', tip: 'Abdômen firme e sem arquear a lombar ao subir.' },
        { name: 'Remada baixa sentada', sets: '3 × 12', rest: 'descanso 60 s', load: '40 kg', tip: 'Peito aberto e cotovelos rente ao corpo no final da puxada.' },
        { name: 'Tríceps corda', sets: '3 × 12', rest: 'descanso 45 s', load: '20 kg', tip: 'Cotovelos parados ao lado do corpo; abra a corda no final.' },
        { name: 'Rosca alternada com halteres', sets: '3 × 12', rest: 'descanso 45 s', load: '10 kg cada', tip: 'Sem balançar o tronco; gire o punho ao subir.' }
      ] },
      C_costas: { title: 'Treino C · Costas e bíceps', ex: [
        { name: 'Barra fixa pronada', sets: '4 × 8', rest: 'descanso 90 s', load: 'peso do corpo', tip: 'Desça até estender os braços e suba levando o peito à barra.' },
        { name: 'Remada curvada com barra', sets: '4 × 10', rest: 'descanso 75 s', load: '50 kg', tip: 'Tronco a 45°, coluna neutra e barra em direção ao umbigo.' },
        { name: 'Puxada supinada', sets: '3 × 12', rest: 'descanso 60 s', load: '50 kg', tip: 'Pegada na largura dos ombros, puxe com os cotovelos.' },
        { name: 'Remada unilateral com halter (serrote)', sets: '3 × 12', rest: 'descanso 60 s', load: '26 kg', tip: 'Apoie mão e joelho no banco e puxe o halter rente ao corpo.' },
        { name: 'Face pull', sets: '3 × 15', rest: 'descanso 45 s', load: '20 kg', tech: 'Pausa de 2 s', tip: 'Puxe a corda em direção ao rosto abrindo os cotovelos.' },
        { name: 'Rosca direta com barra', sets: '3 × 10', rest: 'descanso 60 s', load: '30 kg', tip: 'Cotovelos parados e descida controlada.' }
      ] },
      func: { title: 'Funcional · circuito', ex: [
        { name: 'Kettlebell swing', sets: '4 × 40 s', rest: 'descanso 20 s', load: '16 kg', tip: 'O movimento vem do quadril, não dos braços.' },
        { name: 'Burpee', sets: '4 × 40 s', rest: 'descanso 20 s', load: '', tip: 'Peito no chão e salto com braços acima da cabeça.' },
        { name: 'Agachamento goblet', sets: '4 × 40 s', rest: 'descanso 20 s', load: '12 kg', tip: 'Kettlebell junto ao peito e cotovelos por dentro dos joelhos.' },
        { name: 'Remada no TRX', sets: '4 × 40 s', rest: 'descanso 20 s', load: '', tip: 'Corpo em prancha o tempo todo.' },
        { name: 'Prancha com toque no ombro', sets: '4 × 40 s', rest: 'descanso 20 s', load: '', tip: 'Quadril parado enquanto alterna as mãos.' },
        { name: 'Corda naval ondas alternadas', sets: '4 × 30 s', rest: 'descanso 30 s', load: '', tip: 'Joelhos flexionados e ritmo constante.' }
      ] },
      A_peito: { title: 'Treino A · Peito e tríceps', ex: [
        { name: 'Supino reto com barra', sets: '4 × 8', rest: 'descanso 90 s', load: '70 kg', tip: 'Desça a barra até a linha do mamilo, pés firmes no chão.' },
        { name: 'Supino inclinado com halteres', sets: '3 × 10', rest: 'descanso 75 s', load: '26 kg cada', tip: 'Banco a 30°, sem bater os halteres no alto.' },
        { name: 'Crucifixo na máquina (peck deck)', sets: '3 × 12', rest: 'descanso 60 s', load: '50 kg', tip: 'Cotovelos levemente flexionados durante todo o movimento.' },
        { name: 'Tríceps pulley com barra', sets: '3 × 12', rest: 'descanso 45 s', load: '30 kg', tip: 'Cotovelos colados ao corpo.' },
        { name: 'Tríceps francês com halter', sets: '3 × 12', rest: 'descanso 45 s', load: '16 kg', tip: 'Cotovelos apontando para cima, sem abrir.' },
        { name: 'Mergulho nas paralelas para tríceps', sets: '3 × falha', rest: 'descanso 60 s', load: 'peso do corpo', tip: 'Tronco reto para focar no tríceps.' }
      ] },
      mob: { title: 'Mobilidade e core', ex: [
        { name: 'Gato-camelo', sets: '2 × 10', rest: 'sem descanso', load: '', tip: 'Movimento lento acompanhando a respiração.' },
        { name: 'Mobilidade de quadril 90/90', sets: '2 × 8 cada lado', rest: 'sem descanso', load: '', tip: 'Tronco alto e troca de lado sem usar as mãos, se conseguir.' },
        { name: 'Rotação torácica', sets: '2 × 10 cada lado', rest: 'sem descanso', load: '', tip: 'Quadril parado; gire só o tronco.' },
        { name: 'Bird dog', sets: '3 × 10 cada lado', rest: 'descanso 30 s', load: '', tip: 'Braço e perna opostos, sem girar o quadril.' },
        { name: 'Dead bug', sets: '3 × 10', rest: 'descanso 30 s', load: '', tip: 'Lombar colada no chão o tempo todo.' },
        { name: 'Ponte de glúteo', sets: '3 × 12', rest: 'descanso 30 s', load: '', tip: 'Suba até alinhar joelho, quadril e ombro.' }
      ] }
    };
    var tplKeys = ['A_inf', 'B_sup', 'C_costas', 'A_peito', 'func', 'mob'];
    var baseEx = TPL.A_inf.ex;
    var fichaTitle = function (i) {
      var k = studentsRaw[i].ficha;
      if (k && TPL[k]) return TPL[k].title;
      return (s.extraEx[i] || []).length ? 'Treino personalizado' : 'Sem treino montado';
    };


    var dayLabels = [['Seg', '23'], ['Ter', '24'], ['Qua', '25'], ['Qui', '26'], ['Sex', '27'], ['Sáb', '28']];
    var times = ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00'];
    var baseSchedule = [
      { 0: 2, 1: 0, 2: 5, 5: 3, 6: 1 },
      { 0: 2, 1: 0, 2: 5, 5: 3, 6: 1 },
      { 0: 2, 2: 0, 4: 4, 5: 5, 6: 3, 7: 1 },
      { 1: 4, 2: 1, 5: 2, 6: 5 },
      { 0: 2, 1: 0, 2: 5, 4: 3, 5: 1 },
      { 0: 5, 1: 2 }
    ];
    var who = function (d, t) {
      var key = d + '-' + t;
      if (s.assigned[key] !== undefined) return s.assigned[key];
      var b = baseSchedule[d][t];
      return b === undefined ? null : b;
    };
    var isNew = function (d, t) { return s.assigned[d + '-' + t] !== undefined; };
    var daysOf = function (i) {
      var out = [];
      dayLabels.forEach(function (d, k) { for (var t = 0; t < times.length; t++) { if (who(k, t) === i) { out.push(d[0]); break; } } });
      if (out.length) return out.join(', ');
      return studentsRaw[i].daysPref ? 'Prefere ' + studentsRaw[i].daysPref : 'Sem horário fixo';
    };

    var openStudent = function (i) {
      return function () { self.setState({ mode: 'personal', screen: 'aluno', student: i, tab: 'ficha', sheet: null }); };
    };
    var openAssign = function (d, t) { return set({ sheet: 'assign', ctx: { d: d, t: t } }); };

    // ── Hoje (terça = dia 1) ──
    var todayCount = 0;
    var todayFree = 0;
    var today = times.map(function (time, t) {
      var i = who(1, t);
      if (i === null) {
        todayFree += 1;
        return { time: time, free: true, busy: false, open: openAssign(1, t) };
      }
      todayCount += 1;
      var a = studentsRaw[i];
      var fresh = isNew(1, t);
      return {
        time: time, free: false, busy: true, name: a.name, initials: initials(a.name), workout: fichaTitle(i),
        status: fresh ? 'Novo' : (t === 2 || t === 6 ? 'Aguardando' : 'Confirmado'),
        chipStyle: chip(fresh ? 'warn' : (t === 2 || t === 6 ? 'info' : 'ok')),
        open: openStudent(i)
      };
    });

    var week = dayLabels.map(function (d, i) {
      var on = s.day === i;
      return {
        label: d[0], num: d[1], on: on,
        pick: set({ day: i, slot: null }),
        style: 'display: flex; flex-direction: column; align-items: center; border: 0; border-radius: 14px; padding: 10px 0; min-height: 56px; ' +
          (on ? 'background: #2563EB; color: #FFFFFF' : 'background: #141418; color: #F5F5F7')
      };
    });

    var weekSlots = times.map(function (time, t) {
      var i = who(s.day, t);
      var busy = i !== null;
      return {
        time: time,
        label: busy ? studentsRaw[i].name + (isNew(s.day, t) ? '  ·  novo' : '') : 'Livre',
        open: busy ? openStudent(i) : openAssign(s.day, t),
        style: 'flex: 1; text-align: left; border-radius: 12px; padding: 0 14px; height: 44px; font-size: 13px; font-weight: 600; ' +
          (busy ? 'background: #1D4ED8; color: #FFFFFF; border: 0' : 'background: none; border: 1.5px dashed rgba(59,130,246,0.55); color: #93C5FD')
      };
    });

    var assignList = studentsRaw.map(function (a, i) {
      return {
        name: a.name, goal: a.goal, initials: initials(a.name),
        pick: function () {
          var c = self.state.ctx;
          var asg = Object.assign({}, self.state.assigned);
          asg[c.d + '-' + c.t] = i;
          self.setState({ assigned: asg, sheet: null });
          self.notify(a.name + ' agendado(a) · ' + dayLabels[c.d][0] + ' às ' + times[c.t]);
        }
      };
    });
    var ctx = s.ctx || { d: 1, t: 3 };

    // ── Alunos ──
    var term = (s.q || '').trim().toLowerCase();
    var studentsAll = studentsRaw.map(function (a, i) {
      return { name: a.name, goal: a.goal, days: daysOf(i), pay: payText(i), initials: initials(a.name), payStyle: chip(payKindOf(i)), open: openStudent(i), plan: a.plan, modal: a.modal, dueDay: a.dueDay, price: a.price, phone: a.phone };
    });
    var studentsShown = studentsAll.filter(function (a) {
      return !term || a.name.toLowerCase().indexOf(term) >= 0 || a.goal.toLowerCase().indexOf(term) >= 0;
    });

    // ── Financeiro ──
    var paidCount = 0, dueCount = 0, lateCount = 0, pendingCount = 0;
    var finance = studentsRaw.map(function (a, i) {
      var k = payKindOf(i);
      if (k === 'ok') paidCount += 1; else if (k === 'warn') dueCount += 1; else lateCount += 1;
      var pending = k !== 'ok';
      if (pending) pendingCount += 1;
      return {
        name: a.name, initials: initials(a.name), pending: pending,
        status: s.paid[i] ? 'Pago agora' : k === 'ok' ? 'Pago via Pix' : k === 'warn' ? (a.isNew ? 'Aguardando 1º pagamento' : 'Vence ' + pad2(a.dueDay) + '/11') : 'Atrasado desde ' + pad2(a.dueDay) + '/11',
        statusStyle: 'font-size: 12px; margin-top: 2px; color: ' + (k === 'ok' ? '#6EE7B7' : k === 'warn' ? '#C9CED6' : '#FCA5A5'),
        chargeLabel: s.charged[i] ? 'Enviada' : 'Cobrar',
        charge: function () {
          var c = Object.assign({}, self.state.charged); c[i] = true;
          self.setState({ charged: c });
          self.notify('Cobrança com Pix enviada para ' + a.name);
        },
        markPaid: function () {
          var p = Object.assign({}, self.state.paid); p[i] = true;
          self.setState({ paid: p });
          self.notify('Pagamento de ' + a.name + ' registrado');
        }
      };
    });
    var total = studentsRaw.length;

    // ── Ficha ──
    // Biblioteca de exercícios (protótipo: 175 em português; no sistema real, 800+ com fotos e instruções)
    if (!this._lib) {
      var groupInfo = {
        'Peito': ['3 × 12', 'descanso 60 s'], 'Costas': ['3 × 12', 'descanso 60 s'], 'Ombros': ['3 × 12', 'descanso 60 s'],
        'Bíceps': ['3 × 12', 'descanso 45 s'], 'Tríceps': ['3 × 12', 'descanso 45 s'], 'Pernas': ['4 × 10', 'descanso 90 s'],
        'Posterior e glúteos': ['3 × 12', 'descanso 60 s'], 'Panturrilha': ['4 × 15', 'descanso 30 s'], 'Abdômen e core': ['3 × 15', 'descanso 30 s'],
        'Funcional': ['4 × 40 s', 'descanso 20 s'], 'Cardio': ['20 min', 'ritmo moderado'], 'Mobilidade': ['2 × 30 s', 'sem descanso']
      };
      var tips = {
        'Funcional': 'Movimento contínuo e controlado. O vídeo mostra a execução e as variações para cada nível.',
        'Cardio': 'Mantenha um ritmo em que ainda consiga falar frases curtas. Ajuste a intensidade pelo vídeo.',
        'Mobilidade': 'Respire fundo e vá até onde for confortável, sem dor. Siga o passo a passo do vídeo.'
      };
      this._lib = [["Peito", "Supino reto com barra", "Barra"], ["Peito", "Supino reto com halteres", "Halter"], ["Peito", "Supino inclinado com barra", "Barra"], ["Peito", "Supino inclinado com halteres", "Halter"], ["Peito", "Supino declinado com barra", "Barra"], ["Peito", "Supino declinado com halteres", "Halter"], ["Peito", "Supino na máquina", "Máquina"], ["Peito", "Supino no Smith", "Smith"], ["Peito", "Crucifixo reto com halteres", "Halter"], ["Peito", "Crucifixo inclinado com halteres", "Halter"], ["Peito", "Crucifixo na máquina (peck deck)", "Máquina"], ["Peito", "Crossover polia alta", "Polia"], ["Peito", "Crossover polia baixa", "Polia"], ["Peito", "Flexão de braço", "Peso do corpo"], ["Peito", "Flexão inclinada", "Peso do corpo"], ["Peito", "Flexão declinada", "Peso do corpo"], ["Peito", "Flexão diamante", "Peso do corpo"], ["Peito", "Pullover com halter", "Halter"], ["Peito", "Mergulho nas paralelas para peito", "Peso do corpo"], ["Costas", "Puxada frontal aberta", "Polia"], ["Costas", "Puxada frontal com triângulo", "Polia"], ["Costas", "Puxada supinada", "Polia"], ["Costas", "Barra fixa pronada", "Peso do corpo"], ["Costas", "Barra fixa supinada", "Peso do corpo"], ["Costas", "Barra fixa assistida", "Máquina"], ["Costas", "Remada curvada com barra", "Barra"], ["Costas", "Remada curvada supinada", "Barra"], ["Costas", "Remada unilateral com halter (serrote)", "Halter"], ["Costas", "Remada baixa sentada", "Polia"], ["Costas", "Remada cavalinho (T-bar)", "Barra"], ["Costas", "Remada na máquina", "Máquina"], ["Costas", "Pulldown com braços estendidos", "Polia"], ["Costas", "Levantamento terra", "Barra"], ["Costas", "Hiperextensão lombar", "Peso do corpo"], ["Costas", "Good morning", "Barra"], ["Costas", "Remada invertida", "Peso do corpo"], ["Costas", "Face pull", "Polia"], ["Ombros", "Desenvolvimento com barra", "Barra"], ["Ombros", "Desenvolvimento com halteres", "Halter"], ["Ombros", "Desenvolvimento Arnold", "Halter"], ["Ombros", "Desenvolvimento na máquina", "Máquina"], ["Ombros", "Desenvolvimento no Smith", "Smith"], ["Ombros", "Elevação lateral com halteres", "Halter"], ["Ombros", "Elevação lateral na polia", "Polia"], ["Ombros", "Elevação frontal com halteres", "Halter"], ["Ombros", "Elevação frontal com anilha", "Anilha"], ["Ombros", "Crucifixo invertido com halteres", "Halter"], ["Ombros", "Voador inverso na máquina", "Máquina"], ["Ombros", "Encolhimento com barra", "Barra"], ["Ombros", "Encolhimento com halteres", "Halter"], ["Ombros", "Remada alta na polia", "Polia"], ["Bíceps", "Rosca direta com barra", "Barra"], ["Bíceps", "Rosca direta com barra W", "Barra"], ["Bíceps", "Rosca alternada com halteres", "Halter"], ["Bíceps", "Rosca martelo", "Halter"], ["Bíceps", "Rosca concentrada", "Halter"], ["Bíceps", "Rosca Scott com barra", "Barra"], ["Bíceps", "Rosca Scott na máquina", "Máquina"], ["Bíceps", "Rosca na polia baixa", "Polia"], ["Bíceps", "Rosca 21", "Barra"], ["Bíceps", "Rosca inversa", "Barra"], ["Bíceps", "Rosca inclinada com halteres", "Halter"], ["Bíceps", "Rosca spider", "Halter"], ["Tríceps", "Tríceps pulley com barra", "Polia"], ["Tríceps", "Tríceps corda", "Polia"], ["Tríceps", "Tríceps testa com barra W", "Barra"], ["Tríceps", "Tríceps francês com halter", "Halter"], ["Tríceps", "Tríceps coice com halter", "Halter"], ["Tríceps", "Tríceps banco", "Peso do corpo"], ["Tríceps", "Mergulho nas paralelas para tríceps", "Peso do corpo"], ["Tríceps", "Supino fechado", "Barra"], ["Tríceps", "Tríceps unilateral na polia", "Polia"], ["Tríceps", "Extensão de tríceps acima da cabeça na polia", "Polia"], ["Pernas", "Agachamento livre", "Barra"], ["Pernas", "Agachamento frontal", "Barra"], ["Pernas", "Agachamento no Smith", "Smith"], ["Pernas", "Agachamento hack", "Máquina"], ["Pernas", "Agachamento goblet", "Kettlebell"], ["Pernas", "Agachamento sumô com halter", "Halter"], ["Pernas", "Agachamento búlgaro", "Halter"], ["Pernas", "Afundo com halteres", "Halter"], ["Pernas", "Avanço caminhando", "Halter"], ["Pernas", "Leg press 45°", "Máquina"], ["Pernas", "Leg press horizontal", "Máquina"], ["Pernas", "Cadeira extensora", "Máquina"], ["Pernas", "Subida no banco (step up)", "Halter"], ["Pernas", "Sissy squat", "Peso do corpo"], ["Pernas", "Agachamento com salto", "Peso do corpo"], ["Pernas", "Pistol squat assistido", "TRX"], ["Posterior e glúteos", "Stiff com barra", "Barra"], ["Posterior e glúteos", "Stiff com halteres", "Halter"], ["Posterior e glúteos", "Levantamento terra romeno", "Barra"], ["Posterior e glúteos", "Levantamento terra sumô", "Barra"], ["Posterior e glúteos", "Mesa flexora", "Máquina"], ["Posterior e glúteos", "Cadeira flexora", "Máquina"], ["Posterior e glúteos", "Flexora em pé", "Máquina"], ["Posterior e glúteos", "Elevação pélvica com barra (hip thrust)", "Barra"], ["Posterior e glúteos", "Ponte de glúteo", "Peso do corpo"], ["Posterior e glúteos", "Coice de glúteo na polia", "Polia"], ["Posterior e glúteos", "Glúteo 4 apoios com caneleira", "Caneleira"], ["Posterior e glúteos", "Cadeira abdutora", "Máquina"], ["Posterior e glúteos", "Cadeira adutora", "Máquina"], ["Posterior e glúteos", "Monster walk com elástico", "Elástico"], ["Posterior e glúteos", "Nordic curl", "Peso do corpo"], ["Panturrilha", "Panturrilha em pé na máquina", "Máquina"], ["Panturrilha", "Panturrilha sentada", "Máquina"], ["Panturrilha", "Panturrilha no leg press", "Máquina"], ["Panturrilha", "Panturrilha unilateral com halter", "Halter"], ["Abdômen e core", "Abdominal supra", "Peso do corpo"], ["Abdômen e core", "Abdominal infra", "Peso do corpo"], ["Abdômen e core", "Abdominal bicicleta", "Peso do corpo"], ["Abdômen e core", "Abdominal remador", "Peso do corpo"], ["Abdômen e core", "Abdominal na polia", "Polia"], ["Abdômen e core", "Elevação de pernas na barra", "Peso do corpo"], ["Abdômen e core", "Elevação de pernas no banco", "Peso do corpo"], ["Abdômen e core", "Prancha frontal", "Peso do corpo"], ["Abdômen e core", "Prancha lateral", "Peso do corpo"], ["Abdômen e core", "Prancha com toque no ombro", "Peso do corpo"], ["Abdômen e core", "Dead bug", "Peso do corpo"], ["Abdômen e core", "Bird dog", "Peso do corpo"], ["Abdômen e core", "Russian twist", "Anilha"], ["Abdômen e core", "Roda abdominal", "Roda"], ["Abdômen e core", "Hollow hold", "Peso do corpo"], ["Abdômen e core", "Abdominal canivete (V-up)", "Peso do corpo"], ["Abdômen e core", "Pallof press", "Polia"], ["Abdômen e core", "Mountain climber", "Peso do corpo"], ["Funcional", "Burpee", "Peso do corpo"], ["Funcional", "Kettlebell swing", "Kettlebell"], ["Funcional", "Kettlebell clean", "Kettlebell"], ["Funcional", "Kettlebell snatch", "Kettlebell"], ["Funcional", "Turkish get-up", "Kettlebell"], ["Funcional", "Wall ball", "Medicine ball"], ["Funcional", "Slam ball", "Medicine ball"], ["Funcional", "Lançamento lateral de medicine ball", "Medicine ball"], ["Funcional", "Avanço com rotação", "Medicine ball"], ["Funcional", "Corda naval ondas alternadas", "Corda naval"], ["Funcional", "Corda naval batida dupla", "Corda naval"], ["Funcional", "Salto na caixa (box jump)", "Caixa"], ["Funcional", "Farmer walk", "Halter"], ["Funcional", "Empurrar trenó", "Trenó"], ["Funcional", "Remada no TRX", "TRX"], ["Funcional", "Agachamento no TRX", "TRX"], ["Funcional", "Flexão no TRX", "TRX"], ["Funcional", "Thruster com halteres", "Halter"], ["Funcional", "Power clean", "Barra"], ["Funcional", "Swing com halter", "Halter"], ["Funcional", "Bear crawl", "Peso do corpo"], ["Funcional", "Mountain climber cruzado", "Peso do corpo"], ["Funcional", "Polichinelo", "Peso do corpo"], ["Funcional", "Salto patinador", "Peso do corpo"], ["Funcional", "Escada de agilidade", "Escada"], ["Funcional", "Renegade row", "Halter"], ["Funcional", "Man maker", "Halter"], ["Cardio", "Corrida na esteira", "Esteira"], ["Cardio", "Caminhada inclinada na esteira", "Esteira"], ["Cardio", "Bicicleta ergométrica", "Bike"], ["Cardio", "Elíptico", "Máquina"], ["Cardio", "Remo ergômetro", "Remo"], ["Cardio", "Pular corda", "Corda"], ["Cardio", "Skipping", "Peso do corpo"], ["Cardio", "Tiro de corrida (sprint)", "Peso do corpo"], ["Cardio", "Air bike", "Bike"], ["Cardio", "Simulador de escada", "Máquina"], ["Mobilidade", "Mobilidade de quadril 90/90", "Peso do corpo"], ["Mobilidade", "Alongamento de posterior de coxa", "Peso do corpo"], ["Mobilidade", "Alongamento de quadríceps", "Peso do corpo"], ["Mobilidade", "Rotação torácica", "Peso do corpo"], ["Mobilidade", "Gato-camelo", "Peso do corpo"], ["Mobilidade", "Alongamento de peitoral na parede", "Peso do corpo"], ["Mobilidade", "Mobilidade de tornozelo", "Peso do corpo"], ["Mobilidade", "Liberação miofascial com rolo", "Rolo"], ["Mobilidade", "Alongamento do glúteo (pombo)", "Peso do corpo"], ["Mobilidade", "Circundução de ombro com bastão", "Bastão"]].map(function (r, k) {
        var gi = groupInfo[r[0]];
        return { id: k, group: r[0], name: r[1], equip: r[2], sets: gi[0], rest: gi[1], load: '', tip: tips[r[0]] || 'Postura firme, movimento controlado na ida e na volta. O vídeo mostra a execução correta.' };
      });
    }
    var libAll = this._lib.concat((s.custom || []).map(function (n, k) {
      return { id: 'c' + k, group: 'Meus exercícios', name: n, equip: 'Personalizado', sets: '3 × 12', rest: 'descanso 60 s', load: '', tip: 'Exercício criado por você. No sistema real você grava ou anexa o vídeo.' };
    }));
    var libById = {};
    libAll.forEach(function (l) { libById[l.id] = l; });
    var extraFor = function (i) { return s.extraEx[i] || []; };
    // ── Ficha com chave por exercício, meta do personal e registro do aluno ──
    var fmtKg = function (n) { return (Math.round(n * 10) / 10).toString().replace('.', ','); };
    var numv = function (v) { var x = parseFloat(String(v === undefined || v === null ? '' : v).replace(',', '.')); return isNaN(x) ? null : x; };
    var fichaItems = function (i) {
      var fk = studentsRaw[i].ficha;
      var rem = s.removedEx[i] || {};
      var a = (fk && TPL[fk] ? TPL[fk].ex : []).map(function (e, j) { return { e: e, key: fk + ':' + j, tpl: true }; });
      var b = extraFor(i).map(function (k) { return libById[k] ? { e: libById[k], key: 'x' + k, tpl: false } : null; }).filter(Boolean);
      return a.concat(b).filter(function (it) { return !rem[it.key]; });
    };
    var fichaOf = function (i) { return fichaItems(i).map(function (it) { return it.e; }); };
    var isTimed = function (reps) { return /\d\s*(s|seg|min)\b/i.test(String(reps)) || /min/.test(String(reps)); };
    var rxBase = function (e, tpl) {
      var m = String(e.sets).match(/^(\d+)\s*×\s*(.+)$/);
      var lm = String(e.load || '').match(/(\d+(?:[.,]\d+)?)\s*kg/);
      var reps = m ? m[2].trim() : (isTimed(e.sets) ? e.sets : '12');
      var noLoadLib = !tpl && (e.equip === 'Peso do corpo' || e.group === 'Cardio' || e.group === 'Mobilidade');
      return {
        n: m ? parseInt(m[1], 10) : 1, reps: reps,
        load: lm ? parseFloat(lm[1].replace(',', '.')) : null,
        each: /cada/.test(e.load || ''),
        bw: /corpo/.test(e.load || '') || (tpl && !lm) || noLoadLib || isTimed(reps),
        rest: parseInt((String(e.rest).match(/(\d+)/) || [0, 0])[1], 10) || 0,
        tech: e.tech || '', note: ''
      };
    };
    var rxOf = function (i, it) {
      return Object.assign(rxBase(it.e, it.tpl), (s.rx[i] || {})[it.key] || {});
    };
    var loadText = function (r) { return r.bw ? 'sem carga' : r.load !== null ? fmtKg(r.load) + ' kg' + (r.each ? ' cada' : '') : 'carga a definir'; };
    var rxLine = function (r) { return r.n + ' × ' + r.reps + ' · ' + loadText(r) + (r.rest ? ' · descanso ' + r.rest + ' s' : ''); };
    var repsTarget = function (r) { var m = String(r.reps).match(/^(\d+)(?:\s*[-a]\s*(\d+))?$/); return m ? parseInt(m[1], 10) : null; };
    var rnd = function (x, L) { return L >= 20 ? Math.round(x / 2.5) * 2.5 : Math.round(x); };

    // Registros de exemplo (as 2 últimas sessões de cada exercício dos alunos que já treinam)
    if (!this._seedLogs) {
      var SL = {};
      var dates = { 0: ['17/11', '20/11'], 1: ['17/11', '19/11'], 2: ['19/11', '21/11'], 3: ['07/11', '12/11'], 4: ['12/11', '14/11'], 5: ['19/11', '21/11'] };
      var anaPlan = ['below', 'above', 'ok', 'ok', 'above', 'ok'];
      var pat = ['ok', 'above', 'below', 'ok', 'ok', 'below'];
      s.students.slice(0, 6).forEach(function (st, i) {
        var fk = st.ficha;
        SL[i] = {};
        (TPL[fk] ? TPL[fk].ex : []).forEach(function (e, j) {
          var r = rxBase(e, true);
          var kind = i === 0 ? anaPlan[j] : pat[(i + j) % 6];
          var T = repsTarget(r);
          var L = r.load;
          var mk = function (kgF, repF) {
            var out = [];
            for (var k = 0; k < r.n; k++) out.push({ kg: L === null ? null : kgF(k), reps: T === null ? r.reps : repF(k) });
            return out;
          };
          var older = mk(function () { return L >= 20 ? rnd(L - 2.5, L) : Math.max(L - 1, 1); }, function () { return T; });
          var last;
          if (kind === 'above') last = mk(function (k) { return rnd(L * (k === 0 ? 1.1 : 1.15), L); }, function () { return T; });
          else if (kind === 'below') last = mk(function (k) { return k < 1 ? L : rnd(L * (k < 2 ? 0.9 : 0.82), L); }, function (k) { return k < 1 ? T : Math.max(T - k, 1); });
          else last = mk(function () { return L; }, function () { return T; });
          if (L === null && kind === 'below' && T !== null) last = mk(function () { return null; }, function (k) { return k < 1 ? T : Math.max(T - 2 - k, 1); });
          if (L === null && kind === 'above') last = mk(function () { return null; }, function () { return T; });
          SL[i][fk + ':' + j] = [{ date: dates[i][0], sets: older, pse: 8 }, { date: dates[i][1], sets: last, pse: kind === 'above' ? 7 : kind === 'below' ? 10 : (j % 2 ? 7 : 8) }];
        });
      });
      this._seedLogs = SL;
    }
    var SLOG = this._seedLogs;
    var todaySession = function (i, key) {
      if (i !== 0) return null;
      var sets = [];
      Object.keys(s.sets).forEach(function (k) {
        var p = k.lastIndexOf('#');
        if (k.slice(0, p) !== key) return;
        var v = s.sets[k];
        if (v && v.done) sets.push({ n: parseInt(k.slice(p + 1), 10), kg: numv(v.kg), reps: numv(v.reps) === null ? v.reps : numv(v.reps) });
      });
      if (!sets.length) return null;
      sets.sort(function (a, b) { return a.n - b.n; });
      return { date: 'Hoje', sets: sets, live: true, pse: s.pse[key] || null };
    };
    var logsOf = function (i, key) {
      var base = ((SLOG[i] || {})[key] || []).slice();
      var t = todaySession(i, key);
      if (t) base.push(t);
      return base;
    };
    var setsText = function (r, sess) {
      return sess.sets.map(function (x) {
        var reps = x.reps === null || x.reps === undefined || x.reps === '' ? '?' : x.reps;
        return (x.kg !== null && x.kg !== undefined ? fmtKg(x.kg) + ' kg × ' : '') + reps;
      }).join('  ·  ');
    };
    var judge = function (r, sess) {
      if (!sess) return { kind: 'none' };
      var T = repsTarget(r);
      var kgs = sess.sets.map(function (x) { return x.kg; }).filter(function (x) { return x !== null && x !== undefined; });
      var max = kgs.length ? Math.max.apply(null, kgs) : null;
      var min = kgs.length ? Math.min.apply(null, kgs) : null;
      var repsShort = T !== null && sess.sets.some(function (x) { return typeof x.reps === 'number' && x.reps < T; });
      var setsShort = sess.sets.length < r.n && !sess.live;
      if (r.bw) return { kind: repsShort ? 'below' : 'ok', max: max, repsShort: repsShort };
      if (r.load === null) return { kind: max !== null ? 'free' : 'none', max: max };
      if (max === null) return { kind: 'ok' };
      if (min < r.load || repsShort || setsShort) return { kind: 'below', max: max, min: min, repsShort: repsShort, loadShort: min < r.load };
      if (max > r.load) return { kind: 'above', max: max };
      return { kind: 'ok', max: max };
    };
    var KIND = {
      above: ['Acima da meta', 'rgba(110,231,183,0.14)', '#6EE7B7'],
      ok: ['Na meta', 'rgba(59,130,246,0.15)', '#93C5FD'],
      below: ['Abaixo da meta', 'rgba(252,165,165,0.14)', '#FCA5A5'],
      free: ['Aluno escolheu', 'rgba(252,211,77,0.12)', '#FCD34D'],
      none: ['Aguardando treino', 'rgba(255,255,255,0.06)', '#A1A1AA'],
      undef: ['Sem carga', 'rgba(252,211,77,0.12)', '#FCD34D']
    };
    // Escala de esforço: o aluno vê palavras, o personal e a IA recebem o PSE (escala de Borg CR-10)
    var FEEL = [
      { n: 6, label: 'Muito leve', hint: 'sobrou muito', color: '#60A5FA', bg: 'rgba(96,165,250,0.2)' },
      { n: 7, label: 'Leve', hint: 'dava +3 reps', color: '#6EE7B7', bg: 'rgba(110,231,183,0.18)' },
      { n: 8, label: 'No ponto', hint: 'sobrou 1 ou 2', color: '#34D399', bg: 'rgba(52,211,153,0.22)' },
      { n: 9, label: 'Pesado', hint: 'no limite', color: '#FBBF24', bg: 'rgba(251,191,36,0.2)' },
      { n: 10, label: 'Não deu', hint: 'faltou rep', color: '#F87171', bg: 'rgba(248,113,113,0.2)' }
    ];
    var feelOf = function (n) { for (var q = 0; q < FEEL.length; q++) if (FEEL[q].n === n) return FEEL[q]; return null; };
    var kchip = function (k) { return 'font-size: 11px; font-weight: 600; padding: 5px 9px; border-radius: 999px; white-space: nowrap; flex: none; background: ' + KIND[k][1] + '; color: ' + KIND[k][2]; };
    var setRx = function (i, key, patch, msg) {
      var all = Object.assign({}, self.state.rx);
      all[i] = Object.assign({}, all[i] || {});
      all[i][key] = Object.assign({}, all[i][key] || {}, patch);
      self.setState({ rx: all });
      if (msg) self.notify(msg);
    };
    var analyze = function (i, it) {
      var r = rxOf(i, it);
      var logs = logsOf(i, it.key);
      var last = logs[logs.length - 1];
      var j = judge(r, last);
      var kind = (!r.bw && r.load === null && j.kind !== 'free') ? 'undef' : j.kind;
      var first = studentsRaw[i].name.split(' ')[0];
      var verdict = '', sug = null, sugLabel = '';
      if (kind === 'above') {
        verdict = first + ' pegou ' + fmtKg(j.max) + ' kg, acima da meta de ' + fmtKg(r.load) + ' kg, e fez todas as repetições.';
        sug = rnd(j.max, r.load); sugLabel = 'Subir meta para ' + fmtKg(sug) + ' kg';
      } else if (kind === 'below') {
        if (r.bw) verdict = first + ' não completou as repetições da meta (' + r.reps + ').';
        else if (j.loadShort) { verdict = first + ' não sustentou ' + fmtKg(r.load) + ' kg: caiu para ' + fmtKg(j.min) + ' kg' + (j.repsShort ? ' e fez menos repetições.' : '.'); sug = rnd((r.load + j.min) / 2, r.load); if (sug >= r.load) sug = j.min; sugLabel = 'Baixar meta para ' + fmtKg(sug) + ' kg'; }
        else verdict = first + ' usou a carga da meta, mas não completou as repetições.';
      } else if (kind === 'ok') {
        verdict = r.bw ? first + ' completou todas as séries.' : first + ' fez ' + fmtKg(r.load) + ' kg em todas as séries, como pedido.';
        if (last && last.pse && last.pse <= 7 && !r.bw && r.load) { sug = r.load + (last.pse === 6 ? 5 : 2.5); sugLabel = 'Achou leve · subir para ' + fmtKg(sug) + ' kg'; }
      } else if (kind === 'free') {
        verdict = 'Você não definiu carga. ' + first + ' usou até ' + fmtKg(j.max) + ' kg.';
        sug = j.max; sugLabel = 'Usar ' + fmtKg(sug) + ' kg como meta';
      }
      if (kind === 'above' && last && last.pse >= 9) verdict += ' Mas achou pesado: talvez suba aos poucos.';
      if (kind === 'below' && last && last.pse === 10) verdict += ' Disse que não deu.';
      var fl = last && last.pse ? feelOf(last.pse) : null;
      return { r: r, logs: logs, last: last, kind: kind, verdict: verdict, sug: sug, sugLabel: sugLabel,
        feel: fl ? 'Achou: ' + fl.label.toLowerCase() + ' (PSE ' + fl.n + ')' : '', feelStyle: fl ? 'font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; background: ' + fl.bg + '; color: ' + fl.color : '' };
    };

    var currentItems = fichaItems(s.student);
    var currentFicha = currentItems.map(function (it) { return it.e; });
    var openVideo = function (list, j) { return set({ video: list[j], playing: false }); };
    var openRx = function (i, it) {
      return function () {
        var r = rxOf(i, it);
        self.setState({ rxEdit: { i: i, key: it.key, tpl: it.tpl, name: it.e.name, n: String(r.n), reps: String(r.reps), load: r.load === null ? '' : fmtKg(r.load),
          bw: r.bw, each: r.each, rest: r.rest ? String(r.rest) : '', tech: r.tech, note: r.note, error: '' } });
      };
    };
    var perfCount = { above: 0, ok: 0, below: 0, undef: 0, free: 0, none: 0 };
    var exercises = currentItems.map(function (it, j) {
      var a = analyze(s.student, it);
      perfCount[a.kind] += 1;
      var i = s.student;
      return {
        name: it.e.name, rxLine: rxLine(a.r), tech: a.r.tech, hasTech: !!a.r.tech,
        rxStyle: 'font-weight: 600; color: ' + (a.kind === 'undef' ? '#FCD34D' : '#F5F5F7'),
        chip: KIND[a.kind][0], chipStyle: kchip(a.kind),
        hasLog: !!a.last, logWhen: a.last ? (a.last.live ? 'Hoje, agora há pouco' : 'Último treino · ' + a.last.date) + ' · o que o aluno fez' : '',
        logSets: a.last ? setsText(a.r, a.last) : '',
        hasFeel: !!a.feel, feel: a.feel, feelStyle: a.feelStyle,
        verdict: a.verdict, verdictStyle: 'font-size: 12px; line-height: 1.4; color: ' + KIND[a.kind === 'undef' ? 'free' : a.kind][2],
        needLoad: a.kind === 'undef',
        waiting: a.kind === 'none',
        waitText: 'Meta salva e já aparece no app ' + (studentsRaw[i].sex === 'M' ? 'do ' : 'da ') + studentsRaw[i].name.split(' ')[0] + '. Assim que ' + (studentsRaw[i].sex === 'M' ? 'ele' : 'ela') + ' fizer este exercício, a carga de cada série aparece aqui e o app diz se ficou acima, na meta ou abaixo.',
        hasSug: a.sug !== null,
        sugLabel: a.sugLabel,
        applySug: function () { setRx(i, it.key, { load: a.sug, bw: false }, 'Meta de ' + it.e.name + ' agora é ' + fmtKg(a.sug) + ' kg · aluno avisado'); },
        edit: openRx(i, it),
        video: openVideo(currentFicha, j)
      };
    });
    var perfSummary = { show: currentItems.length > 0, chips: [] };
    [['above', ' acima'], ['ok', ' na meta'], ['below', ' abaixo'], ['undef', ' sem carga definida'], ['free', ' sem meta, aluno escolheu'], ['none', ' aguardando o 1º treino']].forEach(function (p) {
      if (perfCount[p[0]]) perfSummary.chips.push({ label: perfCount[p[0]] + p[1], style: kchip(p[0]) });
    });

    // Alertas no Hoje: cargas fora da meta na última semana
    var perfAlerts = { items: [] };
    studentsRaw.forEach(function (st, i) {
      fichaItems(i).forEach(function (it) {
        var a = analyze(i, it);
        if ((a.kind === 'above' || a.kind === 'below') && a.last && (a.last.live || ['17/11', '19/11', '20/11', '21/11'].indexOf(a.last.date) >= 0) && !a.r.bw) {
          perfAlerts.items.push({
            title: st.name + ' · ' + it.e.name,
            text: (a.kind === 'above' ? 'Pegou ' + fmtKg(a.last.sets.reduce(function (m, x) { return Math.max(m, x.kg || 0); }, 0)) + ' kg' : 'Caiu para ' + fmtKg(a.last.sets.reduce(function (m, x) { return Math.min(m, x.kg === null ? m : x.kg); }, 9999)) + ' kg') + ' · meta ' + fmtKg(a.r.load) + ' kg · ' + (a.last.live ? 'hoje' : a.last.date),
            dot: 'width: 10px; height: 10px; flex: none; border-radius: 999px; background: ' + (a.kind === 'above' ? '#6EE7B7' : '#FCA5A5'),
            open: function () { self.setState({ mode: 'personal', screen: 'aluno', student: i, tab: 'ficha', sheet: null }); },
            live: !!a.last.live
          });
        }
      });
    });
    perfAlerts.items.sort(function (a, b) { return (b.live ? 1 : 0) - (a.live ? 1 : 0); });
    perfAlerts.count = perfAlerts.items.length;
    perfAlerts.items = perfAlerts.items.slice(0, 4);
    perfAlerts.show = perfAlerts.count > 0;
    perfAlerts.more = perfAlerts.count > 4 ? 'e mais ' + (perfAlerts.count - 4) + ' · toque para abrir a ficha' : 'Toque para abrir a ficha e ajustar a meta';

    // Editor da meta
    var rx = null;
    if (s.rxEdit) {
      var X = s.rxEdit;
      var upd = function (k, v) { var o = Object.assign({}, self.state.rxEdit); o[k] = v; o.error = ''; self.setState({ rxEdit: o }); };
      var inp = function (off) { return 'height: 44px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); background: ' + (off ? '#17171B' : '#0B0B0C') + '; color: ' + (off ? '#52525B' : '#F5F5F7') + '; font-size: 16px; font-weight: 600; padding: 0 10px; min-width: 0'; };
      var fld = function (k, label, mode, ph, off) { return { label: label, val: off ? '' : X[k], mode: mode, ph: off ? '—' : ph, off: !!off, style: inp(off), on: function (e) { upd(k, e.target.value); } }; };
      var itX = { key: X.key, tpl: X.tpl, e: { name: X.name } };
      var rB = Object.assign({}, rxOf(X.i, fichaItems(X.i).filter(function (q) { return q.key === X.key; })[0] || { e: { sets: '3 × 12' }, tpl: false, key: X.key }));
      var hist = logsOf(X.i, X.key).slice().reverse();
      rx = {
        who: studentsRaw[X.i].name + ' · meta do personal',
        name: X.name,
        types: [['load', 'Com carga'], ['bw', 'Sem carga / tempo']].map(function (o) {
          var on = o[0] === 'bw' ? !!X.bw : !X.bw;
          return { label: o[1], on: on, pick: function () { upd('bw', o[0] === 'bw'); },
            style: 'flex: 1; height: 38px; border-radius: 999px; font-size: 13px; font-weight: 600; ' + (on ? 'background: #2563EB; color: #FFFFFF; border: 0' : 'background: #1B1B21; color: #D4D4D8; border: 1px solid rgba(255,255,255,0.08)') };
        }),
        fields: [fld('n', 'Séries', 'numeric', 'Ex.: 4'), fld('reps', 'Repetições (ou tempo)', 'text', 'Ex.: 10, 8-12, 40 s'),
          fld('load', 'Carga meta (kg)', 'decimal', 'Ex.: 40', X.bw), fld('rest', 'Descanso (s)', 'numeric', 'Ex.: 60')],
        showEach: !X.bw, each: !!X.each,
        eachBox: 'width: 22px; height: 22px; flex: none; border-radius: 7px; display: flex; align-items: center; justify-content: center; ' + (X.each ? 'background: #2563EB' : 'border: 2px solid rgba(255,255,255,0.2)'),
        toggleEach: function () { upd('each', !self.state.rxEdit.each); },
        tech: X.tech, onTech: function (e) { upd('tech', e.target.value); },
        note: X.note, onNote: function (e) { upd('note', e.target.value); },
        hist: hist.map(function (h) {
          var k = judge(rB, h).kind; if (k === 'none') k = 'free';
          var fh = h.pse ? feelOf(h.pse) : null;
          return { date: (h.live ? 'Hoje' : h.date) + (fh ? ' · achou ' + fh.label.toLowerCase() + ' (PSE ' + fh.n + ')' : ''), sets: setsText(rB, h), chip: KIND[k][0], chipStyle: kchip(k) };
        }),
        noHist: hist.length === 0,
        canRemove: true,
        remove: function () {
          var rm = Object.assign({}, self.state.removedEx); rm[X.i] = Object.assign({}, rm[X.i] || {}); rm[X.i][X.key] = true;
          self.setState({ removedEx: rm, rxEdit: null });
          self.notify(X.name + ' removido da ficha');
        },
        hasError: !!X.error, error: X.error || '',
        save: function () {
          var E = self.state.rxEdit;
          var n = parseInt(E.n, 10);
          if (!(n >= 1 && n <= 10)) { upd('error', 'Séries entre 1 e 10.'); self.setState({ rxEdit: Object.assign({}, self.state.rxEdit, { error: 'Séries entre 1 e 10.' }) }); return; }
          if (!String(E.reps).trim()) { self.setState({ rxEdit: Object.assign({}, E, { error: 'Diga quantas repetições (ou o tempo).' }) }); return; }
          var load = null;
          if (!E.bw) {
            load = numv(E.load);
            if (!(load > 0 && load < 600)) { self.setState({ rxEdit: Object.assign({}, E, { error: 'Digite a carga meta em kg (ou escolha "Sem carga").' }) }); return; }
          }
          var rest = parseInt(E.rest, 10);
          setRx(E.i, E.key, { n: n, reps: String(E.reps).trim(), load: load, bw: !!E.bw, each: !!E.each && !E.bw, rest: rest > 0 ? rest : 0, tech: (E.tech || '').trim(), note: (E.note || '').trim() });
          self.setState({ rxEdit: null });
          self.notify('Meta salva · ' + studentsRaw[E.i].name.split(' ')[0] + ' vê no app: ' + n + ' × ' + String(E.reps).trim() + (load !== null ? ' com ' + fmtKg(load) + ' kg' : ''));
        }
      };
    }
    var norm = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
    var groups = ['Todos'].concat(Object.keys(this._lib.reduce(function (acc, l) { acc[l.group] = 1; return acc; }, {})));
    if ((s.custom || []).length) groups.push('Meus exercícios');
    var libGroup = s.libGroup || 'Todos';
    var libTerm = norm(s.libQ);
    var libFiltered = libAll.filter(function (l) {
      if (libGroup !== 'Todos' && l.group !== libGroup) return false;
      if (!libTerm) return true;
      return norm(l.name).indexOf(libTerm) >= 0 || norm(l.equip).indexOf(libTerm) >= 0 || norm(l.group).indexOf(libTerm) >= 0;
    });
    var LIMIT = 60;
    var groupChips = groups.map(function (g) {
      var on = g === libGroup;
      return {
        label: g, on: on, pick: set({ libGroup: g }),
        style: 'height: 36px; padding: 0 14px; flex: none; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; ' +
          (on ? 'background: #2563EB; color: #FFFFFF; border: 0' : 'background: #1B1B21; color: #D4D4D8; border: 1px solid rgba(255,255,255,0.08)')
      };
    });
    var library = libFiltered.slice(0, LIMIT).map(function (l) {
      var added = extraFor(s.student).indexOf(l.id) >= 0 && !(s.removedEx[s.student] || {})['x' + l.id];
      return {
        name: l.name, group: l.group, equip: l.equip, sets: l.sets, added: added, action: added ? '✓ Na ficha' : '+ Adicionar',
        actionStyle: 'font-size: 12px; font-weight: 600; white-space: nowrap; padding: 6px 10px; border-radius: 999px; ' + (added ? 'background: rgba(110,231,183,0.12); color: #6EE7B7' : 'color: #93C5FD'),
        style: 'display: flex; align-items: center; gap: 12px; background: ' + (added ? 'rgba(37,99,235,0.1)' : '#1B1B21') + '; border: ' + (added ? '1px solid rgba(59,130,246,0.35)' : '1px solid transparent') + '; border-radius: 16px; padding: 12px 14px; color: #F5F5F7; text-align: left; width: 100%',
        add: function () {
          if (added) {
            var i1 = self.state.student;
            var ex1 = Object.assign({}, self.state.extraEx);
            ex1[i1] = (ex1[i1] || []).filter(function (x) { return x !== l.id; });
            self.setState({ extraEx: ex1, libAdded: (self.state.libAdded || []).filter(function (n) { return n !== l.name; }) });
            return;
          }
          var i0 = self.state.student;
          var ex = Object.assign({}, self.state.extraEx);
          if ((ex[i0] || []).indexOf(l.id) < 0) ex[i0] = (ex[i0] || []).concat([l.id]);
          var rm = Object.assign({}, self.state.removedEx); rm[i0] = Object.assign({}, rm[i0] || {}); delete rm[i0]['x' + l.id];
          self.setState({ extraEx: ex, removedEx: rm, libAdded: (self.state.libAdded || []).concat([l.name]) });
        }
      };
    });
    var libCountLabel = libFiltered.length > LIMIT
      ? 'Mostrando ' + LIMIT + ' de ' + libFiltered.length + ' · refine a busca'
      : libFiltered.length + (libFiltered.length === 1 ? ' exercício' : ' exercícios');

    // ── Treino do aluno (Ana Clara) ──
    var anaItems = fichaItems(0);
    var anaFicha = anaItems.map(function (it) { return it.e; });
    var doneCount = 0;
    var totalKg = 0;
    var checklist = anaItems.map(function (it, j) {
      var e = it.e;
      var ck = it.key;
      var r = rxOf(0, it);
      var nSets = r.n;
      var repsT = repsTarget(r) !== null ? String(repsTarget(r)) : (isTimed(r.reps) ? '' : '');
      var base = r.bw ? 0 : (r.load || 0);
      var prevLogs = (SLOG[0] || {})[ck] || [];
      var prev = prevLogs[prevLogs.length - 1];
      var prevMax = prev ? prev.sets.reduce(function (m, x) { return Math.max(m, x.kg || 0); }, 0) : 0;
      var best = prevLogs.reduce(function (m, sx) { return Math.max(m, sx.sets.reduce(function (mm, x) { return Math.max(mm, x.kg || 0); }, 0)); }, 0);
      var setsDone = 0;
      var rows = [];
      for (var k = 0; k < nSets; k++) {
        (function (k) {
          var key = ck + '#' + k;
          var st = s.sets[key] || {};
          var kg = st.kg !== undefined ? st.kg : (base ? fmtKg(base) : '');
          var reps = st.reps !== undefined ? st.reps : repsT;
          var kgN = numv(kg);
          if (st.done) { setsDone += 1; totalKg += (kgN || 0) * (parseInt(reps, 10) || 0); }
          var upd = function (patch) {
            var all = Object.assign({}, self.state.sets);
            all[key] = Object.assign({ kg: kg, reps: reps }, all[key] || {}, patch);
            self.setState({ sets: all });
          };
          var doneNowCheck = function (kk) { var c2 = 0; for (var q = 0; q < nSets; q++) { if (q === kk || (self.state.sets[ck + '#' + q] || {}).done) c2 += 1; } return c2; };
          var diffCol = !base || kgN === null || Math.abs(kgN - base) < 0.01 ? null : kgN > base ? '#6EE7B7' : '#FCA5A5';
          rows.push({
            n: k + 1, kg: kg, reps: reps, done: !!st.done, kgOff: !!r.bw,
            onKg: function (ev) { upd({ kg: ev.target.value }); },
            onReps: function (ev) { upd({ reps: ev.target.value }); },
            check: function () {
              var nowDone = !(self.state.sets[key] || {}).done;
              upd({ done: nowDone });
              if (nowDone) {
                var used = kgN || 0;
                if (best && used > best && !self.state.prs[ck]) {
                  var p = Object.assign({}, self.state.prs); p[ck] = true;
                  self.setState({ prs: p });
                  self.notify('Novo recorde pessoal: ' + fmtKg(used) + ' kg em ' + e.name);
                } else if (base && used > base) self.notify('Acima da meta (' + fmtKg(base) + ' kg) · o Lucas vai ver');
                else if (base && used && used < base) self.notify('Abaixo da meta (' + fmtKg(base) + ' kg) · registrado para o Lucas');
                var restSec = r.rest || 60;
                if (k < nSets - 1 && doneNowCheck(k) < nSets) self.startRest(Math.min(restSec, 120));
                var doneNow = 0;
                for (var q = 0; q < nSets; q++) { if (q === k || (self.state.sets[ck + '#' + q] || {}).done) doneNow += 1; }
                if (doneNow >= nSets) { self.stopRest(); self.setState({ feelAsk: { ck: ck, j: j, step: 1 } }); }
              }
            },
            inputStyle: 'height: 42px; min-width: 0; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: ' + (st.done ? 'rgba(37,99,235,0.12)' : '#0B0B0C') + '; color: #F5F5F7; font-size: 15px; font-weight: 600; padding: 0 10px; font-family: inherit',
            kgStyle: 'height: 42px; min-width: 0; border-radius: 10px; border: ' + (diffCol ? '2px solid ' + diffCol : '1px solid rgba(255,255,255,0.12)') + '; background: ' + (r.bw ? '#17171B' : st.done ? 'rgba(37,99,235,0.12)' : '#0B0B0C') + '; color: ' + (diffCol || '#F5F5F7') + '; font-size: 15px; font-weight: 600; padding: 0 10px; font-family: inherit',
            checkStyle: 'height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; ' + (st.done ? 'background: #2563EB; color: #FFFFFF; border: 0' : 'background: transparent; color: #71717A; border: 1.5px solid rgba(255,255,255,0.2)')
          });
        })(k);
      }
      var done = setsDone === nSets;
      if (done) doneCount += 1;
      var pse = s.pse[ck];
      var suggest;
      if (!pse) suggest = '';
      else if (!base) suggest = pse <= 7 ? 'Ficou fácil? O Lucas pode aumentar as repetições ou o tempo na próxima.' : pse === 8 ? 'No ponto! Continue assim no próximo treino.' : pse === 9 ? 'Puxado, mas foi. Capriche na execução e respire bem.' : 'Não deu tudo hoje? Normal. O Lucas vai adaptar para você.';
      else if (pse <= 7) suggest = 'Ficou ' + (pse === 6 ? 'bem leve' : 'leve') + '. O Lucas recebe a sugestão de subir para ' + fmtKg(base + (pse === 6 ? 5 : 2.5)) + ' kg no próximo treino.';
      else if (pse === 8) suggest = 'No ponto! Mantenha ' + fmtKg(base) + ' kg e tente 1 repetição a mais na próxima.';
      else if (pse === 9) suggest = 'Pesado, mas foi. Mantenha ' + fmtKg(base) + ' kg e capriche na execução.';
      else suggest = 'Não deu tudo hoje? Normal. A sugestão para o próximo treino é ' + fmtKg(Math.max(base - 2.5, 0)) + ' kg.';
      // retorno do dia: comparado com a meta do personal
      var today = todaySession(0, ck);
      var jt = today ? judge(r, today) : null;
      var fb = '', fbKind = null;
      if (jt && jt.kind === 'above') { fb = 'Você pegou ' + fmtKg(jt.max) + ' kg, acima da meta de ' + fmtKg(r.load) + ' kg. O Lucas foi avisado e pode subir sua carga.'; fbKind = 'above'; }
      else if (jt && jt.kind === 'below') { fb = r.bw ? 'Faltaram repetições hoje. Tudo bem: o Lucas vai acompanhar.' : 'Abaixo da meta de ' + fmtKg(r.load) + ' kg hoje. Sem problema: o Lucas vê e ajusta se precisar.'; fbKind = 'below'; }
      else if (jt && jt.kind === 'ok') { fb = 'Na meta! Exatamente o que o Lucas pediu.'; fbKind = 'ok'; }
      else if (jt && jt.kind === 'free') { fb = 'Registrado: ' + fmtKg(jt.max) + ' kg. O Lucas vai usar isso para definir sua meta.'; fbKind = 'free'; }
      return {
        name: e.name, sets: e.sets, done: done, notDone: !done, open: s.openEx === j,
        metaLine: r.n + ' × ' + r.reps + (r.bw ? '' : r.load !== null ? ' · ' + fmtKg(r.load) + ' kg' + (r.each ? ' cada' : '') : ' · carga livre'),
        last: prevMax ? fmtKg(prevMax) + ' kg' : '—',
        metaFull: r.bw ? r.n + ' séries de ' + r.reps + ', sem carga' : r.load !== null ? r.n + ' séries de ' + r.reps + ' com ' + fmtKg(r.load) + ' kg' + (r.each ? ' em cada halter' : '') : r.n + ' séries de ' + r.reps + ' · carga ainda não definida',
        hasNote: !!r.note, note: r.note,
        setsDoneLabel: setsDone + '/' + nSets,
        pr: !!s.prs[ck], rows: rows, suggest: suggest,
        ck: ck, j: j, isLast: j === anaItems.length - 1,
        hasFeel: !!pse && done, feelLabel: pse && feelOf(pse) ? feelOf(pse).label.toLowerCase() : '',
        feelDot: 'width: 10px; height: 10px; border-radius: 999px; flex: none; background: ' + (pse && feelOf(pse) ? feelOf(pse).color : '#71717A'),
        askFeel: function () { self.setState({ feelAsk: { ck: ck, j: j, step: 1 } }); },
        finishLabel: setsDone ? 'Concluir exercício (' + setsDone + ' de ' + nSets + ' séries)' : 'Concluir exercício',
        finish: function () {
          var all = Object.assign({}, self.state.sets);
          rows.forEach(function (rw, q) { var kk = ck + '#' + q; all[kk] = Object.assign({ kg: rw.kg, reps: rw.reps }, all[kk] || {}, { done: true }); });
          self.stopRest();
          self.setState({ sets: all, feelAsk: { ck: ck, j: j, step: 1 } });
        },
        hasFb: !!fb, fb: fb, fbStyle: fbKind ? 'font-size: 12px; line-height: 1.45; font-weight: 600; border-radius: 12px; padding: 10px 12px; background: ' + KIND[fbKind][1] + '; color: ' + KIND[fbKind][2] : '',
        video: openVideo(anaFicha, j),
        expand: set({ openEx: s.openEx === j ? null : j }),
        pseChips: FEEL.map(function (f) {
          var on = pse === f.n;
          return {
            label: f.label, hint: f.hint, on: on,
            pick: function () { var x = Object.assign({}, self.state.pse); if (x[ck] === f.n) delete x[ck]; else x[ck] = f.n; self.setState({ pse: x }); },
            dot: 'width: 10px; height: 10px; border-radius: 999px; background: ' + f.color + '; opacity: ' + (on ? 1 : 0.55),
            style: 'min-width: 0; min-height: 64px; padding: 7px 3px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center; transition: background .15s ease; ' +
              (on ? 'background: ' + f.bg + '; color: #FFFFFF; border: 1.5px solid ' + f.color : 'background: #1B1B21; color: #D4D4D8; border: 1.5px solid rgba(255,255,255,0.06)')
          };
        }),
        boxStyle: 'width: 44px; height: 44px; flex: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; ' +
          (done ? 'background: #2563EB; border: 0' : 'background: transparent; border: 2px solid rgba(255,255,255,0.2)'),
        nameStyle: 'display: block; font-size: 14px; font-weight: 600; ' + (done ? 'color: #A1A1AA; text-decoration: line-through' : 'color: #F5F5F7')
      };
    });
    var pct = anaFicha.length ? Math.round((doneCount / anaFicha.length) * 100) : 0;
    var feel = {};
    if (s.feelAsk) {
      var FA = s.feelAsk;
      var cItem = checklist.filter(function (c) { return c.ck === FA.ck; })[0];
      if (cItem) {
        var picked = s.pse[FA.ck] ? feelOf(s.pse[FA.ck]) : null;
        var descs = { 6: 'Sobrou muita força, dava para pegar bem mais', 7: 'Dava para fazer umas 3 repetições a mais', 8: 'Cansou, mas sobraram 1 ou 2 repetições', 9: 'Terminei no limite, não sobrou nada', 10: 'Não consegui fazer todas as repetições' };
        var titles = { 6: 'Bem leve!', 7: 'Ficou leve', 8: 'No ponto!', 9: 'Foi pesado, mas foi!', 10: 'Tudo bem, faz parte' };
        var nextJ = FA.j + 1 < anaItems.length ? FA.j + 1 : null;
        var close = function () {
          var allDoneNow = checklist.every(function (c) { return c.done || c.ck === FA.ck; });
          self.setState({ feelAsk: null, openEx: nextJ });
          if (nextJ === null || allDoneNow) self.notify('Treino concluído! Bom trabalho.');
        };
        feel = {
          step1: FA.step === 1, step2: FA.step === 2,
          name: cItem.name, doneLine: 'Exercício concluído · ' + cItem.setsDoneLabel.split('/')[1] + ' séries',
          options: FEEL.map(function (f) {
            var on = picked && picked.n === f.n;
            return { label: f.label, desc: descs[f.n],
              dot: 'width: 14px; height: 14px; flex: none; border-radius: 999px; background: ' + f.color,
              style: 'display: flex; align-items: center; gap: 12px; width: 100%; min-height: 58px; padding: 10px 14px; border-radius: 14px; color: #F5F5F7; ' + (on ? 'background: ' + f.bg + '; border: 1.5px solid ' + f.color : 'background: #1B1B21; border: 1.5px solid rgba(255,255,255,0.06)'),
              pick: function () { var x = Object.assign({}, self.state.pse); x[FA.ck] = f.n; self.setState({ pse: x, feelAsk: { ck: FA.ck, j: FA.j, step: 2 } }); } };
          }),
          skip: close,
          title: picked ? titles[picked.n] : '',
          msg: cItem.suggest,
          tech: picked ? picked.label.toLowerCase() + ' (PSE ' + picked.n + ' de 10)' : '',
          bigDot: 'width: 56px; height: 56px; border-radius: 999px; background: ' + (picked ? picked.bg : '#1B1B21') + '; border: 3px solid ' + (picked ? picked.color : '#3F3F46'),
          nextLabel: nextJ !== null && !checklist.every(function (c) { return c.done; }) ? 'Próximo: ' + checklist[nextJ].name : 'Finalizar treino',
          next: close
        };
      }
    }

    // ── Avaliação física (por aluno) ──
    var fmt = function (n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); };
    var fmtCm = function (n) { return fmt(n).replace(',0', ''); };
    var num = function (v) { var x = parseFloat(String(v === undefined || v === null ? '' : v).replace(',', '.')); return isNaN(x) ? null : x; };
    var PER = [['pescoco', 'Pescoço'], ['ombro', 'Ombros'], ['torax', 'Tórax'], ['braco', 'Braço relaxado'], ['bracoC', 'Braço contraído'], ['antebraco', 'Antebraço'],
      ['cintura', 'Cintura'], ['abdomen', 'Abdômen'], ['quadril', 'Quadril'], ['coxa', 'Coxa'], ['panturrilha', 'Panturrilha']];
    var SITE = { peito: 'Peitoral', axilar: 'Axilar média', tri: 'Tríceps', subesc: 'Subescapular', abd: 'Abdominal', supra: 'Supra-ilíaca', coxa: 'Coxa' };
    var PROT = { p3: 'Pollock 3 dobras', p7: 'Pollock 7 dobras', none: 'Sem dobras' };
    var imcClass = function (v) { return v < 18.5 ? 'Abaixo do peso' : v < 25 ? 'Normal' : v < 30 ? 'Sobrepeso' : v < 35 ? 'Obesidade I' : v < 40 ? 'Obesidade II' : 'Obesidade III'; };
    var rcqClass = function (v, sex) {
      if (sex === 'M') return v < 0.95 ? 'Risco baixo' : v <= 1 ? 'Risco moderado' : 'Risco alto';
      return v < 0.8 ? 'Risco baixo' : v <= 0.85 ? 'Risco moderado' : 'Risco alto';
    };
    // direção boa de cada medida conforme o objetivo: 1 = subir é bom, -1 = descer é bom, 0 = neutro
    var goodDir = function (key, goal) {
      var hip = goal === 'Hipertrofia';
      if (key === 'cintura' || key === 'abdomen' || key === 'bf' || key === 'gorda' || key === 'dob' || key === 'rcq') return -1;
      if (key === 'magra') return 1;
      if (key === 'w') return hip ? 1 : (goal === 'Emagrecimento' ? -1 : 0);
      if (key === 'quadril') return hip ? 0 : -1;
      if (key === 'pescoco') return 0;
      return hip ? 1 : 0;
    };
    var diffColor = function (d, dir) {
      if (!d || Math.abs(d) < 0.05 || !dir) return '#A1A1AA';
      return (d > 0) === (dir > 0) ? '#6EE7B7' : '#FCA5A5';
    };
    var signed = function (d, cm) { if (d === null) return '—'; if (Math.abs(d) < 0.05) return '0'; return (d > 0 ? '+' : '−') + (cm ? fmtCm(Math.abs(d)) : fmt(Math.abs(d))); };
    var derive = function (st, e) {
      var hM = (e.h || st.height || 0) / 100;
      var comp = self.bodyFat(st.sex, st.age, e.prot, e.dob || {});
      var bf = comp ? comp.bf : null;
      return {
        imc: hM ? e.w / (hM * hM) : null,
        rcq: e.per && e.per.cintura && e.per.quadril ? e.per.cintura / e.per.quadril : null,
        bf: bf, sum: comp ? comp.sum : null, dens: comp ? comp.dens : null,
        gorda: bf !== null ? e.w * bf / 100 : null, magra: bf !== null ? e.w * (1 - bf / 100) : null
      };
    };
    var evalView = function (i, withPick) {
      var st = studentsRaw[i];
      var list = s.avals[i] || [];
      var n = list.length;
      var v = { none: n === 0, has: n > 0, newLabel: n ? '+ Nova avaliação' : 'Fazer 1ª avaliação', photoA: 'Foto da 1ª avaliação' };
      if (!n) return Object.assign(v, { kpis: [], chart: [], rows: [], history: [], hasChart: false, linePoints: '', areaPoints: '', weightNow: '—', weightDiff: '', measures: [] });
      var lastI = n - 1;
      var baseI = s.cmpBase[i] !== undefined && s.cmpBase[i] < lastI ? s.cmpBase[i] : 0;
      if (n === 1) baseI = 0;
      var L = list[lastI], B = list[baseI];
      var dL = derive(st, L), dB = derive(st, B);
      var same = baseI === lastI;
      var kpi = function (k, val, sub, subColor) { return { k: k, v: val, sub: sub || ' ', subStyle: 'margin: 2px 0 0; font-size: 10px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ' + (subColor || '#A1A1AA') }; };
      var dW = L.w - B.w;
      v.kpis = [
        kpi('Peso', fmt(L.w) + ' kg', same ? '1ª avaliação' : signed(dW) + ' kg', same ? null : diffColor(dW, goodDir('w', st.goal))),
        kpi('IMC', dL.imc ? fmt(dL.imc) : '—', dL.imc ? imcClass(dL.imc) : ''),
        kpi('Gordura', dL.bf !== null ? fmt(dL.bf) + '%' : '—', dL.bf !== null ? (same || dB.bf === null ? PROT[L.prot] : signed(dL.bf - dB.bf) + ' p.p.') : 'sem dobras', dL.bf !== null && !same && dB.bf !== null ? diffColor(dL.bf - dB.bf, -1) : null),
        kpi('Massa magra', dL.magra !== null ? fmt(dL.magra) + ' kg' : '—', dL.magra !== null && dB.magra !== null && !same ? signed(dL.magra - dB.magra) + ' kg' : ' ', dL.magra !== null && dB.magra !== null && !same ? diffColor(dL.magra - dB.magra, 1) : null),
        kpi('Massa gorda', dL.gorda !== null ? fmt(dL.gorda) + ' kg' : '—', dL.gorda !== null && dB.gorda !== null && !same ? signed(dL.gorda - dB.gorda) + ' kg' : ' ', dL.gorda !== null && dB.gorda !== null && !same ? diffColor(dL.gorda - dB.gorda, -1) : null),
        kpi('RCQ', dL.rcq ? dL.rcq.toFixed(2).replace('.', ',') : '—', dL.rcq ? rcqClass(dL.rcq, st.sex) : '')
      ];
      v.lastLabel = L.date + ' · ' + PROT[L.prot || 'none'];
      var dd = L.date.split('/'); var days = Math.round((new Date(2026, 10, 24) - new Date(+dd[2], +dd[1] - 1, +dd[0])) / 86400000);
      if (days > 45) v.lastLabel = L.date + ' · há ' + days + ' dias, reavaliar';
      // gráfico de peso
      var ws = list.map(function (e) { return e.w; });
      var hi = Math.max.apply(null, ws) + 0.4, lo = Math.min.apply(null, ws) - 0.4;
      v.chart = list.map(function (e, k) {
        var x = n === 1 ? 159 : Math.round(14 + k * (290 / (n - 1)));
        return { x: x, y: Math.round(12 + ((hi - e.w) / (hi - lo)) * 90), m: e.m, lbl: 'position: absolute; top: 0; left: ' + (x - 20) + 'px; width: 40px; text-align: center; font-size: 10px; color: #A1A1AA' };
      });
      v.hasChart = n >= 2;
      v.linePoints = v.chart.map(function (p) { return p.x + ',' + p.y; }).join(' ');
      v.areaPoints = v.linePoints + ' ' + v.chart[n - 1].x + ',108 ' + v.chart[0].x + ',108';
      var dAll = L.w - list[0].w;
      v.weightNow = fmt(L.w) + ' kg';
      v.weightDiff = n < 2 ? '' : signed(dAll) + ' kg desde ' + list[0].m.toLowerCase();
      v.weightDiffStyle = 'font-size: 12px; font-weight: 600; padding: 5px 10px; border-radius: 999px; white-space: nowrap; background: rgba(255,255,255,0.06); color: ' + diffColor(dAll, goodDir('w', st.goal));
      v.chartLabel = 'Peso por avaliação: de ' + fmt(list[0].w) + ' para ' + fmt(L.w) + ' kg';
      // tabela de medidas
      v.cmpLabel = same ? 'Só existe 1 avaliação' : 'Comparando ' + B.date.slice(0, 5) + ' com ' + L.date.slice(0, 5);
      v.baseCol = same ? '' : B.date.slice(0, 5);
      v.lastCol = L.date.slice(0, 5);
      var rows = [];
      var row = function (label, b, l, key, unit, cm, section) {
        var d = (b !== null && l !== null && !same) ? l - b : null;
        rows.push({
          label: label, before: same || b === null ? '' : (cm ? fmtCm(b) : fmt(b)) + (unit || ''), now: l === null ? '—' : (cm ? fmtCm(l) : fmt(l)) + (unit || ''),
          diff: same ? '' : signed(d, cm),
          rowStyle: 'display: grid; grid-template-columns: minmax(0, 1fr) 60px 60px 52px; gap: 6px; align-items: baseline; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.06)' + (section ? '; margin-top: 6px' : ''),
          labelStyle: 'font-size: 13px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap' + (section ? '; font-weight: 600' : ''),
          diffStyle: 'font-size: 12px; font-weight: 600; text-align: right; color: ' + diffColor(d, goodDir(key, st.goal))
        });
      };
      row('Peso', B.w, L.w, 'w', ' kg');
      PER.forEach(function (p) { row(p[1], B.per ? num(B.per[p[0]]) : null, L.per ? num(L.per[p[0]]) : null, p[0], '', true); });
      row('RCQ (cintura/quadril)', dB.rcq, dL.rcq, 'rcq', '');
      rows[rows.length - 1].now = dL.rcq ? dL.rcq.toFixed(2).replace('.', ',') : '—';
      rows[rows.length - 1].before = same || !dB.rcq ? '' : dB.rcq.toFixed(2).replace('.', ',');
      var dR = dB.rcq && dL.rcq ? dL.rcq - dB.rcq : null;
      rows[rows.length - 1].diff = same || dR === null ? '' : Math.abs(dR) < 0.005 ? '0' : (dR > 0 ? '+' : '−') + Math.abs(dR).toFixed(2).replace('.', ',');
      self.protSites(st.sex, L.prot).forEach(function (k, j) {
        row('Dobra ' + SITE[k].toLowerCase() + ' (mm)', B.dob && B.dob[k] !== undefined ? num(B.dob[k]) : null, num(L.dob[k]), 'dob', '', false, j === 0);
      });
      row('Soma das dobras (mm)', dB.sum, dL.sum, 'dob', '');
      row('% de gordura', dB.bf, dL.bf, 'bf', '%');
      row('Massa magra', dB.magra, dL.magra, 'magra', ' kg');
      row('Massa gorda', dB.gorda, dL.gorda, 'gorda', ' kg');
      if (L.fc) row('FC de repouso (bpm)', num(B.fc), num(L.fc), 'gorda', '', true);
      v.rows = rows;
      v.measures = rows.filter(function (r, k) { return k <= 11 || r.label === '% de gordura' || r.label === 'Massa magra'; });
      // histórico (mais recente primeiro)
      v.history = list.map(function (e, k) {
        var d = derive(st, e);
        var isBase = k === baseI && !same, isLast = k === lastI;
        return {
          date: e.date + (isLast ? ' · última' : ''),
          info: 'Peso ' + fmt(e.w) + ' kg' + (d.bf !== null ? ' · ' + fmt(d.bf) + '% gordura' : '') + ' · ' + PROT[e.prot || 'none'] + (e.obs ? ' · ' + e.obs : ''),
          tag: isLast ? 'Atual' : isBase ? 'Comparando' : 'Comparar',
          tagStyle: 'font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 999px; white-space: nowrap; ' +
            (isLast ? 'background: rgba(255,255,255,0.06); color: #A1A1AA' : isBase ? 'background: #2563EB; color: #FFFFFF' : 'background: rgba(59,130,246,0.15); color: #93C5FD'),
          style: 'display: flex; align-items: center; gap: 10px; background: #1B1B21; border: 0; border-radius: 14px; padding: 10px 12px; color: #F5F5F7; text-align: left; width: 100%',
          pick: function () {
            if (isLast) return;
            var c = Object.assign({}, self.state.cmpBase); c[i] = k; self.setState({ cmpBase: c });
          }
        };
      }).reverse();
      v.photoA = 'Foto de ' + list[0].date.slice(0, 5);
      return v;
    };
    var ev = evalView(s.student);
    var evA = evalView(0);

    // ── Formulário da nova avaliação ──
    var fm = null;
    if (s.form && s.sheet === 'aval') {
      var F = s.form;
      var fst = studentsRaw[F.i];
      var lastE = (s.avals[F.i] || [])[(s.avals[F.i] || []).length - 1];
      var field = function (group, key, label, mode, ph) {
        return { label: label, val: group ? F[group][key] : F[key], mode: mode || 'decimal', ph: ph || '',
          on: function (e) { self.setForm(group, key, e.target.value); } };
      };
      var sitesF = self.protSites(fst.sex, F.prot);
      var formEval = { w: num(F.w), h: num(F.h), per: {}, prot: F.prot, dob: F.dob };
      PER.forEach(function (p) { formEval.per[p[0]] = num(F.per[p[0]]); });
      var dF = formEval.w ? derive(Object.assign({}, fst, { height: num(F.h) || fst.height }), formEval) : null;
      fm = {
        who: fst.name + ' · ' + (fst.sex === 'M' ? 'masculino' : 'feminino') + (fst.age ? ', ' + fst.age + ' anos' : '') + ' · ' + F.date,
        hint: lastE ? 'Os campos vieram preenchidos com a última avaliação (' + lastE.date.slice(0, 5) + '). Meça de novo e altere o que mudou.' : 'Primeira avaliação. Preencha o que medir; o que ficar em branco não entra na comparação.',
        dados: [field(null, 'w', 'Peso (kg)', 'decimal', 'Ex.: 78,4'), field(null, 'h', 'Altura (cm)', 'numeric', 'Ex.: 170'),
          field(null, 'pa', 'Pressão arterial', 'text', 'Ex.: 120/80'), field(null, 'fc', 'FC de repouso (bpm)', 'numeric', 'Ex.: 70')],
        per: PER.map(function (p) { return field('per', p[0], p[1], 'decimal', lastE && lastE.per ? 'última: ' + fmtCm(lastE.per[p[0]] || 0) : 'cm'); }),
        prots: ['p3', 'p7', 'none'].map(function (k) {
          var on = F.prot === k;
          return { label: PROT[k], on: on, pick: function () { self.setForm(null, 'prot', k); },
            style: 'height: 36px; padding: 0 14px; border-radius: 999px; font-size: 12px; font-weight: 600; ' + (on ? 'background: #2563EB; color: #FFFFFF; border: 0' : 'background: #1B1B21; color: #D4D4D8; border: 1px solid rgba(255,255,255,0.08)') };
        }),
        protInfo: F.prot === 'none' ? 'Sem dobras, o % de gordura não é calculado.' : F.prot === 'p3'
          ? (fst.sex === 'M' ? 'Homem: peitoral, abdominal e coxa.' : 'Mulher: tríceps, supra-ilíaca e coxa.') + ' Fórmula de Jackson & Pollock + Siri.'
          : 'Sete pontos, mais precisa. Fórmula de Jackson & Pollock + Siri.',
        dob: sitesF.map(function (k) { return field('dob', k, SITE[k], 'decimal', lastE && lastE.dob && lastE.dob[k] ? 'última: ' + fmt(lastE.dob[k]) : 'mm'); }),
        res: [
          { k: 'IMC', v: dF && dF.imc ? fmt(dF.imc) + ' · ' + imcClass(dF.imc) : '—' },
          { k: 'Relação cintura/quadril', v: dF && dF.rcq ? dF.rcq.toFixed(2).replace('.', ',') + ' · ' + rcqClass(dF.rcq, fst.sex) : '—' },
          { k: 'Soma das dobras', v: dF && dF.sum ? fmt(dF.sum) + ' mm' : '—' },
          { k: 'Densidade corporal', v: dF && dF.dens ? dF.dens.toFixed(4).replace('.', ',') : '—' },
          { k: '% de gordura', v: dF && dF.bf !== null ? fmt(dF.bf) + '%' : '—' },
          { k: 'Massa gorda', v: dF && dF.gorda !== null ? fmt(dF.gorda) + ' kg' : '—' },
          { k: 'Massa magra', v: dF && dF.magra !== null ? fmt(dF.magra) + ' kg' : '—' }
        ],
        obs: F.obs,
        onObs: function (e) { self.setForm(null, 'obs', e.target.value); }
      };
    }
    var openAvalFor = function (i) {
      return function () {
        var st = self.state.students[i];
        var list = self.state.avals[i] || [];
        var L = list[list.length - 1];
        var str = function (x) { return x === null || x === undefined ? '' : String(x).replace('.', ','); };
        var per = {};
        PER.forEach(function (p) { per[p[0]] = L && L.per ? str(L.per[p[0]]) : ''; });
        var dob = {};
        if (L && L.dob) Object.keys(L.dob).forEach(function (k) { dob[k] = str(L.dob[k]); });
        self.setState({ sheet: 'aval', form: { i: i, date: '24/11/2026', w: L ? str(L.w) : '', h: String(st.height || ''), pa: L ? L.pa : '', fc: L ? L.fc : '',
          per: per, prot: L ? L.prot : 'p3', dob: dob, obs: '' } });
      };
    };
    var saveAval = function () {
      var F = self.state.form;
      if (!F) return;
      var w = num(F.w);
      if (!(w > 30 && w < 300)) { self.notify('Digite um peso válido'); return; }
      var h = num(F.h);
      var st = self.state.students[F.i];
      var per = {};
      PER.forEach(function (p) { var x = num(F.per[p[0]]); per[p[0]] = x && x > 5 && x < 250 ? x : null; });
      var dob = {};
      self.protSites(st.sex, F.prot).forEach(function (k) { var x = num(F.dob[k]); if (x && x > 0 && x < 80) dob[k] = x; });
      var mm = parseInt(F.date.slice(3, 5), 10);
      var e = { date: F.date, m: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][mm - 1] || 'Nov', w: w, h: h || st.height, per: per,
        prot: F.prot, dob: dob, pa: F.pa, fc: F.fc, obs: (F.obs || '').trim() };
      var av = Object.assign({}, self.state.avals);
      av[F.i] = (av[F.i] || []).concat([e]);
      var studs = self.state.students.slice();
      if (h && h > 100 && h < 230) studs[F.i] = Object.assign({}, studs[F.i], { height: h });
      var c = Object.assign({}, self.state.cmpBase); delete c[F.i];
      self.setState({ avals: av, students: studs, sheet: null, form: null, cmpBase: c, tab: 'aval' });
      self.notify('Avaliação de ' + st.name.split(' ')[0] + ' salva · comparação atualizada');
    };

    var curSt = studentsRaw[s.student];
    var payments = (curSt.isNew
      ? [{ month: 'Novembro', status: payText(s.student), kind: payKindOf(s.student) }]
      : [
        { month: 'Novembro', status: payText(s.student), kind: payKindOf(s.student) },
        { month: 'Outubro', status: 'Pago via Pix', kind: 'ok' },
        { month: 'Setembro', status: 'Pago via Pix', kind: 'ok' }
      ]).map(function (p) { return { month: p.month, status: p.status, style: chip(p.kind) }; });

    // ── Cadastro de aluno ──
    var nv = null;
    var pill = function (on, extra) {
      return 'height: 38px; padding: 0 14px; border-radius: 999px; font-size: 13px; font-weight: 600; ' + (extra || '') +
        (on ? 'background: #2563EB; color: #FFFFFF; border: 0' : 'background: #1B1B21; color: #D4D4D8; border: 1px solid rgba(255,255,255,0.08)');
    };
    if (s.novo && s.sheet === 'novo') {
      var N = s.novo;
      var nf = function (key, label, type, mode, ph) {
        return { label: label, type: type || 'text', mode: mode || 'text', ph: ph || '', val: N[key], on: function (e) { self.setNovo(key, e.target.value); } };
      };
      var choice = function (key, opts, extra) {
        return opts.map(function (o) {
          var on = N[key] === o[0];
          return { label: o[1], on: on, style: pill(on, extra), pick: function () { self.setNovo(key, o[0]); } };
        });
      };
      nv = {
        sub: N.fromAssign && s.ctx ? 'Já vai ficar agendado · ' + dayLabels[s.ctx.d][0] + ' às ' + times[s.ctx.t] : 'Cadastro feito pelo personal',
        fields: [nf('name', 'Nome completo *', 'text', 'text', 'Ex.: Maria Fernanda Silva'), nf('phone', 'WhatsApp *', 'tel', 'tel', '(87) 9 9999-9999'),
          nf('birth', 'Data de nascimento', 'text', 'numeric', 'dd/mm/aaaa'), nf('height', 'Altura (cm)', 'text', 'numeric', 'Ex.: 165')],
        sexes: choice('sex', [['F', 'Feminino'], ['M', 'Masculino']], 'flex: 1; '),
        goals: choice('goal', [['Emagrecimento', 'Emagrecimento'], ['Hipertrofia', 'Hipertrofia'], ['Condicionamento', 'Condicionamento'], ['Saúde e postura', 'Saúde e postura'], ['Reabilitação', 'Reabilitação']]),
        days: dayLabels.map(function (d, k) {
          var on = !!N.days[k];
          return { label: d[0], on: on, style: pill(on, 'padding: 0; '), pick: function () { var dd = Object.assign({}, self.state.novo.days); if (dd[k]) delete dd[k]; else dd[k] = true; self.setNovo('days', dd); } };
        }),
        modals: choice('modal', [['Presencial', 'Presencial'], ['Online', 'Consultoria online'], ['Turma', 'Turma / funcional']]),
        plans: choice('plan', [['Mensal', 'Mensal'], ['Trimestral', 'Trimestral'], ['Semestral', 'Semestral']]),
        payFields: [nf('price', 'Valor por mês (R$)', 'text', 'decimal', 'Ex.: 150'), nf('due', 'Dia do vencimento', 'text', 'numeric', 'Ex.: 10')],
        sends: [['sendApp', 'Convite do app', 'Link para o aluno instalar e ver os treinos'], ['sendAnam', 'Anamnese e PAR-Q', 'Questionário de saúde para responder pelo celular'], ['sendContrato', 'Contrato para assinar', 'Assinatura digital, com validade de 12 meses']].map(function (o) {
          var on = !!N[o[0]];
          return { label: o[1], desc: o[2], on: on, pick: function () { self.setNovo(o[0], !self.state.novo[o[0]]); },
            box: 'width: 26px; height: 26px; flex: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; ' + (on ? 'background: #2563EB; border: 0' : 'border: 2px solid rgba(255,255,255,0.2)') };
        }),
        hasError: !!N.error, error: N.error || ''
      };
    }
    var saveNovo = function () {
      var N = self.state.novo;
      var err = function (m) { self.setState({ novo: Object.assign({}, self.state.novo, { error: m }) }); };
      var name = (N.name || '').trim().replace(/\s+/g, ' ');
      var digits = (N.phone || '').replace(/\D/g, '');
      if (name.split(' ').length < 2) return err('Digite nome e sobrenome do aluno.');
      if (digits.length < 10 || digits.length > 13) return err('Digite um WhatsApp válido, com DDD.');
      if (!N.sex) return err('Escolha o sexo (é usado no cálculo do % de gordura).');
      if (!N.goal) return err('Escolha o objetivo do aluno.');
      var age = null;
      var b = (N.birth || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (N.birth && !b) return err('Data de nascimento no formato dd/mm/aaaa.');
      if (b) {
        var y = parseInt(b[3], 10), mo = parseInt(b[2], 10), d = parseInt(b[1], 10);
        age = 2026 - y - (mo > 11 || (mo === 11 && d > 24) ? 1 : 0);
        if (age < 5 || age > 100) return err('Confira a data de nascimento.');
      }
      var due = parseInt(N.due, 10);
      if (!(due >= 1 && due <= 31)) return err('Dia do vencimento entre 1 e 31.');
      var h = parseFloat(String(N.height || '').replace(',', '.'));
      var daysPref = Object.keys(N.days).sort().map(function (k) { return dayLabels[k][0]; }).join(', ');
      var price = (N.price || '').trim();
      var st = { name: name, phone: N.phone, sex: N.sex, age: age, height: h > 100 && h < 230 ? h : null, goal: N.goal, payKind: 'warn', dueDay: due,
        plan: N.plan, price: price ? 'R$ ' + price.replace('.', ',') : 'valor a definir', ficha: null, since: 'nov/2026', health: false, contract: false,
        sentAnam: !!N.sendAnam, sentContract: !!N.sendContrato, modal: N.modal, daysPref: daysPref, isNew: true, acc: { status: 'pendente', pass: null, last: null } };
      var studs = self.state.students.concat([st]);
      var idx = studs.length - 1;
      var patch = { students: studs, sheet: null, novo: null, mode: 'personal', screen: 'aluno', student: idx, tab: 'ficha', q: '' };
      var sent = [N.sendApp ? 'convite' : null, N.sendAnam ? 'anamnese' : null, N.sendContrato ? 'contrato' : null].filter(Boolean);
      var msg = name.split(' ')[0] + ' cadastrado(a)' + (sent.length ? ' · ' + sent.join(', ') + ' no WhatsApp' : '');
      if (N.fromAssign && self.state.ctx) {
        var asg = Object.assign({}, self.state.assigned);
        asg[self.state.ctx.d + '-' + self.state.ctx.t] = idx;
        patch.assigned = asg;
        msg = name.split(' ')[0] + ' cadastrado(a) e agendado(a) · ' + dayLabels[self.state.ctx.d][0] + ' às ' + times[self.state.ctx.t];
      }
      self.setState(patch);
      self.notify(msg);
    };


    // ── Marcar (aluno) ──
    var freeSlots = times.map(function (time, t) {
      var taken = who(s.day, t) !== null;
      var on = s.slot === t;
      return {
        time: time, taken: taken, on: on,
        pick: taken ? function () {} : set({ slot: t }),
        style: 'height: 46px; border-radius: 12px; font-size: 14px; font-weight: 600; ' +
          (taken ? 'background: #111114; color: #52525B; border: 0; text-decoration: line-through; cursor: default'
            : on ? 'background: #2563EB; color: #FFFFFF; border: 0'
            : 'background: transparent; color: #93C5FD; border: 1.5px solid rgba(59,130,246,0.55)')
      };
    });
    var hasSlot = s.slot !== null && who(s.day, s.slot) === null;
    var label = function (r) { return r ? dayLabels[r.d][0] + ', ' + dayLabels[r.d][1] + '/11 às ' + times[r.t] : ''; };

    // ── Navegação ──
    var navPersonal = [
      { key: 'hoje', label: 'Hoje', iHome: true, badge: !!s.request },
      { key: 'agenda', label: 'Agenda', iCal: true },
      { key: 'alunos', label: 'Alunos', iUsers: true },
      { key: 'mais', label: 'Mais', iGrid: true }
    ];
    var navAluno = [
      { key: 'inicio', label: 'Início', iHome: true },
      { key: 'treino', label: 'Treino', iDumbbell: true },
      { key: 'evolucao', label: 'Evolução', iChart: true },
      { key: 'marcar', label: 'Marcar', iCal: true },
      { key: 'premios', label: 'Prêmios', iTrophy: true }
    ];
    var activeKey = s.screen === 'aluno' ? 'alunos' : s.screen === 'habitos' ? 'inicio'
      : (['financeiro', 'automacoes', 'whatsapp', 'link', 'aulas', 'tv', 'crescer', 'seguranca'].indexOf(s.screen) >= 0) ? 'mais' : s.screen;
    var navList = s.mode === 'personal' ? navPersonal : navAluno;
    var nav = navList.map(function (n) {
      var on = activeKey === n.key;
      return {
        label: n.label, on: on, badge: !!n.badge,
        iHome: !!n.iHome, iCal: !!n.iCal, iUsers: !!n.iUsers, iMoney: !!n.iMoney, iDumbbell: !!n.iDumbbell, iChart: !!n.iChart, iSpark: !!n.iSpark, iGrid: !!n.iGrid, iDrop: !!n.iDrop, iTrophy: !!n.iTrophy,
        go: set({ screen: n.key, sheet: null, video: null }),
        style: 'position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; background: none; border: 0; padding: 8px 0; min-height: 48px; color: ' + (on ? '#3B82F6' : '#71717A')
      };
    });

    // ── Automações ──
    var autoDefs = [
      { key: 'lembrete', title: 'Lembrete do treino', when: 'Na véspera, às 19:00', preview: 'Oi, Ana Clara! Lembrete do seu treino amanhã às 07:00 com o Lucas. Responda 1 para confirmar ou 2 para remarcar.' },
      { key: 'confirma', title: 'Confirmação de horário', when: 'Quando o aluno marca pelo link', preview: 'Horário confirmado: quarta às 09:00 com o Lucas. Te espero lá!' },
      { key: 'cobranca', title: 'Cobrança com Pix', when: 'No dia do vencimento e 3 dias depois', preview: 'Oi, Bruno! Sua mensalidade vence amanhã (25/11).\nPix: lucas@studio.com.br\nQualquer dúvida é só chamar.' },
      { key: 'sumido', title: 'Aluno sumido', when: 'Após 7 dias sem treinar', preview: 'Oi, Diego! Senti sua falta essa semana. Bora voltar? Tenho horário livre quinta às 16:00.' },
      { key: 'avaliacao', title: 'Lembrete de avaliação', when: 'A cada 30 dias', preview: 'Ana Clara, já faz um mês da sua última avaliação. Vamos medir sua evolução no próximo treino?' },
      { key: 'posTreino', title: 'Pós-treino', when: '1 hora depois do treino', preview: 'Como foi o treino de hoje? Responda de 1 a 5. Sua resposta me ajuda a ajustar a ficha.' },
      { key: 'aniversario', title: 'Aniversário', when: 'No dia, às 08:00', preview: 'Parabéns, Carla! Feliz aniversário! Hoje o treino é por minha conta.' }
    ];
    var autoOnCount = 0;
    var autos = autoDefs.map(function (a) {
      var on = !!s.autos[a.key];
      if (on) autoOnCount += 1;
      var open = s.autoOpen === a.key;
      return {
        title: a.title, when: a.when, preview: a.preview, on: on, open: open,
        expand: set({ autoOpen: open ? null : a.key }),
        toggle: function () {
          var x = Object.assign({}, self.state.autos); x[a.key] = !x[a.key];
          self.setState({ autos: x });
          self.notify(a.title + (x[a.key] ? ' ligado' : ' desligado'));
        },
        track: 'width: 52px; height: 32px; flex: none; border-radius: 999px; border: 0; padding: 3px; display: flex; transition: background .2s ease; ' + (on ? 'background: #2563EB; justify-content: flex-end' : 'background: #3F3F46; justify-content: flex-start'),
        knob: 'width: 26px; height: 26px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.35)'
      };
    });

    // ── QR Code de exemplo (desenho, não é um código real) ──
    var qr = [];
    var seed = 7;
    var finder = function (x, y) { return (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); };
    for (var y = 0; y < 21; y++) {
      for (var x = 0; x < 21; x++) {
        var fill;
        if (finder(x, y)) {
          var fx = x > 13 ? x - 14 : x;
          var fy = y > 13 ? y - 14 : y;
          fill = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
        } else {
          seed = (seed * 9301 + 49297) % 233280;
          fill = seed / 233280 > 0.52;
        }
        if (fill) qr.push({ x: x, y: y });
      }
    }

    // ── Assistente IA ──
    var planRows = [
      { a: 'Agachamento goblet', b: '3 × 12' },
      { a: 'Remada com elástico', b: '3 × 12' },
      { a: 'Kettlebell swing', b: '4 × 15' },
      { a: 'Prancha abdominal', b: '3 × 30 s' },
      { a: 'Polichinelo', b: '4 × 40 s' }
    ];
    var chat = [{ who: 'ai', kind: 'hello' }].concat(s.chat).map(function (m) {
      var mine = m.who === 'me';
      var out = {
        wrap: 'display: flex; flex-direction: column; max-width: 88%; animation: kfitIn .3s ease both; align-self: ' + (mine ? 'flex-end; align-items: flex-end' : 'flex-start; align-items: flex-start'),
        bubble: 'padding: 11px 14px; font-size: 14px; line-height: 1.45; white-space: pre-line; ' + (mine ? 'background: #2563EB; color: #FFFFFF; border-radius: 18px 18px 6px 18px' : 'background: #141418; color: #F5F5F7; border-radius: 18px 18px 18px 6px'),
        text: m.text || '', hasCard: false, rows: [], hasAction: false, actionDone: false, cardTitle: '', actionLabel: '', actionStyle: '', action: function () {}
      };
      var btn = function (done) {
        return 'height: 42px; border-radius: 12px; border: 0; margin-top: 4px; font-size: 13px; font-weight: 600; ' + (done ? 'background: rgba(110,231,183,0.12); color: #6EE7B7' : 'background: #2563EB; color: #FFFFFF');
      };
      if (m.kind === 'hello') {
        out.text = 'Oi, Lucas! Eu monto treinos, encontro alunos sumidos, resumo sua semana e escrevo mensagens. Toque numa sugestão ou pergunte.';
      } else if (m.kind === 'treino') {
        out.text = 'Montei um treino funcional para iniciante com foco em emagrecimento, 45 minutos, em circuito:';
        out.hasCard = true; out.cardTitle = 'Circuito · 3 voltas'; out.rows = planRows;
        out.hasAction = true; out.actionDone = s.savedPlan;
        out.actionLabel = s.savedPlan ? 'Salvo na ficha da Carla' : 'Salvar na ficha da Carla Souza';
        out.actionStyle = btn(s.savedPlan);
        out.action = function () { self.setState({ savedPlan: true }); self.notify('Treino salvo na ficha da Carla Souza'); };
      } else if (m.kind === 'sumidos') {
        out.text = 'Dois alunos estão há mais de 7 dias sem treinar:';
        out.hasCard = true; out.cardTitle = 'Precisam de atenção';
        out.rows = [{ a: 'Diego Alves', b: '9 dias' }, { a: 'Elaine Rocha', b: '8 dias' }];
        out.hasAction = true; out.actionDone = s.sentSumidos;
        out.actionLabel = s.sentSumidos ? 'Mensagens enviadas' : 'Enviar convite no WhatsApp';
        out.actionStyle = btn(s.sentSumidos);
        out.action = function () { self.setState({ sentSumidos: true, insightDone: true }); self.notify('Convite enviado para Diego e Elaine'); };
      } else if (m.kind === 'resumo') {
        out.text = 'Resumo da sua semana:';
        out.hasCard = true; out.cardTitle = 'Semana 23 a 28/11';
        out.rows = [{ a: 'Treinos realizados', b: '31 de 34' }, { a: 'Faltas', b: '3' }, { a: 'Novos alunos', b: '1' }, { a: 'Mensalidades em aberto', b: String(pendingCount) }];
        out.text = 'Resumo da sua semana:';
      } else if (m.kind === 'mensagem') {
        out.text = 'Sugestão de post para o seu Instagram:\n\n"O verão está chegando. Últimas vagas para começar o ano já treinando. Chame no direct e garanta seu horário!"';
      } else if (m.kind === 'programa') {
        out.text = 'Criei o rascunho de um programa online para vender:';
        out.hasCard = true; out.cardTitle = 'Desafio Funcional 21 dias';
        out.rows = [{ a: 'Duração', b: '3 semanas' }, { a: 'Treinos', b: '5 por semana · 30 min' }, { a: 'Material', b: 'Peso do corpo e elástico' }, { a: 'Bônus', b: 'Grupo no WhatsApp' }];
      } else if (m.kind === 'livre') {
        out.text = 'Boa pergunta! No sistema de verdade eu respondo usando os dados dos seus alunos. Neste protótipo, teste as sugestões abaixo.';
      }
      return out;
    });
    var chipDefs = [
      { kind: 'treino', label: 'Montar treino para iniciante' },
      { kind: 'sumidos', label: 'Quem está sumido?' },
      { kind: 'resumo', label: 'Resumo da semana' },
      { kind: 'mensagem', label: 'Escrever post de vendas' }
    ];
    var chips = chipDefs.map(function (c) { return { label: c.label, ask: function () { self.ask(c.kind, c.label); } }; });

    // ── Mais ──
    var waLabel = s.wa === 'on' ? 'Conectado' : 'Desconectado · toque para conectar';
    var box = function (bg, fg) { return 'width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-family: \'Exo 2\', Inter, sans-serif; font-style: italic; font-size: 15px; font-weight: 700; background: ' + bg + '; color: ' + fg; };
    var maisItems = [
      { label: 'Minha marca', sub: s.brand.name + ' · logo, cor e link', glyph: s.brand.mono.slice(0, 2), key: 'marca', bg: s.brand.color, fg: '#FFFFFF' },
      { label: 'Financeiro', sub: pendingCount + ' mensalidades em aberto', glyph: 'R$', key: 'financeiro', bg: 'rgba(201,206,214,0.15)', fg: '#C9CED6' },
      { label: 'Automações', sub: autoOnCount + ' ligadas', glyph: 'A', key: 'automacoes', bg: 'rgba(59,130,246,0.15)', fg: '#93C5FD' },
      { label: 'WhatsApp', sub: waLabel, glyph: 'W', key: 'whatsapp', bg: 'rgba(110,231,183,0.12)', fg: '#6EE7B7', warn: s.wa !== 'on' },
      { label: 'Meu link', sub: 'Página para o aluno marcar horário', glyph: '@', key: 'link', bg: 'rgba(255,255,255,0.08)', fg: '#F5F5F7' },
      { label: 'Aulas e turmas', sub: 'Vagas, lista de espera e check-in', glyph: 'T', key: 'aulas', bg: 'rgba(59,130,246,0.15)', fg: '#93C5FD' },
      { label: 'Modo TV do studio', sub: 'Cronômetro e placar na televisão', glyph: 'TV', key: 'tv', bg: 'rgba(201,206,214,0.15)', fg: '#C9CED6' },
      { label: 'Crescer', sub: 'Risco de cancelamento, indicações e vendas', glyph: '+', key: 'crescer', bg: 'rgba(110,231,183,0.12)', fg: '#6EE7B7' },
      { label: 'Segurança e acesso', sub: 'PIN, aparelhos e login dos alunos', glyph: 'PIN', key: 'seguranca', bg: 'rgba(59,130,246,0.15)', fg: '#93C5FD' }
    ].map(function (it) {
      return {
        label: it.label, sub: it.sub, glyph: it.glyph, iconBox: box(it.bg, it.fg),
        subStyle: 'font-size: 12px; margin-top: 2px; color: ' + (it.warn ? '#C9CED6' : '#A1A1AA'),
        go: set({ screen: it.key })
      };
    });


    // ── Marca do personal (multi-tenant / white-label) ──
    var hexRgb = function (h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
    var mixHex = function (h, w, t) { var a = hexRgb(h), b = hexRgb(w); return '#' + a.map(function (v, k) { var x = Math.round(v + (b[k] - v) * t); return (x < 16 ? '0' : '') + x.toString(16); }).join(''); };
    var B = s.brand;
    var aluno = s.mode === 'aluno';
    var tc = aluno ? B.color : '#2563EB';
    var rootStyle = 'width: 390px; height: 844px; box-sizing: border-box; background: #0B0B0C; color: #F5F5F7; font-family: Inter, system-ui, sans-serif; display: flex; flex-direction: column; position: relative; overflow: hidden; ' +
      '--tc: ' + tc + '; --tc2: ' + (aluno ? mixHex(B.color, '#FFFFFF', 0.15) : '#3B82F6') + '; --tc3: ' + (aluno ? mixHex(B.color, '#000000', 0.18) : '#1D4ED8') + '; --tcL: ' + (aluno ? mixHex(B.color, '#FFFFFF', 0.55) : '#93C5FD');
    var badgeOf = function (color, shape, size) {
      var r = shape === 'round' ? '999px' : shape === 'shield' ? '10px 10px ' + Math.round(size / 2) + 'px ' + Math.round(size / 2) + 'px' : '10px';
      return 'width: ' + size + 'px; height: ' + size + 'px; flex: none; border-radius: ' + r + '; background: linear-gradient(145deg, ' + mixHex(color, '#FFFFFF', 0.12) + ', ' + mixHex(color, '#000000', 0.2) + '); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-family: \'Exo 2\', Inter, sans-serif; font-style: italic; font-weight: 900; font-size: ' + Math.round(size * 0.36) + 'px; letter-spacing: -0.02em';
    };
    var slugOf = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'meu-studio'; };
    var setBrand = function (patch) { self.setState({ brand: Object.assign({}, self.state.brand, patch) }); };
    var brandV = {
      name: B.name, slogan: B.slogan, mono: B.mono, badge: badgeOf(B.color, B.shape, 40),
      bar: 'height: 100%; width: 62%; border-radius: 999px; background: linear-gradient(90deg, ' + B.color + ', ' + mixHex(B.color, '#FFFFFF', 0.3) + ')',
      btn: 'height: 46px; border-radius: 12px; background: ' + B.color + '; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600',
      link: 'kfit.tresktecnologia.com.br/p/' + slugOf(B.name),
      onName: function (e) { setBrand({ name: e.target.value }); },
      onSlogan: function (e) { setBrand({ slogan: e.target.value }); },
      onMono: function (e) { setBrand({ mono: e.target.value.toUpperCase().slice(0, 3) }); },
      upload: function () { self.notify('No app real, você escolhe o arquivo do logo e ele aparece para os alunos'); }
    };
    var brandPresets = [
      ['Lucas Martins Personal', 'Funcional e musculação', '#2563EB', 'LM', 'round'],
      ['VEV Funcional', 'Treino funcional em grupo', '#F97316', 'VEV', 'shield'],
      ['Iron Studio', 'Força e hipertrofia', '#DC2626', 'IS', 'square'],
      ['Corpo em Movimento', 'Saúde em todas as idades', '#16A34A', 'CM', 'round'],
      ['Studio Bella Fit', 'Treino feminino', '#DB2777', 'BF', 'shield']
    ].map(function (p) {
      var on = B.name === p[0];
      return { name: p[0], mono: p[3], badge: badgeOf(p[2], p[4], 44),
        style: 'width: 92px; flex: none; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 6px; border-radius: 14px; color: #F5F5F7; ' + (on ? 'background: #1B1B21; border: 1.5px solid ' + p[2] : 'background: #141418; border: 1.5px solid transparent'),
        pick: function () { setBrand({ name: p[0], slogan: p[1], color: p[2], mono: p[3], shape: p[4] }); } };
    });
    var brandColors = [['#2563EB', 'Azul'], ['#7C3AED', 'Roxo'], ['#DB2777', 'Rosa'], ['#DC2626', 'Vermelho'], ['#F97316', 'Laranja'], ['#CA8A04', 'Dourado'], ['#16A34A', 'Verde'], ['#0891B2', 'Turquesa']].map(function (c) {
      var on = B.color.toLowerCase() === c[0].toLowerCase();
      return { label: c[1], on: on, pick: function () { setBrand({ color: c[0] }); },
        style: 'aspect-ratio: 1; border-radius: 999px; background: ' + c[0] + '; border: ' + (on ? '3px solid #FFFFFF' : '3px solid transparent') + '; box-shadow: ' + (on ? '0 0 0 2px ' + c[0] : 'none') };
    });
    var brandShapes = [['round', 'Redondo'], ['square', 'Quadrado'], ['shield', 'Escudo']].map(function (sh) {
      var on = B.shape === sh[0];
      return { label: sh[1], on: on, pick: function () { setBrand({ shape: sh[0] }); },
        style: 'width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; ' + (on ? 'background: #1B1B21; border: 1.5px solid ' + B.color : 'background: #141418; border: 1.5px solid rgba(255,255,255,0.08)'),
        inner: badgeOf(on ? B.color : '#52525B', sh[0], 24) };
    });
    var swapColors = function (str) {
      if (typeof str !== 'string' || str.indexOf(':') < 0) return str;
      return str.replace(/#2563EB/gi, 'var(--tc)').replace(/#3B82F6/gi, 'var(--tc2)').replace(/#1D4ED8/gi, 'var(--tc3)').replace(/#93C5FD/gi, 'var(--tcL)')
        .replace(/rgba\((37,\s*99,\s*235|59,\s*130,\s*246),\s*([0-9.]+)\)/g, function (m, b, a) { return 'color-mix(in srgb, var(' + (b.indexOf('37') === 0 ? '--tc' : '--tc2') + ') ' + Math.round(parseFloat(a) * 100) + '%, transparent)'; });
    };
    var deepSwap = function (v, depth) {
      if (depth > 6) return v;
      if (typeof v === 'string') return swapColors(v);
      if (Array.isArray(v)) return v.map(function (x) { return deepSwap(x, depth + 1); });
      if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) { var o = {}; Object.keys(v).forEach(function (k) { o[k] = deepSwap(v[k], depth + 1); }); return o; }
      return v;
    };
    var insightDone = s.insightDone;

    // ── Saúde ──
    var anamnese = [
      { q: 'Objetivo', a: studentsRaw[s.student].goal },
      { q: 'Lesões ou dores', a: 'Nenhuma relatada' },
      { q: 'Medicamentos', a: 'Não usa' },
      { q: 'Já treinou antes?', a: 'Sim, 6 meses' },
      { q: 'Dias disponíveis', a: studentsAll[s.student].days }
    ];
    var parq = [
      'Problema de coração diagnosticado?', 'Dor no peito ao fazer atividade?', 'Dor no peito no último mês?',
      'Tontura ou desmaio?', 'Problema ósseo ou articular?', 'Remédio para pressão ou coração?', 'Outro motivo para não treinar?'
    ].map(function (q) { return { q: q }; });

    // ── Hábitos ──
    var cups = [];
    for (var c = 0; c < 8; c++) {
      (function (c) {
        var full = c < s.water;
        cups.push({
          fill: full ? '#3B82F6' : 'transparent', label: 'Copo ' + (c + 1),
          tap: function () { self.setState({ water: self.state.water === c + 1 ? c : c + 1 }); if (c + 1 === 8) self.notify('Meta de água batida!'); },
          style: 'height: 48px; border-radius: 10px; border: 0; display: flex; align-items: center; justify-content: center; background: ' + (full ? 'rgba(59,130,246,0.15)' : '#1B1B21')
        });
      })(c);
    }
    var sleepOpts = [5, 6, 7, 8, 9].map(function (h) {
      var on = s.sleep === h;
      return { label: h + ' h', on: on, pick: set({ sleep: h }),
        style: 'height: 44px; border-radius: 10px; font-size: 13px; font-weight: 600; ' + (on ? 'background: #2563EB; color: #FFFFFF; border: 0' : 'background: #1B1B21; color: #D4D4D8; border: 1px solid rgba(255,255,255,0.08)') };
    });
    var protGoal = 110;

    // ── Conquistas ──
    var monthDone = 11 + (doneCount === anaFicha.length && anaFicha.length ? 1 : 0);
    var badgeDefs = [
      ['1º treino', true, '1'], ['5 seguidos', true, '5'], ['10 treinos', true, '10'],
      ['Madrugador', true, '06'], ['Recorde', !!Object.keys(s.prs).length || true, 'PR'], ['Hidratada', s.water >= 8, 'H2O'],
      ['30 treinos', false, '30'], ['Desafio do mês', monthDone >= 16, '16'], ['1 ano', false, '365']
    ];
    var badges = badgeDefs.map(function (b) {
      return { name: b[0], icon: b[2],
        style: 'background: #141418; border-radius: 16px; padding: 14px 8px; display: flex; flex-direction: column; align-items: center; gap: 8px; ' + (b[1] ? '' : 'opacity: 0.35'),
        iconStyle: 'width: 44px; height: 44px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-family: \'Exo 2\', Inter, sans-serif; font-style: italic; font-size: 13px; font-weight: 700; ' + (b[1] ? 'background: linear-gradient(145deg, #9AA3AF, #6B7280); color: #0B0B0C' : 'background: #1B1B21; color: #71717A; border: 1px dashed rgba(255,255,255,0.2)') };
    });
    var rankRaw = [['Carla Souza', 1240], ['Felipe Nunes', 1180], ['Ana Clara', 1090 + (doneCount * 20)], ['Bruno Lima', 980], ['Diego Alves', 720], ['Elaine Rocha', 650]];
    rankRaw.sort(function (a, b) { return b[1] - a[1]; });
    var ranking = rankRaw.map(function (r, i) {
      var me = r[0] === 'Ana Clara';
      return { pos: i + 1, name: me ? r[0] + ' (você)' : r[0], pts: r[1],
        style: 'display: flex; align-items: center; gap: 10px; padding: 10px 8px; border-radius: 10px; margin-top: 4px; ' + (me ? 'background: rgba(37,99,235,0.15)' : '') };
    });

    // ── Turmas ──
    var turmaDefs = [
      { time: '06:00', name: 'Funcional', cap: 12, people: ['Carla Souza', 'Felipe Nunes', 'Ana Clara', 'Rita Moura', 'João Pedro', 'Marina Lopes', 'Tiago Reis', 'Paula Dias'], wait: [] },
      { time: '07:00', name: 'Funcional HIIT', cap: 10, people: ['Bruno Lima', 'Elaine Rocha', 'Diego Alves', 'Lara Costa', 'Igor Melo', 'Sara Nunes', 'Caio Ramos', 'Bia Torres', 'Davi Gomes', 'Nina Alves'], wait: ['Pedro Henrique', 'Luana Silva'] },
      { time: '18:00', name: 'Funcional', cap: 12, people: ['Ana Clara', 'Carla Souza', 'Rafa Lima', 'Duda Rocha', 'Leo Costa', 'Gabi Souza', 'Vitor Melo', 'Livia Reis', 'Otto Dias', 'Iara Gomes', 'Rui Alves', 'Tais Lopes'], wait: ['Henrique Paz', 'Joana Prado', 'Mateus Lira'] },
      { time: '19:00', name: 'Mobilidade', cap: 8, people: ['Elaine Rocha', 'Marina Lopes', 'Paula Dias'], wait: [] }
    ];
    var turmas = turmaDefs.map(function (t, ti) {
      var promoted = s.promoted[ti] || 0;
      var people = t.people.concat(t.wait.slice(0, promoted));
      var wait = t.wait.slice(promoted);
      var inCount = 0;
      var peopleRows = people.map(function (n, pi) {
        var key = ti + '-' + pi;
        var isIn = !!s.checkins[key];
        if (isIn) inCount += 1;
        return { name: n, in: isIn, label: isIn ? 'Presente' : 'Check-in',
          check: function () { var x = Object.assign({}, self.state.checkins); x[key] = !x[key]; self.setState({ checkins: x }); },
          style: 'display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px; border-radius: 12px; font-size: 13px; ' + (isIn ? 'background: rgba(110,231,183,0.12); color: #6EE7B7; border: 0' : 'background: #1B1B21; color: #F5F5F7; border: 1px solid rgba(255,255,255,0.06)') };
      });
      var full = people.length >= t.cap;
      var open = s.turmaOpen === ti;
      return {
        time: t.time, name: t.name, open: open,
        info: people.length + '/' + t.cap + ' vagas' + (wait.length ? ' · ' + wait.length + ' na espera' : '') + (inCount ? ' · ' + inCount + ' presentes' : ''),
        status: full ? 'Lotada' : (t.cap - people.length) + ' vagas',
        chip: chip(full ? 'warn' : 'ok'),
        bar: 'height: 100%; background: ' + (full ? '#9AA3AF' : '#2563EB') + '; width: ' + Math.min(100, Math.round(people.length / t.cap * 100)) + '%',
        toggle: set({ turmaOpen: open ? null : ti }),
        people: peopleRows, hasWait: wait.length > 0,
        wait: wait.map(function (n, wi) {
          return { pos: wi + 1, name: n, promote: function () {
            var pr = Object.assign({}, self.state.promoted); pr[ti] = (pr[ti] || 0) + 1;
            self.setState({ promoted: pr });
            self.notify(n + ' entrou na turma e foi avisado no WhatsApp');
          } };
        })
      };
    });

    // ── Modo TV ──
    var mmss = function (sec) { sec = Math.max(0, sec); var mm = Math.floor(sec / 60); var ss = sec % 60; return (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss; };
    var tvClock, tvSub, tvModeLabel, tvColor = '#FFFFFF';
    if (s.tvMode === 'amrap') {
      var left = 12 * 60 - s.tvSec;
      tvModeLabel = 'AMRAP 12 MIN'; tvClock = mmss(left);
      tvSub = left <= 0 ? 'Tempo! Anotem as rodadas.' : 'Máximo de rodadas no tempo';
      if (left <= 10 && left > 0) tvColor = '#C9CED6';
    } else if (s.tvMode === 'emom') {
      var minute = Math.min(Math.floor(s.tvSec / 60) + 1, 10);
      tvModeLabel = 'EMOM 10 MIN'; tvClock = mmss(60 - (s.tvSec % 60));
      tvSub = s.tvSec >= 600 ? 'Fim do EMOM!' : 'Minuto ' + minute + ' de 10 · ' + (minute % 2 ? '12 kettlebell swings' : '10 burpees');
    } else {
      var cycle = s.tvSec % 30; var round = Math.min(Math.floor(s.tvSec / 30) + 1, 8);
      var work = cycle < 20;
      tvModeLabel = 'TABATA · 8 RODADAS'; tvClock = mmss(work ? 20 - cycle : 30 - cycle);
      tvSub = s.tvSec >= 240 ? 'Fim do Tabata!' : (work ? 'TRABALHO' : 'DESCANSO') + ' · rodada ' + round + ' de 8';
      tvColor = s.tvSec >= 240 ? '#FFFFFF' : (work ? '#6EE7B7' : '#93C5FD');
    }
    var wod = [{ name: 'Kettlebell swing', reps: '15' }, { name: 'Burpee', reps: '10' }, { name: 'Agachamento com salto', reps: '12' }, { name: 'Prancha com toque no ombro', reps: '20' }];
    var boardNames = ['Carla', 'Felipe', 'Ana Clara', 'Bruno'];
    var boardRaw = boardNames.map(function (n, i) { return { i: i, name: n, rounds: s.tvRounds[i] || 0 }; });
    boardRaw.sort(function (a, b) { return b.rounds - a.rounds; });
    var tvBoard = boardRaw.map(function (b, pos) {
      return { pos: pos + 1, name: b.name, rounds: b.rounds,
        add: function () { var r = Object.assign({}, self.state.tvRounds); r[b.i] = (r[b.i] || 0) + 1; self.setState({ tvRounds: r }); } };
    });
    var tvModes = [['amrap', 'AMRAP'], ['emom', 'EMOM'], ['tabata', 'Tabata']].map(function (m) {
      var on = s.tvMode === m[0];
      return { label: m[1], on: on,
        pick: function () { self.resetTv(); self.setState({ tvMode: m[0] }); },
        style: 'height: 44px; border-radius: 12px; font-size: 13px; font-weight: 600; ' + (on ? 'background: #9AA3AF; color: #0B0B0C; border: 0' : 'background: #141418; color: #D4D4D8; border: 1px solid rgba(255,255,255,0.08)') };
    });

    // ── Crescer ──
    var riskDefs = [
      { i: 3, pct: 82, level: 'Alto', kind: 'late', why: '9 dias sem treinar e mensalidade atrasada', msg: 'Oi, Diego! Senti sua falta. Que tal voltarmos quinta às 16:00? Posso parcelar a mensalidade.' },
      { i: 4, pct: 61, level: 'Médio', kind: 'warn', why: 'Frequência caiu pela metade no último mês', msg: 'Oi, Elaine! Montei uma aula de mobilidade mais leve para você. Bora?' },
      { i: 1, pct: 28, level: 'Baixo', kind: 'ok', why: 'Treina com regularidade; plano vence dia 5', msg: '' }
    ];
    var risks = riskDefs.map(function (r) {
      var sent = !!s.riskSent[r.i];
      var can = !!r.msg;
      return {
        name: studentsRaw[r.i].name, level: r.level + ' · ' + r.pct + '%', chip: chip(r.kind), why: r.why, sent: sent || !can,
        bar: 'height: 100%; width: ' + r.pct + '%; background: ' + (r.kind === 'late' ? '#FCA5A5' : r.kind === 'warn' ? '#C9CED6' : '#6EE7B7'),
        btnLabel: !can ? 'Nenhuma ação necessária' : sent ? 'Mensagem enviada' : 'Enviar mensagem pronta',
        btn: 'height: 40px; border-radius: 10px; border: 0; font-size: 12px; font-weight: 600; ' + (!can || sent ? 'background: rgba(255,255,255,0.05); color: #71717A' : 'background: #2563EB; color: #FFFFFF'),
        act: function () { if (!can) return; var x = Object.assign({}, self.state.riskSent); x[r.i] = true; self.setState({ riskSent: x }); self.notify('Enviado: "' + r.msg.slice(0, 38) + '…"'); }
      };
    });
    var programs = [
      { name: 'Desafio Verão 30 dias', info: 'Online · R$ 97,00 · 12 vendas' },
      { name: 'Funcional em casa', info: 'Online · R$ 67,00 · 5 vendas' }
    ].map(function (p) { return { name: p.name, info: p.info, open: function () { self.notify('Abrindo a página de venda de ' + p.name); } }; });

    var ve = s.video || baseEx[0];


    // ── Início do aluno ──
    var hmDone = doneCount, hmTotal = anaFicha.length;
    var allDone = hmTotal > 0 && hmDone === hmTotal;
    var ring = function (r, p, color, label, val, extra) {
      var c = 2 * Math.PI * r;
      return Object.assign({ r: r, c: c.toFixed(1), off: (c * (1 - Math.max(0, Math.min(1, p)))).toFixed(1), color: color, track: 'rgba(255,255,255,0.07)',
        dot: 'width: 10px; height: 10px; flex: none; border-radius: 999px; background: ' + color, label: label, val: val, hasAdd: false, add: function () {}, addText: '', addLabel: '' }, extra || {});
    };
    var weekDays = [['S', 23, 'done'], ['T', 24, allDone ? 'done' : 'today'], ['Q', 25, 'plan'], ['Q', 26, 'rest'], ['S', 27, 'plan'], ['S', 28, 'rest'], ['D', 29, 'rest']];
    var trainedWeek = weekDays.filter(function (d) { return d[2] === 'done'; }).length;
    var reacts = s.coachReact || null;
    var hm = {
      dateLine: 'Terça, 24 de novembro',
      hello: 'Bora, Ana!',
      streak: (5 + (allDone ? 1 : 0)) + ' seguidos',
      heroEyebrow: allDone ? 'Treino de hoje · concluído' : hmDone ? 'Treino de hoje · em andamento' : 'Treino de hoje · 07:00 com Lucas',
      heroTitle: allDone ? 'Mandou bem! Treino feito.' : fichaTitle(0),
      heroChips: (allDone ? [{ t: hmTotal + ' exercícios' }, { t: '+1 na sequência' }] : [{ t: hmTotal + ' exercícios' }, { t: '~50 min' }, { t: hmDone + ' de ' + hmTotal + ' feitos' }]),
      heroBar: 'height: 100%; border-radius: 999px; background: #FFFFFF; transition: width .5s ease; width: ' + pct + '%',
      heroBtn: allDone ? 'Ver o treino' : hmDone ? 'Continuar treino' : 'Começar treino',
      goTreino: set({ screen: 'treino' }),
      goHabitos: set({ screen: 'habitos' }),
      goInicio: set({ screen: 'inicio' }),
      goEvolucao: set({ screen: 'evolucao' }),
      goPremios: set({ screen: 'premios' }),
      weekLine: trainedWeek + ' de 4 treinos',
      week: weekDays.map(function (d) {
        var st = d[2];
        var base = 'width: 34px; height: 34px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; ';
        var sty = st === 'done' ? base + 'background: #2563EB; color: #FFFFFF'
          : st === 'today' ? base + 'border: 2px solid #3B82F6; color: #F5F5F7; box-shadow: 0 0 0 4px rgba(59,130,246,0.18)'
          : st === 'plan' ? base + 'border: 1.5px dashed rgba(255,255,255,0.3); color: #D4D4D8'
          : base + 'color: #52525B';
        return { l: d[0], n: d[1], done: st === 'done', num: st !== 'done', style: sty };
      }),
      rings: [
        ring(48, hmTotal ? hmDone / hmTotal : 0, 'var(--tc2)', 'Treino', hmDone + ' de ' + hmTotal + ' exercícios'),
        ring(35, s.water / 8, '#7DD3FC', 'Água', s.water + ' de 8 copos', { hasAdd: s.water < 8, addText: '+ copo', addLabel: 'Adicionar um copo de água', add: function () { var w = Math.min(8, self.state.water + 1); self.setState({ water: w }); if (w === 8) self.notify('Meta de água batida!'); } }),
        ring(22, s.protein / protGoal, '#C9CED6', 'Proteína', s.protein + ' de ' + protGoal + ' g', { hasAdd: s.protein < protGoal, addText: '+20 g', addLabel: 'Adicionar 20 gramas de proteína', add: function () { var v = self.state.protein + 20; self.setState({ protein: v }); if (v >= protGoal) self.notify('Meta de proteína batida!'); } })
      ],
      coachBadge: badgeOf(B.color, B.shape, 36),
      coachMsg: 'Ana, da última vez a carga do agachamento caiu na 2ª série. Hoje a meta é 4 × 10 com 60 kg: desce devagar e respira. Se não der, anota o que pegou que eu ajusto. 💪',
      reacts: [['👍', 'Combinado'], ['💪', 'Bora!'], ['💬', 'Responder']].map(function (r, i) {
        var on = reacts === i;
        return { t: r[0] + ' ' + r[1], on: on,
          style: 'flex: 1; min-width: 0; height: 38px; padding: 0 4px; white-space: nowrap; border-radius: 10px; font-size: 12px; font-weight: 600; ' + (on ? 'border: 0; background: #2563EB; color: #FFFFFF' : 'border: 1px solid rgba(255,255,255,0.12); background: none; color: #D4D4D8'),
          act: function () {
            if (i === 2) return self.notify('Abrindo a conversa com o Lucas no WhatsApp');
            self.setState({ coachReact: i }); self.notify('Lucas vai ver sua resposta');
          } };
      }),
      weightLine: evA.weightDiff || 'ver evolução',
      payStatus: 'Em dia',
      payStyle: 'font-family: \'Exo 2\', Inter, sans-serif; font-style: italic; font-size: 20px; font-weight: 700; color: #6EE7B7',
      payLine: 'Próxima: 05/12 · Pix',
      payBtn: 'Ver recibos',
      payAct: function () { self.notify('Recibos de jun a nov enviados no seu WhatsApp'); },
      challengeBar: 'display: block; height: 100%; border-radius: 999px; background: #C9CED6; width: ' + Math.min(100, Math.round(monthDone / 16 * 100)) + '%',
      challengeLine: 'Faltam ' + Math.max(0, 16 - monthDone) + ' treinos para ganhar a camiseta do studio'
    };

    return Object.assign(deepSwap(Object.assign({
      hm: hm, showInicio: s.mode === 'aluno' && s.screen === 'inicio',
      kfitLogoWrap: aluno ? 'display: none' : 'display: flex; align-items: center',
      brandV: brandV, brandPresets: brandPresets, brandColors: brandColors, brandShapes: brandShapes,
      showMarca: s.mode === 'personal' && s.screen === 'marca',
      isPersonal: s.mode === 'personal', isAlunoMode: s.mode === 'aluno',
      segPersonal: seg(s.mode === 'personal'),
      segAluno: seg(s.mode === 'aluno'),
      toPersonal: set({ mode: 'personal', screen: 'hoje', sheet: null, video: null }),
      toAluno: set({ mode: 'aluno', screen: 'inicio', sheet: null, video: null }),
      goAgenda: set({ screen: 'agenda', day: 1 }),
      goAlunos: set({ screen: 'alunos' }),
      goFinanceiro: set({ screen: 'financeiro' }),

      showHoje: s.mode === 'personal' && s.screen === 'hoje',
      showAgenda: s.mode === 'personal' && s.screen === 'agenda',
      showAlunos: s.mode === 'personal' && s.screen === 'alunos',
      showFinanceiro: s.mode === 'personal' && s.screen === 'financeiro',
      showAluno: s.mode === 'personal' && s.screen === 'aluno',
      showTreino: s.mode === 'aluno' && s.screen === 'treino',
      showEvolucao: s.mode === 'aluno' && s.screen === 'evolucao',
      showMarcar: s.mode === 'aluno' && s.screen === 'marcar',

      today: today, todayCount: todayCount, todayFree: todayFree, pendingCount: pendingCount,
      week: week, weekSlots: weekSlots,

      hasRequest: !!s.request,
      requestLabel: label(s.request),
      acceptRequest: function () {
        var r = self.state.request;
        var asg = Object.assign({}, self.state.assigned);
        asg[r.d + '-' + r.t] = 0;
        self.setState({ assigned: asg, request: null, accepted: r });
        self.notify('Horário confirmado · Ana Clara avisada no WhatsApp');
      },
      declineRequest: function () {
        self.setState({ request: null });
        self.notify('Pedido recusado · Ana Clara foi avisada');
      },

      q: s.q,
      onSearch: function (e) { self.setState({ q: e.target.value }); },
      studentsShown: studentsShown,
      noResults: studentsShown.length === 0,
      studentsLabel: total + ' ativos',

      finance: finance, paidCount: paidCount, dueCount: dueCount, lateCount: lateCount,
      paidLabel: paidCount + ' de ' + total + ' pagos',
      paidBarStyle: 'height: 100%; border-radius: 999px; background: linear-gradient(90deg, #059669, #6EE7B7); transition: width .5s ease; width: ' + Math.round((paidCount / total) * 100) + '%',

      st: studentsAll[s.student],
      fichaTitle: fichaTitle(s.student),
      anaTitle: fichaTitle(0),
      feelOpen: !!s.feelAsk && !!feel.name, feel: feel,
      perfSummary: perfSummary, perfAlerts: perfAlerts,
      sheetRx: !!s.rxEdit, rx: rx || {}, closeRx: set({ rxEdit: null }),
      fichaEmpty: currentFicha.length === 0,
      tplChips: tplKeys.map(function (k) {
        return { label: TPL[k].title, pick: function () {
          var studs = self.state.students.slice(); var i = self.state.student;
          studs[i] = Object.assign({}, studs[i], { ficha: k });
          self.setState({ students: studs });
          self.notify('Modelo "' + TPL[k].title + '" aplicado · ajuste as cargas');
        } };
      }),
      stHealth: !!curSt.health, stNoHealth: !curSt.health,
      stContract: curSt.contract ? 'Assinado pelo celular em ' + curSt.since + ' · validade de 12 meses' : 'Contrato ainda não assinado',
      healthSteps: [
        ['Convite do app', curSt.isNew ? 'Enviado' : 'Ativo', 'ok'],
        ['Anamnese e PAR-Q', curSt.sentAnam ? 'Aguardando resposta' : 'Não enviado', curSt.sentAnam ? 'warn' : 'late'],
        ['Contrato', curSt.sentContract ? 'Aguardando assinatura' : 'Não enviado', curSt.sentContract ? 'warn' : 'late']
      ].map(function (r) { return { k: r[0], v: r[1], style: 'font-weight: 600; color: ' + (r[2] === 'ok' ? '#6EE7B7' : r[2] === 'warn' ? '#C9CED6' : '#FCA5A5') }; }),
      simulateHealth: function () {
        var studs = self.state.students.slice(); var i = self.state.student;
        studs[i] = Object.assign({}, studs[i], { health: true, contract: true });
        self.setState({ students: studs });
        self.notify(studs[i].name.split(' ')[0] + ' respondeu a anamnese e assinou o contrato');
      },
      sheetNovo: s.sheet === 'novo', nv: nv, saveNovo: saveNovo,
      openNovo: function () { self.setState({ sheet: 'novo', novo: self.emptyNovo(false) }); },
      openNovoAssign: function () { self.setState({ sheet: 'novo', novo: self.emptyNovo(true) }); },
      saveScan: function () { self.setState({ sheet: null }); self.notify('Scan salvo no histórico de ' + self.state.students[self.state.student].name.split(' ')[0]); },
      whatsStudent: function () { self.notify('Abrindo conversa com ' + studentsRaw[self.state.student].name + ' no WhatsApp'); },
      isFicha: s.tab === 'ficha', isAval: s.tab === 'aval', isPag: s.tab === 'pag',
      tabFicha: set({ tab: 'ficha' }), tabAval: set({ tab: 'aval' }), tabPag: set({ tab: 'pag' }),
      tabFichaStyle: tab(s.tab === 'ficha'), tabAvalStyle: tab(s.tab === 'aval'), tabPagStyle: tab(s.tab === 'pag'),
      exercises: exercises,
      exCountLabel: currentFicha.length + ' exercícios',
      openAddEx: set({ sheet: 'addEx', libAdded: [] }),
      libHasAdded: (s.libAdded || []).length > 0,
      libAddedCount: (s.libAdded || []).length,
      libAddedNames: (s.libAdded || []).join(' · '),
      libDoneLabel: (s.libAdded || []).length ? 'Pronto, voltar para a ficha' : 'Fechar sem adicionar',
      libDoneStyle: 'width: 100%; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 15px; font-weight: 600; transition: background .2s ease; ' +
        ((s.libAdded || []).length ? 'background: #2563EB; color: #FFFFFF; border: 0; box-shadow: 0 8px 24px rgba(37,99,235,0.35)' : 'background: #1B1B21; color: #D4D4D8; border: 1px solid rgba(255,255,255,0.1)'),
      libDone: function () {
        var n = (self.state.libAdded || []).length;
        self.setState({ sheet: null, libQ: '', libAdded: [] });
        if (n) self.notify(n + (n === 1 ? ' exercício adicionado' : ' exercícios adicionados') + ' · defina as cargas na ficha');
        if (n) setTimeout(function () { try { var m = document.querySelector('main'); var btns = m.querySelectorAll('button'); var last = btns[btns.length - 1]; if (last) last.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch (e) {} }, 120);
      },
      library: library,
      groupChips: groupChips,
      libCountLabel: libCountLabel,
      libTotal: libAll.length + ' exercícios na biblioteca',
      libEmpty: libFiltered.length === 0,
      libQ: s.libQ,
      onLibQ: function (e) { self.setState({ libQ: e.target.value }); },
      customName: s.customName,
      onCustomName: function (e) { self.setState({ customName: e.target.value }); },
      addCustom: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var n = (self.state.customName || '').trim();
        if (!n) { self.notify('Digite o nome do exercício'); return; }
        var list = (self.state.custom || []).concat([n]);
        var id = 'c' + (list.length - 1);
        var ex = Object.assign({}, self.state.extraEx);
        ex[self.state.student] = (ex[self.state.student] || []).concat([id]);
        self.setState({ custom: list, customName: '', extraEx: ex, libAdded: (self.state.libAdded || []).concat([n]) });
      },

      ev: ev, evA: evA, fm: fm,
      openAval: openAvalFor(s.student), saveAval: saveAval,
      addPhoto: function () { self.notify('No app, abre a câmera para a foto de evolução'); },

      payments: payments,
      stPending: payKindOf(s.student) !== 'ok',
      chargeStudentLabel: s.charged[s.student] ? 'Cobrança enviada' : 'Enviar cobrança no WhatsApp',
      chargeStudent: function () {
        var c = Object.assign({}, self.state.charged); c[self.state.student] = true;
        self.setState({ charged: c });
        self.notify('Cobrança com Pix enviada para ' + studentsRaw[self.state.student].name);
      },

      checklist: checklist,
      doneLabel: doneCount + ' de ' + anaFicha.length + ' feitos',
      allDone: anaFicha.length > 0 && doneCount === anaFicha.length,
      someDone: doneCount > 0,
      resetTreino: function () { self.stopRest(); self.setState({ sets: {}, pse: {}, prs: {}, openEx: 0, rated: 0 }); },
      progressStyle: 'height: 100%; border-radius: 999px; background: linear-gradient(90deg, #2563EB, #3B82F6); transition: width .4s ease; width: ' + pct + '%',

      freeSlots: freeSlots,
      requestPending: !!s.request,
      requestAccepted: !!s.accepted && !s.request,
      acceptedLabel: label(s.accepted),
      confirm: function () {
        var st = self.state;
        if (st.slot === null || who(st.day, st.slot) !== null) return;
        self.setState({ request: { d: st.day, t: st.slot }, accepted: null, slot: null });
        self.notify('Pedido enviado ao Lucas');
      },
      confirmLabel: hasSlot ? 'Pedir ' + dayLabels[s.day][0] + ' às ' + times[s.slot] : 'Escolha um horário livre',
      confirmStyle: 'height: 52px; border-radius: 14px; border: 0; font-size: 15px; font-weight: 600; ' +
        (hasSlot ? 'background: #2563EB; color: #FFFFFF' : 'background: #17171B; color: #71717A'),

      nav: nav,
      navStyle: 'display: grid; grid-template-columns: repeat(' + navList.length + ', minmax(0, 1fr)); padding: 8px 12px 22px; border-top: 1px solid rgba(255,255,255,0.07); background: #0E0E10',

      sheetAssign: s.sheet === 'assign',
      assignLabel: dayLabels[ctx.d][0] + ', ' + dayLabels[ctx.d][1] + '/11 às ' + times[ctx.t],
      assignList: assignList,
      sheetAddEx: s.sheet === 'addEx',
      sheetAval: s.sheet === 'aval',
      closeSheets: set({ sheet: null, video: null, playing: false }),

      videoOpen: !!s.video,
      videoEx: ve,
      playing: s.playing, notPlaying: !s.playing,
      playLabel: s.playing ? 'Pausar vídeo' : 'Tocar vídeo',
      togglePlay: set({ playing: !s.playing }),
      videoCaption: s.playing ? 'Reproduzindo demonstração…' : 'Vídeo gravado pelo personal',

      toast: !!s.toast,
      toastText: s.toast || '',

      showIA: s.mode === 'personal' && s.screen === 'ia',
      showMais: s.mode === 'personal' && s.screen === 'mais',
      showAutomacoes: s.mode === 'personal' && s.screen === 'automacoes',
      showWhatsapp: s.mode === 'personal' && s.screen === 'whatsapp',
      showLink: s.mode === 'personal' && s.screen === 'link',
      goMais: set({ screen: 'mais' }),
      goIA: set({ screen: 'ia' }),
      goAutomacoes: set({ screen: 'automacoes' }),
      goWhatsapp: set({ screen: 'whatsapp' }),

      waOff: s.wa === 'off', waQr: s.wa === 'qr', waOn: s.wa === 'on',
      waShowQr: set({ wa: 'qr' }),
      waConnect: function () { self.setState({ wa: 'on' }); self.notify('WhatsApp conectado'); },
      waDisconnect: function () { self.setState({ wa: 'off' }); self.notify('WhatsApp desconectado'); },
      qr: qr,
      aiAgent: s.aiAgent,
      toggleAgent: function () { var v = !self.state.aiAgent; self.setState({ aiAgent: v }); self.notify('Atendimento automático ' + (v ? 'ligado' : 'desligado')); },
      agentTrack: 'width: 52px; height: 32px; flex: none; border-radius: 999px; border: 0; padding: 3px; display: flex; ' + (s.aiAgent ? 'background: #2563EB; justify-content: flex-end' : 'background: #3F3F46; justify-content: flex-start'),
      agentKnob: 'width: 26px; height: 26px; border-radius: 999px; background: #FFFFFF',

      autos: autos,
      autoSummary: s.wa === 'on' ? autoOnCount + ' automações rodando' : autoOnCount + ' automações prontas',
      autoSub: s.wa === 'on' ? 'Hoje: 5 lembretes e 2 cobranças enviados no WhatsApp' : 'Começam a enviar quando o WhatsApp estiver conectado',

      insightText: insightDone ? 'Feito! Diego e Elaine receberam um convite para voltar. Você é avisado quando responderem.' : 'Diego Alves faltou a todos os treinos dos últimos 9 dias e Elaine Rocha aos dos últimos 8. Mande um convite para voltarem com um toque.',
      insightBtn: insightDone ? 'Enviado' : 'Enviar convite',
      insightBtnStyle: 'height: 40px; padding: 0 14px; border-radius: 12px; border: 0; font-size: 13px; font-weight: 600; ' + (insightDone ? 'background: rgba(110,231,183,0.12); color: #6EE7B7' : 'background: #9AA3AF; color: #0B0B0C'),
      insightAction: function () {
        if (self.state.insightDone) return;
        self.setState({ insightDone: true, sentSumidos: true });
        self.notify('Convite enviado para Diego e Elaine no WhatsApp');
      },

      chat: chat, chips: chips, typing: s.typing,
      askText: s.askText,
      onAsk: function (e) { self.setState({ askText: e.target.value }); },
      sendAsk: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var t = (self.state.askText || '').trim();
        if (!t) return;
        var low = t.toLowerCase();
        var kind = low.indexOf('treino') >= 0 ? 'treino' : (low.indexOf('sumid') >= 0 || low.indexOf('falt') >= 0) ? 'sumidos' : low.indexOf('semana') >= 0 || low.indexOf('resumo') >= 0 ? 'resumo' : (low.indexOf('post') >= 0 || low.indexOf('instagram') >= 0) ? 'mensagem' : 'livre';
        self.ask(kind, t);
      },

      maisItems: maisItems,
      copyLink: function () { self.notify('Link copiado'); },
      previewBooking: set({ mode: 'aluno', screen: 'marcar' }),
      streak: 5,

      isSaude: s.tab === 'saude', tabSaude: set({ tab: 'saude' }), tabSaudeStyle: tab(s.tab === 'saude'),
      anamnese: anamnese, parq: parq,
      sendAnamnese: function () {
        var studs = self.state.students.slice(); var i = self.state.student;
        if (!studs[i].health) { studs[i] = Object.assign({}, studs[i], { sentAnam: true, sentContract: true }); self.setState({ students: studs }); }
        self.notify('Anamnese' + (studs[i].health ? '' : ' e contrato') + ' enviados para ' + studs[i].name.split(' ')[0] + ' no WhatsApp');
      },

      volumeLabel: totalKg ? fmtKg(totalKg) + ' kg levantados hoje.' : '',
      stars: [1, 2, 3, 4, 5].map(function (n) {
        return { label: n + ' estrelas', fill: n <= s.rated ? '#C9CED6' : 'none',
          pick: function () { self.setState({ rated: n }); self.notify('Obrigado! Sua avaliação foi enviada ao Lucas'); } };
      }),
      resting: !!s.rest,
      restClock: s.rest ? mmss(s.rest.left) : '',
      restBar: s.rest ? 'height: 100%; background: #FFFFFF; width: ' + Math.round(s.rest.left / s.rest.total * 100) + '%; transition: width 1s linear' : '',
      skipRest: function () { self.stopRest(); },
      addRest: function () { var r = self.state.rest; if (r) self.setState({ rest: { left: r.left + 15, total: r.total + 15 } }); },

      showHabitos: s.mode === 'aluno' && s.screen === 'habitos',
      showPremios: s.mode === 'aluno' && s.screen === 'premios',
      cups: cups, waterLabel: s.water + ' de 8 copos', sleepOpts: sleepOpts,
      proteinLabel: s.protein + ' de ' + protGoal + ' g',
      proteinBar: 'height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6B7280, #C9CED6); transition: width .4s ease; width: ' + Math.min(100, Math.round(s.protein / protGoal * 100)) + '%',
      addProtein: function () { var v = self.state.protein + 20; self.setState({ protein: v }); if (v >= protGoal && self.state.protein < protGoal) self.notify('Meta de proteína batida!'); },
      resetProtein: set({ protein: 0 }),
      challengeBar: 'height: 100%; border-radius: 999px; background: #FFFFFF; width: ' + Math.min(100, Math.round(monthDone / 16 * 100)) + '%',
      challengeLabel: monthDone + ' de 16 treinos',
      badges: badges, ranking: ranking,
      shareInvite: function () { self.notify('Convite com seu link enviado pelo WhatsApp'); },
      shareRetro: function () { self.notify('Imagem da retrospectiva pronta para o Instagram'); },
      muscles: [['Pernas', 16], ['Glúteos', 12], ['Core', 8], ['Costas', 9], ['Peito', 6], ['Ombros', 6], ['Braços', 4]].map(function (m) {
        return { name: m[0], sets: m[1], bar: 'height: 100%; border-radius: 999px; width: ' + Math.round(m[1] / 16 * 100) + '%; background: ' + (m[1] >= 12 ? '#2563EB' : m[1] >= 8 ? '#3B82F6' : 'rgba(59,130,246,0.5)') };
      }),

      sheetScan: s.sheet === 'scan',
      openScan: set({ sheet: 'scan', scanStep: 0 }),
      scan0: s.scanStep === 0, scan1: s.scanStep === 1, scan2: s.scanStep === 2,
      runScan: function () { self.setState({ scanStep: 1 }); self.scanTimer = setTimeout(function () { self.setState({ scanStep: 2 }); }, 1900); },
      scanResults: [
        { k: 'Gordura corporal estimada', v: '25 a 27%' },
        { k: 'Massa magra estimada', v: '57 kg' },
        { k: 'Ombros', v: 'Direito 1 cm mais alto' },
        { k: 'Cabeça', v: 'Leve projeção para frente' },
        { k: 'Simetria geral', v: '94%' }
      ],

      showAulas: s.mode === 'personal' && s.screen === 'aulas',
      showTV: s.mode === 'personal' && s.screen === 'tv',
      showCrescer: s.mode === 'personal' && s.screen === 'crescer',
      goTV: set({ screen: 'tv' }),
      turmas: turmas,
      tvClock: tvClock, tvSub: tvSub, tvModeLabel: tvModeLabel, tvColor: tvColor,
      wod: wod, tvBoard: tvBoard, tvModes: tvModes,
      tvBtn: s.tvRunning ? 'Pausar' : (s.tvSec ? 'Continuar' : 'Começar'),
      tvToggle: function () { self.toggleTv(); },
      tvReset: function () { self.resetTv(); },
      risks: risks, programs: programs,
      newProgram: function () { self.notify('Programa criado como rascunho. Complete os treinos e publique.'); },
      showSeguranca: s.mode === 'personal' && s.screen === 'seguranca'
    }, self.authView()), 0), { rootStyle: rootStyle });
  }
}
