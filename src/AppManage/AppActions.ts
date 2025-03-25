class AppActions {

    public async Unlock (pwd: string): Promise<boolean> {
        const data = await Config.readData();
        State.CryptPass = new LibCryptPass.CryptPassCached(StandardRnW, data.kp, data.se);
        const k = State.CryptPass.GetK(pwd);
        if (k) {
            State.K = k;
            State.EntriesManage = State.CryptPass.GetEntriesManage(State.K,true);
            State.Password = pwd;
            return true;
        } else {
            State.Password = '';
            return false;
        }
    }
        
            
    
}