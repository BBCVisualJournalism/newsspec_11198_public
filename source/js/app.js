define(['lib/news_special/bootstrap', 'data', 'userInput', 'animatedTable', 'resultsChart', 'employmentChart', 'share'], function (news, jobData, userInput, animatedTable, resultsChart, employmentChart, share) {
    var hasInitedResults;

    userInput.init();
    news.pubsub.on('user-submitted-job', function () {
        if (!hasInitedResults) {
            $('.results-page').slideDown();
            animatedTable.init();
            resultsChart.init();
            employmentChart.init();
            share.init();

            hasInitedResults = true;
        }
    });
    
    news.$(window).on('resize', function emitWindowResize() {
        news.pubsub.emit('window:resize');
    });

    (function addSvgAnimationSupportClass() {
        try {
            var hasSmilSupport = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'animateMotion'
            ).toString().indexOf('SVGAnimateMotionElement') > -1;

            if (hasSmilSupport) {
                news.$('body').addClass('has-animation-support');
            }
        } catch (e) {}
    })();

    news.sendMessageToremoveLoadingImage();

});
