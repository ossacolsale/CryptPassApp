const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '..', 'src/DataHandlers/SecureStorage.ts'), 'utf8');

function createSecureStorage({ initialize = 'success', remove = 'success', timeoutMs = 8 } = {}) {
    let instance;
    const plugin = function (success, error, service) {
        this.service = service;
        this.remove = (onSuccess, onError, key) => {
            if (remove === 'success') queueMicrotask(() => onSuccess(key));
            else if (remove === 'error') queueMicrotask(() => onError(new Error('native remove failure')));
        };
        this.get = (onSuccess, onError, key) => {
            if (key === 'missing') queueMicrotask(() => onError(new Error('Key not found')));
            else queueMicrotask(() => onSuccess('value'));
        };
        instance = this;
        if (initialize === 'success') queueMicrotask(success);
        else if (initialize === 'error') queueMicrotask(() => error(new Error('native init failure')));
    };
    const context = {
        cordova: { platformId: 'android', plugins: { SecureStorage: plugin } },
        CommonHelpers: {
            StandardError() { return false; },
            withTimeout(promise, operation) {
                return Promise.race([
                    promise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error(operation + ' timed out')), timeoutMs))
                ]);
            }
        },
        window: { localStorage: { removeItem() {} } },
        Promise,
        Error
    };
    const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2017 } }).outputText;
    vm.runInNewContext(js + '\nglobalThis.__secureStorage = SecureStorage;', context);
    return { secureStorage: context.__secureStorage, getInstance: () => instance };
}

test('Android deletion uses the initialized SecureStorage instance and returns the removed key', async () => {
    const { secureStorage, getInstance } = createSecureStorage();
    assert.equal(await secureStorage.delVal('specific-key'), 'specific-key');
    assert.equal(getInstance().service, 'cryptpass_store');
});

test('Android deletion handles a missing key through the native remove success callback', async () => {
    const { secureStorage } = createSecureStorage();
    assert.equal(await secureStorage.delVal('missing'), 'missing');
});

test('Android deletion reports initialization and native callback failures as false', async () => {
    const initFailure = createSecureStorage({ initialize: 'error' });
    assert.equal(await initFailure.secureStorage.delVal('key'), false);
    const removeFailure = createSecureStorage({ remove: 'error' });
    assert.equal(await removeFailure.secureStorage.delVal('key'), false);
});

test('Android deletion is guarded by a timeout for initialization and native callbacks', async () => {
    const initTimeout = createSecureStorage({ initialize: 'pending', timeoutMs: 5 });
    assert.equal(await initTimeout.secureStorage.delVal('key'), false);
    const removeTimeout = createSecureStorage({ remove: 'pending', timeoutMs: 5 });
    assert.equal(await removeTimeout.secureStorage.delVal('key'), false);
});

