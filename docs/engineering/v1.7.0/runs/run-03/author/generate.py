#!/usr/bin/env python3
"""Run-03 original author source; writes JSON, never modifies assembled HTML."""
from pathlib import Path
from fractions import Fraction
import json

ROOT = Path(__file__).resolve().parent.parent
HERE = Path(__file__).resolve().parent
DT = {"repository": "DialogueTutor", "path": "references/teaching-design.md", "case": "Run-03 原创情境、任务编排与表现分支"}
QUIZ = {"repository": "HKUDS/DeepTutor", "path": "web/app/(workspace)/books/components/blocks/QuizBlock.tsx", "commit": "42fab3cf429a1fbf36b257ab8d116a3814964202", "case": "公共题卡，原创题目"}
STEPS = {"repository": "HKUDS/DeepTutor", "path": "deeptutor/agents/visualize/agents/code_generator_agent.py", "commit": "42fab3cf429a1fbf36b257ab8d116a3814964202", "case": "公共步进显示，原创完整例题"}

def m(content):
    return '<math xmlns="http://www.w3.org/1998/Math/MathML">' + content + '</math>'

XBAR = '<mover><mi>X</mi><mo>¯</mo></mover>'
MEAN = m(XBAR + '<mo>=</mo><mfrac><mrow><msub><mi>X</mi><mn>1</mn></msub><mo>+</mo><msub><mi>X</mi><mn>2</mn></msub></mrow><mn>2</mn></mfrac>')

def table(head, rows, caption=''):
    return '<table>' + (f'<caption>{caption}</caption>' if caption else '') + '<thead><tr>' + ''.join(f'<th scope="col">{h}</th>' for h in head) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{v}</td>' for v in row) + '</tr>' for row in rows) + '</tbody></table>'

def activity(id, objective, title, prompt, type='quiz', **fields):
    return dict(id=id, objectiveId=objective, type=type, title=title, prompt=prompt, source=DT if type=='interactive' else STEPS if type=='steps' else QUIZ, **fields)

def section(id, title, lead, body, ids, explanation='查看本任务的完整讲解与参考'):
    return dict(id=id, title=title, lead=lead, bodyHtml=body, activityIds=ids, explanationTitle=explanation)

survey_prompt = ('维修站本月收到120个替换灯罩，每个可单独识别。登记册漏掉一箱12个灯罩，只列出108个编号。'
    '现在从登记册的108个编号中等概率、不放回抽出24个，对相应灯罩做破坏性抗压测试。'
    '研究目标是这120个灯罩的抗压表现。先备：总体是研究对象全体；样本是实际抽取的部分；抽样单位是一次选取的对象；抽样框是用于抽样的清单。'
    '请写出①population、②sample、③sampling unit、④sampling frame，指出登记册的具体问题；'
    '⑤在破坏性测试且预算有限的条件下，选择普查 census 还是抽样调查 sample survey，写一个取舍。')
survey_model = ('总体是本月全部120个替换灯罩；样本是实际抽中的24个灯罩；抽样单位是一个灯罩；抽样框是含108个编号的登记册。'
    '漏掉的12个仍属于总体，却没有被抽中的机会，存在覆盖遗漏。应先补全抽样框再随机抽取。'
    '在破坏性测试且预算有限时可选抽样调查，减少被毁的灯罩、时间和费用；代价是存在抽样变异，样本不能保证完全反映总体。'
    '普查测试全部120个，无抽样误差但损毁全部、成本高，仍可能有测量或记录错误。')
