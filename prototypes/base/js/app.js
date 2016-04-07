(function ($) {
    $(document).ready(function(){
        $('body').removeClass('fouc');
    });

    $('.button--link').each(function(){
        console.log($(this).get(0));
        $(this).css('min-width', window.getComputedStyle($(this).get(0)).width);
    });

    $('.button--link').click(function(e){
        var target = e.target || e.srcElement;
        var textField = $(this).closest('.link-generator').find('.share-link');
        var button = $(this);
        var loadingDelay = 2000;
        var animDelay = 500;
        setTimeout(function(){
            button.addClass('button--inactive');
            button.html('<span class="loading">Generating link</span>');
            button.removeClass('button--link');
        }, 100);
        setTimeout(function(){
            button.addClass('complete');
            button.css('min-width', '2.5em');
            button.html('Your link:');
            setTimeout(function(){
                textField.val('http://bbc.in/abcdefg');
                textField.addClass('expanded');
            },animDelay);
        }, loadingDelay);
    });
})(jQuery);
