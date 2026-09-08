// Minimal public-contract probe, not lesson content and not a browser preview.
const { JSDOM } = require('../../repo/node_modules/jsdom');
const api = require('../../repo/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js');
const dom = new JSDOM('<!doctype html><main><div data-dt-activity="probe"></div></main>', { url: 'https://contract.invalid/' });
const lesson = {
  schemaVersion: 1, lessonId: 'contract-only-run02', revision: '1', title: 'Contract probe',
  objectives: [{ id: 'probe-goal', title: 'Probe', kind: 'concept' }],
  activities: [{ id: 'probe', objectiveId: 'probe-goal', type: 'interactive', title: 'Probe', prompt: 'Probe',
    source: { repository: 'DialogueTutor', path: 'references/interactive-html.md' }, bodyHtml: '<p>Probe</p>' }]
};
const instance = api.mount(lesson, dom.window.document, { storage: dom.window.localStorage, now: () => 1000, sessionId: 'probe-session' });
const older = instance.exportState();
let inMemoryContacts = [];
function emit(state) {
  dom.window.document.dispatchEvent(new dom.window.CustomEvent('dt:exploration', { detail: { activityId: 'probe', state } }));
}
emit({ contacts: [{ identity: 'already-observed-condition', at: 1000 }] });
inMemoryContacts = instance.getState().activities.probe.exploration.contacts;
const beforeImport = instance.getState().activities.probe;
dom.window.document.addEventListener('dt:restore', e => {
  if (e.detail.activityId !== 'probe') return;
  inMemoryContacts = [...inMemoryContacts, ...(e.detail.state.contacts || [])];
});
instance.importState(older);
const afterImport = instance.getState().activities.probe;
const immediateExport = instance.exportState().state.activities.probe;
const persisted = JSON.parse(dom.window.localStorage.getItem(instance.storageKey)).state.activities.probe;
// The only advertised state write does persist, but treats restore as another operation.
emit({ contacts: inMemoryContacts });
const afterExplorationWrite = instance.getState().activities.probe;
const result = {
  result: 'public-contract-gap-confirmed',
  afterRealObservation: { explorationCount: beforeImport.explorationCount, contacts: beforeImport.exploration.contacts },
  afterOldImport: { explorationCount: afterImport.explorationCount, contacts: afterImport.exploration.contacts || [], inMemoryContacts },
  immediateExportContacts: immediateExport.exploration.contacts || [],
  immediatePersistedContacts: persisted.exploration.contacts || [],
  usingAdvertisedWriteAfterRestore: {
    explorationCountBefore: afterImport.explorationCount,
    explorationCountAfter: afterExplorationWrite.explorationCount,
    contacts: afterExplorationWrite.exploration.contacts
  },
  mountedPublicMethods: Object.keys(instance),
  scope: 'Real runtime mounted in jsdom; no browser, webserver, preview, visual or learning-effect claim.'
};
if (result.immediateExportContacts.length !== 0 || result.immediatePersistedContacts.length !== 0 || afterExplorationWrite.explorationCount !== afterImport.explorationCount + 1) {
  throw new Error('Public runtime changed; reproduce and reassess the contract rather than reusing this result.');
}
console.log(JSON.stringify(result, null, 2));
dom.window.close();
