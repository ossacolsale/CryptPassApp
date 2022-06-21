/** state variables: */
let __K_: string = '';
let __Password_: string = '';
let __EntriesManage_: EntriesManage;
//let __ConfigCryptPass_: ConfigCryptPass | undefined;
let __CryptPass_: CryptPassCached;

document.addEventListener('deviceready',
    () =>
    ScenarioController.changeScenario(new WelcomeView())
,false);
