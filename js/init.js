entity_id = undefined;
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
                    console.log(id + ":");
                    console.log(entity);

                    if (element.length === 0) {
                        $("#userContent").append("<div class='draggable'><span class='entity_state' id='" + id +"'>" + allEntities[id].state + "</span></div>");
                        if (entity.hasOwnProperty("offset")) {
                            console.log(entity.offset);
                            $("#" + escapeSelector(id)).parent().offset(entity.offset);
                        }
                    }
                });
                $(".draggable").drags();
            });
        });
    }


    chrome.storage.onChanged.addListener(function(changes, namespace) {

        for (let key in changes) {
            if (namespace === "local" && key === "allEntities") {
                chrome.storage.local.get({"allEntities": {}}, function(data) {
                    let allEntities = data.allEntities;
                    console.log("States updated");

                    $.each($(".entity_state"), function() {
                        $(this).text(allEntities[$(this).attr("id")].state);
                    });

                });
            } else if (namespace === "sync" && key === "userEntities") {
                loadEntities();
            }
        }
    });


    let sel = $("#select_components");
    sel.data("prev",sel.val());

    $("body").mouseup(function() {
       $(".dragging").mouseup();
    });

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
           console.log("Selected: " + id);

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
           console.log("Deselected: " + id);
           let element = $("#" + escapeSelector(id));

           element.parent().fadeOut(400, function() {
               $(this).remove();
               element = $("#" + escapeSelector(id));
               console.log(element.length);
               if (element.length === 0) {
                   console.log("REMOVING " + id.toUpperCase());
                   chrome.storage.sync.get({"userEntities": {}}, function(data) {
                       let userEntities = data.userEntities;
                       delete userEntities[id];
                       chrome.storage.sync.set({"userEntities": userEntities});
                   });
               }
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
    });

    $("#settingsMenuCloseBtn").click(function() {
        closeNav();
    });

});

function escapeSelector(s) {
    return s.replace(/(:|\.|\[|\])/g, "\\$1");
}