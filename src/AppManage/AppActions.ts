class AppActions {

    public async Unlock (pwd: string): Promise<boolean> {
        const data = await Config.readData();
        __CryptPass_ = new LibCryptPass.CryptPassCached(StandardRnW, data.kp, data.se);
        const k = __CryptPass_.GetK(pwd);
        if (k) {
            __K_ = k;
            __EntriesManage_ = __CryptPass_.GetEntriesManage(__K_,true);
            __Password_ = pwd;
            return true;
        } else {
            __Password_ = '';
            return false;
        }
    }
        
            
    
}