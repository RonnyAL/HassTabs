var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

/* Set the width of the side navigation to 250px */
function openNav() {
    $("#sideMenu").width("50em");
    $("#sideMenu").data("hidden", false);
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    $("#sideMenu").width(0);
    $("#sideMenu").data("hidden", true);
}

$("#i_settings").click(function() {
    let sideMenu = $("#sideMenu");
    if (sideMenu.data("hidden") === true) {
        openNav();
        $("#i_settings").html("close");
    } else {
        closeNav();
        $("#i_settings").html("menu");
    }
   //chrome.tabs.create({url: "options.html"});
});

$("#settingsMenuCloseBtn").click(function() {
    closeNav();
});

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






