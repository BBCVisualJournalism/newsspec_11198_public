define(['lib/news_special/bootstrap', 'data', 'd3', 'userInput', 'utils', 'backgroundsize'], function (news, jobData, d3, userInput, utils) {
    /* Elements */
    var $panelJobCount;
    var $panelJobTitle;
    var $employmentFigures;
    var $employmentFiguresJobTitle;
    var $employmentFiguresMedianSalary;

    /* Vars */
    var userJob;
    
    var init = function () {
        $panelJobCount = news.$('#employment-panel--total');
        $panelJobTitle = news.$('#employment-panel--job');
        $employmentFigures = news.$('.employment-figures');
        $employmentFiguresJobTitle = $employmentFigures.find('#figure-display__user-job');
        $employmentFiguresMedianSalary = $employmentFigures.find('#figure-display__med-salary');

        jobChanged();

        /* LISTENERS */
        news.pubsub.on('user-submitted-job', jobChanged);
        
        if (d3) {
            news.pubsub.on('window:resize', function () {
                setTimeout(function () {
                    drawChart();
                }, 400);
            });
        } else {
            setRobotBackgroundSizeManually();
            news.$('.employment-chart').hide();
        }
    };

    var jobChanged = function () {
        userJob = userInput.getUserJob();

        updatePanel();
        if (d3) {
            drawChart();
        }
    };

    var recapitaliseAcronyms = function (jobTitle) {

        var acronyms = ['IT', 'TV,', '(NGOs)'];
        $.each(acronyms, function () {
            var acronym = this;
            var escapedAcronym = acronym.replace('(', '\\(').replace(')', '\\)');

            var re1 = new RegExp('^([\\s\\S]* )?' + escapedAcronym + ' ', 'gi');
            var re2 = new RegExp(' ' + escapedAcronym + '( [\\s\\S]*)?$', 'gi');

            jobTitle = jobTitle.replace(re1, '$1 ' + acronym + ' ');
            jobTitle = jobTitle.replace(re2, ' ' + acronym + '$1');
        });
        return jobTitle;

    };

    var updatePanel = function () {
        var jobCountRounded = Math.round(userJob['2015'] / 1000) * 1000;
        var userJobLower = recapitaliseAcronyms(userJob.bbc_job_title.toLowerCase());

        $panelJobCount.text(utils.numberWithCommas(jobCountRounded));
        $panelJobTitle.text(userJobLower);
        
        var medianSalary = userJob['median_salary_2014'];
        if (medianSalary) {
            $employmentFiguresMedianSalary.text('£' + utils.numberWithCommas(medianSalary));
            $employmentFiguresJobTitle.text(userJobLower);

            $employmentFigures.show();
        } else {
            $employmentFigures.hide();
        }
    };


    var getChartData = function () {
        var chartData = [];
        for (var i = 0; i < 15; i++) {
            var year = (2001 + i);
            var value = userJob[year.toString()] / 1000 || null;
            if (value) {
                chartData.push({
                    x: year,
                    y: value
                });
            }
        }

        return chartData;
    };

    var getChartDimensions = function () {
        var $chartWrapper = news.$('.employment-chart--wrapper');
        var marginOffset = (news.$(window).width() > 768) ? 60 : 0;
        return [
            $chartWrapper.width() + marginOffset,
            $chartWrapper.outerHeight()
        ];
    };

    var setRobotBackgroundSizeManually = function () {
        news.$('.bot-image__bottom').css('background-size', 'contain');
        news.$('.bot-image__top').css('background-size', 'contain');
    };

    var drawChart = function () {
        var chartData = getChartData();
        var svg = d3.select('.employment-chart--svg');
        var chartDimensions = getChartDimensions();
        var width = chartDimensions[0];
        var height = chartDimensions[1];

        var margin = {top: 10, right: 40, bottom: 30, left: 60};
        var widthAfterMargin = width - margin.right - margin.left;
        var heightAfterMargin = height - margin.top - margin.bottom;

        var xScale = d3.scale.linear()
            .range([0, widthAfterMargin])
            .domain(d3.extent(chartData, function (d) { return d.x; }));

        var yScale = d3.scale.linear()
            .range([heightAfterMargin, 0])
            .domain([0, Math.ceil(d3.max(chartData, function (d) { return d.y; }) * 0.055) * 20]);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .tickValues([2001, 2005, 2010, 2015])
            .tickFormat(d3.format('d'))
            .tickSize(13)
            .orient('bottom');


        var xAxisTicks = d3.svg.axis()
            .scale(xScale)
            .tickValues(d3.range(2001, 2015))
            .tickFormat('')
            .tickSize(6)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .outerTickSize(0)
            .orient('left');

        var yAxisGrid = d3.svg.axis()
            .scale(yScale)
            .tickFormat('')
            .tickSize(-widthAfterMargin)
            .orient('left');

        var line = d3.svg.line()
            .x(function (d) { return xScale(d.x); })
            .y(function (d) { return yScale(d.y); });

        svg.selectAll('*').remove();
        
        svg = d3.select('.employment-chart--svg')
            .attr('width', width)
            .attr('height', height)
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.append('g')
            .attr('class', 'axis axis__x')
            .attr('transform', 'translate(0,' + heightAfterMargin + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'axis axis__x-ticks')
            .attr('transform', 'translate(0,' + heightAfterMargin + ')')
            .call(xAxisTicks);

        svg.append('g')
            .attr('class', 'axis axis__y')
            .call(yAxis);

        svg.append('g')
            .attr('class', 'axis axis__y-grid')
            .call(yAxisGrid);

        svg.append('path')
            .data([chartData])
            .attr('class', 'line')
            .attr('d', line);

        svg.append('g')
            .append('circle')
                .attr('class', 'circle-point')
                .attr('cx', xScale(2015))
                .attr('cy', yScale(chartData[chartData.length - 1].y))
                .attr('r', 6);

    };

    var publicApi = {
        init: init
    };

    return publicApi;

});
