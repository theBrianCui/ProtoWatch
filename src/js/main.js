React.initializeTouchEvents(true);

/* The labelToId object maps labels to id properties.
 Due to the large number of possible contexts with which labelToId can be
 referred to, it is one of the few designated global variables in ProtoWatch.

 The state property idToIndex allows us to bridge labels to module list array indices.
 */
var labelToId = {};

/* The prevEndTime value designates the expected end time of the previous module.
 Null signifies "ignore this value and use Date.now() instead".
 prevEndTime is always null if highPrecisionTiming is false (disabled).

 Originally, prevEndTime was a Stopwatch property, but complications quickly arose when
 it came to enabling/disabling highPrecisionTiming, and updating it between Stopwatches
 further slowed the transition time due to the need to clone, then update the properties
 of the next Stopwatch (Module). It was decided that it was too costly to manage prevEndTime
 as a prop, so it is declared as a global variable instead.
 */
var prevEndTime = null;

/* SoundJS Settings: SoundJS itself is initialized after Main has been mounted. */
var soundPath = 'sounds/';
var soundList = [
    {id: 'bloop_d', src: 'bloop_d.ogg'},
    {id: 'bloop_g', src: 'bloop_g.ogg'}
];
createjs.Sound.alternateExtensions = ["mp3"];

function pad2(str) {
    str = '' + str;
    return str.length < 2 ? ('0' + str) : str;
}

