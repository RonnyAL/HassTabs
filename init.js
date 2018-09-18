$(document).ready(function() {

    chrome.storage.sync.get({'userContent' : []}, function(data) {
        let elements = data.userContent;

        for (let i = 0; i < elements.length; i++) {
            $("#userContent").append("<div class='draggable'>" + elements[i] +"</div>");
            $(".draggable").drags();
        }

        $(".entity_state").each(function() {
            let id = $(this).attr("id");
            chrome.storage.sync.get([$(this).attr("id")].toString(), function(data) {
                $("#" + escapeSelector(id)).parent().offset({ top: data[id].top.slice(0,-2), left: data[id].left.slice(0,-2)});
            });
        });

    });
});


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

$(document).ready(function() {

    chrome.storage.sync.get(['hassUrl', 'hassPass'], function (result) {
        if (result !== undefined && result.hassUrl !== undefined && result.hassPass !== undefined) {
            let hassUrl = result.hassUrl;
            let hassPass = result.hassPass;

            let hass = new HomeAssistant(hassUrl, hassPass);

            hass.getStates().then(function (states) {
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

                        hass.getEntity(id).then(function (result) {
                            if (result.entity_id !== undefined) {
                                $("#userContent").append('<div class="draggable"><span class="entity_state" id="' + result.entity_id + '">' + result.state + '</span></div>');
                                $("#" + escapeSelector(id)).parent().drags();
                            }

                            let outerHTML = $("#" + escapeSelector(id)).clone().empty().prop("outerHTML");

                            chrome.storage.sync.get({'userContent': []}, function (data) {
                                let userContent = data.userContent;
                                userContent.push(outerHTML);

                                let uniqueContent = [];
                                uniqueContent.push(outerHTML);
                                $.each(userContent, function (i, el) {
                                    if ($.inArray(el, uniqueContent) === -1) uniqueContent.push(el);
                                });
                                userContent = uniqueContent;

                                chrome.storage.sync.set({"userContent": userContent});
                            });
                        });
                    },
                    afterDeselect: function (values) {
                        let deselected = $("#select_components option[value='" + parseInt(values) + "']");

                        let id = deselected.prop("innerHTML");
                        let outerHTML = $("#" + escapeSelector(id)).clone().empty().prop("outerHTML");


                        chrome.storage.sync.get({'userContent': []}, function (data) {
                            let userContent = data.userContent;
                            userContent.push(outerHTML);


                            userContent = userContent.filter(function (e) {
                                return e !== outerHTML;
                            });

                            chrome.storage.sync.set({"userContent": userContent});
                            $("#" + escapeSelector(id)).remove();

                        });

                    }
                });

                select.change(function () {

                });

            });

            hass.getServices().then(function (services) {
                let select = $("#select_services");

                for (let i in services)
                    select.append("<option value=" + i + ">" + services[i].domain + "</option>");

                select.html(select.find('option').sort(function (x, y) {
                    return $(x).text() > $(y).text() ? 1 : -1;
                }));
                select.get(0).selectedIndex = 0;

                select.change(function () {
                    $("#ul_services").text("");
                    for (let i in services[$(this).val()].services) {
                        $("#ul_services").append("<li>" + i + "</ul>");
                    }
                });
            });
        }
    });
});

function escapeSelector(s) {
    return s.replace(/(:|\.|\[|\])/g, "\\$1");
}






