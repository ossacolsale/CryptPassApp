const handledTypes = ['deviceready', 'click', 'change', 'submit', 'focus', 'blur', 'backbutton', 'touchstart', 'touchend'] as const;
type HandledTypes = typeof handledTypes[number];

type EventHandlersCollection = {[key in HandledTypes]: EventHandlers};
type EventHandlers = {[key: string]: EventHandler};
type EventHandler = (e: Event) => void | Promise<void>;

class EventsController {

    protected static _events: EventHandlersCollection = (() => {
        const eh = {} as EventHandlersCollection;
        handledTypes.forEach(element => {
            eh[element] = {} as EventHandlers;
        });
        return eh;
    })();

    protected static getEventHandler(name: string, event: HandledTypes): EventHandler {
        return this._events[event][name];
    }

    protected static addOrSetEventHandler(name: string, event: HandledTypes, handler: EventHandler, setEvent: boolean = false): boolean {
        const exists = this.getEventHandler(name, event) !== undefined;
        if ((exists && setEvent) || (!exists && !setEvent)) {
            this._events[event][name] = handler;
            return true;
        } else return false;
    }

    public static addEventHandler(name: string, event: HandledTypes, handler: EventHandler): boolean {
        return this.addOrSetEventHandler(name,event,handler,false);
    }

    public static delEventHandler(name: string, event: HandledTypes) {
        delete this._events[event][name];
    }

    public static setEventHandler(name: string, event: HandledTypes, handler: EventHandler): boolean {
        return this.addOrSetEventHandler(name,event,handler,true);
    }

    public static async eventCatcher (e: Event) {
        const events = this._events[e.type as HandledTypes];
        for (let ev in events) {
            await events[ev](e);
        }
    }

    public static Initialize () {
        handledTypes.forEach(element => {
            document.addEventListener(element, async (ev: Event) => EventsController.eventCatcher(ev), element == 'focus' || element == 'blur');
        });
    }
}