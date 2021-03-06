class HomeAssistant {
    constructor(url = null, pass = null, accessToken = null) {
        if (url !== null)
            this._url = url.replace('https://','wss://').replace('http://','ws://') + "/api/websocket";

        this._pass = pass;
        this._accessToken = accessToken;

        if (pass !== null || accessToken !== null) {
            this._ws = new WebSocket(this._url);
            this._id = 0;
            this._getStatesId = null;
            this.initialize();
        } else {
            let urlSpecified = "";
            if (url === null) urlSpecified += " and your Home Assistant URL";
            $.toast({
                heading: 'Missing config',
                text: 'Please provide a long-lived access token (recommended) or API password' + urlSpecified + ' from the <a href="options.html">options page</a>.',
                showHideTransition: 'plain',
                hideAfter: false,
                icon: 'error'
            });
        }
    }

    id() {
        return this._id += 1;
    }

    getStates() {
        let ws = this._ws;
        let getStatesId = this.id();
        this._getStatesId = getStatesId;
        ws.send('{"id": ' + getStatesId + ', "type": "get_states"}');
    }

    initialize() {
        let ws = this._ws;
        let accessToken = this._accessToken;
        let pass = this._pass;
        let self = this;

        ws.onclose = function() {
            $.toast({
                heading: 'Error!',
                text: 'No connection to Home Assistant: WebSocket was closed. <a id ="refresh_link" href="">Refresh</a> page to retry!',
                showHideTransition: 'plain',
                hideAfter: false,
                icon: 'error'
            });
            console.log('Socket closed!');
        };
        ws.onopen = function() {console.log('Connected!');};
        $("#refresh_link").click(function() {location.reload()});

        ws.onerror = function(event) {console.log(event);};

        ws.onmessage = function(event) {
            let response = JSON.parse(event.data);
            if (response.type === "auth_required") {
                console.log("Authenticating...");
                let authMsg = {};
                authMsg["type"] = "auth";

                if (accessToken !== "") {
                    authMsg["access_token"] = accessToken;
                } else if (pass !== "") {
                    authMsg["api_password"] = pass;
                } else {
                    throw "Failed to connect to Home Assistant! Access token" +
                    " or API password must be specified in extension options.";
                }
                ws.send(JSON.stringify(authMsg));

            } else if (response.type === "auth_ok") {
                console.log("Authenticated!");
                self.getStates();
                ws.send('{"id": ' + self.id() +', "type": "subscribe_events", "event_type": "state_changed"}');

            } else if (response.type === "event") {
                chrome.storage.local.get({"allEntities": {}}, function(data) {
                    let allEntities = data.allEntities;
                    let entity_id = response.event.data.entity_id;

                    allEntities[entity_id] = response.event.data.new_state;
                    chrome.storage.local.set({"allEntities": allEntities});
                });

            } else if (response.type === "result") {

                if (response.result !== null && response.id === self._getStatesId) {
                    console.log("All entities updated");
                    let allEntities = {};

                    for (let i in response.result) {
                        allEntities[response.result[i].entity_id] = response.result[i];
                    }

                    chrome.storage.local.set({"allEntities": allEntities});

                    let entities = response.result;
                    let select = $("#select_components");

                    for (let i in entities) {
                        let entity_id = entities[i].entity_id;

                        if ($("#" + escapeSelector(entity_id)).length !== 0) {
                            select.append("<option value='" + i + "' selected>" + entities[i].entity_id + "</option>");
                        } else {
                            select.append("<option value='" + i + "'>" + entities[i].entity_id + "</option>");
                        }

                    }

                    select.html(select.find('option').sort(function (x, y) {
                        return $(x).text() > $(y).text() ? 1 : -1;
                    }));

                    let domains = [];

                    select.find('option').each(function () {
                        let option = this;
                        let currentDomain = option.text.substr(0, option.text.indexOf('.'));

                        if (!domains.includes(currentDomain)) {
                            domains.push(currentDomain);
                            select.append("<optgroup label='" + currentDomain + "'></optgroup>");
                        }

                        $(option).appendTo($("optgroup[label='" + currentDomain + "']"));

                    });

                    select.fSelect({
                        placeholder: 'Select entities to display',
                        numDisplayed: 2,
                        overflowText: '{n} entities selected',
                        noResultsText: 'No entities found',
                        searchText: 'Search',
                        showSearch: true,
                    });
                }
            } else if (response.type === "error") {
                console.log("Error: ");
                console.log(response);
            }else {
                console.log(response.type);
                console.log(response);
            }

            function escapeSelector(s) {
                return s.replace(/(:|\.|\[|\])/g, "\\$1");
            }

        };
    }

}