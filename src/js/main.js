React.initializeTouchEvents(true);

function pad2(str) {
    str = '' + str;
    return str.length < 2 ? ('0' + str) : str;
}

function quickClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

var Stopwatch = React.createClass({
    getInitialState: function () {
        var gIS_endTime = 0;
        var gIS_timerValue = 0;
        if (!this.props.countUp) {
            gIS_endTime = Date.now().valueOf() + this.props.timerMax;
            gIS_timerValue = this.props.timerMax;
        }
        return {
            startTime: Date.now().valueOf(),
            endTime: gIS_endTime,
            timerValue: gIS_timerValue,
            running: this.props.autorun,
            countingUp: this.props.countUp
        };
    },

    componentDidMount: function () {
        this.interval = setInterval(this.tick, 5);
    },

    /* make sure to disable stopwatch upon removal */
    componentWillUnmount: function () {
        clearInterval(this.interval);
    },

    toggle: function (event) {
        event.preventDefault();
        if (this.state.running)
            this.pause();
        else
            this.resume();
    },

    pause: function () {
        this.setState({
            running: false
        })
    },

    resume: function () {
        if (!this.state.running) {
            this.correctStartEndTimes();
        }
    },

    reset: function () { //optional: pass in an event parameter.
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
    },

    tick: function () {
        if (this.state.running) {
            var newTimerValue;
            if (this.props.countUp) {
                if (this.state.countingUp) { //was counting up and continue to count up
                    newTimerValue = Date.now().valueOf() - this.state.startTime;
                    if (this.props.timerMax != 0 && newTimerValue >= this.props.timerMax) {
                        this.setState({
                            timerValue: this.props.timerMax,
                            running: false
                        });
                        this.props.s_onLimit();
                    } else {
                        this.setState({
                            timerValue: newTimerValue
                        })
                    }
                } else { //was counting down, now count up
                    this.correctStartEndTimes();
                }
            } else {
                newTimerValue = this.state.endTime - Date.now().valueOf();
                if (!this.state.countingUp && (!(this.props.timerMax > 0) || newTimerValue < this.props.timerMax)) { //was counting down and continue to count down
                    /*if(this.props.timerMax > 0 && this.state.timerValue > this.props.timerMax)
                     newTimerValue = this.props.timerMax;*/
                    if (newTimerValue >= 0) {
                        this.setState({
                            timerValue: newTimerValue
                        })
                    } else {
                        this.setState({
                            timerValue: 0,
                            running: false
                        });
                        this.props.s_onLimit();
                    }
                } else { //was counting up, now count down
                    this.correctStartEndTimes();
                }
            }
        }
    },

    //reset the start/end times based on the current timerValue
    correctStartEndTimes: function () {
        console.log('Correcting StartEndTimes: this.props.countUp: ' + this.props.countUp
        + ', this.state.countingUp: ' + this.state.countingUp);
        if (this.props.countUp && !this.state.countingUp) { //switch counting down to up
            this.setState({
                countingUp: true,
                startTime: Date.now().valueOf() - this.state.timerValue,
                running: true
            })
        } else if (this.props.countUp && this.state.countingUp) {
            this.setState({
                startTime: Date.now().valueOf() - this.state.timerValue,
                running: true
            })
        } else {
            var endTimeOffset = this.state.timerValue;
            if (this.props.timerMax > 0 && this.state.timerValue > this.props.timerMax)
                endTimeOffset = this.props.timerMax;
            if (!this.props.countUp && this.state.countingUp) { //switch counting up to down
                this.setState({
                    countingUp: false,
                    endTime: Date.now().valueOf() + endTimeOffset,
                    running: true
                })
            } else if (!this.props.countUp && !this.state.countingUp) {
                this.setState({
                    endTime: Date.now().valueOf() + endTimeOffset,
                    running: true
                })
            }
        }
    },

    previous: function () { //optional: pass in an event parameter.
        this.props.s_onPrevious();
    },

    next: function () { //optional: pass in an event parameter.
        this.props.s_onNext();
    },

    render: function () {
        //compute display timer values
        var tValue = this.state.timerValue;
        var cs = Math.floor(tValue % 1000 / 10);
        var sec = Math.floor(tValue / 1000) % 60;
        var min = Math.floor(tValue / 60000) % 60;
        var hrs = Math.floor(tValue / 3600000);
        var display = [];
        display.push(pad2(min));
        display.push(pad2(sec));
        display.push(pad2(cs));

        //determine toggleButton state
        var toggleButton;
        if (this.state.running)
            toggleButton = <i className="fa fa-pause"></i>;
        else
            toggleButton = <i className="fa fa-play"></i>;
        return (
            <div className="mainWrapper">
                <p className="mainWatch">
                    <span id="hourDisplay">{pad2(hrs)}:</span>{display.join(':')}</p>
                <p className="mainLinks">
                    <span>
                        <span className="mainLinksWrapper">
                            <a className="leftRightButton" href="javascript:void(0)" onTouchStart={this.previous} onMouseDown={this.previous}>
                                <i className="fa fa-step-backward doubleArrow"></i>
                            </a>
                            <a id="toggleButton" className="bigButton" href="javascript:void(0)" onTouchStart={this.toggle} onMouseDown={this.toggle}>{toggleButton}</a>
                            <a id="resetButton" className="bigButton" href="javascript:void(0)" onTouchStart={this.reset} onMouseDown={this.reset}>
                                <i className="fa fa-undo fa-flip-horizontal" id="resetButton"></i>
                            </a>
                            <a className="leftRightButton" href="javascript:void(0)" onTouchStart={this.next} onMouseDown={this.next}>
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
    handlePropUpdate: function (newProps) {
        this.props.m_moduleUpdate(newProps);
    },

    blankField: function (event) {
        //console.log('className: ' + this.refs.confirmButton.getDOMNode().className);
        event.target.value = '';
    },

    /* Fields above the break are updated in real time. They get their own update functions. */
    updateAutorun: function (event) {
        var newAutorun = event.target.checked;
        console.log('updateAutorun was called. value: ' + newAutorun);
        var newProps = quickClone(this.props);
        newProps.autorun = newAutorun;
        this.handlePropUpdate(newProps);
    },

    updateCountUp: function (event) {
        console.log('updateCountUp was called. value: ' + event.target.value);
        var newCountUp = (event.target.value == 'true'); //convert to boolean
        if (this.props.countUp != newCountUp) {
            var newProps = quickClone(this.props);
            newProps.countUp = newCountUp;
            this.handlePropUpdate(newProps);
        }
    },

    /*
     We can't just use this.forceUpdate() here because React is a little too smart for its own good,
     and won't update the form fields back to their default state. So instead, we manually reset the form fields
     to their default state.
     */
    resetFormFields: function () {
        //Set default limit configuration values
        var timerMaxFields = this.computeTimerMaxFields();
        this.refs.hrsField.getDOMNode().value = timerMaxFields.hrs;
        this.refs.minField.getDOMNode().value = timerMaxFields.min;
        this.refs.secField.getDOMNode().value = timerMaxFields.sec;
        this.refs.csField.getDOMNode().value = timerMaxFields.cs;

        this.setUpdateButton();
    },

    /* Take the modified contents of form fields and update this module's props with them. */
    updateFormFields: function () {
        console.log('updateTimerMax was called.');
        if (this.verifyTimerMaxFields()) {
            var newProps = quickClone(this.props);

            var newTimerMax = (parseInt(this.refs.hrsField.getDOMNode().value, 10) * 3600000);
            newTimerMax += (parseInt(this.refs.minField.getDOMNode().value, 10) * 60000);
            newTimerMax += (parseInt(this.refs.secField.getDOMNode().value, 10) * 1000);
            newTimerMax += (parseInt(this.refs.csField.getDOMNode().value, 10) * 10);

            console.log('newTimerMax: ' + newTimerMax);
            newProps.timerMax = newTimerMax;

            this.handlePropUpdate(newProps);
        }
        /*
         Don't add any code after this, as the function will run in the context of the old props.
         Put code inside componentDidUpdate instead.
         */
    },

    componentDidUpdate: function () {
        //console.log('timerMax now: ' + this.props.timerMax);
        //this.resetTimerMax();
        this.setUpdateButton();
    },

    computeTimerMaxFields: function () {
        var tMax = this.props.timerMax;
        var fields = {};
        fields.cs = Math.floor(tMax % 1000 / 10);
        fields.sec = Math.floor(tMax / 1000) % 60;
        fields.min = Math.floor(tMax / 60000) % 60;
        fields.hrs = Math.floor(tMax / 3600000);
        return fields;
    },

    verifyTimerMaxFields: function () { //Verified values 1) are valid and 2) are not equal their existing values.
        var original = this.computeTimerMaxFields();
        var update = {};
        update.hrs = parseInt(this.refs.hrsField.getDOMNode().value, 10);
        update.min = parseInt(this.refs.minField.getDOMNode().value, 10);
        update.sec = parseInt(this.refs.secField.getDOMNode().value, 10);
        update.cs = parseInt(this.refs.csField.getDOMNode().value, 10);

        return ((!isNaN(update.hrs) && !isNaN(update.min) && !isNaN(update.sec) && !isNaN(update.cs))
        && (update.hrs >= 0 && update.min >= 0 && update.sec >= 0 && update.cs >= 0)
        && (original.hrs != update.hrs || original.min != update.min || original.sec != update.sec || original.cs != update.cs))
    },

    setUpdateButton: function () { //All fields must be verified for the update button to be untucked.
        if (this.verifyTimerMaxFields()) {
            this.refs.updateButtonWrapper.getDOMNode().className += ' untucked';
        } else {
            this.refs.updateButtonWrapper.getDOMNode().className = 'updateButtonWrapper';
        }
    },

    playAudioSample: function () {
        document.getElementById('sounds_bloop').play()
    },

    render: function () {
        //Highlight activeModule
        var cssClasses = 'Module';
        if (this.props.m_isActive)
            cssClasses += ' activeModule';
        var upToDownFrom;

        //Set countUp/countDown limit text
        if (this.props.countUp)
            upToDownFrom = 'Up Towards:';
        else
            upToDownFrom = 'Down From:';

        //Set default limit configuration values
        var fields = this.computeTimerMaxFields();

        return (
            <div id={this.props.id} className={cssClasses}>
                <div className="tabs">
                    <div className="tab">
                        <input type="radio" id={this.props.id + '-1'} name={this.props.id} defaultChecked={true} />
                        <label htmlFor={this.props.id + '-1'}>
                            Main Settings</label>
                        <div className="content">
                            <table>
                                <tr>
                                    <td className="tableLeft">Stopwatch ID:</td>
                                    <td className="tableRight">{this.props.id}</td>
                                </tr>
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
                            <div className="updatableWrapper limitInputWrapper">
                                <p>Count {upToDownFrom}</p>
                                {/* We use data-tag to identify elements and ref to select them */}
                                <input type="text"
                                    defaultValue={fields.hrs}
                                    onFocus={this.blankField}
                                    onChange={this.setUpdateButton}
                                    data-tag="hrsField" ref="hrsField"
                                />
                                :
                                <input type="text"
                                    defaultValue={fields.min}
                                    onFocus={this.blankField}
                                    onChange={this.setUpdateButton}
                                    data-tag="minField" ref="minField"
                                />
                                :
                                <input type="text"
                                    defaultValue={fields.sec}
                                    onFocus={this.blankField}
                                    onChange={this.setUpdateButton}
                                    data-tag="secField" ref="secField"
                                />
                                :
                                <input type="text"
                                    defaultValue={fields.cs}
                                    onFocus={this.blankField}
                                    onChange={this.setUpdateButton}
                                    data-tag="csField" ref="csField"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="tab">
                        <input type="radio" id={this.props.id + '-2'} name={this.props.id} />
                        <label htmlFor={this.props.id + '-2'}>
                            Sounds</label>
                        <div className="content">
                            <button onClick={this.playAudioSample}>Play the Audio</button>
                            <div className="updatableDivider"></div>
                        </div>
                    </div>
                </div>
                <div className="updateButtonWrapper" ref="updateButtonWrapper">
                    <button type="button"
                        ref="moduleLimitButton"
                        onClick={this.updateFormFields}>Update</button>
                    <button type="button"
                        ref="moduleLimitButton"
                        onClick={this.resetFormFields} data-tag="resetButton">Revert</button>
                </div>
            </div>
        );
    }
});

var Main = React.createClass({
    getInitialState: function () {
        var initialModule = this.createDefaultModule();
        initialModule.props.m_isActive = true;
        return {
            Modules: [initialModule],
            Stopwatch_active_index: 0
        };
    },

    createDefaultModule: function () {
        return (
            React.createElement(Module, ({
                id: Date.now().valueOf(),
                autorun: false,
                timerMax: 0,
                countUp: true,
                m_isActive: false,
                m_moduleUpdate: this.moduleUpdate,
                s_onLimit: this.next, //make sure to also update moduleUpdate with new function props
                s_onNext: this.next,
                s_onPrevious: this.previous
            }))
        )
    },

    moduleUpdate: function (newProps) {
        var moduleID = newProps.id;
        console.log('Updating module ' + moduleID);
        var moduleIndex;
        for (moduleIndex = 0; moduleIndex < this.state.Modules.length; moduleIndex++) {
            if (this.state.Modules[moduleIndex].props.id == moduleID)
                break;
        }
        console.log('Updating module ' + moduleID + '...with index ' + moduleIndex);
        var newModuleList = this.state.Modules;
        var newModule = React.createElement(Module, newProps);

        //update these with function props
        newModule.props.m_moduleUpdate = this.moduleUpdate;
        newModule.props.s_onLimit = this.next;
        newModule.props.s_onNext = this.next;
        newModule.props.s_onPrevious = this.previous;

        newModuleList[moduleIndex] = newModule;
        this.setState({
            Modules: newModuleList
        })
    },

    next: function () {
        console.log('next was called.');
        var nextIndex = this.state.Stopwatch_active_index + 1;
        if (nextIndex >= this.state.Modules.length)
            nextIndex = 0;
        this.cycleActive(this.state.Stopwatch_active_index, nextIndex);
        this.setState({
            Stopwatch_active_index: nextIndex
        })
    },

    previous: function () {
        console.log('previous was called.');
        var nextIndex = this.state.Stopwatch_active_index - 1;
        if (nextIndex < 0)
            nextIndex = this.state.Modules.length - 1;
        this.cycleActive(this.state.Stopwatch_active_index, nextIndex);
        this.setState({
            Stopwatch_active_index: nextIndex
        })
    },

    cycleActive: function (currentIndex, nextIndex) {
        if (currentIndex != nextIndex) {
            var currentActiveStopwatchProps = quickClone(this.state.Modules[currentIndex].props);
            currentActiveStopwatchProps.m_isActive = false;
            this.moduleUpdate(currentActiveStopwatchProps);
            var nextActiveStopwatchProps = quickClone(this.state.Modules[nextIndex].props);
            nextActiveStopwatchProps.m_isActive = true;
            this.moduleUpdate(nextActiveStopwatchProps);
        }
    },

    add: function () {
        console.log('add was called.');
        var newModules = this.state.Modules;
        console.log('newModules.length: ' + newModules.length);
        var newStopwatchModule = this.createDefaultModule();
        newModules.push(newStopwatchModule);
        this.setState({
            Modules: newModules
        })
    },

    render: function () {
        var currentActiveStopwatch = this.state.Modules[this.state.Stopwatch_active_index];
        return (
            <div>
                <Stopwatch
                {...currentActiveStopwatch.props}
                    key={currentActiveStopwatch.props.id}
                />
                <div id="moduleList">
                {this.state.Modules}
                    <div id="addModuleButton" className="Module" onClick={this.add}>
                        <p>+</p>
                    </div>
                </div>
                <p>{currentActiveStopwatch.props.id}</p>
            </div>
        )
    }
});

React.render(
    <Main />
    ,
    document.getElementById('container')
);
