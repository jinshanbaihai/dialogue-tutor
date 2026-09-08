(function () {
  'use strict';
  const id = 'evidence-close', reviewId = 'distribution-probability';
  let root = null, lesson = null;
  const $ = selector => root.querySelector(selector);
  function reviewTarget(state) {
    const saved = state.activities[reviewId];
    const item = window.DialogueTutor.getReviews(lesson, state, Date.now()).find(x => x.activityId === reviewId);
    const pending = saved.status === 'idle' && Boolean(saved.draft.trim()) || saved.status === 'submitted' && saved.attempts.some(x => x.id === saved.submittedAttemptId && x.correct === null);
    return { saved, item, pending };
  }
  function render() {
    if (!root) return;
    const state = window.DialogueTutor.instance.getState(), lab = state.activities['sample-lab'].exploration;
    const p = lab.parameters || { n: 2, mechanism: 'with', threshold: 5 };
    let loop;
    if (lab.phase === 'revealed' && lab.revealedAt) {
      loop = `开场的概率比较，在本轮已有可查证据：${window.R3Sampling.comparisonText(p)}${window.R3Sampling.predictionText(lab)}`;
      if (lab.revealHadReference) loop += ' 本次揭示结果前已查看实验全解。';
      else if (lab.referenceViewed) loop += ' 目前已查看实验全解；这不倒改原预测的提交条件。';
      if (lab.pathSelections && lab.pathSelections.length) loop += ` 本轮记录了 ${lab.pathSelections.length} 次主动选择路径查看。`;
      else loop += ' 本轮没有主动选择路径的记录；展示过的默认路径不算你亲自计算。';
      loop += ' 可在“无放回”新题中自行组织样本空间。';
    } else loop = `${window.R3Sampling.condition(p)}。当前轮尚未揭示结果，不能据进入收束判断实验已完成。用“返回工时卡实验”继续验证，再尝试无放回新题。`;
    $('#r3-close-loop').textContent = loop;
    const list = $('#r3-evidence-list'); list.replaceChildren();
    ['statistic-check', 'distribution-completion', 'distribution-probability'].forEach(activityId => {
      const def = lesson.activities.find(x => x.id === activityId), saved = state.activities[activityId], last = saved.attempts[saved.attempts.length - 1];
      const li = document.createElement('li');
      let text = saved.status === 'skipped' ? '已跳过，未记作错误' : '尚无已提交作答';
      if (last) text = last.correct === true ? last.assisted ? '最新数值或选项核对正确，提交前有提示／参考接触' : '最新数值或选项独立客观核对正确' : '最新作答与参考不符，仍可核对具体依据';
      li.textContent = `${def.title}：${text}。`; list.append(li);
    });
    const statements = ['survey-plan', 'distribution-independent', 'without-replacement'].map(activityId => {
      const def = lesson.activities.find(x => x.id === activityId), saved = state.activities[activityId], last = saved.attempts[saved.attempts.length - 1];
      if (!last) return `${def.title}：${saved.status === 'skipped' ? '已跳过' : '尚无原答'}`;
      return `${def.title}：原答已保存，${last.correct === null ? '等待自评' : last.correct ? '自评达到要点' : '自评仍需练习'}${last.assisted ? '（辅助后提交）' : ''}`;
    });
    $('#r3-open-evidence').textContent = statements.join('；') + '。开放题的自评不等于客观独立通过；数值核对也不能单独证明完整推导。';
    const target = reviewTarget(state);
    const date = target.item ? new Date(target.item.review.dueAt).toLocaleString('zh-CN') : '';
    $('#r3-review').textContent = target.pending ? '继续未完成：独立求极差概率' : target.item ? target.item.due ? '到期回顾：独立求极差概率' : '提前练习：独立求极差概率' : '初次作答：独立求极差概率';
    $('#r3-review-status').textContent = target.pending ? '已有未完成作答，将保留当前内容。' : target.item ? `记录安排的回顾时间：${date}。${target.item.due ? '当前已到期。' : '当前未到期，提前练习不会推进间隔。'}` : '这道题还没有复习记录；先完成一次真实作答，再按记录回来。';
  }
  function bind() {
    if (root) return;
    root = document.getElementById('r3-close-root');
    if (!root) return;
    lesson = JSON.parse(document.getElementById('dt-lesson').textContent);
    $('#r3-return-lab').addEventListener('click', () => window.DialogueTutor.instance.navigate('sample-lab'));
    $('#r3-challenge').addEventListener('click', () => window.DialogueTutor.instance.navigate('without-replacement'));
    $('#r3-review').addEventListener('click', () => {
      const target = reviewTarget(window.DialogueTutor.instance.getState());
      if (target.item) window.DialogueTutor.instance.navigate(target.item.activityId, target.item);
      else window.DialogueTutor.instance.navigate(reviewId);
    });
  }
  ['dt:activity-mounted', 'dt:restore', 'dt:navigate'].forEach(name => document.addEventListener(name, event => { if (event.detail && event.detail.activityId === id) { bind(); render(); } }));
  document.addEventListener('dt:exploration', () => { if (root && window.DialogueTutor.instance.getState().currentActivity === id) render(); });
})();
