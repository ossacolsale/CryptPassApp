class AppActions {

    public async Unlock (pwd: string): Promise<boolean> {
        let data: { kp: {}; se: {} };
        try {
            data = await Config.readData();
        } catch (error) {
            throw new Error(this.unlockDiagnostic('load-vault', undefined, undefined, error));
        }
        try {
            State.CryptPass = new LibCryptPass.CryptPassCached(StandardRnW, data.kp, data.se);
        } catch (error) {
            throw new Error(this.unlockDiagnostic('initialize-reader', data.kp, data.se, error));
        }
        let k: string | false;
        try {
            k = State.CryptPass.GetK(pwd);
        } catch (error) {
            throw new Error(this.unlockDiagnostic('derive-key', data.kp, data.se, error));
        }
        if (k) {
            State.K = k;
            try {
                State.EntriesManage = State.CryptPass.GetEntriesManage(State.K,true);
            } catch (error) {
                const diagnostic = this.unlockDiagnostic('decrypt-entries', data.kp, data.se, error);
                console.error('Key derivation succeeded, but decrypting/parsing Pass.Entries failed.', diagnostic);
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

    private unlockDiagnostic(phase: string, keyPassData: unknown, sequenceData: unknown, error: unknown): string {
        const keyPass = keyPassData && typeof keyPassData === 'object' ? keyPassData as {
            Key?: { FormatVersion?: unknown; Kdf?: { name?: unknown; N?: unknown; r?: unknown; p?: unknown }; MasterKChunks?: unknown };
            Pass?: { Entries?: unknown };
        } : undefined;
        const key = keyPass?.Key;
        const entries = keyPass?.Pass?.Entries;
        let envelope: { v?: unknown; alg?: unknown; nonce?: unknown; ciphertext?: unknown; tag?: unknown } | undefined;
        if (typeof entries === 'string') {
            try {
                const parsed: unknown = JSON.parse(entries);
                if (parsed && typeof parsed === 'object') envelope = parsed as typeof envelope;
            } catch (_) { /* Keep only the non-JSON classification below. */ }
        }
        const sequence = sequenceData && typeof sequenceData === 'object'
            ? (sequenceData as { Sequence?: unknown }).Sequence : undefined;
        const errorName = error instanceof Error ? error.name : typeof error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const failure = errorMessage === 'Decryption failed' ? 'authentication-or-decryption'
            : error instanceof SyntaxError ? 'plaintext-json-parse'
                : 'library-or-input-structure';
        return 'UNLOCK_DIAG|' + JSON.stringify({
            version: 1,
            phase: phase,
            keyDerivation: phase === 'decrypt-entries' ? 'success' : 'not-completed',
            vaultFormat: key?.FormatVersion === undefined ? 'legacy' : key.FormatVersion,
            kdf: key?.Kdf && { name: key.Kdf.name, N: key.Kdf.N, r: key.Kdf.r, p: key.Kdf.p },
            masterKeyChunks: Array.isArray(key?.MasterKChunks) ? key?.MasterKChunks.length : 0,
            sequenceItems: Array.isArray(sequence) ? sequence.length : 0,
            entriesChars: typeof entries === 'string' ? entries.length : null,
            envelope: envelope ? {
                version: envelope.v,
                algorithm: envelope.alg,
                nonceChars: typeof envelope.nonce === 'string' ? envelope.nonce.length : null,
                ciphertextChars: typeof envelope.ciphertext === 'string' ? envelope.ciphertext.length : null,
                tagChars: typeof envelope.tag === 'string' ? envelope.tag.length : null
            } : typeof entries === 'string' ? 'non-json' : 'missing-or-non-string',
            failure: failure,
            errorType: errorName,
            libraryError: errorMessage === 'Decryption failed' || errorMessage === 'Invalid sequence' || errorMessage === 'Invalid key data'
                ? errorMessage : undefined
        });
    }
        
            
    
}