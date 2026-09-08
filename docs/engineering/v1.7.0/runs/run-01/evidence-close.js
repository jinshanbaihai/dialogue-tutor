(function () {
  'use strict';
  const id = 'evidence-close';
  const root = () => document.querySelector('#dt-activity-' + id + ' .evidence-close');
  function render() {
    const r = root(), api = window.DialogueTutor, instance = api && api.instance;
    if (!r || !instance) return;
    const lesson = JSON.parse(document.getElementById('dt-lesson').textContent);
    const state = instance.getState();
    const lab = state.activities['sampling-lab'].exploration || {};
    const names = { equal: '一样常见', centre: '均值3更常见', edge: '均值1更常见' };
    const story = r.querySelector('[data-close-story]');
    story.textContent = lab.revealedAt ? '你已经在实验中把一份样本映射为一个均值，再把同值的路径合并。' + (lab.prediction ? '最近一轮保留的判断是“' + names[lab.prediction] + '”。' : '最近一轮选择了直接观察，没有预测记录。') + '返回实验可查看对应条件与证据。' : '开场的问题仍可在实验中检验：先固定抽样条件，再比较均值3与1的路径。你可以从尚未完成的实验继续。';
    const list = r.querySelector('[data-close-evidence]'); list.replaceChildren();
    lesson.objectives.forEach(objective => {
      const activities = lesson.activities.filter(activity => activity.objectiveId === objective.id && activity.id !== id);
      const row = document.createElement('li');
      const title = document.createElement('strong'); title.textContent = objective.title; row.appendChild(title);
      const detail = document.createElement('p');
      const facts = [];
      activities.forEach(activity => {
        const saved = state.activities[activity.id], attempts = saved.attempts || [];
        const independent = attempts.filter(a => a.source === 'objective' && a.correct === true && !a.assisted);
        const assisted = attempts.filter(a => a.assisted);
        const self = attempts.filter(a => a.source === 'self' && a.correct !== null);
        const pending = attempts.filter(a => a.source === 'self' && a.correct === null);
        const wrong = attempts.filter(a => a.source === 'objective' && a.correct === false);
        if (independent.length) facts.push(activity.title + '：有独立客观核对通过记录');
        if (assisted.length) facts.push(activity.title + '：有辅助尝试（' + assisted.length + '次）');
        if (self.length) facts.push(activity.title + '：有自评记录（非自动判断）');
        if (pending.length && !self.length) facts.push(activity.title + '：已保存原答，等待自评');
        if (wrong.length && !independent.length) facts.push(activity.title + '：曾需修正，可回看具体尝试');
        if (!attempts.length && saved.participated) facts.push(activity.title + '：参与或查阅，尚无作答证据');
      });
      detail.textContent = facts.length ? facts.join('；') + '。' : '尚无作答证据；可以从本目标的具名任务开始。'; row.appendChild(detail); list.appendChild(row);
    });
    const challenge = r.querySelector('[data-close-challenge]');
    challenge.textContent = (state.activities['repeated-values'].attempts.length ? '返回已有作答：' : '改变条件的挑战：') + '相同数值、不同个体';
    challenge.onclick = () => instance.navigate('repeated-values');
    r.querySelector('[data-close-lab]').onclick = () => instance.navigate('sampling-lab');
    r.querySelector('[data-close-independent]').onclick = () => instance.navigate('mean-independent');
    const reviews = api.getReviews(lesson, state, Date.now());
    const recall = reviews.find(item => item.activityId === 'return-recall') || reviews[0];
    const button = r.querySelector('[data-close-review]');
    const note = r.querySelector('[data-close-review-note]');
    if (recall) {
      const saved = state.activities[recall.activityId];
      const pending = saved.attempts.find(a => a.id === saved.submittedAttemptId);
      const unfinished = (saved.status === 'idle' && saved.draft.trim()) || (pending && pending.source === 'self' && pending.correct === null);
      const date = new Date(recall.review.dueAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      button.textContent = unfinished ? '继续未完成作答：' + recall.title : (recall.due ? '到期回忆：' : '提前练习：') + recall.title;
      note.textContent = '实际复习时间：' + date + '。' + (unfinished ? '保留当前草稿或尚未自评的原答。' : recall.due ? '进入后先呈现问题，旧输入和答案收起，历史保留。' : '尚未到期；提前练习不会推进复习间隔。');
      button.onclick = () => instance.navigate(recall.activityId, recall);
    } else {
      button.textContent = '建立回访入口：三张核心概念卡';
      note.textContent = '尚无复习记录。完成一次核对或闪卡自评后，按真实记录显示日期。';
      button.onclick = () => instance.navigate('return-recall');
    }
  }
  ['dt:activity-mounted', 'dt:restore', 'dt:navigate'].forEach(name => document.addEventListener(name, event => { if (event.detail && event.detail.activityId === id) render(); }));
  document.addEventListener('dt:ready', render);
})();
