(function () {
  'use strict';
  const activityId = 'sample-lab';
  const solutionId = 'dt-explanation-lab';
  const population = [2, 4, 8];
  let local = null, root = null, serial = 0;
  const clone = value => JSON.parse(JSON.stringify(value));
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const fraction = (a, b) => { const g = gcd(a, b); return `${a / g}/${b / g}`; };
  function identity(p) {
    return JSON.stringify({ population, statistic: 'arithmetic-mean', ordered: true, equalCardChoice: true, n: p.n, mechanism: p.mechanism, event: 'mean>=threshold', threshold: p.threshold });
  }
  function enumerate(p) {
    const paths = [];
    population.forEach((a, i) => {
      if (p.n === 1) paths.push({ values: [a], mean: a });
      else population.forEach((b, j) => { if (p.mechanism === 'with' || i !== j) paths.push({ values: [a, b], mean: (a + b) / 2 }); });
    });
    const groups = [];
    [...new Set(paths.map(x => x.mean))].sort((a, b) => a - b).forEach(value => {
      const members = paths.filter(x => x.mean === value);
      groups.push({ value, count: members.length, paths: members.map(x => x.values) });
    });
    const eventCount = paths.filter(x => x.mean >= p.threshold).length;
    const singleCount = population.filter(x => x >= p.threshold).length;
    const difference = eventCount * population.length - singleCount * paths.length;
    return { paths, groups, eventCount, singleCount, total: paths.length, relation: difference < 0 ? 'less' : difference > 0 ? 'greater' : 'equal' };
  }
  function condition(p) { return `总体为 2、4、8 分钟；n=${p.n}；${p.mechanism === 'with' ? '有放回' : '无放回'}；事件为样本均值≥${p.threshold} 分钟`; }
  const relationText = relation => ({ less: '小于', equal: '等于', greater: '大于' }[relation]);
  function comparisonText(p) {
    const r = enumerate(p);
    return `当前${condition(p)}。P(样本均值≥${p.threshold})=${fraction(r.eventCount, r.total)}，${relationText(r.relation)}单卡概率 P(X≥${p.threshold})=${fraction(r.singleCount, 3)}。`;
  }
  function predictionText(s) {
    if (!s.prediction) return '本轮未提交预测；这里记录的是直接查看结果，没有推断你的原想法。';
    const r = enumerate(s.parameters);
    const contact = s.predictionHadReference ? '提交前已查看覆盖本实验全部条件的全解' : s.predictionHadResult ? '提交前已见同条件结果' : '提交前尚无本实验参考或同条件结果接触记录';
    return `原预测：${relationText(s.prediction)}；${s.prediction === r.relation ? '与本轮精确枚举一致' : `与本轮结果不一致，枚举给出“${relationText(r.relation)}”`}。${contact}。这是一条未评分的探索判断。`;
  }
  window.R3Sampling = Object.freeze({ enumerate, identity, condition, fraction, comparisonText, predictionText });
  function empty(p) {
    return { version: 1, roundId: null, phase: 'draft', parameters: p || { n: 2, mechanism: 'with', threshold: 5 }, predictionDraft: '', prediction: null, predictionAt: null, predictionHadReference: false, predictionHadResult: false, revealedAt: null, revealHadReference: false, selectedPath: null, pathSelections: [], history: [], resultContacts: [], referenceViewed: false, lastAction: null };
  }
  function normalize(value) {
    const base = empty();
    if (!value || value.version !== 1) return base;
    const p = value.parameters || {};
    const s = Object.assign(base, clone(value));
    s.parameters = { n: p.n === 1 ? 1 : 2, mechanism: p.mechanism === 'without' ? 'without' : 'with', threshold: [5, 6, 8].includes(p.threshold) ? p.threshold : 5 };
    s.history = Array.isArray(s.history) ? s.history : [];
    s.resultContacts = Array.isArray(s.resultContacts) ? s.resultContacts : [];
    s.pathSelections = Array.isArray(s.pathSelections) ? s.pathSelections : [];
    if (!['draft', 'frozen', 'revealed'].includes(s.phase)) s.phase = 'draft';
    return s;
  }
  function runtimeState() { return window.DialogueTutor.instance.getState().activities[activityId]; }
  function hasReference() {
    const panel = document.getElementById(solutionId), saved = runtimeState();
    return Boolean((local && local.referenceViewed) || (saved.exposure && saved.exposure.reference) || (panel && panel.open));
  }
  function sameResultContact(s) { return s.resultContacts.some(x => x.identity === identity(s.parameters)); }
  function snapshot(s) {
    return { roundId: s.roundId, parameters: clone(s.parameters), phase: s.phase, prediction: s.prediction, predictionAt: s.predictionAt, predictionHadReference: s.predictionHadReference, predictionHadResult: s.predictionHadResult, revealedAt: s.revealedAt, revealHadReference: Boolean(s.revealHadReference), selectedPath: s.selectedPath, pathSelections: clone(s.pathSelections) };
  }
  function mergeHistory(records) {
    const byId = new Map();
    records.filter(x => x && x.roundId && (x.predictionAt || x.revealedAt)).forEach(x => {
      const old = byId.get(x.roundId);
      if (!old) { byId.set(x.roundId, clone(x)); return; }
      // The frozen prediction fields always come from the original submission.
      const prediction = old.predictionAt ? old : x;
      const revealed = old.revealedAt ? old : x;
      const merged = Object.assign({}, old, clone(x));
      ['prediction', 'predictionAt', 'predictionHadReference', 'predictionHadResult'].forEach(k => { merged[k] = prediction[k]; });
      merged.revealedAt = revealed.revealedAt || null;
      merged.revealHadReference = Boolean(revealed.revealHadReference);
      merged.phase = merged.revealedAt ? 'revealed' : merged.predictionAt ? 'frozen' : 'draft';
      const selections = [...(old.pathSelections || []), ...(x.pathSelections || [])];
      merged.pathSelections = [...new Map(selections.map(y => [y.eventId, y])).values()];
      byId.set(x.roundId, merged);
    });
    return [...byId.values()].sort((a, b) => (a.predictionAt || a.revealedAt) - (b.predictionAt || b.revealedAt));
  }
  function mergeContacts(records) {
    const map = new Map();
    records.filter(x => x && typeof x.identity === 'string' && Number.isFinite(x.at)).forEach(x => {
      const old = map.get(x.identity);
      if (!old || x.at < old.at) map.set(x.identity, clone(x));
    });
    return [...map.values()];
  }
  function persistRestore() {
    local.referenceViewed = hasReference();
    window.DialogueTutor.instance.restoreExploration(activityId, clone(local));
  }
  function restore(value) {
    const old = local, incoming = normalize(value);
    const records = [...incoming.history];
    if (old) records.push(...old.history, snapshot(old));
    incoming.history = mergeHistory(records);
    incoming.resultContacts = mergeContacts([...incoming.resultContacts, ...(old ? old.resultContacts : [])]);
    incoming.referenceViewed = Boolean(incoming.referenceViewed || (old && old.referenceViewed));
    // An imported draft can be resumed, but it cannot overwrite a submission
    // that already occurred in this page under the same round identity.
    if (!incoming.predictionAt && !incoming.revealedAt && incoming.history.some(x => x.roundId === incoming.roundId)) incoming.roundId = null;
    // If the imported round already has a frozen prediction, keep that original
    // snapshot; later reference contact is stored separately from it.
    local = incoming;
    persistRestore();
    render();
  }
  function act(kind) {
    if (!local.roundId) local.roundId = `round-${Date.now()}-${++serial}`;
    local.referenceViewed = hasReference();
    local.lastAction = { type: kind, at: Date.now() };
    document.dispatchEvent(new CustomEvent('dt:exploration', { detail: { activityId, state: clone(local) } }));
    render();
  }
  function newRound(p, kind) {
    const old = local;
    local = empty(clone(p));
    local.history = mergeHistory([...old.history, snapshot(old)]);
    local.resultContacts = clone(old.resultContacts);
    local.referenceViewed = old.referenceViewed;
    act(kind);
  }
  function reveal() {
    if (local.phase === 'revealed') return;
    local.revealHadReference = hasReference();
    local.revealedAt = Date.now();
    local.phase = 'revealed';
    local.resultContacts = mergeContacts([...local.resultContacts, { identity: identity(local.parameters), at: local.revealedAt, source: 'exact-enumeration-reveal' }]);
    act('reveal-exact-enumeration');
  }
  const $ = selector => root.querySelector(selector);
  function node(tag, text) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; return el; }
  function render() {
    if (!root || !local) return;
    $('#r3-n').value = String(local.parameters.n);
    $('#r3-mechanism').value = local.parameters.mechanism;
    $('#r3-threshold').value = String(local.parameters.threshold);
    $('#r3-condition').textContent = condition(local.parameters) + '。改变任一条件会保存旧轮次并开始新判断。';
    root.querySelectorAll('input[name="r3-prediction"]').forEach(radio => { radio.checked = radio.value === (local.prediction || local.predictionDraft); radio.disabled = local.phase !== 'draft'; });
    $('#r3-freeze').hidden = local.phase !== 'draft';
    $('#r3-freeze').disabled = !local.predictionDraft;
    $('#r3-direct').hidden = local.phase !== 'draft';
    $('#r3-reveal').hidden = local.phase !== 'frozen';
    $('#r3-results').hidden = local.phase !== 'revealed';
    $('#r3-status').textContent = local.phase === 'draft' ? '本轮结果尚未揭示。先选择，再保存预测；也可以直接观察。' : local.phase === 'frozen' ? `预测已保存并锁定：“${relationText(local.prediction)}”。现在可以揭示枚举，原判断不会被后续结果改写。` : '已揭示本轮全部可能样本。下面的路径与分布对应同一组条件。';
    const contact = [];
    if (local.referenceViewed) contact.push('目前已查看本实验全解（覆盖全部允许条件）');
    if (sameResultContact(local)) contact.push('目前已有同条件结果接触记录');
    $('#r3-contact').textContent = contact.length ? contact.join('；') + '。新的预测会保留相应接触身份。' : '目前没有本实验全解或同条件结果接触记录。';
    if (local.phase === 'revealed') renderResults();
    const hist = $('#r3-history'); hist.replaceChildren();
    const history = mergeHistory([...local.history, snapshot(local)]);
    if (!history.length) hist.append(node('p', '尚无已提交预测或已揭示的轮次。'));
    history.forEach((round, i) => {
      const p = node('p');
      p.textContent = `轮次 ${i + 1}：${condition(round.parameters)}。${round.prediction ? `原预测为“${relationText(round.prediction)}”，提交时间 ${new Date(round.predictionAt).toISOString()}；提交前全解接触：${round.predictionHadReference ? '有' : '无'}，同条件结果接触：${round.predictionHadResult ? '有' : '无'}` : '未提交预测'}。${round.revealedAt ? '已查看结果' : '尚未揭示结果'}。`;
      hist.append(p);
    });
  }
  function renderResults() {
    const p = local.parameters, result = enumerate(p);
    let reason = '';
    if (result.relation === 'equal') reason = p.n === 1 ? 'n=1 时样本均值就是单张卡值，所以两事件相同。' : '两个事件虽不是同一组样本，但合并后的概率恰好相同；相等不代表所有统计量都与总体同分布。';
    else reason = '检查下表达到门槛的均值行，把这些行的概率相加，再与单卡中达到门槛的卡数除以3比较。';
    $('#r3-comparison').textContent = comparisonText(p) + reason;
    $('#r3-prediction-response').textContent = predictionText(local);
    const select = $('#r3-path-select'); select.replaceChildren();
    result.paths.forEach((path, i) => { const option = node('option', `路径 ${i + 1}：(${path.values.join(', ')})`); option.value = String(i); select.append(option); });
    const index = Number.isInteger(local.selectedPath) && result.paths[local.selectedPath] ? local.selectedPath : 0;
    select.value = String(index);
    const path = result.paths[index];
    $('#r3-path-view').textContent = `${local.selectedPath === null ? '默认展示路径（未记为你主动选择）：' : '当前选择路径：'}(${path.values.join(', ')}) → 均值=(${path.values.join('+')})/${p.n}=${path.mean} 分钟；这条有序路径的概率=${fraction(1, result.total)}。`;
    const table = node('table');
    table.append(node('caption', `全部 ${result.total} 条有序样本路径，每条等概率；相同均值合并。`));
    const head = node('tr'); ['均值（分钟）', '产生它的样本路径', '路径数／总数'].forEach(text => { const th = node('th', text); th.scope = 'col'; head.append(th); });
    const thead = node('thead'); thead.append(head); table.append(thead);
    const tbody = node('tbody');
    result.groups.forEach(group => { const tr = node('tr'); tr.append(node('td', group.value), node('td', group.paths.map(path => `(${path.join(', ')})`).join('、')), node('td', `${group.count}/${result.total} = ${fraction(group.count, result.total)}`)); tbody.append(tr); });
    table.append(tbody); $('#r3-path-table').replaceChildren(table);
    const distribution = $('#r3-distribution'); distribution.replaceChildren();
    result.groups.forEach(group => {
      const row = node('div'); row.className = 'r3-bar-row';
      const label = node('span', `${group.value} 分`), track = node('div'), bar = node('div'), prob = node('span', fraction(group.count, result.total));
      track.className = 'r3-track'; bar.className = 'r3-bar'; bar.style.width = `${100 * group.count / result.total}%`;
      track.setAttribute('aria-hidden', 'true'); track.append(bar); row.append(label, track, prob); distribution.append(row);
    });
    $('#r3-total').textContent = `总概率=(${result.groups.map(g => g.count).join('+')})/${result.total}=1。${p.n === 2 ? p.mechanism === 'with' ? '每次放回且重新等概率抽取，两次独立；每条有序路径的概率为(1/3)×(1/3)=1/9。' : '第二次在剩余2张中等概率抽取，与第一次不独立；每条允许路径的概率为(1/3)×(1/2)=1/6。' : '只抽1张，每条路径概率为1/3；此时放回机制不影响结果。'}`;
    $('#r3-switch').textContent = p.mechanism === 'with' ? '改为无放回再验证' : '改为有放回再验证';
  }
  function bind() {
    if (root) return;
    root = document.getElementById('r3-lab-root');
    if (!root) return;
    root.querySelectorAll('input[name="r3-prediction"]').forEach(radio => radio.addEventListener('change', () => { if (local.phase === 'draft') { local.predictionDraft = radio.value; act('prediction-draft'); } }));
    ['#r3-n', '#r3-mechanism', '#r3-threshold'].forEach(selector => $(selector).addEventListener('change', () => newRound({ n: Number($('#r3-n').value), mechanism: $('#r3-mechanism').value, threshold: Number($('#r3-threshold').value) }, 'change-conditions')));
    $('#r3-freeze').addEventListener('click', () => {
      if (local.phase !== 'draft' || !local.predictionDraft) return;
      local.prediction = local.predictionDraft;
      local.predictionAt = Date.now();
      local.predictionHadReference = hasReference();
      local.predictionHadResult = sameResultContact(local);
      local.phase = 'frozen';
      act('submit-ungraded-prediction');
    });
    $('#r3-direct').addEventListener('click', reveal);
    $('#r3-reveal').addEventListener('click', reveal);
    $('#r3-new').addEventListener('click', () => newRound(local.parameters, 'start-new-round'));
    $('#r3-switch').addEventListener('click', () => newRound(Object.assign({}, local.parameters, { mechanism: local.parameters.mechanism === 'with' ? 'without' : 'with' }), 'change-mechanism'));
    $('#r3-path-select').addEventListener('change', () => {
      if (local.phase !== 'revealed') return;
      local.selectedPath = Number($('#r3-path-select').value);
      local.pathSelections.push({ eventId: `path-${Date.now()}-${++serial}`, index: local.selectedPath, values: enumerate(local.parameters).paths[local.selectedPath].values, at: Date.now() });
      act('select-enumerated-path');
    });
    $('#r3-completion').addEventListener('click', () => window.DialogueTutor.instance.navigate('distribution-completion'));
    document.getElementById(solutionId).addEventListener('toggle', () => { if (local && document.getElementById(solutionId).open) { persistRestore(); render(); } });
  }
  ['dt:activity-mounted', 'dt:restore'].forEach(name => document.addEventListener(name, event => {
    if (!event.detail || event.detail.activityId !== activityId) return;
    bind(); restore(event.detail.state);
  }));
  document.addEventListener('dt:navigate', event => {
    if (root && event.detail && event.detail.activityId === activityId) { persistRestore(); render(); }
  });
})();
