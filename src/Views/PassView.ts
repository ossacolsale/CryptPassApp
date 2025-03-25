class PassView extends View implements ViewModel {

    protected readonly IdGoToInit: string = 'goToInit';
    protected readonly IdLogout: string = 'goToMainMenu';
    protected readonly IdOtherOptions: string = 'goToOtherOptions';
    
    protected readonly IdEntriesList: string = 'entries';
    protected readonly IdNewEntry: string = 'newEntry';

    protected readonly IdSearch: string = 'Search';
    protected readonly IdSearchDiv: string = 'SearchDiv';
    protected readonly IdTagFilter: string = 'TagFilter';
    protected readonly IdShowHideTags: string = 'ShowHideTags';

    protected readonly IdAddEntryForm: string = 'AddEntryForm';
    protected readonly IdAddEntry: string = 'AddEntry';
    protected readonly IdName: string = 'Name';
    protected readonly IdDesc: string = 'Desc';
    protected readonly IdTags: string = 'Tags';

    protected readonly IdSpanSelExistingTags: string = 'SpanSelExistingTags';
    protected readonly IdSelExistingTags: string = 'SelExistingTags';
    protected readonly IdExistingTags: string = 'ExistingTags';
    protected readonly IdCloseSelExistingTags: string = 'CloseSelExistingTags';

    protected readonly IdUsername: string = 'Username';
    protected readonly IdPassword: string = 'Password';
    protected readonly IdPIN: string = 'PIN';
    protected readonly IdOther: string = 'Other';
    
    protected readonly IdOtherKey: string = 'OtherKey';
    protected readonly IdOtherValue: string = 'OtherValue';
    protected readonly IdOtherDelete: string = 'OtherDelete';
    protected readonly IdOtherAdd: string = 'OtherAdd';
    protected readonly IdOtherP: string = 'OtherP';

    protected readonly IdNameTitle: string = 'NameTitle';
    protected readonly IdEdit: string = 'Edit';

    protected readonly IdBackToView: string = 'BackToView';
    protected readonly IdEditEntryForm: string = 'EditEntryForm';
    protected readonly IdEditEntry: string = 'EditEntry';
    protected readonly IdNameOld: string = 'NameOld'; 

    protected readonly IdDeleteEntry: string = 'DeleteEntry';
    protected readonly IdConfirmDeleteEntry: string = 'ConfirmDeleteEntry';

    protected readonly IdGoToView: string = 'GoToView';

    protected readonly hideVal: string = '•••••••••••••••';
    protected readonly valExt: string = '_val';
    protected readonly vocBarPre: string = 'vocbar_';


    async Init() {
        console.log(this.CheckedTags, this.searchEntry);//paperino
        
        const passDescr = State.CryptPass.getPassDescription().trim();
        this.OtherCounter = 0;
        const names = State.EntriesManage.GetEntryNames().sort(CommonHelpers.insensitiveSorter);
        let out: string = `${passDescr === '' ? '' : '<p>Wallet &quot;<em>'+passDescr+'</em>&quot;</p>'}
        <p>${ViewHelpers.button(this.IdLogout,'Logout',this.ClassFormBtnSec)}
        ${ViewHelpers.button(this.IdNewEntry,'Add a new entry',this.ClassFormBtn)}
        ${ViewHelpers.button(this.IdOtherOptions,'Other options',this.ClassFormBtn)}</p>`;
        if (names.length == 0) {
            out += `<p class="alert alert-warning">Your wallet is empty</p>`;
        } else {
            let tags = TagHelpers.getAllTags(State.EntriesManage);
            let tagsFilter = '';
            if (tags.length > 0) {
                tagsFilter = `<div id="${this.IdTagFilter}" class="my-4 d-none">${this.PrintTags(tags)}</div>`;
            }
            out += `
            <div class="container">
                <div class="row">
                    <div class="col" id="${this.IdSearchDiv}">${ViewHelpers.textinput(this.IdSearch,this.searchEntry,'Find entry...',this.ClassFormCtrl,false,true)}</div>
                    <div class="col">${ViewHelpers.button(this.IdShowHideTags,'Tags search',this.ClassFormBtn)}</div>
                </div>
            </div>
            ${tagsFilter}
            <p>Select an entry to view:</p>
            <ul id="${this.IdEntriesList}">${this.PrintEntriesName(names)}</ul>`;
        }
        this.setApp(out,() => this.clickEl(this.IdLogout));
        this.searchRoutine(names, true);
        if (this.CheckedTags.length > 0) {
            this.showHideTags();
        }
    }

    protected searchRoutine (names: string[], firstTime: boolean = false) {
        setTimeout(() => {
            try {
                const s = this.getVal(this.IdSearch).trim();
                if (s != this.searchEntry || (firstTime && this.searchEntry !== '')) {
                    this.searchEntry = s;
                    this.setInner(this.IdEntriesList,this.PrintEntriesName(this.searchEntryName(names,s)));   
                }
            } catch (e) {}
            this.searchRoutine(names);
        },150);
    }

    protected showHideTags() {
        switch (this.showHideTagsStatus) {
            case 'hide':
                this.setVal(this.IdSearch,'');
                this.showEl(this.IdTagFilter);
                this.hideEl(this.IdSearchDiv);
                this.setInner(this.IdShowHideTags,'Hide tags filter');
                this.showHideTagsStatus = 'show';
            break;
            case 'show':
                this.selectTag();
                this.hideEl(this.IdTagFilter);
                this.showEl(this.IdSearchDiv);
                this.setInner(this.IdShowHideTags,'Select by tags');
                this.showHideTagsStatus = 'hide';
            break;
        }
    }

    protected PrintViewOrCopyBar(refId: string, label: string): string {
        return `<span id="${this.vocBarPre+refId}" class="d-none">
        ${ViewHelpers.button('view_'+refId,'View '+label,this.ClassFormBtnSec,` data-view="${refId}"`)}
        ${ViewHelpers.button('copy_'+refId,'Copy '+label,this.ClassFormBtnSec,` data-copy="${refId}"`)}
        ${ViewHelpers.button('cancel_'+refId,' X ',this.ClassFormBtnSec,` data-cancel="${refId}"`)}
        </span>`;
    }

    protected showHideTagsStatus: 'show' | 'hide' = 'hide';

    protected searchEntry: string = '';

    protected searchEntryName (names: string[], name: string): string[] {
        let outNames = new Array<string>();
        name = name.toLowerCase();
        for (let n of names) {
            if (n.toLowerCase().indexOf(name) != -1) outNames.push(n);
        }
        return outNames;
    }

    protected async onSubmit(e: Event) {
        switch ((e.target as HTMLFormElement).id) {
           case this.IdAddEntryForm:
                this.addEntry();
           break;
           case this.IdEditEntryForm:
                this.editEntry();
           break;
        }
    }
    
    public onBackButton!: TBackButton;

    protected async onClick(e: Event) {
        const el = e.target as HTMLInputElement;
        switch (el.id) {
            case this.IdOtherOptions:
                ScenarioController.changeScenario(new OtherView());
            break;
            case this.IdLogout:
                if (confirm('Are you sure to logout?')) {
                    State.logout();
                    ScenarioController.changeScenario(new MainView());
                }
            break;
            case this.IdGoToInit:
                this.Init();
            break;
            case this.IdNewEntry:
                this.handleNew();
            break;
            case this.IdOtherAdd:
                this.addOther();
            break;
            case this.IdEdit:
                this.handleEdit();
            break;
            case this.IdGoToView:
                this.viewEntry(this.getVal(this.IdNameOld));
            break;
            case this.IdSelExistingTags:
                this.viewExistingTags('open');
            break;
            case this.IdCloseSelExistingTags:
                this.viewExistingTags('close');
            break;
            case this.IdShowHideTags:
                this.showHideTags();
            break;
            case this.IdDeleteEntry:
                this.handleDelete();
            break;
            case this.IdConfirmDeleteEntry:
                this.deleteEntry();
            break;
        }
        if (el.id.indexOf(this.IdOtherDelete) == 0) {
            this.delOther(el.dataset['counter']);
        } else {
            if (el.dataset['name'] !== undefined) {
                this.viewEntry(el.dataset['name']);
            } else if (el.dataset['tag'] !== undefined) {
                this.addTag(el.dataset['tag']);
            } else if (el.dataset['tagfilter'] !== undefined) {
                console.log(el);
                this.selectTag(el.dataset['tagfilter']);
            } else if (el.dataset['view'] !== undefined) {
                this.doVoc(el.dataset['view'],'view');
            } else if (el.dataset['copy'] !== undefined) {
                this.doVoc(el.dataset['copy'],'copy');
            } else if (el.dataset['cancel'] !== undefined) {
                this.doVoc(el.dataset['cancel'],'cancel');
            }
        }
    }

    protected doVoc (refId: string, action: 'view' | 'copy' | 'cancel') {
        switch(action) {
            case 'view':
                this.setVal(refId, this.getVal(refId+this.valExt));
            break;
            case 'copy':
                switch(cordova.platformId) {
                    case 'android':
                        cordova.plugins.clipboard.copy(this.getVal(refId+this.valExt));
                    break;
                    case 'electron':
                        const old_val = this.getVal(refId);
                        const val = this.getVal(refId+this.valExt);
                        this.setVal(refId,val);
                        const el = this.getEl(refId) as HTMLInputElement;
                        el.select();
                        navigator.clipboard.writeText(el.value);
                        this.setVal(refId,old_val);
                    break;
                }
                
            break;
            case 'cancel':
                this.setVal(refId,this.hideVal);
                this.hideEl(this.vocBarPre+refId);
            break;
        }
    }

    protected selectTag(tag?: string) {
        let entries: string[] = [];
        let tags: string[] = [];
        
        switch(tag) {
            case undefined:
                tags = TagHelpers.getAllTags(State.EntriesManage);
                entries = State.EntriesManage.GetEntryNames();
                this.CheckedTags = [];
            break;
            default:
                const index = this.CheckedTags.indexOf(tag);
                if (index == -1) {
                    this.CheckedTags.push(tag);
                } else {
                    this.CheckedTags.splice(index,1);
                }
                const ev = TagHelpers.getAllEntriesFromTags(this.CheckedTags,State.EntriesManage);
                tags = TagHelpers.getAllTagsFromArr(ev);
                entries = ev.map( 
                    (val) => val.Name !== undefined ? val.Name : ''
                );  
        }
        //this.setInner(this.IdTagFilter,this.PrintTags(tags));
        this.setInner(this.IdEntriesList,this.PrintEntriesName(entries));
    }

    protected CheckedTags: string[] = [];

    protected PrintTags (tags: string[]) {
        let tagsButtons = new Array<string>();
        let tagCounter = 0;
        tags.forEach(
            (tag) => {
                const checked = this.CheckedTags.indexOf(tag) != -1;
                let id = ++tagCounter;
                tagsButtons.push(`${ViewHelpers.checkbox('tag'+id,tag,checked,'btn-check',`data-tagfilter="${tag}"`)}
                ${ViewHelpers.label('tag'+id,tag,'my-1 btn btn-primary btn-sm')}`);
                if (checked)
                    this.selectTag(tag);
            }
        )
        return `TAGS: ${tagsButtons.join(' ')}`;
    }

    protected PrintEntriesName (entriesName: string[]) {
        let out = '';
        let counter = 0;
        entriesName.forEach(
            (val) => out += `<li class="my-3">${ViewHelpers.button('Entry'+(counter++),val,this.ClassFormBtnBla,`data-name="${ViewHelpers.cleanVal(val)}"`)}</li>`
        );
        return out;
    }

    protected async onFocus(e: Event) {
        const el = e.target as HTMLInputElement;
        switch (el.id) {
            case this.IdTags:
                this.showEl(this.IdSelExistingTags);
            break;
        }
        this.setHidden(el.id, 'show');
    }

    protected onBlur(e: Event) {
        const el = e.target as HTMLInputElement;
        this.setHidden(el.id, 'hide');
    }

    protected setHidden(id: string, action: 'show' | 'hide') {
        const hiddenId = id + this.valExt;
        const vocId = this.vocBarPre + id;

        if (action == 'show' && this.getEl(vocId) !== undefined) {
            this.showEl(vocId);
        } else if (this.getEl(vocId) === undefined && this.getEl(hiddenId) !== undefined) {
            switch(action) {
                case 'show':
                    this.setVal(id, this.getVal(hiddenId));
                break;
                case 'hide':
                    this.setVal(hiddenId, this.getVal(id));
                    this.setVal(id,this.hideVal);
                break;
            }
        }
    }


    protected BackButton!: () => Promise<any> | any;

    protected addTag(tag: string) {
        const tagString = this.getVal(this.IdTags);
        if (!TagHelpers.tagExists(tag, tagString)) {
            this.setVal(this.IdTags,tagString+(tagString.trim() == '' ? '' : ', ')+tag);
        }
    }

    protected viewExistingTags(action: 'open' | 'close') {
        switch(action) {
            case 'open':
                this.hideEl(this.IdSpanSelExistingTags);
                this.showEl(this.IdExistingTags);
            break;
            case 'close':
                this.showEl(this.IdSpanSelExistingTags);
                this.hideEl(this.IdExistingTags);
            break;
        }
    }

    protected handleEdit() {
        const entry = State.EntriesManage.GetEntry(this.getInner(this.IdNameTitle));
        if (entry !== false) {
            this.setApp(`<p>${ViewHelpers.button(this.IdGoToView,'Cancel',this.ClassFormBtnSec)}
            ${ViewHelpers.button(this.IdDeleteEntry,'Delete entry',this.ClassFormBtnSec)}</p>
            <h2>Edit entry</h2>
            <form id="${this.IdEditEntryForm}">
            ${this.entryMask(entry, false)}
            <p>${ViewHelpers.submit(this.IdEditEntry,'Save entry',this.ClassFormBtn)}</p>
            </form>
            `,() => this.clickEl(this.IdGoToView));
        }
        else alert('Error: entry not found');
    }

    protected handleDelete () {
        const entryName = this.getVal(this.IdNameOld);
        this.setApp(`
        <h2>Delete entry &quot;<span id="${this.IdNameTitle}">${entryName}</span>&quot;</h2>
        <p>Are you sure to proceed?</p>
        <p>${ViewHelpers.submit(this.IdConfirmDeleteEntry,'Confirm delete',this.ClassFormBtn)}
        ${ViewHelpers.button(this.IdEdit,'Cancel',this.ClassFormBtnSec)}</p>
        `,() => this.clickEl(this.IdEdit));
    }

    protected viewEntry (EntryName: string) {
        const entry = State.EntriesManage.GetEntry(EntryName);
        if (entry !== false)
            this.setApp(`<p>${ViewHelpers.button(this.IdGoToInit,'Go back',this.ClassFormBtnSec)} ${ViewHelpers.button(this.IdEdit,'Edit entry',this.ClassFormBtn)}</p>
            <h2 id="${this.IdNameTitle}">${entry.Name}</h2>
            ${this.entryMask(entry)}
            `,() => this.clickEl(this.IdGoToInit));
        else alert('Error: entry not found');
    }

    protected composeEntry (): EntryView {
        const Name = this.getVal(this.IdName);
        const Description = this.getVal(this.IdDesc);
        const Tags = this.getVal(this.IdTags);
        const Username = this.getVal(this.IdUsername+this.valExt);
        const Password = this.getVal(this.IdPassword+this.valExt);
        const PIN = this.getVal(this.IdPIN+this.valExt);
        let Other: {[Name: string]: string} = {};
        if (this.OtherCounter > 0) {
            let counter = 0;
            Other = {};
            while (this.OtherCounter > counter) {   
                let id = this.IdOtherKey+counter;
                if ($('#'+id)[0] !== undefined) {
                    let key = this.getVal(id);
                    let val = this.getVal(this.IdOtherValue+counter+this.valExt);
                    if (key !== '' && val != '')
                        Other[key] = val;
                }
                ++counter;
            }
        }
        return {
            Name: Name,
            Description: Description !== '' ? Description : undefined,
            Tags: Tags !== '' ? Tags : undefined,
            Username: Username !== '' ? Username : undefined,
            Password: Password !== '' ? Password : undefined,
            PIN: PIN !== '' ? PIN : undefined,
            Other: Other
        } as EntryView;
    }

    protected async deleteEntry() {
        const Name = this.getInner(this.IdNameTitle);
        if (State.EntriesManage.DeleteEntry(Name)) {
            this.LoaderShow();
            const setresult = await State.CryptPass.SetEntries(State.EntriesManage.Export(),State.K,true);
            this.LoaderHide();
            if (setresult) {
                alert('Entry "' + Name + '" successfully removed');
                this.Init();
            } else {
                alert('Sorry, generic error during entry removing. Please retry.');
            }
        } else {
            alert('Sorry, generic error during entry removing. Please retry.');
        }
    }

    protected async editEntry() {
        const NameOld = this.getVal(this.IdNameOld);
        const Name = this.getVal(this.IdName);
        if (Name != '') {
            let checkName: 'OK' | 'Changed' | 'Invalid' = 'Invalid';
            if (Name != NameOld) {
                if (State.EntriesManage.GetEntry(Name) === false) {
                    checkName = 'Changed';
                } else {
                    alert('An entry named "'+Name+'" already exists. Please choose another name.');
                    this.focusEl(this.IdName);
                }
            } else checkName = 'OK';
            if (checkName != 'Invalid') {  
                if ((checkName == 'Changed' && State.EntriesManage.UpdateEntryName(NameOld,Name)) || checkName == 'OK') {
                    if (State.EntriesManage.UpdateEntry(this.composeEntry())) {
                        this.LoaderShow();
                        const setresult = await State.CryptPass.SetEntries(State.EntriesManage.Export(),State.K,true);
                        this.LoaderHide();
                        if (setresult) {
                            this.viewEntry(Name);
                        } else {
                            alert('Sorry, generic error during wallet saving. Please retry.');
                        }
                    } else {
                        alert('Sorry, generic error during entry updating. Please retry.');
                    }
                } else {
                    alert('Sorry, generic error during entry name changing. Please retry.');
                }
            }
        } else {
            alert('Insert a name for this entry!');
            this.focusEl(this.IdName);
        }
    }

    protected async addEntry() {
        const Name = this.getVal(this.IdName);
        if (Name != '') {
            if (State.EntriesManage.GetEntry(Name) === false) {
                if (State.EntriesManage.AddEntry(this.composeEntry())) {
                    this.LoaderShow();
                    const setresult = await State.CryptPass.SetEntries(State.EntriesManage.Export(),State.K,true);
                    this.LoaderHide();
                    if (setresult) {
                        alert('Entry correctly added to your wallet');
                        this.viewEntry(Name);
                    } else {
                        alert('Sorry, generic error. Please retry.');
                    }
                } else {
                    alert('Sorry, generic error. Please retry.');
                }
                
            } else {
                alert('An entry named "'+Name+'" already exists. Please choose another name.');
                this.focusEl(this.IdName);
            }
        } else {
            alert('Insert a name for this entry!');
            this.focusEl(this.IdName);
        }
    }
    

    protected async handleNew() {
        this.setApp(`<p>${ViewHelpers.button(this.IdGoToInit,'Go back',this.ClassFormBtnSec)}</p>
        <h2>Add new entry</h2>
        <form id="${this.IdAddEntryForm}">
        ${this.entryMask(undefined, false)}
        <p>${ViewHelpers.submit(this.IdAddEntry,'Save entry',this.ClassFormBtn)}</p>
        </form>`,() => this.clickEl(this.IdGoToInit));
    }

    protected OtherCounter: number = 0;

    protected entryMask (entry?: EntryView, readonly: boolean = true): string {
        let out: string = '';
        if (entry === undefined) entry = {};
        else out += ViewHelpers.hiddeninput(this.IdNameOld, entry.Name);
        if (readonly && entry.Date !== undefined) out += `<p class="fst-italic">Last edit: <strong>${entry.Date}</strong></p>`;
        if (!readonly) out += this.attrInput(this.IdName,'Name * (mandatory)','Put here the entry name',entry.Name === undefined ? '' : entry.Name);
        if (!readonly || entry.Tags !== undefined) out += this.attrInput(this.IdTags,'Tags','Tags comma separated (eg. &quot;work, Windows&quot;))',entry.Tags === undefined ? '' : entry.Tags, readonly, true);
        if (!readonly) {
            const tags = TagHelpers.getAllTags(State.EntriesManage);
            if (tags.length > 0) {
                let tagsButtons = new Array<string>();
                let tagCounter = 0;
                tags.forEach(
                    (tag) => {
                        tagsButtons.push(ViewHelpers.button('tag'+(++tagCounter),tag,this.ClassFormBtn+' my-1',`data-tag="${tag}"`));
                    }
                )
                out += `<div><span id="${this.IdSpanSelExistingTags}">${ViewHelpers.button(this.IdSelExistingTags,'Select existing tags','my-1 d-none '+this.ClassFormBtnSec)}</span>
                <span id="${this.IdExistingTags}" class="d-none">${tagsButtons.join(' ')}
                ${ViewHelpers.button(this.IdCloseSelExistingTags,' CLOSE ',this.ClassFormBtnSec)}</span></div>`;
            }
        }
        if (!readonly || entry.Description !== undefined) out += this.attrInput(this.IdDesc,'Description','Put here an entry description',entry.Description === undefined ? '' : entry.Description, readonly);
        if (!readonly || entry.Username !== undefined) out += this.attrInput(this.IdUsername,'Username','Put here an entry username',entry.Username === undefined ? '' : entry.Username, readonly, true, false, true);
        if (!readonly || entry.Password !== undefined) out += this.attrInput(this.IdPassword,'Password','Put here an entry password',entry.Password === undefined ? '' : entry.Password, readonly, true, false, true);
        if (!readonly || entry.PIN !== undefined) out += this.attrInput(this.IdPIN,'PIN','Put here an entry PIN',entry.PIN === undefined ? '' : entry.PIN, readonly, undefined, true, true);
        out += `<div id="${this.IdOther}">`;
        if (!readonly) out += `<h3>Custom fields</h3>`;
        if (entry.Other !== undefined) {
            let counter = 0;
            for (let ot in entry.Other) {
                if (readonly && counter == 0) out += `<h3>Custom fields</h3>`;
                out += this.otherInput(ot, entry.Other[ot], readonly, counter);
                ++counter;
            }
            this.OtherCounter = counter;
        }
        out += `</div>`;
        if (!readonly)
            out += `<p>${ViewHelpers.button(this.IdOtherAdd,'Add a custom field',this.ClassFormBtnSec)}</p>`;
        return out;
    }

    protected otherInput (entryKey: string, entryVal: string, readonly: boolean, counter: number): string {
        return `<div class="container">
        <div class="row mb-4" id="${this.IdOtherP+counter}">
            <div class="col-9">
                <p class="row my-1">${readonly ? this.PrintViewOrCopyBar(this.IdOtherValue+counter,entryKey) : ''}
                ${readonly ? `<strong>${entryKey}</strong>` : ViewHelpers.textinput(this.IdOtherKey+counter, entryKey, 'Put here a custom label', this.ClassFormCtrl, readonly)}
                </p>
                <p class="row my-1">${ViewHelpers.hiddeninput(this.IdOtherValue+counter+this.valExt,entryVal)}
                ${ViewHelpers.textinput(this.IdOtherValue+counter, this.hideVal, readonly ? '' : 'Put here a custom value', this.ClassFormCtrl + ' ', readonly, true)}
                </p>
            </div>
            <div class="col-3 align-self-center">
                ${readonly ? '' : ViewHelpers.button(this.IdOtherDelete+counter,'&nbsp;X&nbsp;',this.ClassFormBtn,`data-counter="${counter}"`)}
            </div>
        </div></div>`;
    }

    protected attrInput (attrId: string, attrLabel: string, attrPlaceholder: string, attrVal?: string, attrReadonly?: boolean, attrNoautocaps?: boolean, numeric?: boolean, hidden?: boolean): string {
        return `${(hidden && attrReadonly ? `<p>${this.PrintViewOrCopyBar(attrId, attrLabel)}</p>` : '')}<div class="${this.ClassFormFloat}">${hidden === true ? `${ViewHelpers.hiddeninput(attrId+this.valExt,attrVal)}` : ''}
        ${numeric ? ViewHelpers.numericinput(attrId, hidden ? this.hideVal : attrVal, attrReadonly ? '' : attrPlaceholder, this.ClassFormCtrl, attrReadonly) : 
        ViewHelpers.textinput(attrId, hidden ? this.hideVal : attrVal, attrReadonly ? '' : attrPlaceholder, this.ClassFormCtrl, attrReadonly, attrNoautocaps)}
        ${ViewHelpers.label(attrId, attrLabel)}
        </div>
        `;
    }

    protected addOther () {
        $('#'+this.IdOther).append(this.otherInput('','',false,this.OtherCounter++));
        this.focusEl(this.IdOtherKey+(this.OtherCounter-1));
    }

    protected delOther (counter?: string) {
        if (counter !== undefined)
            $('#'+this.IdOtherP+counter).remove();
    }

    public Handlers: EventHandlerModel[] = [
        //{name: 'PassViewChange', handler: (e) => this.onChange(e), type: 'change'},
        {name: 'PassViewClick', handler: (e) => this.onClick(e), type: 'click'},
        {name: 'PassViewBlur', handler: (e) => this.onBlur(e), type: 'blur'},
        {name: 'PassViewFocus', handler: (e) => this.onFocus(e), type: 'focus'},
        {name: 'PassViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit'}
    ];   

    
}