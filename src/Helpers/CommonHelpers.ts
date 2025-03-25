class CommonHelpers {

    public static StandardError(e: unknown): false {
        console.log(e);
        return false;
    }

    public static CustomError(msg: string): false {
        console.log(msg);
        return false;
    }

    public static CheckNewPassword (pwd1: string, pwd2: string): boolean {
        let ok: boolean = false;
        if (pwd1 == '' && pwd2 == '') {
            alert('You have to type passwords before proceeding');
        } else if (pwd1.length < 10) {
            alert('Have you really typed a less than 10 characters password?');
        } else if (pwd1 != pwd2) {
            alert('Passwords don\'t match!');
        } else {
            ok = true;
        }
        return ok;
    }

    public static CheckChPassword (oldpwd: string, pwd1: string, pwd2: string): true | 'wrongOld' | 'wrongNew' {
        if (oldpwd !== State.Password) {
            alert('Old password is wrong, please retype');
            return 'wrongOld';
        } else if (oldpwd == pwd1 || oldpwd == pwd2) {
            alert('New password must be different from old');
            return 'wrongNew';
        } else {
            return this.CheckNewPassword(pwd1, pwd2) ? true : 'wrongNew';
        }
    }

    public static insensitiveSorter: (a: string, b: string) => number = (a: string, b: string) => { a=a.toLowerCase(); b=b.toLowerCase(); if (a<b) return -1; if (a>b) return 1; return 0; }

}