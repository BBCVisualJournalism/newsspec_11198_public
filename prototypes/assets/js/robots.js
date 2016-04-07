(function ($) {
    $(document).ready(function(){
        var buttonMost = $('#button-most');
        var buttonLeast = $('#button-least');
        var buttonMy = $('#button-mine');
        var jobsTable;
        var jobsTableWrapper;
        var scrollMultiplier = 2500;
        var minThreshold = 1500;
        var fadeThreshold = 500;
        var panelFadeThreshold;
        var panelFadeHeight = 48;

        $(this).on('scroll', function(e){ checkPosition(e); });

        function checkPosition(e) {
            var target = e.target || e.srcElement;
            var scrollPos = target.scrollTop;
            var errorMargin = 16;
            var wrapperHeight = jobsTableWrapper.height();
            var tableHeight = jobsTable.height();
            var myJob = jobsTable.find('.my-job');
            panelFadeThreshold = tableHeight - wrapperHeight - panelFadeHeight;

            $('.table-outer-wrapper').removeClass('not-scrolled');
            
            var myJobPos = {
                'top': (myJob[0].offsetTop - wrapperHeight + 40),
                'bottom': myJob[0].offsetTop - 40
            };

            // console.log(myJobPos['top']);
            // console.log(myJobPos['bottom']);
            console.log(scrollPos);
            console.log(panelFadeThreshold);

            if(scrollPos > 0) {
                buttonMost.removeClass('button--inactive');
            } else {
                buttonMost.addClass('button--inactive');
            }

            if(scrollPos < (tableHeight - wrapperHeight)) {
                buttonLeast.removeClass('button--inactive');
            } else {
                buttonLeast.addClass('button--inactive');
            }

            if(scrollPos > myJobPos['top'] && scrollPos < myJobPos['bottom']) {
                buttonMy.addClass('button--inactive');
            } else {
                buttonMy.removeClass('button--inactive');
            }

            if(scrollPos > panelFadeThreshold) {
                $('.table-outer-wrapper').addClass('no-fade');
            } else {
                $('.table-outer-wrapper').removeClass('no-fade');
            }
        }

        buttonMost.on('click', scrollToTop);
        buttonLeast.on('click', scrollToBottom);
        buttonMy.on('click', scrollToMine);

        function scrollToTop(){
            var currentPosition = jobsTableWrapper.scrollTop();
            var total = jobsTable.height() - jobsTableWrapper.height();
            var proportion = currentPosition / total;
            if(proportion < minThreshold) {
                proportion = minThreshold;
            } else {
                proportion = scrollMultiplier * proportion;
            }

            if(currentPosition > fadeThreshold) {
                jobsTable.addClass('moving');
            }

            jobsTableWrapper.animate({'scrollTop':0}, proportion, 'swing', function(){
                var tableRows = jobsTable.find('tbody').find('tr');
                setTimeout(function(){
                    var tableRows = jobsTable.find('tbody').find('tr').removeClass('least most');
                    jobsTable.removeClass('moving');
                    $(tableRows[0]).addClass('most');
                },250);
            });
        }

        function scrollToBottom(){
            var currentPosition = jobsTableWrapper.scrollTop();
            var total = jobsTable.height() - jobsTableWrapper.height();
            var proportion = (jobsTable.height() - currentPosition) / total;
            if(proportion < minThreshold) {
                proportion = minThreshold;
            } else {
                proportion = scrollMultiplier * proportion;
            }

            console.log(fadeThreshold);
            console.log(total);
            if((total - currentPosition) > fadeThreshold) {
                jobsTable.addClass('moving');
            }

            jobsTableWrapper.animate({'scrollTop':jobsTable.height() - jobsTableWrapper.height()}, proportion, 'swing', function(){
                var tableRows = jobsTable.find('tbody').find('tr');
                setTimeout(function(){
                    var tableRows = jobsTable.find('tbody').find('tr').removeClass('least most');
                    jobsTable.removeClass('moving');
                    $(tableRows[tableRows.length - 1]).addClass('least');
                },250);
            });
        }

        function scrollToMine() {
            console.log('clicked');
            var currentPosition = jobsTableWrapper.scrollTop();
            var total = jobsTable.height() - jobsTableWrapper.height();
            var myJob = jobsTable.find('.my-job');
            var myJobTop = myJob[0].offsetTop - (jobsTableWrapper.height() / 2);
            var proportion = Math.abs(myJob[0].offsetTop - currentPosition) / total;
            if(proportion < minThreshold) {
                proportion = minThreshold;
            } else {
                proportion = scrollMultiplier * proportion;
            }
            console.log(myJob[0].offsetTop);

            if(Math.abs(currentPosition - myJobTop) > fadeThreshold) {
                jobsTable.addClass('moving');
            }

            jobsTableWrapper.animate({'scrollTop':myJobTop}, proportion, 'swing', function(){
                var tableRows = jobsTable.find('tbody').find('tr');
                setTimeout(function(){
                    var tableRows = jobsTable.find('tbody').find('tr').removeClass('least most');
                    jobsTable.removeClass('moving');
                    myJob.addClass('mine');
                    buttonMy.addClass('button--inactive');
                },250);
            });
        }
    });
})(jQuery);