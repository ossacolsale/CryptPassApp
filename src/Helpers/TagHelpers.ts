class TagHelpers {

    public static getTagsFromString(tagString: string): string[] {
        let tags = new Array<string>();
        const sp = tagString.split('"').join('').split(',');
        for (let tag of sp) {
            tags.push(tag.trim().toLowerCase());
        }
        return tags;
    }

    public static tagExists(tag: string, tagString: string) {
        return this.getTagsFromString(tagString).indexOf(tag) != -1;
    }

    public static getAllTags(em: EntriesManage, exceptTags?: string[]): string[] {
        return this.getAllTagsFromArr(this.getEntriesFromEM(em), exceptTags);
    }

    protected static getEntriesFromEM (em: EntriesManage): EntryView[] {
        let entries = new Array<EntryView>();
        let E = em.Export();
        for (let e in E) {
            const entry = em.GetEntry(e)
            if (entry !== false)
                entries.push(entry);
        }
        return entries.sort(
            (a: EntryView, b: EntryView) => 
            CommonHelpers.insensitiveSorter((a.Name as string),(b.Name as string))
        );
    }

    public static getAllTagsFromArr(e: EntryView[], exceptTags?: string[]): string[] {
        let outTags = new Array<string>();
        for (let en of e) {
            let entryTags = en.Tags;
            if (entryTags !== undefined) {
                let tags = this.getTagsFromString(entryTags);
                    tags.forEach( (val) => {
                        if (((exceptTags !== undefined && exceptTags.indexOf(val) == -1) || exceptTags === undefined) && outTags.indexOf(val) == -1)
                            outTags.push(val);
                    });
                }
        }
        return outTags.sort(CommonHelpers.insensitiveSorter);
    }

    public static getAllEntriesFromTags(tags: string[], em: EntriesManage): EntryView[] {
        return this.getEntriesFromTags(tags, this.getEntriesFromEM(em));
    }

    protected static getEntriesFromTags(tags: string[], ev: EntryView[]): EntryView[] {
        if (tags.length > 0) {
            let outEntries = new Array<EntryView>();
            for (let en of ev) {
                let entryTags = en.Tags;
                if (entryTags !== undefined) {
                    let entrytags = this.getTagsFromString(entryTags);
                    let found = true;
                    for (let tag of tags) {
                        if (entrytags.indexOf(tag) == -1) {
                            found = false; break;
                        }
                    }
                    if (found) outEntries.push(en);
                }
            }
            return outEntries;
        } else return ev;
    }
}