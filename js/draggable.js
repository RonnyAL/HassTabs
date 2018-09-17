//Make the DIV element draggagle:
$(document).ready(function() {
    $("body").css("max-width", $(window).width());
    $(".draggable").each(function() {
        $(this).drags();
    });
});

$( window ).resize(function() {
    $("body").css("max-width", $(window).width());
});

(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"move"}, opt);

        var $el = this;
        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            var $drag = $(this).addClass('dragging');
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                $('.dragging').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    //chrome.storage.sync.set({[$(this).id]: [$(this).offset()]});

                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {

            //console.log($(this).find(".entity_state").attr("id"));
            $(this).removeClass('dragging');

            let offsetArr = {top: "auto", left: "auto"};
            offsetArr.top = $(this).css("top");
            offsetArr.left = $(this).css("left");

            chrome.storage.sync.set({
                [$(this).find(".entity_state").attr("id")]: offsetArr
            })
        });

    }
})(jQuery);