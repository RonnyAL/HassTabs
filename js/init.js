$(document).ready(function() {

    chrome.storage.sync.get({'hassUrl': null, 'hassPass': null, 'hassAccessToken': null}, function (result) {
        let hass = new HomeAssistant(result.hassUrl, result.hassPass, result.hassAccessToken);
        hass.connect();
    });


    chrome.storage.sync.get({'entities' : []}, function(data) {
        let elements = data.entities;
        console.log(elements);

        for (let i = 0; i < elements.length; i++) {
            $("#userContent").append("<div class='draggable'><span class='entity_state' id='" + elements[i] +"'></span></div>");
        }
        $(".draggable").drags();

        $(".entity_state").each(function() {
            let id = $(this).attr("id");
            chrome.storage.sync.get([$(this).attr("id")].toString(), function(data) {
                $("#" + escapeSelector(id)).parent().offset({ top: data[id].top.slice(0,-2), left: data[id].left.slice(0,-2)});
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
        //chrome.tabs.create({url: "options.html"});
    });

    $("#settingsMenuCloseBtn").click(function() {
        closeNav();
    });

});



$(document).ready(function() {

});

function escapeSelector(s) {
    return s.replace(/(:|\.|\[|\])/g, "\\$1");
}