survey_body = ('<p>先明确“要对谁作结论”，再选资料来源。' + survey_model + '</p>'
    + table(['术语','本题对象'], [['总体 population','120个灯罩'],['样本 sample','实际抽中的24个灯罩'],['抽样单位 sampling unit','一个灯罩'],['抽样框 sampling frame','列出108个编号的登记册']])
    + '<p>抽样框是一份用于选取的清单，不是总体的同义词。清单完整时，才可能让目标总体中的每个单位被抽到。'
    '本题的随机选择只能解决108个编号之间的选择问题，不能补回根本不在名单上的12个。</p>'
    '<p>简单随机样本（simple random sample）要求固定样本量下，每一组可能样本有相同机会。若每次从剩余编号中等概率抽取，直至取满24个，得到登记册范围内的简单随机样本。'
    '不要把“方便找到的24个”当作随机样本。普查（census）调查全体，抽样调查（sample survey）只调查其中一部分。</p>'
    + table(['做法','可能的优点','代价与限制'], [['普查','覆盖全体，无抽样变异；适合对象少、无损且成本可接受的核对','时间与成本高；本题会破坏全部产品；仍可能测错、漏记'], ['抽样调查','较快、较省；破坏性试验损耗少','存在抽样变异；抽样框和选择机制也可能带来偏差']])
    + '<p>评价依据来自本题约束，没有一种方法在所有任务中都最好。以上是自拟核对要点，不是官方评分细则。</p>')

stat_prompt = ('从某批灯罩的抗压力总体随机抽取两个测量值 X₁、X₂，单位为牛顿。总体均值 μ 未知。统计量 statistic 必须只由样本和已知常数计算。以下哪个量是统计量？')
stat_body = ('<p>统计量（statistic）是样本观测值与已知常数的函数，不含未知总体参数（population parameter）。用途是把一组样本压缩为可比较的数值。</p>'
    '<p>样本均值可直接从两次测量算出：' + MEAN + '。例如样本为10 N与14 N，均值为12 N，不需要知道μ。抽样前，样本未定，样本均值也是随机变量；抽样后，12 N是它的一次观测值。</p>'
    '<p>μ描述整个总体，本题未知。X₁−μ、(X₁+X₂)/(2μ)及μ本身都不能仅用本题样本求出，因而不满足这里的统计量定义。'
    '若演示中把另一个小总体的所有值列出来，不会改变本题“μ未知”的条件。</p>'
    '<p>完整答案：选择(X₁+X₂)/2。需要检查的是计算是否依赖未知参数，不是表达式看上去有没有随机字母。</p>')

lab_rows=[]
for n in [1,2]:
    for mechanism in ['with','without']:
        paths=[(a,) for a in [2,4,8]] if n==1 else [(a,b) for a in [2,4,8] for b in [2,4,8] if mechanism=='with' or a!=b]
        vals=[sum(x)/n for x in paths]
        lab_rows.append([n, '有放回' if mechanism=='with' else '无放回', *[str(Fraction(sum(x>=t for x in vals),len(vals))) for t in [5,6,8]]])
lab_body = ('<p>本全解覆盖实验中全部可选条件：总体值2、4、8分钟，样本量1或2，有放回或无放回，门槛5、6或8分钟。查看后，新的实验预测会标记全解接触。</p>'
    '<p>抽样分布（sampling distribution）描述在一个固定抽样方案下，统计量的所有可能取值及各自的概率。'
    '一次样本只有一个均值；反复实施同一方案，才会看到均值的变化。理论抽样分布不需要实际反复抽很多次，可以枚举或推导得到。</p>'
    '<p>有放回抽2次：每次3种选择，两次独立，9条有序路径各有概率1/9。先把每条路径代入' + MEAN + '，再合并相同均值。'
    '“路径等可能”不表示“不同均值等可能”。</p>'
    + table(['均值（分钟）','有序路径','理论概率'], [[2,'(2,2)','1/9'],[3,'(2,4)、(4,2)','2/9'],[4,'(4,4)','1/9'],[5,'(2,8)、(8,2)','2/9'],[6,'(4,8)、(8,4)','2/9'],[8,'(8,8)','1/9']])
    + '<p>默认门槛5下，达到门槛的路径数为2+2+1=5，因此P(均值≥5)=5/9；单卡只有8达到门槛，P(X≥5)=1/3，所以前者更大。'
    '条件改变后重新计数，不能沿用5/9。</p>'
    '<p>无放回抽2次：第一次3种，第二次剩2种，6条有序路径各有概率1/6，两次不独立。'
    '均值3、5、6分别来自两条路径，概率均为1/3。此时没有(2,2)、(4,4)、(8,8)。样本量1时均值就是单张值，机制没有影响。</p>'
    + table(['n','机制','P(均值≥5)','P(均值≥6)','P(均值≥8)'],lab_rows,'全部实验条件的核对表')
    + '<p>三个门槛对应的单卡概率均为1/3。比较表内数值可以出现更小、相等或更大；这种关系由总体、统计量、样本量、机制和事件共同决定。</p>'
    '<p>枚举是理论计算；随机模拟得到的是有限次的相对频率，可能偏离理论值。本实验不用随机模拟，不把手选路径当作随机抽样次数。</p>')

