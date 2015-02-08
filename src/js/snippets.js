
add: function(){
    var newList = this.state.Stopwatch_list;
    newList.push(React.createElement(Stopwatch, {
            key: (this.state.Stopwatch_active_index + 1),
            autorun: true,
            timerMax: 3000,
            s_onMax: this.next
        }
    ));
    this.setState({
        Stopwatch_list: newList
    })
},


next: function(){
    var nextIndex = this.state.Stopwatch_active_index + 1;
    if(nextIndex >= this.state.Stopwatch_list.length)
        nextIndex = 0;
    this.setState({
        Stopwatch_active_index: nextIndex
    })
},


/**
 * Created by Brian on 2/7/2015.
 */
