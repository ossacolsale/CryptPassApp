class AppActions {

    public async Unlock (pwd: string): Promise<boolean> {
        const data = await Config.readData();
        State.CryptPass = new LibCryptPass.CryptPassCached(StandardRnW, data.kp, data.se);
        const k = State.CryptPass.GetK(pwd);
        if (k) {
            State.K = k;
            try {
                State.EntriesManage = State.CryptPass.GetEntriesManage(State.K,true);
            } catch (error) {
                const keyPass = data.kp as { Key?: { FormatVersion?: number }; Pass?: { Entries?: unknown } };
                const formatVersion = keyPass && keyPass.Key ? keyPass.Key.FormatVersion : undefined;
                const entries = keyPass && keyPass.Pass ? keyPass.Pass.Entries : undefined;
                const entriesLength = typeof entries === 'string' ? entries.length : 0;
                let envelopeType = 'legacy-or-invalid';
                if (typeof entries === 'string') {
                    try {
                        const envelope = JSON.parse(entries) as { v?: unknown; alg?: unknown };
                        if (envelope && envelope.v === 2 && envelope.alg === 'A256GCM') envelopeType = 'aead-v2';
                        else if (envelope && typeof envelope === 'object') envelopeType = 'json-other';
                    } catch (_) { envelopeType = 'non-json'; }
                }
                const format = formatVersion === 2 ? 'v2' : 'legacy';
                const failure = error instanceof Error && error.message === 'Decryption failed' ? 'decrypt' : 'parse-or-structure';
                const diagnostic = 'UNLOCK_DIAG|' + format + '|' + envelopeType + '|' + entriesLength + '|' + failure;
                console.error('Key derivation returned a value, but decrypting/parsing Pass.Entries failed.', { formatVersion: formatVersion === undefined ? 1 : formatVersion, envelopeType: envelopeType, entriesLength: entriesLength, failure: failure, error: error });
                State.CryptPass = null;
                State.EntriesManage = null;
                State.K = '';
                State.Password = '';
                throw new Error(diagnostic);
            }
            State.Password = pwd;
            AutoLock.start();
            return true;
        } else {
            State.Password = '';
            return false;
        }
    }
        
            
    
}