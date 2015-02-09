function pad(str, max) {
    str = '' + str;
    return str.length < max ? pad("0" + str, max) : str;
}

var Stopwatch = React.createClass({
    getDefaultProps: function () {
        return {
            autorun: true,
            timerMax: 0
        };
    },

    getInitialState: function () {
        return {
            startTime: Date.now(),
            timerValue: 0,
            running: this.props.autorun
        };
    },

    componentDidMount: function () {
        this.interval = setInterval(this.tick, 2);
    },

    /* make sure to disable stopwatch upon removal */
    componentWillUnmount: function () {
        clearInterval(this.interval);
    },

    toggle: function () {
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
            this.setState({
                startTime: new Date(Date.now() - this.state.timerValue),
                running: true
            })
        }
    },

    reset: function () {
        this.setState({
            startTime: Date.now(),
            timerValue: 0,
            running: false
        })
    },

    tick: function () {
        if (this.state.running && this.props.countUp) {
            console.log('Running: ' + this.state.running + ', Counting up: ' + this.props.countUp);
            var newTimerValue = Date.now() - this.state.startTime;
            if (this.props.timerMax != 0 && newTimerValue >= this.props.timerMax) {
                this.setState({
                    timerValue: this.props.timerMax,
                    running: false
                });
                this.props.s_onMax();
            } else {
                this.setState({
                    timerValue: newTimerValue
                })
            }
        }
    },

    render: function () {
        var ms = Math.floor(this.state.timerValue % 1000 / 10);
        var sec = Math.floor(this.state.timerValue / 1000) % 60;
        var min = Math.floor(this.state.timerValue / 60000);
        var hrs = Math.floor(this.state.timerValue / 3600000);
        return (
            <div className="mainWrapper">
                <p className="mainWatch">{pad(hrs, 2)}:{pad(min, 2)}:{pad(sec, 2)}:{pad(ms, 2)}</p>
                <p className="mainLinks">
                    <a href="javascript:void(0)" onClick={this.props.s_onPrevious}>previous</a>
                    <a href="javascript:void(0)" onClick={this.toggle}>{this.state.running ? 'pause' : 'resume'}</a>
                    <a href="javascript:void(0)" onClick={this.reset}>reset</a>
                    <a href="javascript:void(0)" onClick={this.props.s_onNext}>next</a>
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

    resetTimerMax: function (event) {
        event.target.value = this.props.timerMax;
    },

    blankField: function (event) {
        event.target.value = '';
    },

    updateTimerMax: function (event) {
        console.log('updateTimerMax was called. keypress: ' + event.keyCode);
        if (event.keyCode == 13) {
            var newTimerMax = parseInt(event.target.value);
            if (!isNaN(newTimerMax)) {
                /* clone current props to avoid modifying existing ones */
                var newProps = JSON.parse(JSON.stringify(this.props));
                newProps.timerMax = newTimerMax;
                this.handlePropUpdate(newProps);
            }
        }
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

    render: function () {
        var cssClasses = 'Module';
        if (this.props.m_isActive)
            cssClasses += ' activeModule';
        return (
            <div className={cssClasses}>
                <p>Stopwatch ID: {this.props.id}</p>
                <p>Run Automatically:
                    <input type="checkbox"
                        defaultChecked={this.props.autorun}
                        onChange={this.updateAutorun}
                    />
                </p>
                <p>Count:
                    <select value={'' + this.props.countUp} onChange={this.updateCountUp}>
                        <option value="true">up</option>
                        <option value="false">down</option>
                    </select>
                </p>
                <p>Limit:
                    <input type="text"
                        defaultValue={this.props.timerMax}
                        onKeyDown={this.updateTimerMax}
                        onFocus={this.blankField}
                        onBlur={this.resetTimerMax}
                    />
                </p>
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
                id: Date.now(),
                autorun: true,
                timerMax: 0,
                countUp: true,
                m_isActive: false,
                m_moduleUpdate: this.moduleUpdate,
                s_onMax: this.next, //make sure to also update moduleUpdate with new function props
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
        newModule.props.s_onMax = this.next;
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
                {this.state.Modules}
                <p>{currentActiveStopwatch.props.id}</p>
                <a href="javascript:void(0)" onClick={this.add}>Add a Stopwatch...</a>
            </div>
        )
    }
});

React.render(
    <Main />,
    document.getElementById('container')
);
