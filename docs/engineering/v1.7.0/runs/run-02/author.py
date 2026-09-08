#!/usr/bin/env python3
"""Original lesson author source. No earlier lesson, fixture, or model API is read."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import platform

ROOT = Path(__file__).resolve().parent
WORKSPACE = ROOT.parents[1]
SKILL = WORKSPACE / 'repo/plugins/dialogue-tutor/skills/dialogue-tutor'
SCOPE = WORKSPACE / 'repo/docs/engineering/v1.7.0/official-scope.md'
SOURCE = {'repository': 'DialogueTutor', 'path': 'references/teaching-design.md', 'case': '原创课程情境、题目、活动编排与表现分支'}
QUIZ = {'repository': 'HKUDS/DeepTutor', 'path': 'web/app/(workspace)/books/components/blocks/QuizBlock.tsx', 'commit': '42fab3cf429a1fbf36b257ab8d116a3814964202', 'case': '本地题卡适配；所有题面与解法为本次原创'}
STEPS = {'repository': 'HKUDS/DeepTutor', 'path': 'deeptutor/agents/visualize/agents/code_generator_agent.py', 'commit': '42fab3cf429a1fbf36b257ab8d116a3814964202', 'case': '步骤显示；不产生客观通过证据'}
FLASH = {'repository': 'HKUDS/DeepTutor', 'path': 'web/app/(workspace)/books/components/blocks/FlashCardsBlock.tsx', 'commit': '42fab3cf429a1fbf36b257ab8d116a3814964202', 'case': '回忆后翻面并自评；本地复习连接'}

def formula(inner):
    return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">' + inner + '</math>'

MEAN = formula('<mover><mi>X</mi><mo>¯</mo></mover><mo>=</mo><mfrac><mrow><msub><mi>X</mi><mn>1</mn></msub><mo>+</mo><mo>⋯</mo><mo>+</mo><msub><mi>X</mi><mi>n</mi></msub></mrow><mi>n</mi></mfrac>')

def table(headers, rows, caption):
    return '<div class="r02-table-wrap"><table><caption>' + caption + '</caption><thead><tr>' + ''.join('<th scope="col">'+str(x)+'</th>' for x in headers) + '</tr></thead><tbody>' + ''.join('<tr>'+''.join('<td>'+str(x)+'</td>' for x in row)+'</tr>' for row in rows) + '</tbody></table></div>'

def base(id, objective, type, title, prompt, solution=None, **kw):
    d = dict(id=id, objectiveId=objective, type=type, title=title, prompt=prompt, source=QUIZ if type=='quiz' else SOURCE)
    if solution:
        d['solutionId'] = 'dt-explanation-' + solution
    d.update(kw)
    return d

def choice(id, objective, title, prompt, scene, options, answer, explanation, hint):
    return base(id, objective, 'quiz', title, prompt, scene, format='choice', choices=[dict(id=k,text=v,feedback=f) for k,v,f in options], answer=answer, explanation=explanation, hint=hint)

def numeric(id, title, prompt, scene, answer, explanation, hint, objective='distribution'):
    return base(id, objective, 'quiz', title, prompt, scene, format='numeric', answer=answer, tolerance=1e-8, explanation=explanation, hint=hint)

def opened(id, objective, title, prompt, scene, model, rubric, hint):
    return base(id, objective, 'quiz', title, prompt, scene, format='open', modelAnswer=model, rubric=rubric, explanation='请先对照本人原答，再按自拟评价要点自行评价；这些要点不是官方分数表。', hint=hint)

def section(id, title, lead, body, activities):
    return dict(id=id,title=title,lead=lead,bodyHtml=body,explanationTitle='查看本场景原理与完整解答',activityIds=activities)

lab_html = '<style>'+(ROOT/'theme.css').read_text()+'</style>'+'''
<div class="r02-lab">
  <div class="r02-population" aria-label="总体：三台设备的固定响应时间">
    <div><b>A</b><span>1 秒</span></div><div><b>B</b><span>4 秒</span></div><div><b>C</b><span>7 秒</span></div>
  </div>
  <p>研究量：一次抽样的平均响应时间 X̄。平均值＝总和÷次数。比较对象是只抽一台时的响应时间 X。</p>
  <div class="r02-controls">
    <label>每次样本量 n<select id="r02-n" class="dt-input"><option value="2">2 台次</option><option value="1">1 台次</option></select></label>
    <label>抽取机制<select id="r02-mechanism" class="dt-input"><option value="wr">有放回（with replacement）</option><option value="wor">无放回（without replacement）</option></select></label>
    <label>比较门槛 c<select id="r02-threshold" class="dt-input"><option value="6">6 秒</option><option value="4">4 秒</option><option value="2">2 秒</option></select></label>
  </div>
  <p id="r02-conditions" class="r02-condition"></p>
  <label for="r02-prediction">先判断：P(X̄ ≥ c) 与 P(X ≥ c) 相比会怎样？</label>
  <select id="r02-prediction" class="dt-input"><option value="">请选择一个判断</option><option value="less">小于</option><option value="equal">等于</option><option value="greater">大于</option></select>
  <div class="dt-row r02-action-row">
    <button type="button" id="r02-freeze" class="dt-button dt-button-primary">保存判断，暂不揭示</button>
    <button type="button" id="r02-reveal" class="dt-button dt-button-primary" hidden>枚举全部样本并核对</button>
    <button type="button" id="r02-direct" class="dt-button dt-button-quiet">不作预测，直接观察</button>
  </div>
  <p id="r02-phase" role="status" aria-live="polite"></p>
  <p id="r02-contact" class="dt-small"></p>
  <div id="r02-results" hidden>
    <h4>同一抽样机制下的两个理论概率</h4>
    <div id="r02-probability" class="r02-probability" aria-live="polite"></div>
    <div id="r02-distribution"></div>
    <label for="r02-path">选择一条有序样本，追踪它的统计量（枚举演示）</label>
    <select id="r02-path" class="dt-input"></select>
    <p id="r02-path-result"></p>
    <p id="r02-response" class="r02-response"></p>
  </div>
  <div class="dt-row r02-action-row">
    <button type="button" id="r02-new" class="dt-button" hidden>开启新一轮，保留历史</button>
    <button type="button" id="r02-example" class="dt-button dt-button-quiet">先看四条样本的完整例题</button>
    <button type="button" id="r02-next" class="dt-button dt-button-quiet">去辨认总体与抽样框</button>
  </div>
  <details class="r02-history"><summary>查阅本活动的判断历史</summary><ol id="r02-history-list"></ol></details>
</div>'''

activities = [base('response-lab','distribution','interactive','先判断：取平均以后，越过门槛会怎样？','观测站用三台设备做小型抽样演示，A、B、C 的固定响应时间分别为 1、4、7 秒。每一步都在当时可选的设备中等概率抽取；有放回时两次抽取独立。先选条件并保存未评分判断，再枚举全部有序样本。这里没有随机模拟。','opening',bodyHtml=lab_html,script=(ROOT/'lab.js').read_text())]

frame_solution = '总体是本月正常使用的180台传感器；抽样单位是一台传感器；抽样框是云端表中的156个设备ID；样本是实际抽中的12台。漏掉离线设备意味着有24台目标设备没有被抽到的机会；在这张不完整的表内随机抽取不能修复覆盖不足。'
activities.append(choice('frame-choice','sampling-design','把四个名字放回调查里','调查目标是本月正常使用的180台传感器。云端表只列156台已联网设备的ID，另24台仍在使用但暂时离线；从云端表随机抽取12台。哪一组配对正确？','frame',[
    ('a','总体180台；单位一台；框156个ID；样本12台。','四个对象分清了。还要检查：24台离线设备是否有机会被抽到？去下一题修正名单。'),
    ('b','总体156台；单位一个ID字符；框180台；样本12台。','研究目标明确包含180台；ID是名单中的标识，不是要研究的物理对象。先圈出题面中的“调查目标”。'),
    ('c','总体180台；单位12台；框12台；样本156台。','12台是一次抽得的集合，不是一个抽样单位。先分别写下“抽之前的名单”和“抽之后的对象”。')
], 'a', frame_solution, '先问：研究谁、每次抽谁、从哪张表抽、最终抽中了谁。'))
frame_transfer = '总体是目前在水库工作的75个探头，单位是一个探头。旧名单包含已报废编号会造成非目标对象混入，漏掉新探头会造成目标对象覆盖不足。应把名单与当前安装清单核对，移除报废项、补入新探头并去重，再按这份更新的完整名单抽取。随机选择只能作用于名单中已有的项目。'
activities.append(opened('frame-transfer','sampling-design','新名单为什么仍会漏人？','另一水库目前有75个在用探头。调查员拿去年名单抽样：其中有6个已报废编号，最近新装的9个探头不在名单里。说明总体与抽样单位，指出名单的两个问题，并给出抽样前应做的一项修复。不要假定旧名单总数。','frame',frame_transfer,['准确写出当前75个在用探头和一个探头。','分别识别非目标编号混入与新设备遗漏，不仅笼统说“有偏”。','提出更新并核对完整现用名单；不把“随机抽”当作名单修复。'],'先把“谁应该在名单中”和“谁实际上在名单中”分开。'))

survey_solution='这次续航测量会耗尽并损伤电池，抽样调查更合适：成本较低、速度较快，并能保留大部分交付品；代价是没有检查每件，结论可能受抽样波动及代表性不足影响。普查覆盖全部单位，能够获得这一总体完整信息，并消除由只查部分单位引起的抽样误差；但费用和时间通常较大，本题还会破坏全部产品。两种方法都可能有测量、记录或漏查错误。'
activities.append(choice('survey-choice','survey-method','测完还能交货吗？','要了解500块待交付电池的极限续航。每次极限测试会损伤被测电池，预算只能测40块；客户仍需收到大部分电池。此时哪项建议最合理？','survey',[
 ('sample','从合理覆盖全部批次的抽样框中抽取40块测量，并承认抽样误差。','抽样保留大部分交付品，同时需要检查各批次的覆盖。去下一项比较不破坏产品的调查。'),
 ('census','测完全部500块；普查保证没有任何错误。','测全体会损伤全部交付品，也超过预算。普查仍可能测错或记错；先区分抽样误差与其他误差。'),
 ('near','只测箱口最容易拿到的40块，就能保证代表所有批次。','易拿到不等于有代表性。先检查箱口设备是否来自同一批，再考虑覆盖所有批次的名单。')
], 'sample', survey_solution,'先看检测是否破坏物品、成本与时限，再比较信息覆盖范围。'))
survey_evaluate='可以选择普查：只有26个可接近的房间，每个房间测量只用约半分钟且不造成损坏，检查全部房间约13分钟，可直接获得本时点所有房间读数并避免抽样误差。抽样可以节省一些时间，但会遗漏部分房间，面对很小且容易测量的总体未必值得。普查仍可能发生传感器校准、读数记录或时点变化等问题，因此不能保证“绝对准确”。'
activities.append(opened('survey-evaluate','survey-method','条件一换，普查值得吗？','一座小型档案馆共有26个房间。管理员要知道今天9时各房间湿度；固定记录仪可在同一分钟读取全部房间，每个房间整理记录约30秒，不会损伤设备。比较普查与抽样后给出建议，并说明普查仍可能出现的一种错误。','survey',survey_evaluate,['结合总体小、可同时读取且无损的条件，给出有理由的建议。','比较完整覆盖与时间成本，不只罗列定义。','明确抽样误差与测量、记录等错误不同。'],'一个房间30秒，全部整理约多久？“全查到”是否等于“每次都测对”？'))

statistic_solution='C不是统计量，因为μ被明确规定为未知的总体平均值，无法只从本次五个样本值计算。A是样本平均值，B是样本极差（sample range），D是样本中超过已知常数3的个数，它们都由样本和已知常数确定，所以是统计量。统计量是一个随机样本的函数；抽样前它可随样本而变，抽样后得到一个实现值。总体参数（parameter）描述总体；未知不等于随机抽样后就变成样本统计量。'
activities.append(choice('statistic-choice','statistic','有一个式子还缺少总体信息','X₁,…,X₅ 是随机样本，μ是未知的总体平均值，3是已知常数。哪一个表达式不是统计量（statistic）？','statistic',[
 ('a','A：样本平均值 (X₁+⋯+X₅)/5。','样本值和已知样本量已经足够。请改查哪一个选项依赖题面说“未知”的量。'),
 ('b','B：max(X₁,…,X₅) − min(X₁,…,X₅)。','最大值和最小值都来自样本。请检查是否还有样本之外的未知参数。'),
 ('c','C：(X₁−μ)²+⋯+(X₅−μ)²。','这里仍需未知的总体μ；完整样本并不能单独给出C。下一题把未知量换成已知常数来比较。'),
 ('d','D：这五个样本值中大于3的个数。','计数规则只用样本和已知常数3，满足统计量条件。')
], 'c', statistic_solution,'尝试把五个样本值都填进去：哪一个式子仍然没有足够信息算出数值？'))
statistic_explain='U不是统计量，因为θ是未知的总体中位数；即使已知三个样本值，也不能仅由它们算出U。V是统计量，因为只用样本与已知常数5；本次V=(2+8+11)/3−5=2。只看本次结果是否“像一个数”不足以判断，关键是其计算规则是否含未知总体参数。'
activities.append(opened('statistic-explain','statistic','能算出来与算不出来','新样本 X₁,X₂,X₃ 的观测值是2、8、11。θ是未知的总体中位数。比较 U=(X₁+X₂+X₃)/3−θ 与 V=(X₁+X₂+X₃)/3−5：分别判断是否为统计量，写出依据，并算出能够由样本唯一确定的表达式的值。','statistic',statistic_explain,['分别判U不是、V是，并把原因落到未知θ与已知5。','展示V的运算，得到2。','不把样本中位数8未经说明替代总体θ。'],'先计算样本平均值；随后问剩下的减数是否已知。'))

worked_table=table(['有序样本（秒）','样本平均值 X̄（秒）','路径概率'],[('(3,3)',3,'1/4'),('(3,9)',6,'1/4'),('(9,3)',6,'1/4'),('(9,9)',9,'1/4')],'两台设备，抽两次并放回：完整样本空间')
worked_distribution=table(['x̄（秒）',3,6,9], [['P(X̄=x̄)','1/4','1/2','1/4']],'样本平均值的抽样分布')
worked_body='<p>两台测试器D、E的固定响应时间为3、9秒。每次等概率抽取一台，放回后再独立抽一次，n=2。要建立的不是两条样本数据的频数表，而是所有可能抽样所得平均值的概率表。</p>'+MEAN+'<p>有放回且独立，所以每条有序路径的概率为(1/2)×(1/2)=1/4。先算每条路径的平均值，再把同一个平均值对应的路径概率相加。</p>'+worked_table+worked_distribution+'<p>平均值6对应两条不同路径，因此P(X̄=6)=1/4+1/4=1/2；另外两个值各对应一条。三个概率非负且和为1，单位仍是秒。这个分布描述统计量在重复按同一机制抽样时的可能值与概率；一次样本(3,9)只给一个实现值6，无法代替整个抽样分布。</p>'
activities.append(base('dist-worked','distribution','steps','四条样本，怎样变成三根柱？','完整例题：两台设备D、E的固定响应时间分别为3、9秒。等概率、有放回且独立抽两次，建立样本平均值X̄的抽样分布。可以逐步查阅，也可展开本场景全解。','worked',source=STEPS,steps=[
 {'title':'先定基本结果与概率','bodyHtml':'<p>每个结果写成有顺序的两次设备读数；重复设备允许出现。两次均为1/2且独立，所以四条路径各为1/4。</p>'+worked_table},
 {'title':'同一统计量值合并概率','bodyHtml':'<p>平均值是两读数之和除以2。(3,9)与(9,3)是两条路径，却给出同一个平均值6。将它们合并得到1/2。</p>'+worked_distribution},
 {'title':'检查分布在回答什么','bodyHtml':'<p>1/4+1/2+1/4=1，全部可能值已列出。一次样本给出一个平均值，重复抽样的全部可能结果给出X̄的抽样分布（sampling distribution）。下一项更换为三台设备，请自己补关键概率。</p>'}
]))

completion_solution='三个带标签设备的值为2、5、8秒。有放回独立抽两次，共3×3=9条等可能有序样本。均值5来自(2,8)、(5,5)、(8,2)，每条1/9，所以概率3/9=1/3。也可由概率和检查：剩余路径数9−1−2−2−1=3。完整分布为均值2、3.5、5、6.5、8分别对应1/9、2/9、1/3、2/9、1/9。'
activities.append(numeric('dist-completion','补上中间那一项','不同题：三台带标签设备的固定响应时间是2、5、8秒。等概率、有放回且独立抽取两次。9条有序样本中，均值2和8各有1条，均值3.5和6.5各有2条。补上 P(X̄=5)。输入精确分数或小数，不写单位。','completion','1/3',completion_solution,'9条路径必须全部分配。先算已经用了几条，再把剩余路径数除以9。'))

independent_solution='按设备标签列9个有序结果：AA、AB、AC、BA、BB、BC、CA、CB、CC，每个1/9。A和B都是0秒，但仍是两台不同设备。均值0来自AA、AB、BA、BB，共4条；均值3来自AC、BC、CA、CB，共4条；均值6来自CC，共1条。故X̄的分布为0、3、6对应4/9、4/9、1/9，概率和为1。一次样本例如AC只产生平均值3；抽样分布包含所有可能样本及其概率。'
activities.append(opened('dist-independent','distribution','相同读数，是否只算一台？','独立新题：总体包含三台带标签设备 A、B、C，其固定响应时间分别为0、0、6秒。每次在三台设备中等概率抽取一台，放回后再独立抽一次。自行组织样本空间，求样本平均值X̄的全部取值和概率；说明为何两台0秒设备不能先合并成一台等可能设备，并区别一次样本与抽样分布。','independent',independent_solution,['按设备标签保留9条等可能有序路径，每条1/9。','完整列出X̄=0、3、6，概率4/9、4/9、1/9，并检查和为1。','说明重复读数不改变设备身份及抽取权重。','明确一次样本给一个实现值，分布描述全部可能实现值及概率。'],'先只写设备标签AA、AB等，再把标签换成响应时间，最后按平均值归组。'))

numeric_solution='四台带标签设备的值为0、2、2、6秒，有放回独立抽取两次产生16条等概率有序路径。均值至少3等价于两数和至少6。含一台6秒与一台0秒的两条路径符合；含一台6秒与任一2秒设备共4条符合；(6,6)另1条。合计7条，所以P(X̄≥3)=7/16。完整分布是0、1、2、3、4、6秒，对应1/16、4/16、4/16、2/16、4/16、1/16，总和16/16=1。'
activities.append(numeric('dist-numeric','换一组总体，独立核对概率','独立数值题：总体有四台带标签设备 P、Q、R、S，其固定响应时间分别为0、2、2、6秒。每次在四台中等概率抽取一台，放回后再独立抽一次。求 P(X̄≥3)，X̄为两次读数平均值。自行组织方法；输入精确分数或小数，不写单位。','numeric','7/16',numeric_solution,'“平均值至少3”改写成“两次读数之和至少6”。用设备标签计数，别把Q和R合成一个抽取机会。'))

max_solution='无放回抽两台，按先后记录有6条等概率路径，每条1/(3×2)=1/6：AB、AC、BA、BC、CA、CB。最大值M=3出现在AB、BA，共2条，概率1/3；M=5出现在AC、BC、CA、CB，共4条，概率2/3。M=1不可能，因为不能重复抽唯一的1。全部概率和为1。若改成有放回，会允许AA，M=1的概率变成1/9，不能沿用当前分布。'
activities.append(opened('maximum-transfer','mechanism','改变机制，也改变统计量','改变条件挑战：三台设备A、B、C的固定响应时间为1、3、5秒。先在三台中等概率抽一台，再在剩下两台中等概率抽一台（无放回）；记录先后顺序。这次统计量是两次读数的最大值 M，而不是平均值。求M的抽样分布，并说明M=1能否出现及原因。','maximum',max_solution,['无放回有6条等概率有序路径，每条1/6。','给出M=3的概率1/3，M=5的概率2/3，且和为1。','结合唯一的1不能重复抽取，说明M=1不可能。','计算的是最大值，不能把平均值分布搬过来。'],'先删除AA、BB、CC；对剩下每一对只保留较大的那个读数。'))
without_solution='无放回按先后共有4×3=12条等概率路径。最大值不超过9要求两台均来自2、4、9这三台；符合的路径有3×2=6条，所以概率6/12=1/2。也可用6个等概率无序二元子集：{2,4}、{2,9}、{2,12}、{4,9}、{4,12}、{9,12}，其中前三台内部的3组符合。完整最大值分布：4、9、12分别对应1/6、1/3、1/2。'
activities.append(numeric('without-replacement','无放回的新题：谁会成为最大值？','独立数值题：四台设备的固定响应时间是2、4、9、12秒。先等概率抽一台，再从剩下三台等概率抽一台，不放回。令M为两次读数的最大值，求 P(M≤9)。输入精确分数或小数，不写单位。','without','1/2',without_solution,'M不超过9要求两台都来自哪几台？第二次的可选总数是否仍是4？',objective='mechanism'))

activities.append(base('terms-recall','recall','flashcards','下次先回忆这三个区别','先在心里或纸上作答，再翻面核对；正向自评只针对翻面之前已经回忆出的内容。这是同题回顾，不能替代新情境应用。','recall',source=FLASH,cards=[
 {'front':'总体 population、抽样框 sampling frame、样本 sample 分别指什么？','back':'总体是所研究对象的全体；抽样框是用于抽取单位的名单或表示；样本是实际抽取的总体子集。框可能漏掉总体对象，也可能混入非目标对象。','hint':'分别对应研究范围、抽样之前的入口、抽样之后的对象。'},
 {'front':'一个表达式含未知总体参数，还能只凭样本称为统计量 statistic 吗？','back':'不能。统计量仅由样本观测值和已知常数计算，不含未知总体参数。样本平均值是统计量，样本平均值减去未知总体平均值不是。','hint':'问完整样本给你以后是否已经足够算出它。'},
 {'front':'怎样从全部可能样本建立一个统计量的抽样分布 sampling distribution？','back':'明确抽样机制与路径概率；列出可能样本；计算各样本对应的统计量；对相同统计量取值合并路径概率；检查概率非负、和为1。一次样本只产生一个统计量实现值。','hint':'同一统计量值可能对应多条路径。'}
]))

checkpoint_html='''<div class="r02-checkpoint"><p id="r02-closing-response" class="r02-response"></p><h4>可以由当前记录支持的证据</h4><ul id="r02-evidence"></ul><p id="r02-next-evidence"></p><div class="dt-row"><button type="button" id="r02-transfer" class="dt-button dt-button-primary">挑战：无放回抽样的最大值</button><button type="button" id="r02-return-lab" class="dt-button">回到本轮预测与枚举</button><button type="button" id="r02-review" class="dt-button">打开回忆任务</button></div><p id="r02-review-status" class="dt-small"></p></div>'''
activities.append(base('checkpoint','distribution','interactive','带着证据离开，带着问题回来','这里按实际作答、参考接触和自评分别列出记录。进入此页不代表整章通过；选择一个仍值得验证的下一步。',bodyHtml=checkpoint_html,script=(ROOT/'checkpoint.js').read_text()))

lab_table=table(['条件','P(X̄≥c)','P(X≥c)','关系'],[
 ('n=2，有放回，c=6','1/9','1/3','小于'),('n=2，有放回，c=4','2/3','2/3','等于'),('n=2，有放回，c=2','8/9','2/3','大于'),
 ('n=2，无放回，c=6','0','1/3','小于'),('n=2，无放回，c=4','2/3','2/3','等于'),('n=2，无放回，c=2','1','2/3','大于'),('n=1，任一机制，任一提供门槛','与X相同','与X̄相同','等于')
],'本活动所有可选条件的完整概率核对')
lab_body='<p>样本平均值是统计量：它把一次样本的多个读数变成一个值。总体分布针对单台设备响应X，抽样分布针对按指定机制反复抽样得到的X̄。平均值与原变量不必有同一个分布。</p>'+MEAN+'<p>在本活动有放回且n=2时，AA、AB、AC、BA、BB、BC、CA、CB、CC各有概率1/9。均值1、2.5、4、5.5、7对应路径数1、2、3、2、1。无放回时删去AA、BB、CC，剩6条各1/6；均值2.5、4、5.5各对应2条。n=1时，X̄=X，两者事件逐次相同。</p>'+lab_table+'<p>默认门槛6秒只让(7,7)的平均值越界，所以是1/9，而单抽到7的概率是1/3。门槛降到2秒时，有放回样本除(1,1)外都符合，变成8/9，大于单抽的2/3；门槛4秒时两边恰为2/3。可见“取平均后越界概率总会变小”不能作为不带门槛条件的一般定律。图表用精确枚举概率，不是模拟频率；手选路径只用于追踪样本到统计量的映射。</p>'

sections=[
 section('opening','一次抽样，一次平均','从一个可检验的判断开始：改变样本量、放回条件或门槛，再核对平均值的抽样分布。',lab_body,['response-lab']),
 section('frame','谁能进入样本？','总体（population）是研究对象的全体；抽样单位（sampling unit）是每次被抽取的对象；抽样框（sampling frame）是用于抽取的名单；样本（sample）是实际选中的对象。','<p>'+frame_solution+'</p><h3>换到水库名单</h3><p>'+frame_transfer+'</p><p>样本调查只能直接测到样本。要把结果用于目标总体，必须认真考虑抽样框与选择方式；样本量再大也不能自动补回完全没有抽取机会的对象。</p>',['frame-choice','frame-transfer']),
 section('survey','查全部，还是查一部分？','普查（census）调查总体每一个单位；抽样调查（sample survey）只调查部分单位。选择取决于费用、时间、可接近性与检测是否破坏对象。','<p>'+survey_solution+'</p><h3>档案馆条件下的选择</h3><p>'+survey_evaluate+'</p>',['survey-choice','survey-evaluate']),
 section('statistic','样本能否独立算出它？','统计量（statistic）只由样本与已知常数计算，不含未知总体参数（parameter）。按这个条件判断，再用新样本解释。','<p>'+statistic_solution+'</p>'+MEAN+'<h3>用新样本检验规则</h3><p>'+statistic_explain+'</p>',['statistic-choice','statistic-explain']),
 section('worked','把样本映射成统计量','先看一个完整例题：两台设备、四条等概率路径。准备好了即可到下一项补全新题。',worked_body,['dist-worked']),
 section('completion','支架少一点：补关键概率','题面已经给出部分归组结果；请自行补出剩余概率。','<p>'+completion_solution+'</p>'+table(['X̄（秒）',2,3.5,5,6.5,8],[['概率','1/9','2/9','1/3','2/9','1/9']],'补全题的完整分布'),['dist-completion']),
 section('independent','自己建立完整分布','新的判断要求：两台设备读数相同。保留设备身份，独立写出方法和全部分布。','<p>'+independent_solution+'</p>'+table(['X̄（秒）',0,3,6],[['概率','4/9','4/9','1/9']],'三台带标签设备的样本平均值分布'),['dist-independent']),
 section('numeric','把分布用到新事件','这次不给步骤，独立处理四台设备、重复读数与门槛事件。数值核对不代表过程已经自动评阅。','<p>'+numeric_solution+'</p>'+table(['X̄（秒）',0,1,2,3,4,6],[['概率','1/16','4/16','4/16','2/16','4/16','1/16']],'四台设备的完整均值分布'),['dist-numeric']),
 section('maximum','改变条件：不放回，取最大值','先判断哪些路径还可能，再把每一对映射到最大值M。这个挑战同时改变机制和统计量。','<p>'+max_solution+'</p>'+table(['M（秒）',3,5],[['概率','1/3','2/3']],'无放回最大值的分布'),['maximum-transfer']),
 section('without','再用一次无放回机制','用四台新设备检验方法。最大值不超过门槛，意味着被抽的两台都满足什么条件？','<p>'+without_solution+'</p>'+table(['M（秒）',4,9,12],[['概率','1/6','1/3','1/2']],'四台设备无放回最大值分布'),['without-replacement']),
 section('recall','回忆，而后核对','先回忆，再翻面。当前尝试是即时自评；只有以后实际发生的间隔回顾才能提供延迟保持记录。','<p>总体、样本、单位与框的区别决定研究范围和谁有机会被抽中。统计量只由样本与已知常数计算。抽样分布描述统计量全部可能取值及各自概率；枚举时先明确有无放回、先后顺序和基本路径权重，再合并相同统计量值。</p>',['terms-recall']),
 section('closing','把结论带回开场','检查当前轮的真实结果与自己的判断，再选择改变条件的挑战或下次回忆入口。','<p>本章覆盖总体与样本、统计量及其抽样分布。题目、参数和评价要点是本次原创。章号依据提供的官方范围文件：Pearson Statistics 2 Student Book目录第六章为Sampling and sampling distributions，6.1–6.3；规范Unit S2 4.1–4.2。这里没有声称取得教材第六章全文，也不讲授第七章假设检验。</p><p>来源范围文件于2026-09-07核对的公开入口：<a href="https://www.pearson.com/content/dam/one-dot-com/one-dot-com/international-schools/pdfs/secondary-curriculum/international-a-levels/mathematics/International-A-Level-Mathematics-Statistics-2-Student-Book-sample.pdf">Pearson官方样章目录</a>；<a href="https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Mathematics/2018/Specification-and-Sample-Assessment/international-a-level-maths-spec.pdf">Pearson IAL规范</a>。这些是查阅链接，课程运行不请求外部服务。</p>',['checkpoint'])
]

pathways=[]
def paths(from_id, targets):
    for on,(to,label) in targets.items():
        pathways.append(dict(from_=from_id,on=on,to=to,label=label))
        pathways[-1]['from']=pathways[-1].pop('from_')

paths('frame-choice',{'incorrect':('frame-transfer','用新名单区分两个覆盖问题'),'assisted':('frame-transfer','在新名单中解释修复动作'),'correct':('survey-choice','选择受破坏性检测约束的调查'),'skipped':('terms-recall','先回忆总体、框与样本')})
paths('survey-choice',{'incorrect':('survey-evaluate','换到可完整测量的小总体再比较'),'assisted':('survey-evaluate','用档案馆条件独立论证'),'correct':('statistic-choice','判断样本能否计算表达式'),'skipped':('survey-evaluate','先从26个房间的条件比较')})
paths('statistic-choice',{'incorrect':('statistic-explain','检查未知θ与已知常数5'),'assisted':('statistic-explain','用新样本说明统计量条件'),'correct':('dist-worked','建立四条路径的完整抽样分布'),'skipped':('terms-recall','先回忆统计量定义')})
paths('dist-completion',{'incorrect':('dist-worked','重新追踪同值路径如何合并'),'assisted':('dist-independent','独立处理重复读数的新总体'),'correct':('dist-numeric','挑战四台设备的门槛概率'),'skipped':('dist-worked','先看四条路径的完整例题')})
paths('dist-numeric',{'incorrect':('dist-independent','用三台设备检查标签与权重'),'assisted':('without-replacement','在无放回的新题重新组织计数'),'correct':('maximum-transfer','改为无放回并更换统计量'),'skipped':('dist-completion','从部分归组结果补关键概率')})
paths('without-replacement',{'incorrect':('maximum-transfer','先列无放回路径与最大值'),'assisted':('checkpoint','查看当前证据与待回顾入口'),'correct':('checkpoint','用实际记录回应开场判断'),'skipped':('maximum-transfer','先写三台设备的完整分布')})
for id,to,label in [('frame-transfer','frame-choice','回到四个调查对象的配对'),('survey-evaluate','survey-choice','重看破坏性检测的限制'),('statistic-explain','statistic-choice','按未知参数条件重新辨析'),('dist-independent','dist-worked','用完整例题核对枚举步骤'),('maximum-transfer','dist-worked','先区分样本路径与统计量值')]:
    paths(id,{'incorrect':(to,label),'assisted':('without-replacement','用另一题继续检查抽样机制'),'skipped':(to,label)})
paths('response-lab',{'assisted':('dist-completion','用另一组数值补关键概率'),'skipped':('dist-worked','先看平均值分布完整例题')})

lesson=dict(schemaVersion=1,lessonId='station-sampling-run02',revision='1.7.0-run02-r1',presentation='studio',title='一次抽样，一次平均｜IAL S2 第六章',language='zh-CN',mode='bgct',objectives=[
 dict(id='sampling-design',title='区分总体、样本、单位与框，并修复覆盖问题',kind='design'),
 dict(id='survey-method',title='按现实限制比较普查与抽样调查',kind='design'),
 dict(id='statistic',title='按未知总体参数条件辨认并解释统计量',kind='concept'),
 dict(id='distribution',title='建立、解释并应用统计量的抽样分布',kind='procedure'),
 dict(id='mechanism',title='改变放回条件和统计量后重建抽样分布',kind='procedure'),
 dict(id='recall',title='回忆并区分抽样的核心概念',kind='memory')
],sections=sections,activities=activities,pathways=pathways)

(ROOT/'lesson.json').write_text(json.dumps(lesson,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
used=['SKILL.md','references/teaching-design.md','references/interactive-html.md','references/visual-design.md','references/engagement-and-narrative.md','references/modes-and-explanations.md','references/统计术语中英对照.md','references/考纲与考试局.md','references/deeptutor-provenance.md','scripts/build_lesson.py','assets/interactive/lesson-runtime.js','assets/interactive/lesson-runtime.css']
conditions={
 'generated_at_utc':datetime.now(timezone.utc).isoformat(),
 'request_environment_date':'2026-09-08',
 'task':'独立、从空白生成原创中文bgct课程；交互＞可视化＞文字',
 'scope_input':str(SCOPE), 'scope_sha256':hashlib.sha256(SCOPE.read_bytes()).hexdigest(),
 'skill_version':'1.7.0',
 'skill_file_sha256':{p:hashlib.sha256((SKILL/p).read_bytes()).hexdigest() for p in used},
 'author_file_sha256':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in ['author.py','lab.js','checkpoint.js','theme.css']},
 'exact_underlying_model':'未提供', 'model_revision':'未提供','temperature':'未提供','seed':'未提供',
 'execution':'当前课程纯本地运行，无外部服务；Python组装器内联公共CSS/JS、课程JSON与自定义脚本。',
 'generation_isolation':'未读取其他generation目录、旧成品、测试课程或技能examples；仅使用所列范围文件、技能参考与公共实现。',
 'verification_limit':'不启动浏览器、webserver或替代预览；真实视觉门槛由外层执行。jsdom仅提供实际DOM及状态执行证据。',
 'python':platform.python_version()
}
(ROOT/'generation-conditions.json').write_text(json.dumps(conditions,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'lesson':str(ROOT/'lesson.json'),'activities':len(activities),'pathways':len(pathways)},ensure_ascii=False))