worked_steps = [
    {'title':'先定基本结果与概率','bodyHtml':'<p>两张不同工时卡为1、7分钟，等概率有放回抽2次。记录顺序，得到(1,1)、(1,7)、(7,1)、(7,7)。因为每次都是1/2且独立，每条路径概率为1/4。</p>'},
    {'title':'把样本变成一个统计量','bodyHtml':'<p>统计量是样本均值。将每条路径代入'+MEAN+'，分别得到1、4、4、7分钟。两个不同路径都给出均值4。</p>'},
    {'title':'合并路径概率并检查','bodyHtml':table(['均值 x（分钟）','1','4','7'],[['P(均值=x)','1/4','1/2','1/4']])+'<p>互斥路径(1,7)与(7,1)的概率相加，得P(均值=4)=1/4+1/4=1/2。概率非负且总和为1，完整分布成立。一次样本若为(1,7)，只给一个观测均值4；不是整个分布。</p>'}
]
worked_body = '<p>任务：两张卡1、7分钟，等概率有放回抽2次，求样本均值的完整抽样分布。</p>' + ''.join('<h3>'+s['title']+'</h3>'+s['bodyHtml'] for s in worked_steps) + '<p>接着用另一组卡补全概率，再独立改变统计量。这里的步进只是看完整例题，不接收独立答案。</p>'

completion_prompt = ('三张不同卡标有0、3、6分钟，每次等概率抽取，放回后再抽一次，两次独立。统计量为两张卡的样本均值。已列出9条等可能有序路径，且每条概率为1/9。请补上关键一步：P(样本均值=3)=？输入精确分数或小数。')
completion_explain = '均值=3要求两数和为6，满足条件的有序样本为(0,6)、(3,3)、(6,0)。互斥概率相加，得3×1/9=1/3。若结果不符，先把每个候选样本的两数相加，保留顺序不同的两条路径。'
completion_body = '<p>'+completion_prompt+'</p><p>'+completion_explain+'</p>' + table(['第一张＼第二张','0','3','6'],[[0,0,'1.5',3],[3,'1.5',3,'4.5'],[6,3,'4.5',6]],'格内为均值（分钟），每格概率1/9') + '<p>完整分布的均值取值为0、1.5、3、4.5、6，概率依次为1/9、2/9、3/9、2/9、1/9，总和为1。</p>'

ind_prompt = ('独立新题：三张不同卡为1、4、9分钟，等概率有放回抽2次，两次独立。现在统计量改为较大值 M=max(X₁,X₂)。请写出M的完整抽样分布（所有取值和精确概率），说明基本样本为何等可能，以及怎样合并；最后说明一次抽到(1,9)得到的M，与整个抽样分布有什么区别。')
ind_model = ('9条有序基本样本各有概率1/9。M=1仅由(1,1)产生，概率1/9；M=4由(1,4)、(4,1)、(4,4)产生，概率3/9=1/3；M=9由(1,9)、(4,9)、(9,1)、(9,4)、(9,9)产生，概率5/9。总概率(1+3+5)/9=1。一次样本(1,9)给出单个观测值M=9；完整抽样分布说明全部可能的M及概率。')
ind_body = '<p>'+ind_prompt+'</p><p>'+ind_model+'</p>'+table(['M（分钟）',1,4,9],[['P(M=m)','1/9','1/3','5/9']])+'<p>也可先累计：M≤4要求两张都来自{1,4}，概率(2/3)²=4/9；再减去M=1的1/9，得M=4的3/9。统计量改变后必须重新映射每条样本，不能照搬均值分布。评价要点为自拟。</p>'

