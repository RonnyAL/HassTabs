$(document).ready(function() {
    $("body").css("max-width", $(window).width());
});

$( window ).resize(function() {
    $("body").css("max-width", $(window).width());
});

(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"move"}, opt);

        let $el = this;
        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            let $drag = $(this).addClass('dragging');
            let z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1).parents().on("mousemove", function(e) {
                $('.dragging').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                })
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            $(this).removeClass('dragging');

            offset = $(this).offset();
            let entityId = $(this).find(".entity_state").attr("id");

            console.log("WRITING OFFSET FOR " + entityId);
            console.log(offset);
            chrome.storage.sync.get({'userEntities': []}, function(data) {
                let userEntities = data.userEntities;
                userEntities[entityId].offset = offset;
                chrome.storage.sync.set({"userEntities": userEntities});
            });

        });

    }

})(jQuery);