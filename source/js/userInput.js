define(['lib/news_special/bootstrap', 'data', 'jobsAutocomplete'], function (news, jobsData, JobsAutocomplete) {
    /* Constants */
    var INPUT_AUTOCOMPLETE = 'autocomplete';
    var INPUT_DROPDOWN = 'dropdown';

    /* Vars */
    var currentInputType;
    var autocompleteSelectedJob;
    var dropdownSelectedJob;
    var autocompleteSelected;
    var dropdownSelected;
    var jobsAutocomplete;
    var toggleInputIstats;

    /* Elements */
    var $autocompleteddInput;
    var $autocompleteEl;
    var $dropdownInput;
    var $userInputWrapperEl;
    var $submitButton;

    var init = function () {
        /* Set defaults */
        currentInputType = INPUT_AUTOCOMPLETE;
        autocompleteSelectedJob = null;
        dropdownSelectedJob = null;
        autocompleteSelected = false;
        dropdownSelected = false;
        toggleInputIstats = false;

        /* Element selectors */
        $autocompleteInput = news.$('#user-input--text-input');
        $autocompleteEl = news.$('.user-input--autocomplete');
        $dropdownEl = news.$('.user-input--dropdown');
        $dropdownInput = news.$('.user-input--dropdown-input');
        $userInputWrapperEl = news.$('.user-input--inputs');
        $submitButton = news.$('.user-input--submit');

        /* Populate the inputs */
        jobsAutocomplete = new JobsAutocomplete($autocompleteInput, updateButtonState);
        populateDropdown();

        /* LISTENERS */
        news.$('.user-input--toggle').on('click', toggleInputMethod);
        $dropdownInput.on('change', dropdownInputChanged);
        $submitButton.on('click', submit);
    };

    var populateDropdown = function () {
        var jobList = jobsData;
        jobList.sort(function (a, b) {
            var jobA = a.bbc_job_title_singular;
            var jobB = b.bbc_job_title_singular;
            if (jobA < jobB) {
                return -1;
            }
            if (jobA > jobB) {
                return 1;
            }
            return 0;
        });


        for (var i = 0; i < jobList.length; i++) {
            var job = jobList[i];
            var $jobOption = $('<option>' + job.bbc_job_title_singular + '</option>');
            $jobOption.data('job', job);
            $dropdownInput.append($jobOption);
        }
    };

    var updateButtonState = function () {
        var disabled = true;
        if (currentInputType === INPUT_AUTOCOMPLETE && jobsAutocomplete.getSelectedJob() !== null) {
            disabled = false;
        }
        if (currentInputType === INPUT_DROPDOWN && dropdownSelected === true) {
            disabled = false;
        }

        if (disabled) {
            $submitButton.addClass('disabled');
        } else {
            $submitButton.removeClass('disabled');
            $submitButton.focus();
        }
    };
    

    var dropdownInputChanged = function () {
        dropdownSelected = (news.$(this).val() !== 'default');
        dropdownSelectedJob = news.$(this).find(':selected').data('job');
        updateButtonState();
    };

    var toggleInputMethod = function () {
        var $toCollapse = (currentInputType === INPUT_AUTOCOMPLETE) ? $autocompleteEl : $dropdownEl;
        var $toOpen = (currentInputType === INPUT_AUTOCOMPLETE) ? $dropdownEl : $autocompleteEl;

        /* Static height whilst animating */
        $userInputWrapperEl.css('height', $userInputWrapperEl.outerHeight());

        $toCollapse.slideUp(400, function showToOpen() {
            $toOpen.slideDown(400, function animationFinsihed() {
                $userInputWrapperEl.css('height', 'auto');
            });
        });

        currentInputType = (currentInputType === INPUT_AUTOCOMPLETE) ? INPUT_DROPDOWN : INPUT_AUTOCOMPLETE;
        updateButtonState();
        
        if (!toggleInputIstats) {
            news.pubsub.emit('istats', ['change-to-dropdown', '']);
            toggleInputIstats = false;
        }

        return false;
    };

    var getUserJob = function () {
        return (currentInputType === INPUT_AUTOCOMPLETE) ? jobsAutocomplete.getSelectedJob() : dropdownSelectedJob;
    };

    var submit = function () {
        news.pubsub.emit('istats', ['find-automation-clicked', currentInputType]);

        news.pubsub.emit('user-submitted-job', getUserJob());
    };

    var publicApi = {
        init: init,
        getUserJob: getUserJob
    };

    return publicApi;

});