prob_prompt = ('独立计算：三张不同卡为2、5、10分钟，等概率有放回抽2次，两次独立。统计量改为极差 R=max(X₁,X₂)−min(X₁,X₂)。求P(R≥5)。请自行组织样本空间，输入精确分数或小数。')
prob_explain = ('9条等可能有序样本中，(2,10)、(10,2)给R=8，(5,10)、(10,5)给R=5。因此P(R≥5)=4/9。其余样本极差为0或3。数值不符时先检查“≥”包含等于5，并保留每对的两个顺序；页面不知道你的具体错误原因。')
prob_body = '<p>'+prob_prompt+'</p><p>'+prob_explain+'</p>'+table(['R（分钟）',0,3,5,8],[['有序路径数',3,2,2,2],['理论概率','1/3','2/9','2/9','2/9']])+'<p>R只由样本计算，是统计量。完整分布各项非负，总和为1。此次数值核对只能确认概率结果；完整推导仍应能用样本路径解释。</p>'

without_prompt = ('改变条件：三张不同工时卡为3、6、12分钟。第一次从3张中等概率抽1张，不放回；第二次从剩下2张中等概率抽1张。以两张卡的样本均值为统计量。请写完整抽样分布，说明每条有序样本的概率和两次为何不独立；说明即使未知总体均值μ，样本均值是否仍为统计量。最后区分：抽取前的随机变量，与已抽到(3,12)后记录的一个均值。')
without_model = ('6条允许的有序样本各有概率(1/3)×(1/2)=1/6。(3,6)、(6,3)给均值4.5；(3,12)、(12,3)给7.5；(6,12)、(12,6)给9，因此概率均为2/6=1/3。概率总和为1。第二次的选择依赖第一次：例如已抽到3后，再抽3的概率为0，所以不独立。样本均值只由两个样本值与已知常数2计算，不依赖未知μ，因此仍是统计量。抽取前样本未定，均值可取4.5、7.5、9，是随机变量；抽到(3,12)后记录的7.5分钟是这个统计量的一次观测值，不是整个分布。')
without_body = '<p>'+without_prompt+'</p><p>'+without_model+'</p>'+table(['样本均值（分钟）','4.5','7.5','9'],[['概率','1/3','1/3','1/3']])+'<p>也可采用3组无序样本{3,6}、{3,12}、{6,12}，本题每组恰由2条有序路径合并，故各组等概率1/3。不能在未说明机制时假定所有无序样本都等可能。有放回时，(3,3)与{3,6}包含的有序路径数不同。</p>'

