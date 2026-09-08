(function () {
  'use strict';
  const id = 'sampling-lab';
  const solutionId = 'dt-explanation-opening-scene';
  const labels = ['A', 'B', 'C'];
  const values = [1, 3, 5];
  const names = { equal: '两者一样常见', centre: '均值3更常见', edge: '均值1更常见' };
  let state;
  let observer;
  const copy = value => JSON.parse(JSON.stringify(value));
  const root = () => document.querySelector('#dt-activity-' + id + ' .sampling-lab');
  const initial = () => ({ version: 1, phase: 'draft', parameters: { n: 2, replacement: true }, predictionDraft: '', prediction: null, predictionAt: null, predictionHadReference: false, revealedAt: null, referenceViewed: false, referenceAt: null, supportViewed: false, history: [], simulation: { B: 0, counts: {}, last: null }, selectedPath: 0 });
  function normalize(raw) {
    const next = Object.assign(initial(), raw || {});
    next.parameters = Object.assign({ n: 2, replacement: true }, next.parameters || {});
    if (![1, 2, 3].includes(next.parameters.n)) next.parameters.n = 2;
    next.parameters.replacement = next.parameters.replacement !== false;
    if (!['draft', 'frozen', 'revealed'].includes(next.phase)) next.phase = 'draft';
    if (!Object.prototype.hasOwnProperty.call(names, next.predictionDraft)) next.predictionDraft = '';
    if (next.prediction !== null && !Object.prototype.hasOwnProperty.call(names, next.prediction)) next.prediction = null;
    if (!Array.isArray(next.history)) next.history = [];
    next.simulation = Object.assign({ B: 0, counts: {}, last: null }, next.simulation || {});
    return next;
  }
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  function fraction(a, b) { const d = gcd(Math.abs(a), b); return b / d === 1 ? String(a / d) : (a / d) + '/' + (b / d); }
  function model(parameters) {
    const paths = [];
    function visit(sample) {
      if (sample.length === parameters.n) {
        const sum = sample.reduce((total, i) => total + values[i], 0);
        paths.push({ sample: sample.slice(), sum: sum, key: String(sum), value: sum / parameters.n });
        return;
      }
      values.forEach((_, i) => { if (parameters.replacement || !sample.includes(i)) visit(sample.concat(i)); });
    }
    visit([]);
    const groups = {};
    paths.forEach(path => { groups[path.key] = (groups[path.key] || 0) + 1; });
    const total = paths.length;
    const centre = groups[String(3 * parameters.n)] || 0;
    const edge = groups[String(parameters.n)] || 0;
    return { paths: paths, groups: groups, total: total, centre: centre, edge: edge, truth: centre === edge ? 'equal' : centre > edge ? 'centre' : 'edge' };
  }
  function parameterText(p) { return '每份 n=' + p.n + '；' + (p.replacement ? '有放回，各次独立均匀抽取' : '无放回，每次从剩余服务点均匀抽取'); }
  function setText(r, selector, value) { const node = r.querySelector(selector); if (node) node.textContent = value; }
  function persist() {
    document.dispatchEvent(new CustomEvent('dt:exploration', { detail: { activityId: id, state: copy(state) } }));
  }
  function newRound() {
    const old = copy(state);
    const history = old.history.slice();
    if (old.predictionAt || old.revealedAt) {
      delete old.history;
      history.push(old);
    }
    state = initial();
    state.parameters = old.parameters;
    state.history = history;
    state.referenceViewed = !!old.referenceViewed;
    state.referenceAt = old.referenceAt;
    state.supportViewed = !!old.supportViewed;
    persist();
  }
  function svgElement(name, attrs, text) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs || {}).forEach(([key, val]) => node.setAttribute(key, String(val)));
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function drawChart(r, data) {
    const host = r.querySelector('.lab-chart');
    host.replaceChildren();
    const width = Math.max(240, Math.round(host.clientWidth || 600));
    const height = 240, left = 38, right = 14, top = 18, bottom = 52;
    const svg = svgElement('svg', { viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': '理论抽样分布：横轴样本均值（分钟），纵轴概率；精确概率在下方表格中。' });
    svg.style.width = '100%';
    svg.style.display = 'block';
    const sums = Object.keys(data.groups).map(Number).sort((a, b) => a - b);
    const max = Math.max(...Object.values(data.groups)) / data.total;
    const yMax = max > 0.55 ? 1 : 0.6;
    const plotHeight = height - top - bottom;
    const y = p => height - bottom - p / yMax * plotHeight;
    [0, yMax / 2, yMax].forEach(p => {
      svg.appendChild(svgElement('line', { x1: left, y1: y(p), x2: width - right, y2: y(p), stroke: 'var(--dt-control-line)', 'stroke-width': 1, 'stroke-dasharray': p ? '3 5' : 'none' }));
      svg.appendChild(svgElement('text', { x: left - 7, y: y(p) + 5, 'text-anchor': 'end', fill: 'var(--dt-ink)', 'font-size': 16 }, p.toFixed(1)));
    });
    const band = (width - left - right) / sums.length;
    sums.forEach((sum, index) => {
      const p = data.groups[String(sum)] / data.total;
      const cx = left + band * (index + 0.5), barWidth = Math.max(8, band * 0.58);
      const selected = data.paths[Math.min(state.selectedPath || 0, data.paths.length - 1)];
      const highlighted = selected && Number(selected.key) === sum;
      svg.appendChild(svgElement('rect', { x: cx - barWidth / 2, y: y(p), width: barWidth, height: height - bottom - y(p), fill: highlighted ? 'var(--dt-parameter-a)' : 'var(--dt-plot-function)', stroke: 'var(--dt-ink)', 'stroke-width': highlighted ? 2 : 0 }));
      svg.appendChild(svgElement('text', { x: cx, y: height - bottom + 25, 'text-anchor': 'middle', fill: 'var(--dt-ink)', 'font-size': 16 }, fraction(sum, state.parameters.n)));
    });
    svg.appendChild(svgElement('text', { x: width / 2, y: height - 7, 'text-anchor': 'middle', fill: 'var(--dt-ink)', 'font-size': 16 }, '样本均值 / 分钟'));
    host.appendChild(svg);
  }
  function render() {
    const r = root();
    if (!r || !state) return;
    const data = model(state.parameters), frozen = state.phase !== 'draft', revealed = state.phase === 'revealed';
    r.querySelector('[data-lab-n]').value = String(state.parameters.n);
    r.querySelector('[data-lab-replacement]').value = state.parameters.replacement ? 'yes' : 'no';
    r.querySelector('[data-lab-n]').disabled = frozen;
    r.querySelector('[data-lab-replacement]').disabled = frozen;
    r.querySelector('[data-lab-prediction]').value = state.predictionDraft;
    r.querySelector('[data-lab-prediction]').disabled = frozen;
    r.querySelector('[data-lab-freeze]').disabled = frozen || !state.predictionDraft;
    r.querySelector('[data-lab-freeze]').hidden = frozen;
    r.querySelector('[data-lab-skip]').hidden = frozen;
    r.querySelector('[data-lab-reveal]').hidden = state.phase !== 'frozen';
    r.querySelector('[data-lab-reset]').hidden = !frozen;
    r.querySelector('[data-lab-results]').hidden = !revealed;
    setText(r, '[data-lab-current]', parameterText(state.parameters));
    setText(r, '[data-lab-reference]', state.referenceViewed ? '已查看本实验完整参考；后续判断保留参考接触记录。' : '实验结果尚由你的操作揭示；也可随时主动查阅完整讲解。');
    setText(r, '[data-lab-phase]', state.phase === 'draft' ? '先选一个判断，再冻结预测。没有把握时可以直接观察。' : state.phase === 'frozen' ? '预测已冻结：' + names[state.prediction] + '。现在用枚举检查。' : state.prediction ? '本轮原预测：' + names[state.prediction] + '（已保留，不能改写）。' : '本轮未提交预测，直接观察；没有“原来以为”的记录。');
    const history = r.querySelector('[data-lab-history]');
    history.replaceChildren();
    state.history.forEach((record, i) => {
      const p = document.createElement('p');
      p.textContent = '第' + (i + 1) + '轮：' + parameterText(record.parameters) + '；' + (record.prediction ? '原预测：' + names[record.prediction] : '未预测直接观察') + '；' + (record.revealedAt ? '已揭示' : '未揭示') + (record.referenceViewed ? '；已接触参考' : '') + '。';
      history.appendChild(p);
    });
    if (!state.history.length) setText(r, '[data-lab-history]', '还没有结束的轮次。新一轮会保留已提交的预测和条件。');
    if (!revealed) {
      r.querySelector('.lab-chart').replaceChildren();
      r.querySelector('[data-lab-table]').replaceChildren();
      return;
    }
    const base = '枚举得到 P(均值=3)=' + fraction(data.centre, data.total) + '，P(均值=1)=' + fraction(data.edge, data.total) + '。';
    const response = state.prediction === null ? '这是本轮首次观察，尚无预测可比较。' : state.prediction === data.truth ? '结果与本轮判断一致。检查下方路径，找出这个差异怎样形成。' : '结果与本轮判断不同。先在“定位一个有序样本”中比较能得到3和1的路径，再数同值路径。';
    setText(r, '[data-lab-comparison]', base + response + (state.predictionHadReference ? '提交该判断前已看过参考，本轮不作为未接触答案的预测。' : ''));
    setText(r, '[data-lab-count]', '当前共 ' + data.total + ' 个等可能的有序样本；每条路径的理论概率为 ' + fraction(1, data.total) + '。');
    const picker = r.querySelector('[data-lab-path]');
    picker.replaceChildren();
    data.paths.forEach((path, i) => {
      const option = document.createElement('option');
      option.value = String(i); option.textContent = path.sample.map(j => labels[j]).join(' → ') + '：' + path.sample.map(j => values[j]).join(', ');
      picker.appendChild(option);
    });
    state.selectedPath = Math.max(0, Math.min(state.selectedPath || 0, data.paths.length - 1));
    picker.value = String(state.selectedPath);
    const path = data.paths[state.selectedPath];
    setText(r, '[data-lab-trace]', '枚举定位（非随机）：(' + path.sample.map(j => values[j]).join(' + ') + ') ÷ ' + state.parameters.n + ' = ' + fraction(path.sum, state.parameters.n) + ' 分钟。它归入图中带轮廓的铜橙色柱。手选路径不增加模拟次数。');
    drawChart(r, data);
    const tableBody = r.querySelector('[data-lab-table]');
    tableBody.replaceChildren();
    Object.keys(data.groups).map(Number).sort((a, b) => a - b).forEach(sum => {
      const row = document.createElement('tr');
      const count = state.simulation.counts[String(sum)] || 0;
      [fraction(sum, state.parameters.n), String(data.groups[String(sum)]), fraction(data.groups[String(sum)], data.total), state.simulation.B ? count + '/' + state.simulation.B + ' ≈ ' + (count / state.simulation.B).toFixed(3) : '尚未模拟'].forEach((value, i) => {
        const cell = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) cell.scope = 'row'; cell.textContent = value; row.appendChild(cell);
      });
      tableBody.appendChild(row);
    });
    setText(r, '[data-lab-simulation]', '单份样本量 n=' + state.parameters.n + '；已随机抽取 B=' + state.simulation.B + ' 份样本。每份只产生一个均值。');
    const last = state.simulation.last;
    setText(r, '[data-lab-last]', last ? '最近一份随机样本：' + last.sample.map(j => labels[j] + '=' + values[j]).join('，') + '；均值=' + fraction(last.sum, state.parameters.n) + ' 分钟；这一份为相应频数加1。' : '还没有随机样本。先抽1份，追踪它形成的一个均值。');
    setText(r, '[data-lab-question]', '比较问题：均值3对应几条路径？把样本量或放回条件改掉后，这些路径还都存在吗？下一轮可以只改变一个条件检查。');
  }
  function simulate(count) {
    if (state.phase !== 'revealed') return;
    for (let k = 0; k < count; k++) {
      const remaining = [0, 1, 2], sample = [];
      for (let j = 0; j < state.parameters.n; j++) {
        if (state.parameters.replacement) sample.push(Math.floor(Math.random() * values.length));
        else sample.push(remaining.splice(Math.floor(Math.random() * remaining.length), 1)[0]);
      }
      const sum = sample.reduce((a, i) => a + values[i], 0);
      state.simulation.counts[String(sum)] = (state.simulation.counts[String(sum)] || 0) + 1;
      state.simulation.B += 1; state.simulation.last = { sample: sample, sum: sum };
    }
    persist();
  }
  function bind() {
    const r = root();
    if (!r || r.dataset.labBound) return;
    r.dataset.labBound = 'true';
    r.querySelector('[data-lab-n]').addEventListener('change', event => { if (state.phase !== 'draft') return; state.parameters.n = Number(event.target.value); persist(); });
    r.querySelector('[data-lab-replacement]').addEventListener('change', event => { if (state.phase !== 'draft') return; state.parameters.replacement = event.target.value === 'yes'; persist(); });
    r.querySelector('[data-lab-prediction]').addEventListener('change', event => { if (state.phase !== 'draft') return; state.predictionDraft = event.target.value; persist(); });
    r.querySelector('[data-lab-freeze]').addEventListener('click', () => {
      if (state.phase !== 'draft' || !state.predictionDraft) return;
      state.prediction = state.predictionDraft; state.predictionAt = Date.now(); state.predictionHadReference = !!state.referenceViewed; state.phase = 'frozen'; persist();
    });
    r.querySelector('[data-lab-reveal]').addEventListener('click', () => { if (state.phase !== 'frozen') return; state.phase = 'revealed'; state.revealedAt = Date.now(); persist(); });
    r.querySelector('[data-lab-skip]').addEventListener('click', () => { if (state.phase !== 'draft') return; state.prediction = null; state.predictionDraft = ''; state.phase = 'revealed'; state.revealedAt = Date.now(); persist(); });
    r.querySelector('[data-lab-reset]').addEventListener('click', newRound);
    r.querySelector('[data-lab-path]').addEventListener('change', event => { state.selectedPath = Number(event.target.value); persist(); });
    r.querySelector('[data-lab-one]').addEventListener('click', () => simulate(1));
    r.querySelector('[data-lab-many]').addEventListener('click', () => simulate(20));
    r.querySelector('[data-lab-clear]').addEventListener('click', () => { state.simulation = { B: 0, counts: {}, last: null }; persist(); });
    r.querySelector('[data-lab-next]').addEventListener('click', () => window.DialogueTutor.instance.navigate('population-check'));
    r.querySelector('[data-lab-completion]').addEventListener('click', () => window.DialogueTutor.instance.navigate('mean-completion'));
    r.querySelector('[data-lab-support]').addEventListener('toggle', event => { if (event.target.open) { state.supportViewed = true; persist(); } });
    if (observer) observer.disconnect();
    if (window.ResizeObserver) { observer = new ResizeObserver(() => { if (state && state.phase === 'revealed') drawChart(r, model(state.parameters)); }); observer.observe(r.querySelector('.lab-chart')); }
  }
  function restore(event) {
    if (!event.detail || event.detail.activityId !== id) return;
    state = normalize(event.detail.state);
    bind(); render();
  }
  document.addEventListener('dt:activity-mounted', restore);
  document.addEventListener('dt:restore', restore);
  document.addEventListener('dt:exploration', restore);
  document.addEventListener('dt:navigate', event => { if (event.detail && event.detail.activityId === id) { bind(); render(); } });
  document.addEventListener('toggle', event => {
    if (state && event.target.id === solutionId && event.target.open) { state.referenceViewed = true; state.referenceAt = Date.now(); persist(); }
  }, true);
})();
