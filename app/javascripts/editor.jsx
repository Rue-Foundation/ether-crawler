var Editor = React.createClass({
  getInitialState: function() {
    return {
      menu: null,
      focussed_cell: null,
      hasStaircase: false
    };
  },
  cellClicked: function(cell, event) {
    var element = event.target;
    var grid_container = this.refs.grid_container.getDOMNode();

    var choices = [
      {id: "add_monster", name: "Add Monster"},
      {id: "add_wall", name: "Add Wall"},
      {id: "add_staircase", name: "Add Staircase"},
      {id: "set_empty", name: "Delete What's Here"},
    ];

    var elementRect = element.getBoundingClientRect();
    var containerRect = grid_container.getBoundingClientRect();

    var left = (elementRect.left + elementRect.width / 2) - containerRect.left;
    var top = (elementRect.top + elementRect.height / 2) - containerRect.top;

    this.setState({
      menu: <ContextMenu choices={choices} top={top} left={left} choiceClicked={this.menuItemClicked}/>,
      focussed_cell: cell
    });
  },
  hasStaircase: function(booli) {
    if (booli == true || booli == false) {
      this.state.hasStaircase = booli;
    }
    return this.state.hasStaircase;
  },
  checkFromStaircase: function() {
    if (this.state.focussed_cell.type == "staircase") {
      this.state.hasStaircase = false;
    }
  },
  menuItemClicked: function(id, event) {
    var focussed_cell = this.state.focussed_cell;

    // TODO: Handle actions from multiple items being clicked.
    if (id == "add_monster") {
      this.checkFromStaircase();
      focussed_cell.type = "monster";

    } else if (id == "add_wall") {
      this.checkFromStaircase();
      focussed_cell.type = "wall";

    } else if (id == "add_staircase" && !this.hasStaircase()) {
      this.hasStaircase(true);
      focussed_cell.type = "staircase";

    } else if (id == "set_empty") {
      this.checkFromStaircase();
      focussed_cell.type = "empty";
    }

    // Remove the menu.
    this.setState({
      menu: null,
      focussed_cell: null
    });
  },
  submitLevel: function() {
    var grid = this.refs.grid.state.grid;
    Level.new().then(function(level) {
      var index = -1;

      var handleError = function(e) {
        alert("Error! Oh no!");
        console.log(e);
      };

      var callNext = function() {
        index += 1;
        if (index == grid.length - 1) {
          alert("Done!");
          return;
        }

        var cell = grid[index];

        if (cell.type == "empty") {
          callNext(index + 1);
        }

        if (cell.type == "monster") {
          level.add_monster(cell.location, 10, 100).then(callNext).catch(handleError);
        }
      };

      callNext();
    });
  },
  render: function() {
    var self = this;
    return (
      <div className="editor">
        <div className="one columns">
          Steps:
        </div>
        <div className="five columns">
          <ol>
            <li>Create a level (click on squares below)</li>
            <li>Submit your level for others to play</li>
            <li>Earn Ether</li>
          </ol>
        </div>
        <div className="six columns right">
          <label for="level_name">Level Name:</label><input id="level_name" type="text" />
          <br/>
          <label for="submit_level"><small>Finished designing?</small></label>
          <button id="submit_level" className="button-primary" onClick={this.submitLevel}>Submit Level</button>
        </div>
        <div className="grid-container twelve columns" ref="grid_container">
          <Grid key="__editor" editor={true} cellClicked={this.cellClicked} ref="grid"/>
          {this.state.menu}
        </div>
      </div>
    );
  }
});