activities = [
    activity('survey-plan','population-design','先决定调查谁',survey_prompt,format='open',modelAnswer=survey_model,rubric=['总体120个、样本24个、单位一个灯罩、抽样框108个编号登记册四项对应准确。','指出遗漏12个仍在总体中，补全抽样框才能覆盖目标总体。','结合破坏性与预算给选择和代价；不说普查消除所有错误。'],hint='先分别圈出“要对其作结论的全部对象”“实际测量的对象”“一次选中的对象”“用于选取的清单”。',explanation='逐项核对对象，再用破坏性与预算约束评价方法。',solutionId='dt-explanation-survey'),
    activity('statistic-check','statistic-concept','哪个量不依赖未知参数？',stat_prompt,format='choice',choices=[
        {'id':'sample','text':'(X₁+X₂)/2','feedback':'这个式子只需要样本和已知常数2。你选择了符合定义的表达式。'},
        {'id':'ratio','text':'(X₁+X₂)/(2μ)','feedback':'分母还需要未知μ。先把X₁、X₂代入，你仍无法得到唯一数值；核对统计量的“仅由样本和已知常数”条件。'},
        {'id':'parameter','text':'μ','feedback':'μ描述整个总体，本题没有给出；它不是从这个样本直接算出的统计量。先辨认总体参数与样本函数。'},
        {'id':'center','text':'X₁−μ','feedback':'即使X₁已知，未知μ仍阻止计算。减去已知数5可算，减去本题未知μ不可直接算。'}],answer='sample',hint='假设两次测量为10和14；哪一式能在不知道μ时算出数值？',explanation='(X₁+X₂)/2可从样本直接计算；其余选项依赖本题未知的总体均值μ。',solutionId='dt-explanation-statistic'),
    activity('sample-lab','sampling-distribution','均值越过门槛，会更常见吗？','先固定条件，再预测概率关系；揭示后跟踪有序样本怎样合并成均值分布。',type='interactive',bodyHtml=(HERE/'lab-body.html').read_text(),script=(HERE/'lab.js').read_text(),solutionId='dt-explanation-lab'),
    activity('worked-distribution','sampling-distribution','完整例题：从四条路径到分布','两张卡1、7分钟，等概率有放回抽2次。跟随完整例题确定样本均值的抽样分布。若方法熟悉，可直接进入下一题。',type='steps',steps=worked_steps,solutionId='dt-explanation-worked'),
    activity('distribution-completion','sampling-distribution','补全：哪些路径给均值3？',completion_prompt,format='numeric',answer='1/3',tolerance=0.000001,explanation=completion_explain,hint='均值等于3相当于两张卡的值之和等于6。列出满足条件的有序对，再乘每条路径概率。',remediation='返回完整例题，检查两个不同顺序如何合并到同一均值。',solutionId='dt-explanation-completion'),
    activity('distribution-independent','sampling-distribution','独立构造：改用最大值',ind_prompt,format='open',modelAnswer=ind_model,rubric=['写出M=1、4、9，概率依次为1/9、1/3、5/9。','说明放回且独立，9条有序路径等概率，合并路径或累计后相减的依据正确。','区分M=9的一次观测与全部取值及概率，并检验概率和为1。'],hint='把9条有序样本都写出；每对只保留较大值，再数每种结果出现几次。',explanation='这里统计量变成最大值，必须重新把样本映射成M；原答保存后由你按要点评价。',solutionId='dt-explanation-independent'),
    activity('distribution-probability','sampling-distribution','独立求极差概率',prob_prompt,format='numeric',answer='4/9',tolerance=0.000001,explanation=prob_explain,hint='逐对求较大值减较小值，再筛选极差至少5的有序路径；同一张值抽两次，极差是0。',remediation='在完整例题重新检查“有序路径等可能→按统计量合并”这一步，然后返回核对极差。',solutionId='dt-explanation-probability'),
    activity('without-replacement','statistic-concept','迁移：无放回时重新构造',without_prompt,format='open',modelAnswer=without_model,rubric=['允许6条有序路径且每条1/6；没有(3,3)、(6,6)、(12,12)。','均值4.5、7.5、9，各概率1/3，并核对总和1。','用具体条件概率说明不独立；样本均值不依赖未知μ，所以仍是统计量。','抽取前均值随随机样本变化；抽到(3,12)后的7.5分钟是一次观测值。'],hint='第一次3种选择，第二次只剩2种。先列允许的有序样本，再计算均值。',explanation='此题同时改变抽样机制并要求说明统计量定义，开放原答与自评分开保存。',solutionId='dt-explanation-without'),
    activity('evidence-close','sampling-distribution','带着真实证据收束','回看本轮实验的条件与自己实际提交的答案，选择一个改变条件的挑战或一个回顾入口。',type='interactive',bodyHtml=(HERE/'close-body.html').read_text(),script=(HERE/'close.js').read_text())
]

sections = [
    section('survey','调查从对象开始','你要决定测试哪些灯罩；先让总体、名单和实际样本各归其位。',survey_body,['survey-plan']),
    section('statistic','用样本计算一个量','样本测完以后，哪些量能直接算出来？',stat_body,['statistic-check']),
    section('lab','把抽样方案固定下来','同一张卡的值与两张卡的均值，会有怎样的概率关系？先留下自己的判断。',lab_body,['sample-lab'],'查看实验原理、全部条件概率表与完整答案'),
    section('worked','把方法完整走一遍','若你还不熟悉枚举，先用两张卡看清“路径→统计量→概率”。',worked_body,['worked-distribution']),
    section('completion','把关键一步交给你','另一组卡保留相同机制：现在由你找出该合并的路径。',completion_body,['distribution-completion']),
    section('independent','自行构造完整分布','保留放回条件，改用最大值；需要重新决定怎样归组。',ind_body,['distribution-independent']),
    section('probability','留下独立数值证据','再换一组卡与统计量，检验你能否把枚举用于一个概率问题。',prob_body,['distribution-probability']),
    section('without','改变机制再应用','这次不放回，哪些样本不再可能？用新题把依据写出来。',without_body,['without-replacement']),
    section('close','哪些关系已经留下证据？','看到结果、提交计算和自评解释，是不同的记录。', '<p>本章的三个核心问题：调查对象与抽样机制是什么；统计量是否只用样本和已知常数；固定抽样方案下，统计量如何取不同值及相应概率。</p><p>收束依据本页面实际记录，不把探索参与变成正确性、不把自评改成客观分数，也不把当场重试称作延迟保持。回顾入口采用公共运行时的真实日期与重试流程。</p><p>范围依据：Pearson S2 Student Book官方样章目录的第六章6.1–6.3，以及S2规范4.1–4.2；本课题目与核对要点均为原创。第七章假设检验不在本课范围。</p><p><a href="https://www.pearson.com/content/dam/one-dot-com/one-dot-com/international-schools/pdfs/secondary-curriculum/international-a-levels/mathematics/International-A-Level-Mathematics-Statistics-2-Student-Book-sample.pdf">Pearson官方样章目录</a>；<a href="https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Mathematics/2018/Specification-and-Sample-Assessment/international-a-level-maths-spec.pdf">Pearson IAL规范</a>。依据本轮提供的2026-09-07范围核对，未取得教材本章全文。</p>', ['evidence-close'],'查看章节依据与记录含义')
]

