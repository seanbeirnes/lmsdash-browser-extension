export class Message
{
    constructor(target, sender, type, text = "", data = {}, time = Date.now())
    {
        this.target = target;
        this.sender = sender;
        this.type = type;
        this.text = text;
        this.data = data;
        this.time = time;
        this.signature = null;
    }

    // Enums for message types
    static Type = {
        // Canvas requests (for making content script API requests)
        Canvas: {
            REQUESTS: 1,
            RESPONSES: 2
        },

        // Tasks for serviceWorker (called from SidePanel and response to SidePanel)
        Task: {
            Request: {
                App: {
                    STATE: 100, // Application info and state
                    SET_PANEL_OPENED: 101
                },
                Info: {
                    USER: 200, // User info
                    SEARCH_TERMS: 210
                },
                NEW: 300,
                STOP: 301,
                PROGRESS: 302,
                BY_ID: 303,
                BY_TYPE: 305
            },
            Response: {
                App: {
                    STATE: 1001, // Application info and state
                    SET_PANEL_OPENED: 1011
                },
                Info: {
                    USER: 2001, // User info
                    SEARCH_TERMS: 2101
                },
                NEW: 3000,
                STOP: 3001,
                PROGRESS: 3002,
                BY_ID: 3003,
                BY_TYPE: 3004
            }
        }
    }

    static Target = {
        SERVICE_WORKER: 100,
        SIDE_PANEL: 200,
        TAB: 300
    }

    static Sender = {
        SERVICE_WORKER: 101,
        SIDE_PANEL: 201,
        TAB: 301
    }
}