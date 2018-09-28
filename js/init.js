$(document).ready(function() {

    let hass;
    chrome.storage.sync.get({'hassUrl': null, 'hassPass': null, 'hassAccessToken': null}, function (result) {
        hass = new HomeAssistant(result.hassUrl, result.hassPass, result.hassAccessToken);
    });

    loadEntities();

    function loadEntities() {
        chrome.storage.sync.get({"userEntities": {}}, function(data) {
            console.log("\n\nLoading entities...");
            let userEntities = data.userEntities;


            chrome.storage.local.get({"allEntities": {}}, function(data) {
                let allEntities = data.allEntities;

                $.each(userEntities, function(id, entity) {
                    let element = $("#" + escapeSelector(id));

                    if (element.length === 0) {
                        if (allEntities.hasOwnProperty(id)) {
                            let output = allEntities[id].state;
                            if (allEntities[id].attributes.hasOwnProperty("unit_of_measurement")) {
                                output += " " + allEntities[id].attributes.unit_of_measurement;
                            }
                            $("#userContent").append("<div class='draggable' id='" + id +"'><span class='entity_state'>" + output + "</span></div>");
                            $("#" + escapeSelector(id)).prepend("<p class='friendly_name'>" + allEntities[id].attributes.friendly_name + "</p>");
                        }

                        if (entity.hasOwnProperty("offset")) {
                            $("#" + escapeSelector(id)).offset(entity.offset);
                        }
                    } else {

                        if (allEntities.hasOwnProperty(id)) {
                            let output = allEntities[id].state;
                            if (allEntities[id].attributes.hasOwnProperty("unit_of_measurement")) {
                                output += " " + allEntities[id].attributes.unit_of_measurement;
                            }
                            $("#" + escapeSelector(id)).find(".entity_state").text(output);
                        }

                    }

                });
                $(".draggable").draggable( {
                    grid: [ 20, 20 ],
                    containment: $("body"),
                    scroll: false,

                }).on("dragstart", function() {
                    closeNav();
                }).on("dragstop", function( event, ui ) {
                    let offset = ui.offset;
                    $(event.currentTarget).css('z-index', 1);
                    let id = $(event.currentTarget).attr("id");

                    console.log("WRITING OFFSET FOR " + id);
                    console.log(offset);
                    chrome.storage.sync.get({'userEntities': []}, function(data) {
                        let userEntities = data.userEntities;
                        userEntities[id].offset = offset;
                        chrome.storage.sync.set({"userEntities": userEntities});
                    });
                });

            });
        });
    }

    chrome.storage.onChanged.addListener(function(changes, namespace) {

        for (let key in changes) {
            if (namespace === "local" && key === "allEntities") {
                loadEntities();
            } else if (namespace === "sync" && key === "userEntities") {
                loadEntities();
            }
        }
    });


    let sel = $("#select_components");
    sel.data("prev",sel.val());


   sel.change(function() {
       let $this = $(this);
       let prev = $this.data("prev");
       let entities = [];

       for (let i in prev) {
           if ($this.val().indexOf(prev[i]) === -1) {
               let id = sel.find(" option[value='" + prev[i] + "']").text();
               entityRemoved(id);
           }
       }

       let selected = $(this).val();
       for (let i in selected) {
           if (prev.indexOf(selected[i]) === -1) {
               let id = $this.find(" option[value='" + selected[i] + "']").text();
               entityAdded(id);
           }
       }

       function entityAdded(id) {

           chrome.storage.sync.get({"userEntities": {}}, function(data) {
               let userEntities = data.userEntities;

               if (userEntities[id] === undefined) {
                   userEntities[id] =
                       {
                           "offset": {"top": "auto", "left": "auto"},
                       };
                   chrome.storage.sync.set({"userEntities": userEntities});
               }
           });
       }

       function entityRemoved(id) {
           let element = $("#" + escapeSelector(id));

           element.fadeOut(400, function() {
               $(this).remove();
           });

           element.attr("id", "");

           chrome.storage.sync.get({"userEntities": {}}, function(data) {
               let userEntities = data.userEntities;
               delete userEntities[id];
               chrome.storage.sync.set({"userEntities": userEntities});
           });
       }
       $this.data("prev", $this.val());
    });



    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight){
                content.style.maxHeight = null;
                content.style.padding = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 900 + "px";
                content.style.padding = "1em 0";
            }
        });
    }

    /* Set the width of the side navigation to 250px */
    function openNav() {
        $("#sideMenu").width("35em");
        $("#sideMenu").data("hidden", false);
        $("#i_settings").html("close");
    }

    /* Set the width of the side navigation to 0 */
    function closeNav() {
        $("#sideMenu").width(0);
        $("#sideMenu").data("hidden", true);
        $("#i_settings").html("menu");
    }

    $("#i_settings").click(function() {
        let sideMenu = $("#sideMenu");
        if (sideMenu.data("hidden") === true) {
            openNav();
        } else {
            closeNav();
        }
    });

    $("#settingsMenuCloseBtn").click(function() {
        closeNav();
    });

});

function escapeSelector(s) {
    return s.replace(/(:|\.|\[|\])/g, "\\$1");
}