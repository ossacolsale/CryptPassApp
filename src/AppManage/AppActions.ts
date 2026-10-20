type UnlockResult = { status: 'unlocked' | 'wrong-password' | 'legacy-unlock-failed' } | { status: 'migration-required'; notice?: string };

class AppActions {

    public async Unlock (pwd: string): Promise<UnlockResult> {
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
            if (State.CryptPass.MigrationRequired) {
                State.K = '';
                State.Password = '';
                State.EntriesManage = null;
                return { status: 'migration-required', notice: State.CryptPass.MigrationNotice };
            }
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
            try {
                const vaultUri = await Config.getActiveKeyPassUri();
                if (vaultUri !== false) await FS.DiscardMigrationBackup(vaultUri);
            } catch (_) { /* A stale migration backup is safe to retain after authenticated reopen. */ }
            State.Password = pwd;
            AutoLock.start();
            return { status: 'unlocked' };
        } else {
            const key = data.kp && typeof data.kp === 'object'
                ? (data.kp as { Key?: { FormatVersion?: unknown } }).Key : undefined;
            const isLegacy = key?.FormatVersion === undefined || key.FormatVersion === 1;
            State.CryptPass = null;
            State.EntriesManage = null;
            State.K = '';
            State.Password = '';
            return { status: isLegacy ? 'legacy-unlock-failed' : 'wrong-password' };
        }
    }

    public CancelLegacyMigration(): void {
        State.CryptPass = null;
        State.EntriesManage = null;
        State.K = '';
        State.Password = '';
    }

    public async MigrateLegacy(pwd: string): Promise<boolean> {
        const cryptPass = State.CryptPass;
        if (!cryptPass.MigrationRequired) return false;
        let vaultUri: string|false = false;
        try {
            vaultUri = await Config.getActiveKeyPassUri();
            if (vaultUri === false) throw new Error('Vault reference unavailable');
            if (!await cryptPass.MigrateLegacy(pwd)) throw new Error('Library migration failed');

            // Reopen from storage and authenticate both the master key and entries before
            // discarding the original-vault backup retained by the writer.
            const persisted = await Config.readData();
            const reopened = new LibCryptPass.CryptPassCached(StandardRnW, persisted.kp, persisted.se);
            const key = reopened.GetK(pwd);
            if (!key || reopened.MigrationRequired) throw new Error('Migrated vault could not be reopened');
            const entries = reopened.GetEntriesManage(key, true);

            State.CryptPass = reopened;
            State.K = key;
            State.EntriesManage = entries;
            State.Password = pwd;
            await FS.DiscardMigrationBackup(vaultUri);
            AutoLock.start();
            return true;
        } catch (error) {
            console.error('Legacy vault migration failed');
            if (vaultUri !== false) {
                try {
                    if (await FS.RestoreMigrationBackup(vaultUri)) await FS.DiscardMigrationBackup(vaultUri);
                } catch (_) { /* Keep any recoverable backup and leave the vault locked. */ }
            }
            this.CancelLegacyMigration();
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
