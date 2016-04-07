define(['lib/news_special/bootstrap', 'data', 'jobsAutocomplete', 'userInput', 'utils', 'lib/news_special/template_engine', 'd3'], function (news, jobData, JobsAutocomplete, userInput, utils, templateEngine, d3) {
    /* Constants */
    var scrollMultiplier = 2500;
    var minThreshold = 1500;
    var fadeThreshold = 500;
    var panelFadeHeight = 48;

    /* Vars */
    var hasInited;
    var jobsAutocomplete;

    /* Elements */
    var $tableHeader;
    var $tableHeaderCols;
    var $table;
    var $autocompleteEl;
    var $findButton;
    var $mostButton;
    var $myJobButton;
    var $leastButton;

    var init = function () {
        /* Element selectors */
        $tableHeader =  news.$('.animated-table--table-header');
        $tableHeaderCols = $tableHeader.find('.th--col');
        $table = news.$('.animated-table--table');
        $tableWrapper = $table.parent();
        $autocompleteEl = news.$('#animated-table--search-input');
        $findButton = news.$('.animated-table--search-submit');
        $leastButton = news.$('#button-least');
        $mostButton = news.$('#button-most');
        $myJobButton = news.$('#button-mine');

        jobsAutocomplete = new JobsAutocomplete($autocompleteEl, updateFindButtonState);
        
        addJobsToTable();
        setTableNthColors();

        hasInited = true;

        /* LISTENERS */
        if (d3) {
            $tableWrapper.on('scroll', utils.debounce(updateOnScroll));
            $mostButton.on('click', function () {
                enabledButtons();
                news.pubsub.emit('istats', ['animated-table-used', 'most-button']);
                $mostButton.addClass('disabled');
                tableScrollTo('top');
            });
            $leastButton.on('click', function () {
                enabledButtons();
                news.pubsub.emit('istats', ['animated-table-used', 'least-button']);
                $leastButton.addClass('disabled');
                tableScrollTo('bottom');
            });
            $myJobButton.on('click', function () {
                enabledButtons();
                news.pubsub.emit('istats', ['animated-table-used', 'my-job-button']);
                $myJobButton.addClass('disabled');
                tableScrollTo('userJob');
            });
            $findButton.on('click', function () {
                enabledButtons();
                news.pubsub.emit('istats', ['animated-table-used', 'find-button']);
                tableScrollTo('userSearch');
            });
        } else {
            news.$('.animated-table--search').hide();
            news.$('.table--buttons').hide();
        }
    };


    var enabledButtons = function () {
        $leastButton.removeClass('disabled');
        $mostButton.removeClass('disabled');
        $myJobButton.removeClass('disabled');
    };

    var updateOnScroll = function (e) {
        var target = e.target || e.srcElement;
        var scrollPos = target.scrollTop;
        var wrapperHeight = $tableWrapper.height();
        var tableHeight = $table.height();
        var panelFadeThreshold = tableHeight - wrapperHeight - panelFadeHeight;

        $userJobRow = getUserJobRow();
        var myJobPos = {
            'top': ($userJobRow[0].offsetTop - wrapperHeight + 40),
            'bottom': $userJobRow[0].offsetTop - 40
        };

        if (scrollPos > panelFadeThreshold) {
            $('.table-gradient').fadeOut();
        } else {
            $('.table-gradient').fadeIn();
        }
    };

    var tableScrollTo = function (position) {
        var yCord;
        var done;
        if (position === 'top') {
            yCord = 0;
            done = function () {
                $table.find('tr').first().addClass('tr--highlighted');
            };
        }
        if (position === 'bottom') {
            yCord = $table.height() - $tableWrapper.height();
            done = function () {
                $table.find('tr').last().addClass('tr--highlighted');
            };
        }
        if (position === 'userJob') {
            var $userJobRow = getUserJobRow();
            yCord = $userJobRow[0].offsetTop - ($tableWrapper.height() / 2);

            done = function () {
                $userJobRow.addClass('tr--highlighted');
            };
        }
        if (position === 'userSearch') {
            var $userSearchRow = $table.find('.td--2:contains(\'' + jobsAutocomplete.getSelectedJob().bbc_job_title_singular  + '\')').parent();
            yCord = $userSearchRow[0].offsetTop - ($tableWrapper.height() / 2);

            done = function () {
                $userSearchRow.addClass('tr--highlighted');
            };
        }

        tableScrollToY(yCord, done);
    };

    var tableScrollToY = function (y, callback) {
        var currentPosition = $tableWrapper.scrollTop();

        var tableHeight = $table.height();
        var wrapperHeight = $tableWrapper.height();
        var total = tableHeight - wrapperHeight;

        var proportion = (y - currentPosition) / total;
        if (proportion < minThreshold && proportion !== 0) {
            proportion = minThreshold;
        } else {
            proportion = scrollMultiplier * proportion;
        }

        if (Math.abs(currentPosition - y) > fadeThreshold) {
            $tableWrapper.addClass('animated-table--table--moving');
        }

        $tableWrapper.animate({'scrollTop': y}, proportion, 'swing', function () {
            $tableWrapper.removeClass('animated-table--table--moving');
            
            setTimeout(function () {
                $('.tr--highlighted').removeClass('tr--highlighted');
                if (callback) {
                    callback();
                }
            }, 250);
        });
    };

    var addJobsToTable = function () {
        var sortedJobs = utils.getSortedJobs();
        var rowTemplate = news.$('#animated-table-row').html();
        var currentRank = 0;
        var lastProbabilty = null;
        news.$.each(sortedJobs, function (index) {
            var job = this;
            if (lastProbabilty !== job.probability_percentage) {
                currentRank = index + 1;
                lastProbabilty = job.probability_percentage;
            }
            var jobObject = {
                rank: currentRank,
                job: job.bbc_job_title_singular,
                percentage: job.probability_percentage.toFixed(1)
            };
            var $tableRow = news.$.parseHTML(templateEngine(rowTemplate, jobObject));
            $table.append($tableRow);
        });

        addUserJobClass();

        $table.parent().css('width', '100%');
    };

    var getUserJobRow = function () {
        var userJob = userInput.getUserJob();

        var tdMatch = $table.find('.td--2').filter(function(index) { return $(this).html() === userJob.bbc_job_title_singular; });

        // return $table.find('.td--2:contains(\'' + userJob.bbc_job_title_singular  + '\')').parent();
        return tdMatch.parent();
    };

    var addUserJobClass = function () {
        $('.tr--user-job').removeClass('tr--user-job');
        getUserJobRow().addClass('tr--user-job');
    };

    var setTableNthColors = function () {
        var $tableRows =  news.$('.animated-table--table tr');
        if ($tableRows[1] && news.$($tableRows[1]).css('backgroundColor') !== 'rgb(242, 242, 242)') {
            $tableRows.each(function (index) {
                if (index % 2 > 0) {
                    news.$(this).css('background-color', '#fff');
                }
            });
        }
    };

    var updateFindButtonState = function () {
        var disabled = (jobsAutocomplete.getSelectedJob() === null);
        if (disabled) {
            $findButton.attr('disabled', 'disabled');
        } else {
            setTimeout(function () {
                $findButton.removeAttr('disabled');
            }, 0);
        }
    };

    var publicApi = {
        init: init
    };

    return publicApi;

});
