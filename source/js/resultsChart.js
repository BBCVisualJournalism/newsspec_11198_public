define(['lib/news_special/bootstrap', 'utils', 'userInput', 'data'], function (news, utils, userInput, jobData) {

    /* Elements */
    var $rankLabel;
    var $totalLabel;
    var $markerLine;
    var $markerLabel;
    var $percentageDisplay;
    var $jobDisplay;
    var $animationRobot;
    var $resultsPage;
    var $peopleSvg;

    var init = function () {
        $markerLine = news.$('.results-chart--marker');
        $markerLabel = news.$('.results-chart--label');
        $rankLabel = $markerLabel.find('#results-chart--label__rank');
        $totalLabel = $markerLabel.find('#results-chart--label__total');
        $percentageDisplay = news.$('#results-chart--percentage');
        $jobDisplay = news.$('#results-chart--job');
        $LikelihoodText = news.$('#results-chart--Likelihood-text');
        $animationRobot = news.$('#robot');
        $resultsPage = news.$('.results-page');
        $peopleSvg = news.$('.people-svg');

        updateMarker();

        /* LISTENERS */
        news.pubsub.on('user-submitted-job', updateMarker);
    };

    var updateMarker = function () {
        var userJob = userInput.getUserJob();
        var userRank = getJobRank(userJob);
        var totalJobs = jobData.length;

        var targetMarkerPosition = userRank / totalJobs * 100;
        var boundMarkerPosition = Math.max(Math.min(targetMarkerPosition, 75), 14);

        $rankLabel.text(getOrdinalSuffix(userRank));
        $totalLabel.text(totalJobs);

        $markerLine.css('left', targetMarkerPosition + '%');
        $markerLabel.css('left', boundMarkerPosition + '%');

        $percentageDisplay.text(Math.round(userJob.probability_percentage) + '%');
        $jobDisplay.text(userJob.bbc_job_title);
        $LikelihoodText.text(getAutomationText(userJob.probability_percentage));

        var resultsPosition = $resultsPage.offset().top;

        news.pubsub.emit('window:scrollTo', [resultsPosition, 1300]);
        resetPeople();
        
        var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var peopleAnimationTime = (viewportWidth > 600) ? 1600 : 2000;

        setTimeout(startRobotAnimation, peopleAnimationTime);
    };
    
    var startRobotAnimation = function () {
        $peopleSvg.addClass('people-svg__is-animating');

        var userJob = userInput.getUserJob();
        var animationClass = getAnimationClass(userJob.probability_percentage);
        var animationRobotElm = $animationRobot[0];
        var newRobotElement = animationRobotElm.cloneNode(true);
        newRobotElement.className.animVal = animationClass;
        newRobotElement.className.baseVal = animationClass;
        
        animationRobotElm.parentNode.replaceChild(newRobotElement, animationRobotElm);

        $animationRobot = news.$('#robot');
    };

    var resetPeople = function () {
        $peopleSvg.removeClass('people-svg__is-animating');

        var userJob = userInput.getUserJob();
        var animationClass = (userJob.probability_percentage < 40) ? '' : 'people--no-items';
        var animationRobotElm = $animationRobot[0];
        var newRobotElement = animationRobotElm.cloneNode(true);

        newRobotElement.className.animVal = animationClass;
        newRobotElement.className.baseVal = animationClass;

        animationRobotElm.parentNode.replaceChild(newRobotElement, animationRobotElm);
        
        $animationRobot = news.$('#robot');
    };

    var getAnimationClass = function (percentage) {
        if (percentage < 20) {
            return 'robot-0pc';
        }
        if (percentage < 40) {
            return 'robot-20pc';
        }
        if (percentage < 60) {
            return 'robot-40pc';
        }
        if (percentage < 80) {
            return 'robot-60pc';
        }
        return 'robot-80pc';
    };

    var getAutomationText = function (percentage) {
        if (percentage < 20) {
            return 'It\'s quite unlikely';
        }
        if (percentage < 40) {
            return 'It\'s not very likely';
        }
        if (percentage < 60) {
            return 'It\'s too close to call';
        }
        if (percentage < 80) {
            return 'It\'s fairly likely';
        }
        return 'It\'s quite likely';
    };

    var getJobRank = function (userJob) {
        var sortedJobs = utils.getSortedJobs();
        var currentRank = null;
        var lastProbabilty = null;
        news.$.each(sortedJobs, function (index) {
            var job = this;
            if (lastProbabilty !== job.probability_percentage) {
                currentRank = index + 1;
                lastProbabilty = job.probability_percentage;
            }

            if (userJob.bbc_job_title === job.bbc_job_title) {
                return false;
            }
        });
        return currentRank;
    };

    var getOrdinalSuffix = function (i) {
        var j = i % 10;
        var k = i % 100;

        if (j === 1 && k !== 11) {
            return i + 'st';
        }
        if (j === 2 && k !== 12) {
            return i + 'nd';
        }
        if (j === 3 && k !== 13) {
            return i + 'rd';
        }
        return i + 'th';
    };

    var publicApi = {
        init: init
    };

    return publicApi;

});