pathways=[]
def paths(source, mapping):
    for outcome, (target,label) in mapping.items(): pathways.append(dict(from_=source,on=outcome,to=target,label=label))
paths('survey-plan', {'incorrect':('survey-plan','依据对象表重新核对调查方案'),'assisted':('statistic-check','继续判断样本能算出的量'),'skipped':('worked-distribution','先从两张卡的完整例题开始')})
paths('statistic-check', {'incorrect':('worked-distribution','看清一个样本怎样产生一个统计量'),'assisted':('distribution-completion','在另一组卡中练习样本计算'),'correct':('sample-lab','预测并验证均值的抽样分布'),'skipped':('worked-distribution','先看完整例题中的样本均值')})
paths('sample-lab', {'assisted':('distribution-completion','把实验中的归组方法用于新题'),'skipped':('worked-distribution','先看两张卡的完整例题')})
paths('worked-distribution', {'skipped':('distribution-completion','直接尝试概率补全')})
paths('distribution-completion', {'incorrect':('worked-distribution','回到例题核对互斥路径的合并'),'assisted':('distribution-independent','在未给完整表的新题中独立组织'),'correct':('distribution-probability','改用极差求一个新概率'),'skipped':('worked-distribution','先查看一遍完整方法')})
paths('distribution-independent', {'incorrect':('worked-distribution','返回样本到统计量的完整映射'),'assisted':('distribution-probability','再用极差留下数值作答'),'skipped':('distribution-completion','先补全一项关键概率')})
paths('distribution-probability', {'incorrect':('worked-distribution','用完整例题检查有序样本与合并'),'assisted':('without-replacement','换成无放回条件写出依据'),'correct':('evidence-close','检查已有证据并安排回顾'),'skipped':('distribution-completion','先完成路径合并的关键一步')})
paths('without-replacement', {'incorrect':('worked-distribution','对照完整例题中有放回的依据'),'assisted':('evidence-close','区分已有的辅助与独立证据'),'skipped':('sample-lab','先在实验中切换抽样机制')})
for p in pathways: p['from']=p.pop('from_')

lesson = dict(schemaVersion=1,lessonId='s2-ch6-workshop-cards-run03',revision='run03-v2',presentation='studio',title='抽样与抽样分布｜从调查名单到工时卡',language='zh-CN',mode='bgct',objectives=[
    {'id':'population-design','title':'在具体调查中区分总体、样本、单位与抽样框，并评价普查和抽样调查','kind':'design'},
    {'id':'statistic-concept','title':'按是否依赖未知总体参数判定统计量，并解释其随机性','kind':'concept'},
    {'id':'sampling-distribution','title':'按固定抽样机制枚举样本、构造统计量的抽样分布并求概率','kind':'procedure'}],activities=activities,sections=sections,pathways=pathways)
(ROOT/'lesson.json').write_text(json.dumps(lesson,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'file':str(ROOT/'lesson.json'),'activities':len(activities),'sections':len(sections),'objectives':len(lesson['objectives']),'revision':lesson['revision']},ensure_ascii=False))
