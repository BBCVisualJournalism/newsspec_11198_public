define(['data'], function (jobData) {
    /* Vars */
    var sortedJobs = null;

    var debounce = function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    };
    
    var getSortedJobs = function () {
        if (!sortedJobs) {
            var sortedArray = jobData.slice(0);
            
            sortedArray.sort(function (a, b) {
                return b.probability_percentage - a.probability_percentage;
            });

            sortedJobs = sortedArray;
        }

        return sortedJobs;
    };

    var numberWithCommas = function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    return {
        debounce: debounce,
        getSortedJobs: getSortedJobs,
        numberWithCommas: numberWithCommas
    };
});
