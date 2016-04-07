define(['lib/news_special/bootstrap', 'lib/news_special/share_tools/controller', 'userInput', 'data'], function (news, ShareTools, userInput, jobData) {
    /* CONST */
    var SHARE_NS = 'robots_share';
    var v = '0.1';


    var init = function () {
        new ShareTools('.sharetools-holder', {
            storyPageUrl: document.referrer,
            template:     'dropdown'
        }, SHARE_NS);

        updateShareMessages();

        /* LISTENERS */
        news.pubsub.on('user-submitted-job', updateShareMessages);

        news.pubsub.on('ns:' + SHARE_NS + ':share:call:facebook', logSocialClick('facebook'));
        news.pubsub.on('ns:' + SHARE_NS + ':share:call:twitter', logSocialClick('twitter'));
        news.pubsub.on('ns:' + SHARE_NS + ':share:call:email', logSocialClick('email'));

    };

    var logSocialClick = function (platform) {
        return function () {
            news.pubsub.emit('istats', ['share-clicked', platform]);
        };
    };

    var updateShareMessages = function () {
        var job = userInput.getUserJob();
        var probability = Math.round(job.probability_percentage);

        var fbMessage = 'It\'s ' + probability + '% likely my job will be automated in 20 years. How about yours? #IntelligentMachines http://bbc.in/1Q5Vecw';
        var twitMessage = 'It\'s ' + probability + '% likely my job will be automated in 20 years. How about yours? #IntelligentMachines pic.twitter.com/SIZR7yHzKF http://bbc.in/1Q5Vecw';
        var emailMessage = 'It\'s ' + probability + '% likely my job will be automated in 20 years. How about yours? #IntelligentMachines http://bbc.in/1Q5Vecw';

        news.pubsub.emit('ns:' + SHARE_NS + ':share:setFacebookMessage', {message: fbMessage, pic:'http://www.bbc.co.uk/news/special/2015/newsspec_11198/content/english/img/robots_facebook.png'});
        news.pubsub.emit('ns:' + SHARE_NS + ':share:setTwitterMessage', twitMessage);
        news.pubsub.emit('ns:' + SHARE_NS + ':share:setEmailMessage', {message: emailMessage, subject: 'Will a robot take your job?'});
    };

    var publicApi = {
        init: init
    };

    return publicApi;

});
