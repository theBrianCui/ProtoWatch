React.initializeTouchEvents(true);

function pad(str, max) {
    str = '' + str;
    return str.length < max ? pad("0" + str, max) : str;
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
        display.push(pad(min, 2));
        display.push(pad(sec, 2));
        display.push(pad(cs, 2));

        //determine toggleButton state
        var toggleButton;
        if (this.state.running)
            toggleButton = <i className="fa fa-pause"></i>;
        else
            toggleButton = <i className="fa fa-play"></i>;
        return (
            <div className="mainWrapper">
                <p className="mainWatch">
                    <span id="hourDisplay">{pad(hrs, 2)}:</span>{display.join(':')}</p>
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

    updateAutorun: function (event) {
        var newAutorun = event.target.checked;
        console.log('updateAutorun was called. value: ' + newAutorun);
        var newProps = JSON.parse(JSON.stringify(this.props));
        newProps.autorun = newAutorun;
        this.handlePropUpdate(newProps);
    },

    updateCountUp: function (event) {
        console.log('updateCountUp was called. value: ' + event.target.value);
        var newCountUp = (event.target.value == 'true'); //convert to boolean
        if (this.props.countUp != newCountUp) {
            var newProps = JSON.parse(JSON.stringify(this.props));
            newProps.countUp = newCountUp;
            this.handlePropUpdate(newProps);
        }
    },

    resetTimerMax: function (event) {
        //Set default limit configuration values
        var fields = this.computeTimerFields();
        this.refs.hrsField.getDOMNode().value = fields.hrs;
        this.refs.minField.getDOMNode().value = fields.min;
        this.refs.secField.getDOMNode().value = fields.sec;
        this.refs.csField.getDOMNode().value = fields.cs;

        this.setUpdateButton();
    },

    blankField: function (event) {
        //console.log('className: ' + this.refs.confirmButton.getDOMNode().className);
        event.target.value = '';
    },

    updateTimerMax: function (event) {
        console.log('updateTimerMax was called.');
        this.setUpdateButton();
        /*console.log('updateTimerMax was called. keypress: ' + event.keyCode);
         if (event.keyCode == 13) {
         var newTimerMax = parseInt(event.target.value);
         if (!isNaN(newTimerMax)) {
         */
        /* clone current props to avoid modifying existing ones */
        /*
         var newProps = JSON.parse(JSON.stringify(this.props));
         newProps.timerMax = newTimerMax;
         this.handlePropUpdate(newProps);
         }
         }*/
    },

    computeTimerFields: function () {
        var tMax = this.props.timerMax;
        var fields = {};
        fields.cs = Math.floor(tMax % 1000 / 10);
        fields.sec = Math.floor(tMax / 1000) % 60;
        fields.min = Math.floor(tMax / 60000) % 60;
        fields.hrs = Math.floor(tMax / 3600000);
        return fields;
    },

    setUpdateButton: function () {
        var original = this.computeTimerFields();
        var update = {};
        update.hrs = this.refs.hrsField.getDOMNode().value;
        update.min = this.refs.minField.getDOMNode().value;
        update.sec = this.refs.secField.getDOMNode().value;
        update.cs = this.refs.csField.getDOMNode().value;

        if (!isNaN(update.hrs) && !isNaN(update.min) && !isNaN(update.sec) && !isNaN(update.cs)
            && (original.hrs != update.hrs || original.min != update.min || original.sec != update.sec || original.cs != update.cs)) {
            //this.refs.moduleLimitButton.getDOMNode().disabled = false;
            this.refs.moduleUpdateButtonWrapper.getDOMNode().className += ' untucked';
        } else {
            //this.refs.moduleLimitButton.getDOMNode().disabled = true;
            this.refs.moduleUpdateButtonWrapper.getDOMNode().className = 'moduleUpdateButtonWrapper';
        }
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
        var fields = this.computeTimerFields();

        return (
            <div className={cssClasses}>
                <div className="tabs">
                    <div className="tab">
                        <input type="radio" id={this.props.id + '-1'} name={this.props.id} defaultChecked={true} />
                        <label htmlFor={this.props.id + '-1'}>
                            Main Settings</label>
                        <div className="content">
                            <table>
                                <tr>
                                    <td className="moduleTableLeft">Stopwatch ID:</td>
                                    <td className="moduleTableRight">{this.props.id}</td>
                                </tr>
                                <tr>
                                    <td className="moduleTableLeft">Run Automatically:</td>
                                    <td className="moduleTableRight">
                                        <input type="checkbox"
                                            defaultChecked={this.props.autorun}
                                            onChange={this.updateAutorun}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="moduleTableLeft">Count Direction:</td>
                                    <td className="moduleTableRight">
                                        <select value={'' + this.props.countUp} onChange={this.updateCountUp}>
                                            <option value="true">up</option>
                                            <option value="false">down</option>
                                        </select>
                                    </td>
                                </tr>
                            </table>
                            <div className="moduleUpdatableDivider"></div>
                            <div className="moduleUpdatableWrapper moduleLimitInputWrapper">
                                <p className="moduleLimitText">Count {upToDownFrom}</p>
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
                            <p>Sounds will go here! Soon!</p>
                            <div className="moduleUpdatableDivider"></div>
                        </div>
                    </div>
                </div>
                <div className="moduleUpdateButtonWrapper" ref="moduleUpdateButtonWrapper">
                    <button type="button"
                        ref="moduleLimitButton"
                        onClick={this.updateTimerMax}>Update</button>
                    <button type="button"
                        ref="moduleLimitButton"
                        onClick={this.resetTimerMax} data-tag="resetButton">Revert</button>
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
            var currentActiveStopwatchProps = this.state.Modules[currentIndex].props;
            currentActiveStopwatchProps.m_isActive = false;
            this.moduleUpdate(currentActiveStopwatchProps);
            var nextActiveStopwatchProps = this.state.Modules[nextIndex].props;
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
                    <div className="Module" onClick={this.add}>
                        <p>Add a stopwatch</p>
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
