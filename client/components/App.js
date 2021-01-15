import React from 'react';
import ReactDOM from 'react-dom';
import Todo from './Todo';
import '../style.css';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      todos: []
    }
    this.headerColumn = { rank: "Rank", description: "Description", need: "Need", want: "Want" };
    this.getToday = this.getToday.bind(this);
  }
  componentDidMount() {
    this.getToday();
  }
  getToday() {
    fetch('/today', {
      headers: [
        [ 'Accept', 'application/json' ]
      ]
    })
    .then(res => res.json())
    .then(data => this.setState({ todos: data.todos }))
    .catch(err => console.error(`Error fetching today's data: ${err}`));
  }
  render() {
    const { todos } = this.state;
    return (
      <div>
        <h1>TODO</h1>
        <input type='text'></input><button>Add</button>
        <Todo item={this.headerColumn} />
        {/* newly added items go here and get the Have/Want columns, which rearrange them */}
        {todos.map(item => <Todo item={item} />)}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
