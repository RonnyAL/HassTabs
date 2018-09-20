class HomeAssistant {
    constructor(url = null, pass = null, accessToken = null) {
        this._url = url.replace('https://','wss://').replace('http://','ws://') + "/api/websocket";
        this._pass = pass;
        this._accessToken = accessToken;
    }

    connect() {
        let ws = new WebSocket(this._url);
        let accessToken = this._accessToken;
        let pass = this._pass;

        ws.onclose = function() {console.log('Socket closed');};
        ws.onopen = function() {console.log('Connected');};
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
                ws.send('{"id": 1, "type": "get_states"}');
                ws.send('{"id": 2, "type": "subscribe_events", "event_type": "state_changed"}');

            } else if (response.type === "event") {
                let data = response.event.data;
                let entity_id = data.entity_id;
                let new_state = data.new_state.state;
                $("#" + escapeSelector(entity_id)).text(new_state);
            } else if (response.type === "result") {

                // TODO: This is a really stupid way to check if we're getting a response to get_states...
                if (response.result !== null && response.result.length > 30) {
                    console.log(response);
                    chrome.storage.local.set({"states": JSON.stringify(response.result)});
                    let states = response.result;
                    let select = $("#select_components");

                    for (let i in states) {
                        let entity_id = states[i].entity_id;

                        if ($("#" + escapeSelector(entity_id)).length !== 0) {
                            $("#" + escapeSelector(entity_id)).text(states[i].state /*+ (states[i].attributes.unit_of_measurement)*/);
                            select.append("<option value='" + i + "' selected='selected'>" + states[i].entity_id + "</option>");
                        } else {
                            select.append("<option value=" + i + ">" + states[i].entity_id + "</option>");
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

                    select.multiSelect({
                        selectableOptgroup: false,
                        selectableHeader: "<div class='custom-header'>Available entities</div>",
                        selectionHeader: "<div class='custom-header'>Added entities</div>",
                        afterSelect: function (values) {
                            let selected = $("#select_components option[value='" + parseInt(values) + "']");
                            let id = selected.prop("innerHTML");

                            chrome.storage.sync.get({"entities": []}, function(data) {

                                let entities = data.entities;
                                let uniqueEntities = [];
                                uniqueEntities.push(id);
                                $.each(entities, function (i, el) {
                                    if ($.inArray(el, uniqueEntities) === -1) uniqueEntities.push(el);
                                });
                                entities = uniqueEntities;
                                chrome.storage.sync.set({"entities": entities});

                            });

                            $("#userContent").append('<div class="draggable"><span class="entity_state" id="' + id + '"></span></div>');
                            $("#" + escapeSelector(id)).parent().drags();

                            chrome.storage.local.get({'states': null}, function (data) {
                                let states = JSON.parse(data.states);
                                for (let i in states) {
                                    if ($("#" + escapeSelector(states[i].entity_id)).length !== 0) {
                                        $("#" + escapeSelector(states[i].entity_id)).text(states[i].state);
                                    }
                                }
                            });
                        }
                    });

                }
            } else {
                console.log(response.type);
                console.log(response);
            }
            function escapeSelector(s) {
                return s.replace(/(:|\.|\[|\])/g, "\\$1");
            }

        };
    }

}