var Stopwatch = React.createClass({
    getInitialState: function () {
        var currProps = this.props;
        var gIS_endTime = 0;
        var gIS_timerValue = 0;
        var baseTime = (prevEndTime || Date.now().valueOf()); //if the previous module end time was set, use that, otherwise, use Date.now()
        if (!currProps.countUp) {
            gIS_endTime = baseTime + currProps.timerMax;
            gIS_timerValue = currProps.timerMax;
        }

        var gIS_expectedEndTime = null;
        if (currProps.timerMax > 0) {
            if (currProps.autorun)
                gIS_expectedEndTime = baseTime + currProps.timerMax;
        } else { //timerMax is 0
            if (!currProps.countUp)
                gIS_expectedEndTime = baseTime; //counting down with a timerMax of 0 means instant completion
        }
        /* Note: gIS stands for "getInitialState". These variables are applied once.
         Cases where gIS_expectedEndTime is null:
         - the timerMax is 0 and counting up
         - the timerMax is >0, but autorun is disabled
         */

        return {
            startTime: baseTime,
            endTime: gIS_endTime,
            expectedEndTime: gIS_expectedEndTime,
            timerValue: gIS_timerValue,
            running: currProps.autorun,
            lastButtonEvent: "none"
        };
    },

    componentDidMount: function () {
        console.log('Module started on: ' + this.state.startTime);
        this.interval = setInterval(this.tick, 5);
        if (this.state.running) {
            document.getElementById(this.props.id).classList.add('running');
            this.playbackSound(this.props.onPlaySound);
        }
        else {
            document.getElementById(this.props.id).classList.remove('running');
        }
    },

    componentWillUnmount: function () {
        clearInterval(this.interval);
        document.getElementById(this.props.id).classList.remove('running');
    },

    componentWillReceiveProps: function (nextProps) {
        //console.log('componentWillReceiveProps was called');
        var currState = this.state;
        var currProps = this.props;
        if ((nextProps.countUp != currProps.countUp) || (nextProps.timerMax != currProps.timerMax)) {
            //Either the count direction has switched, or the timerMax has changed
            //console.log('Time to correctStartEndTimes! Counting up, should count down next');
            this.correctStartEndTimes(nextProps);
        }

        if (!currState.running) {
            /* Some special cases: if the timer is paused, and a new timerMax is received, update the timerValue
             as a user would reasonably expect. */
            if (currState.timerValue == 0 && !nextProps.countUp && nextProps.timerMax > 0) {
                this.setState({
                    timerValue: nextProps.timerMax
                });
            } else if (currState.timerValue == currProps.timerMax && !currProps.countUp && nextProps.countUp) {
                this.setState({
                    timerValue: 0
                });
            } else if (!currProps.countUp && !nextProps.countUp && nextProps.timerMax < currState.timerValue) {
                this.setState({
                    timerValue: nextProps.timerMax
                });
            }
            /* A case we're not accounting for here is if the timer is paused, ticking down, and it gets updated
             with a timerMax that's higher than the current timerValue. We'll preserve the current timer value in case
             someone doesn't want it to be overridden. */
        }
    },

    toggle: function (event) {
        event.preventDefault();
        if (this.state.running) {
            this.playbackSound(this.props.onPauseSound);
            console.log("Finished sound playback");
            document.getElementById(this.props.id).classList.remove('running');

            this.pause();
        }
        else {
            this.playbackSound(this.props.onPlaySound);
            console.log("Finished sound playback");
            document.getElementById(this.props.id).classList.add('running');

            this.resume();
        }
    },

    pause: function () {
        this.setState({
            timerValue: this.state.timerValue,
            running: false
        });
        /* While it may seem redundant to set timerValue to itself through setState,
         it is used to ensure the value displayed is that of when the toggle button was pressed
         (as a tick that fires during setState would cause an small, but improper delay)

         An even more accurate measurement would be to determine the time difference between
         when the timer started and when the button press event was fired. TODO: implement someday. */
    },

    resume: function () {
        console.log('Resuming: ');
        if (!this.state.running) {
            this.correctStartEndTimes(this.props);
        }
        this.setState({
            running: true
        })
    },

    reset: function (event) { //optional: pass in an event parameter.
        event.preventDefault();
        if (this.props.countUp) {
            this.setState({
                timerValue: 0,
                running: false
            })
        } else {
            this.setState({
                timerValue: this.props.timerMax,
                running: false
            })
        }
        document.getElementById(this.props.id).classList.remove('running');
    },

    tick: function () {
        var currState = this.state;
        if (currState.running) {
            var currProps = this.props;
            var newTimerValue;
            if (currState.expectedEndTime && Date.now().valueOf() >= currState.expectedEndTime) {
                this.next();
            } else {
                if (currProps.countUp) {
                    newTimerValue = Date.now().valueOf() - currState.startTime;
                    this.setState({
                        timerValue: newTimerValue
                    })
                } else {
                    newTimerValue = currState.endTime - Date.now().valueOf();
                    this.setState({
                        timerValue: newTimerValue
                    })
                }
            }
        }
    },

    //reset the start/end times based on the current timerValue
    correctStartEndTimes: function (nextProps) {
        //console.log('correctStartEndTimes was called');
        //console.log('Correcting StartEndTimes: nextProps.countUp: ' + nextProps.countUp);
        if (nextProps.countUp) { //switch counting down to up
            var nextExpectedEndTime = null;
            if (nextProps.timerMax > 0)
                nextExpectedEndTime = Date.now().valueOf() + (nextProps.timerMax - this.state.timerValue);
            this.setState({
                startTime: Date.now().valueOf() - this.state.timerValue,
                expectedEndTime: nextExpectedEndTime
            })
        } else {
            var endTimeOffset = this.state.timerValue;
            if (nextProps.timerMax > 0 && this.state.timerValue > nextProps.timerMax) {
                endTimeOffset = nextProps.timerMax;
            }
            this.setState({
                endTime: Date.now().valueOf() + endTimeOffset,
                expectedEndTime: Date.now().valueOf() + endTimeOffset
            })
        }
    },

    previous: function () { //optional: pass in an event parameter.
        this.props.s_onPrevious();
    },

    next: function (event) { //optional: pass in an event parameter.
        if (event) {// The button was pressed. Ignore the expected end time.
            this.props.s_onNext(null);
        } else { // The limit was reached: Forward the expected end time to the next Module for high-precision timing.
            this.playbackSound(this.props.onEndSound);
            this.props.s_onNext(this.state.expectedEndTime);
        }

        // The following only runs if there the next module happens to be this same one
        // This might break a jump to the same module; we'll see. React throws a warning in the Console for this.
        this.setState({
            timerValue: this.props.timerMax,
            running: false
        });
        document.getElementById(this.props.id).classList.remove('running');
    },

    //Play back a sound file using soundjs, according to its soundjs id
    //See sound declarations at the top in the SoundList array
    playbackSound: function (sound) {
        if (this.props.soundEnabled && sound) createjs.Sound.play(sound);
    },

    render: function () {
        //compute display timer values
        var currState = this.state;
        var tValue = currState.timerValue;
        var cs = Math.floor(tValue % 1000 / 10);
        var sec = Math.floor(tValue / 1000) % 60;
        var min = Math.floor(tValue / 60000) % 60;
        var hrs = Math.floor(tValue / 3600000);
        var display = [];

        function pad2(str) {
            str = '' + str;
            return str.length < 2 ? ('0' + str) : str;
        }

        display.push(pad2(min));
        display.push(pad2(sec));
        display.push(pad2(cs));

        //determine toggleButton state
        var toggleButton;
        if (currState.running)
            toggleButton = <i className="fa fa-pause"></i>;
        else
            toggleButton = <i className="fa fa-play"></i>;
        return (
            <div className="mainWrapper noSelect">
                <p className="mainWatch">
                    <span id="hourDisplay">{pad2(hrs)}:</span>{display.join(':')}</p>

                <p className="mainLinks">
                    <span>
                        <span className="mainLinksWrapper">
                            <a className="leftRightButton hvr-sweep-to-left" href="javascript:void(0)"
                               onTouchStart={this.previous} onMouseDown={this.previous}>
                                <i className="fa fa-step-backward doubleArrow"></i>
                            </a>
                            <a id="toggleButton" className="bigButton" href="javascript:void(0)"
                               onTouchStart={this.toggle} onMouseDown={this.toggle}>{toggleButton}</a>
                            <a id="resetButton" className="bigButton" href="javascript:void(0)"
                               onTouchStart={this.reset} onMouseDown={this.reset}>
                                <i className="fa fa-undo fa-flip-horizontal"></i>
                            </a>
                            <a className="leftRightButton hvr-sweep-to-right" href="javascript:void(0)"
                               onTouchStart={this.next} onMouseDown={this.next}>
                                <i className="fa fa-step-forward doubleArrow"></i>
                            </a>
                        </span>
                        { /* <span className="lowerLinksWrapper">
                         <a className="leftRightButton" href="javascript:void(0)" onTouchStart={this.previous} onMouseDown={this.previous}>
                         <i className="fa fa-step-backward doubleArrow"></i>
                         </a>
                         <a className="leftRightButton" href="javascript:void(0)" onTouchStart={this.next} onMouseDown={this.next}>
                         <i className="fa fa-step-forward doubleArrow"></i>
                         </a>
                         </span> */ }
                    </span>
                </p>
            </div>
        )
    }
});

