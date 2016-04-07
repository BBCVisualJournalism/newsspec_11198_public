define(['lib/news_special/bootstrap', 'data', 'lib/vendors/autocomplete'], function (news, jobsData) {
    var JobsAutocomplete = function ($inputElement, onJobChange) {
        this.$autocompleteInput = $inputElement;
        this.onJobChange = onJobChange;
        this.autocompleteSelectedJob  = null;
        this.istatsSent = false;
        
        this.setupAutocomplete();
    };

    JobsAutocomplete.prototype = {
        setupAutocomplete: function () {
            var jobsAutocomplete = this;

            this.$autocompleteInput.autocomplete({
                lookup: this.getAutocompleteData(),
                lookupLimit: 20,
                autoSelectFirst: true,
                onSelect: function (suggestion) {
                    // jobsAutocomplete.autocompleteSelectedJob = suggestion.job;
                    // if (jobsAutocomplete.onJobChange) {
                    //     jobsAutocomplete.onJobChange();
                    // }
                    if (suggestion.job !== jobsAutocomplete.autocompleteSelectedJob) {
                        jobsAutocomplete.autocompleteSelectedJob = suggestion.job;
                        if (jobsAutocomplete.onJobChange) {
                            jobsAutocomplete.onJobChange(suggestion.job);
                        }
                    }

                },
                lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
                    if (suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1) {
                        return true;
                    }

                    jobsAutocomplete.logiStats();

                    return suggestion.job.search_alternative && suggestion.job.search_alternative.toLowerCase().indexOf(queryLowerCase) !== -1;
                },
                onInvalidateSelection: function () {
                    jobsAutocomplete.autocompleteSelectedJob = null;
                    if (jobsAutocomplete.onJobChange) {
                        jobsAutocomplete.onJobChange();
                    }
                }

            });
        },
        getAutocompleteData: function () {
            var autocompleteObject = [];
            $.each(jobsData, function (index, job) {
                autocompleteObject.push({
                    value: job.bbc_job_title_singular,
                    job: job
                });
            });
            return autocompleteObject;
        },
        getSelectedJob: function () {
            return this.autocompleteSelectedJob;
        },
        logiStats: function () {
            if (this.istatsSent === false) {
                var searchType = (this.$autocompleteInput.selector === '#user-input--text-input') ? 'initial-search' : 'animate-table-search';
                news.pubsub.emit('istats', ['autocomplete-used', searchType]);

                this.istatsSent = true;
            }
        }
    };

    return JobsAutocomplete;
});
