"""Classify raw DOM observations without turning an unloaded img slot into a media mismatch."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
r=json.loads((ROOT/'reviews/correction-code-course-results.json').read_text())
m=json.loads((ROOT/'generation/correction-run-01/manim-manifest.json').read_text())
empty='e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
placeholders=[i for i in r['staticImages'] if i['hash']==empty and i['hidden'] and not i['frameId']]
static=[i for i in r['staticImages'] if i not in placeholders]
used={i['frameId'] for i in static+r['requests'] if i['frameId']}
expected={i['frameId'] for i in m['frames']}
result={
 'rawHarnessNote':'P09/static-images-match treated the hidden source-less explorer placeholder as image bytes; preserve the raw false assertion, exclude that placeholder from byte verification.',
 'emptyHiddenPlaceholders':len(placeholders),
 'staticImagesWithBytes':len(static),
 'actualStaticByteMismatches':[i for i in static if not i['frameId']],
 'uniqueActualRequestedFrames':len({i['frameId'] for i in r['requests']}),
 'actualRequestByteMismatches':[i for i in r['requests'] if not i['frameId']],
 'usedFrameUnion':len(used), 'manifestFrames':len(expected),
 'missingFrameIds':sorted(expected-used), 'extraFrameIds':sorted(used-expected),
 'confirmedFailedAssertions':[c['id'] for c in r['checks'] if not c['pass'] and c['id']!='P09/static-images-match'],
 'mediaDisplayLimit':'No load callbacks were fabricated. Byte/request verification is not image decode/display verification.'
}
(ROOT/'reviews/correction-code-course-classification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