var Module = React.createClass({
    getInitialState: function () {
        return this.getResetState();
    },

    /*
     We consider prop data "old data" and state data "new data".
     To revert a Module to its previous state, re-load the state properties directly from props.
     */
    getResetState: function () {
        var fields = this.computeOldTimerMaxFields();
        return {
            labelField: this.props.label,
            hrsField: pad2(fields.hrs),
            minField: pad2(fields.min),
            secField: pad2(fields.sec),
            csField: pad2(fields.cs),

            //Sound selection fields
            onPlaySelectedSound: this.props.onPlaySound,
            onPauseSelectedSound: this.props.onPauseSound,
            onEndSelectedSound: this.props.onEndSound
        };
    },

    handlePropUpdate: function (newProps) {
        this.props.m_moduleUpdate(newProps, this.props);
    },

    log: function (message) {
        console.log('id: ' + this.props.id + ' : ' + message);
    },

    blankField: function (event) {
        //this.log('className: ' + this.refs.confirmButton.getDOMNode().className);
        event.target.value = '';
        this.refs.unitLabel.getDOMNode().style.display = 'block';
    },

    padOnBlur: function (event) {
        var newState = {};
        newState[event.target.dataset.tag] = pad2(this.state[event.target.dataset.tag]);
        this.setState(newState);
        this.refs.unitLabel.getDOMNode().style.display = 'none';
    },

    handleFieldChange: function (event) {
        var newState = {};
        var eventTarget = event.target;
        var eventTargetValue = event.target.value;
        var eventTargetDatasetTag = eventTarget.dataset.tag;
        //TODO: Make this more efficient
        if (eventTargetDatasetTag != 'hrsField'
            && eventTargetDatasetTag != 'minField'
            && eventTargetDatasetTag != 'secField'
            && eventTargetDatasetTag != 'csField') {
            // Replace non-alphanumeric characters for the label field
            newState[eventTargetDatasetTag] = (eventTargetValue).replace(/\W/g, '');
        } else {
            // Replace non-numerical characters for the timerMax fields
            newState[eventTargetDatasetTag] = (eventTargetValue).replace(/([^0-9])/g, '');
        }
        newState[eventTargetDatasetTag] = newState[eventTargetDatasetTag].trim();
        if (newState[eventTargetDatasetTag] != eventTargetValue) {
            this.log('Invalid characters entered for ' + eventTargetDatasetTag + ', ignoring update...');
            eventTarget.classList.remove('invalidInput');
            //noinspection SillyAssignmentJS
            eventTarget.offsetWidth = eventTarget.offsetWidth; //Force element reflow
            eventTarget.classList.add('invalidInput');
        } else {
            this.setState(newState);
        }
    },

    handleSoundChange: function (event) {
        var newState = {};
        newState[event.target.dataset.tag] = event.target.value;
        this.setState(newState);
    },

    /* Fields above the break are updated in real time. They get their own update functions. */
    updateAutorun: function (event) {
        var newAutorun = event.target.checked;
        this.log('updateAutorun was called. value: ' + newAutorun);
        // Use the React immutability helper to avoid mutating/deep cloning this component's props
        var newProps = React.addons.update(this.props, {
            autorun: {$set: newAutorun}
        });
        this.handlePropUpdate(newProps);
    },

    updateCountUp: function (event) {
        this.log('updateCountUp was called. value: ' + event.target.value);
        var newCountUp = (event.target.value == 'true'); //convert to boolean
        //Unlike checkboxes, dropdown forms can "change" without the selected value being different.
        if (this.props.countUp != newCountUp) {
            var newProps = React.addons.update(this.props, {
                countUp: {$set: newCountUp}
            });
            this.handlePropUpdate(newProps);
        }
    },

    updateSoundEnabled: function (event) {
        //this.log('updateSoundEnabled was called. value: ' + event.target.checked);
        var newSoundEnabled = event.target.checked;
        var newProps = React.addons.update(this.props, {
            soundEnabled: {$set: newSoundEnabled}
        });
        this.handlePropUpdate(newProps);
    },

    resetModuleState: function () {
        //this.log('resetModuleState was called.');
        this.setState(this.getResetState());
        this.setUpdateButton();
    },

    /* Take the modified contents of real time updated form fields and update this module's props with them. */
    updatePropsWithState: function () {
        if (this.validateInput()) {
            var newProps = React.addons.update(this.props, {
                timerMax: {$set: this.computeNewTimerMax()},
                label: {$set: this.state.labelField},
                onPlaySound: {$set: this.state.onPlaySelectedSound},
                onPauseSound: {$set: this.state.onPauseSelectedSound},
                onEndSound: {$set: this.state.onEndSelectedSound}
            });
            this.handlePropUpdate(newProps);
        }
        /*
         Don't add any code after this, as the function will run in the context of the old props.
         Put code inside componentDidUpdate instead.
         */
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return (this.props !== nextProps || this.state !== nextState)
    },

    /* componentDidUpdate runs whenever setState() is finished, or when new props are passed down to it .
     Whenever this happens, open or close the update button. */

    componentDidUpdate: function () {
        this.log('Module component updated!');

        /*
         Here we have a special case where the updated state don't precisely reflect the input.
         Typically, updated state reflects the previous input, and this.setUpdateButton() will hide
         the update button. However, because we want to support inline conversion (say, 120 sec -> 2 min),
         the new timerMax prop won't always exactly match the previous state. So, just to make sure,
         we'll manually reset all the form fields.
         */

        if (this.verifyTimerMaxFields(false)) {
            var newTimerMax = this.computeNewTimerMax();
            if (this.props.timerMax == newTimerMax) {
                this.resetModuleState();
            }
        }
        this.setUpdateButton();
    },

    computeOldTimerMaxFields: function () {
        var tMax = this.props.timerMax;
        var fields = {};
        fields.cs = Math.floor(tMax % 1000 / 10);
        fields.sec = Math.floor(tMax / 1000) % 60;
        fields.min = Math.floor(tMax / 60000) % 60;
        fields.hrs = Math.floor(tMax / 3600000);
        return fields;
    },

    computeNewTimerMax: function () {
        var currState = this.state;
        var newTimerMax = (parseInt(currState.hrsField, 10) * 3600000);
        newTimerMax += (parseInt(currState.minField, 10) * 60000);
        newTimerMax += (parseInt(currState.secField, 10) * 1000);
        newTimerMax += (parseInt(currState.csField, 10) * 10);
        return newTimerMax;
    },

    verifyTimerMaxFields: function (canMatchExistingValues) {
        var original = this.computeOldTimerMaxFields();
        var currState = this.state;
        var update = {};
        update.hrs = parseInt(currState.hrsField, 10);
        update.min = parseInt(currState.minField, 10);
        update.sec = parseInt(currState.secField, 10);
        update.cs = parseInt(currState.csField, 10);
        return ((update.hrs >= 0 && update.min >= 0 && update.sec >= 0 && update.cs >= 0)
        && (canMatchExistingValues || original.hrs != update.hrs || original.min != update.min || original.sec != update.sec || original.cs != update.cs));
    },

    setUpdateButton: function () { //All fields must be verified for the update button to be untucked.
        this.log('setUpdateButton was called.');
        if (this.validateInput()) {
            this.log('Revealing update button...');
            this.refs.updateButtonWrapper.getDOMNode().className += ' untucked';
        } else {
            this.refs.updateButtonWrapper.getDOMNode().className = 'updateButtonWrapper';
        }
    },

    validateInput: function () {
        /* Logic: "If at least one of them has changed, AND all of them are valid"
         For the labelField, the return value of labelToId must either match this module's id,
         or match null/undefined (indicating the label is available).
         */
        var label = this.state.labelField;
        return (this.verifyTimerMaxFields(false) || label != this.props.label ||
            this.state.onPlaySelectedSound != this.props.onPlaySound
            || this.state.onEndSelectedSound != this.props.onEndSound
            || this.state.onPauseSelectedSound != this.props.onPauseSound) //check if one changed
            &&
            (this.verifyTimerMaxFields(true) && label != '' && (labelToId[label] == this.props.id || !labelToId[label])); //check if all valid
    },

    enterKeyUpdate: function (event) {
        if (event.charCode == 13)
            this.updatePropsWithState();
    },

    render: function () {
        var upToDownFrom;
        //Set countUp/countDown limit text
        if (this.props.countUp)
            upToDownFrom = 'Up Towards:';
        else
            upToDownFrom = 'Down From:';

        var soundOptionsList = []; // Generate an options list containing all available sounds
        var soundListLocal = soundList;
        for (var i = 0; i < soundListLocal.length; i++) {
            soundOptionsList.push(<option value={soundListLocal[i].id}>{soundListLocal[i].id}</option>);
        }

        return (
            <div id={this.props.id} className="Module">
                <div className="tabs">
                    <div className="deleteButton">
                        <i className="fa fa-times"></i>
                    </div>
                    <div className="tab">
                        {/* We'll manually index input id and label htmlFor based on module id */}
                        <input type="radio" id={this.props.id + '-1'} name={this.props.id} defaultChecked={true}/>
                        <label htmlFor={this.props.id + '-1'}>
                            General</label>

                        <div className="content">
                            <table>
                                <tr>
                                    <td className="tableLeft">Run Automatically:</td>
                                    <td className="tableRight">
                                        <input type="checkbox"
                                               defaultChecked={this.props.autorun}
                                               onChange={this.updateAutorun}
                                            />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="tableLeft">Count Direction:</td>
                                    <td className="tableRight">
                                        <select value={'' + this.props.countUp} onChange={this.updateCountUp}>
                                            <option value="true">up</option>
                                            <option value="false">down</option>
                                        </select>
                                    </td>
                                </tr>
                            </table>
                            <div className="updatableDivider"></div>
                            <div className="updatableWrapper">
                                <table>
                                    <tr>
                                        <td className="tableLeft">Label:</td>
                                        <td className="tableRight">
                                            <input type="text"
                                                   value={this.state.labelField}
                                                   onChange={this.handleFieldChange}
                                                   onKeyPress={this.enterKeyUpdate}
                                                   data-tag="labelField" ref="labelField"
                                                />
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <div className="updatableWrapper limitInputWrapper">
                                <p>Count {upToDownFrom}</p>
                                {/* We use data-tag to identify elements and ref to select them
                                 You can then access them with someDOMNode.dataset.tag */}
                                <input type="text"
                                       value={this.state.hrsField}
                                       onFocus={this.blankField}
                                       onBlur={this.padOnBlur}
                                       onChange={this.handleFieldChange}
                                       onKeyPress={this.enterKeyUpdate}
                                       data-tag="hrsField" ref="hrsField"
                                    />
                                :
                                <input type="text"
                                       value={this.state.minField}
                                       onFocus={this.blankField}
                                       onBlur={this.padOnBlur}
                                       onChange={this.handleFieldChange}
                                       onKeyPress={this.enterKeyUpdate}
                                       data-tag="minField" ref="minField"
                                    />
                                :
                                <input type="text"
                                       value={this.state.secField}
                                       onFocus={this.blankField}
                                       onBlur={this.padOnBlur}
                                       onChange={this.handleFieldChange}
                                       onKeyPress={this.enterKeyUpdate}
                                       data-tag="secField" ref="secField"
                                    />
                                :
                                <input type="text"
                                       value={this.state.csField}
                                       onFocus={this.blankField}
                                       onBlur={this.padOnBlur}
                                       onChange={this.handleFieldChange}
                                       onKeyPress={this.enterKeyUpdate}
                                       data-tag="csField" ref="csField"
                                    />

                                <p className="limitInputLabel" ref="unitLabel">Hours : Minutes : Seconds : Centisecs </p>
                            </div>
                        </div>
                    </div>
                    <div className="tab">
                        <input type="radio" id={this.props.id + '-2'} name={this.props.id}/>
                        <label htmlFor={this.props.id + '-2'}>
                            Sounds</label>

                        <div className="content">
                            <table>
                                <tr>
                                    <td className="tableLeft">Sound Enabled:</td>
                                    <td className="tableRight">
                                        <input type="checkbox"
                                               defaultChecked={this.props.soundEnabled}
                                               onChange={this.updateSoundEnabled}
                                            />
                                    </td>
                                </tr>
                            </table>
                            <div className="updatableDivider"></div>
                            <div className="updatableWrapper">
                                <table>
                                    <tr>
                                        <td className="tableLeft">On Play:</td>
                                        <td className="tableRight">
                                            <select value={'' + this.state.onPlaySelectedSound}
                                                    data-tag="onPlaySelectedSound" onChange={this.handleSoundChange}>
                                                <option value="null">(none)</option>
                                                {soundOptionsList}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="tableLeft">On Pause:</td>
                                        <td className="tableRight">
                                            <select value={'' + this.state.onPauseSelectedSound}
                                                    data-tag="onPauseSelectedSound" onChange={this.handleSoundChange}>
                                                <option value="null">(none)</option>
                                                {soundOptionsList}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="tableLeft">On End:</td>
                                        <td className="tableRight">
                                            <select value={'' + this.state.onEndSelectedSound}
                                                    data-tag="onEndSelectedSound" onChange={this.handleSoundChange}>
                                                <option value="null">(none)</option>
                                                {soundOptionsList}
                                            </select>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="updateButtonWrapper" ref="updateButtonWrapper">
                    <button type="button"
                            ref="moduleLimitButton"
                            onClick={this.updatePropsWithState}>Update
                    </button>
                    <button type="button"
                            ref="moduleLimitButton"
                            onClick={this.resetModuleState} data-tag="resetButton">Revert
                    </button>
                </div>
            </div>
        );
    }
});

