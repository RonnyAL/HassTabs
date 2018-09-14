chrome.storage.sync.get(['hassUrl', 'hassPass'], function(result) {
    if (result !== undefined && result.hassUrl !== undefined && result.hassPass !== undefined) {
        let hassUrl = result.hassUrl;
        let hassPass = result.hassPass;

        let hass = new HomeAssistant(hassUrl, hassPass);


        hass.getStates().then(function(states) {
            let select = $("#select_components");

            for (let i in states)
                select.append("<option value=" + i + ">" + states[i].entity_id + "</option>");

            select.html(select.find('option').sort(function(x, y) {
                return $(x).text() > $(y).text() ? 1 : -1;
            }));
            select.get(0).selectedIndex = 0;

            select.change(function() {
                $("#entity_header").text(states[$(this).val()].attributes.friendly_name + ": " + (states[$(this).val()].state));
            });

        });

        hass.getServices().then(function(services) {
            let select = $("#select_services");

            for (let i in services)
                select.append("<option value=" + i + ">" + services[i].domain + "</option>");

            select.html(select.find('option').sort(function(x, y) {
                return $(x).text() > $(y).text() ? 1 : -1;
            }));
            select.get(0).selectedIndex = 0;

            select.change(function() {
                $("#ul_services").text("");
                for (let i in services[$(this).val()].services) {
                    $("#ul_services").append("<li>" + i + "</ul>");
                }
            });
        });
    }
});






