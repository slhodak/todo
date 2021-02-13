import React from 'react';
import Todo from './Todo';
import '../style.css';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      todos: []
    }
    this.headerColumn = { rank: "Rank", description: "Description", need: "Need", want: "Want" };
    this.getToday = this.getToday.bind(this);
  }
  componentDidMount() {
    today = new Date(Date.now())
    todayISODate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    this.getList(todayISODate);
  }
  getList(date) {
    fetch(`/list?date=${date}`, {
      headers: [
        [ 'Accept', 'application/json' ]
      ]
    })
    .then(res => res.json())
    .then(data => {
      if (data.todos) {
        this.setState({ todos: data.todos });
      } else {
        throw new Error('No todos');
      }
    })
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
        {todos ? todos.map(item => <Todo item={item} />) : null}
      </div>
    )
  }
}