var Main = React.createClass({
    // https://facebook.github.io/react/docs/two-way-binding-helpers.html
    mixins: [React.addons.LinkedStateMixin],

    getInitialState: function () {
        var initialModuleProps = this.getDefaultModuleProps(true);
        labelToId[initialModuleProps.label] = initialModuleProps.id;
        // idToIndex maps id values to module list indices. Always assume id never changes, but indices are volatile.
        var initialIdToIndex = {};
        initialIdToIndex[initialModuleProps.id] = 0;
        return {
            modules: [<Module {...initialModuleProps} />],
            idToIndex: initialIdToIndex,
            activeIndex: 0,
            previousActiveIndex: -1,
            highPrecisionTiming: true,
            playbackAnimationEnabled: false,
            defaultModuleLabel: null
        };
    },

    createNewModule: function (newModuleProps) {
        // Just-in-case code for when newModuleProps argument is not passed
        if (newModuleProps == undefined)
            newModuleProps = this.getDefaultModuleProps();
        /* Set the new label value to map to the id (We'll assume all calls to createNewModule puts them into use)
         If the label already maps to an existing value, append a special marker to the end
         TODO: make the numbering scheme more intuitive and less O(n) */
        while (labelToId[newModuleProps.label])
            newModuleProps.label = newModuleProps.label + '.1';
        labelToId[newModuleProps.label] = newModuleProps.id;
        return (
            <Module {...newModuleProps} />
        )
    },

    getDefaultModuleProps: function (firstModule) {
        var props = {
            id: Date.now().valueOf(),
            autorun: false,
            timerMax: 0,
            countUp: true,

            /* Sound settings go here. */
            soundEnabled: true,
            onPlaySound: null,
            onPauseSound: null,
            onEndSound: null,

            m_moduleUpdate: this.moduleUpdate,
            //s_onLimit: this.next,
            s_onNext: this.next,
            s_onPrevious: this.previous
        };
        if (firstModule)
            props.label = 'Stopwatch0';
        else
            props.label = 'Stopwatch' + this.state.modules.length;
        return props;
    },

    moduleUpdate: function (newProps, oldProps) {
        var moduleId = newProps.id;
        var moduleIndex = this.state.idToIndex[moduleId];

        console.log('Updating module ' + moduleId + '...with index ' + moduleIndex);
        var newModule = <Module {...newProps} />;
        var newState = React.addons.update(this.state, {
            modules: {
                $splice: [[moduleIndex, 1, newModule]]
            }
        });

        // Update labelToId object property named with new label to map to the module Id
        if (newProps.label != oldProps.label) {
            labelToId[newProps.label] = moduleId;
            // Remove the mapping from the old label to the module Id
            delete labelToId[oldProps.label];
        }

        this.setState(newState);
    },

    next: function (previousModuleEndTime) {
        console.log('next was called.');
        var nextIndex = this.computeNextModule();
        this.cycleActive(this.state.activeIndex, nextIndex, previousModuleEndTime);
    },

    computeNextModule: function () {
        var nextIndex = this.state.activeIndex + 1;
        if (nextIndex >= this.state.modules.length)
            nextIndex = 0;
        return nextIndex;
    },

    previous: function () {
        console.log('previous was called.');
        var nextIndex = this.state.activeIndex - 1;
        if (nextIndex < 0)
            nextIndex = this.state.modules.length - 1;
        this.cycleActive(this.state.activeIndex, nextIndex, null);
    },

    cycleActive: function (currentIndex, nextIndex, prevModuleEndTime) {
        if (currentIndex != nextIndex) {
            console.log('Cycling active modules: ' + currentIndex + ' to ' + nextIndex);
            console.log('highPrecisionTiming is: ' + this.state.highPrecisionTiming);
            if (this.state.highPrecisionTiming)
                prevEndTime = prevModuleEndTime;
            else
                prevEndTime = null;
            this.setState({
                activeIndex: nextIndex,
                previousActiveIndex: currentIndex
            });
        }
    },

    add: function () {
        console.log('add was called.');
        var currState = this.state;
        var newModule;
        var newModuleProps = this.getDefaultModuleProps();
        if (('' + currState.defaultModuleLabel) != 'null') {
            var clonedModuleProps = currState.modules[currState.idToIndex[labelToId[currState.defaultModuleLabel]]].props;
            newModuleProps = React.addons.update(clonedModuleProps, {
                id: {$set: newModuleProps.id}
            });
        }
        newModule = this.createNewModule(newModuleProps);

        var newIdToIndex = {};
        newIdToIndex[newModule.props.id] = currState.modules.length;
        var newState = React.addons.update(this.state, {
            modules: {$push: [newModule]},
            idToIndex: {$merge: newIdToIndex}
        });
        this.setState(newState);
    },

    setDefaultModule: function (event) {
        var newDefaultModuleLabel = event.target.value;
        //console.log(JSON.stringify(event.target.nodeName)); //prints "SELECT"
        this.setState({
            defaultModuleLabel: newDefaultModuleLabel
        });
    },

    ignoreClick: function (event) {
        event.preventDefault();
        event.stopPropagation();
    },

    render: function () {
        var currState = this.state;
        //console.log('idToIndex: ' + JSON.stringify(currState.idToIndex));

        var currentActiveStopwatch = currState.modules[currState.activeIndex];
        var defaultModuleSelectOptions = [];
        for (var i = 0; i < currState.modules.length; i++) { //TODO: optimize this to run only when necessary
            var iteratedLabel = currState.modules[i].props.label;
            defaultModuleSelectOptions.push(<option value={iteratedLabel}>{iteratedLabel}</option>);
        }

        var appWrapperClasses = 'appWrapper';
        if (!currState.playbackAnimationEnabled)
            appWrapperClasses += ' noAnimate';

        return (
            <div className={appWrapperClasses}>
                <div className={(currState.modules.length == 1) ? 'hideLeftRightButtons' : ''}>
                    <Stopwatch
                        {...currentActiveStopwatch.props}
                        key={currentActiveStopwatch.props.id}
                        />
                </div>

                <div id="moduleList">
                    {currState.modules}
                    <div id="addModuleButton" className="Module noSelect" onClick={this.add}>
                        <p>+</p>

                        <p>
                            <select value={'' + currState.defaultModuleLabel} onClick={this.ignoreClick}
                                    onChange={this.setDefaultModule}>
                                <option value="null">(default)</option>
                                {defaultModuleSelectOptions}
                            </select>
                        </p>
                    </div>
                </div>
                <p><input type="checkbox"
                          defaultChecked={currState.highPrecisionTiming}
                          checkedLink={this.linkState('highPrecisionTiming')}
                    />
                    High Precision Timing
                </p>

                <p><input type="checkbox"
                          defaultChecked={currState.playbackAnimationEnabled}
                          checkedLink={this.linkState('playbackAnimationEnabled')}
                    />
                    Active CSS Animations
                </p>

                <p>{currentActiveStopwatch.props.id}</p>
            </div>
        )
    },

    componentDidMount: function () {
        console.log('Main component mounted!');

        // Initialize SoundJS
        //createjs.Sound.addEventListener("fileload", handleLoad);
        createjs.Sound.registerSounds(soundList, soundPath);

        if (window.innerWidth > 640) {
            console.log("Initializing scrollbar...");
            Ps.initialize(document.getElementById('moduleList'), {
                useBothWheelAxes: true,
                swipePropagation: true,
                wheelPropagation: true
            });
            Ps.ready = true;
        }

        //Set active module highlight (componentDidUpdate does not run on initial mount)
        this.componentDidUpdate(null, {activeIndex: -1});

        //Not a native property
        React.ready = true;
    },

    //Use componentDidUpdate to "clean up" after Modules change, usually for styling
    //Since Modules cannot directly view the state of Main, it's sometimes easier/faster to simply
    //reach out to the exact DOM nodes themselves
    componentDidUpdate: function (prevProps, prevState) {
        console.log('Main component updated!');
        var currState = this.state;

        if (currState.activeIndex != prevState.activeIndex) {
            if (currState.previousActiveIndex != -1)
                document.getElementById(currState.modules[currState.previousActiveIndex].props.id).classList.toggle('activeModule');
            document.getElementById(currState.modules[currState.activeIndex].props.id).classList.toggle('activeModule');
        }

        if(currState.modules.length === 1) {
            //Cheesy, but avoids using another library. Maybe there's a native & more elegant way?
            //Workaround for CSS ID as number
            document.querySelector("[id='" + currState.modules[0].props.id + "'] .deleteButton").style.display = "none";
        } else {
            document.querySelector("[id='" + currState.modules[0].props.id + "'] .deleteButton").style.display = "block";
        }

        if (Ps.ready)
            Ps.update(document.getElementById('moduleList'));
    }
});

React.render(
    <Main />
    ,
    document.getElementById('container')
);

//Fixes a minor window resize bug if scrolled. Not sure if worth the extra event listener or if there's an easier fix.
//Optional: event parameter in callback function
window.addEventListener('resize', function () {
    if (React.ready) {
        if (window.innerWidth <= 640) {
            if (Ps.ready) {
                Ps.destroy(document.getElementById('moduleList'));
                Ps.ready = false;
            }
        } else {
            if (Ps.ready) {
                Ps.update(document.getElementById('moduleList'));
            } else {
                Ps.initialize(document.getElementById('moduleList'), {
                    useBothWheelAxes: true,
                    swipePropagation: true,
                    wheelPropagation: true
                });
                Ps.ready = true;
            }
        }
    }
});
