import React from 'react';
import Todo from './Todo';
import '../style.css';

export default class App extends React.Component {
  constructor() {
    super();
    this.blankTodo = {
      description: '',
      need: false,
      want: false,
      rank: 0
    };
    this.state = {
      todos: [],
      newTodo: Object.assign({}, this.blankTodo)
    };
    this.headerColumn = { rank: "Rank", description: "Description", need: "Need", want: "Want" };
    this.getList = this.getList.bind(this);
    this.handleAddChange = this.handleAddChange.bind(this);
    this.addTodo = this.addTodo.bind(this);
    this.updateList = this.updateList.bind(this);
  }
  componentDidMount() {
    let today = new Date(Date.now())
    let todayISODate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    this.getList(todayISODate);
  }
  getList(date) {
    fetch(`/list?date=${date}`, {
      headers: [
        [ 'Accept', 'application/json' ]
      ]
    })
    .then(res => this.updateList(res))
    .catch(err => console.error(`Error fetching today's data: ${err}`));
  }
  // update new todo in state
  handleAddChange(event) {
    const property = event.target.name;
    let value;
    if (property === 'description') {
      value = event.target.value;
    } else {
      value = event.target.checked;
    }
    let { newTodo } = this.state;
    newTodo[property] = value;
    this.setState({ newTodo });
  }
  addTodo() {
    const { newTodo } = this.state;
    fetch('/todo', {
      method: 'POST',
      headers: [
        [ 'Content-type', 'application/json' ]
      ],
      body: JSON.stringify(newTodo)
    })
    .then(res => {
      this.updateList(res);
      this.setState({ newTodo: Object.assign({}, this.blankTodo) });
    })
    .catch(err => console.error(`Error adding todo: ${err}`));
  }
  updateList(response) {
    response.json()
    .then(data => {
      if (data.todos) {
        this.setState({ todos: data.todos });
      } else {
        throw new Error('No todos');
      }
    })
    .catch(err => console.error('Error updating list', err));
  }
  render() {
    const { todos, newTodo } = this.state;
    return (
      <div>
        <h1>todo</h1>
        <div>
          <label htmlFor='need'>Need</label>
          <input type='checkbox' name='need' onChange={this.handleAddChange} checked={newTodo.need ? true : false}></input>
          <label htmlFor='want'>Want</label>
          <input type='checkbox' name='want' onChange={this.handleAddChange} checked={newTodo.want ? true : false}></input>
          <label htmlFor='description'>Description</label>
          <input type='text' name='description' onChange={this.handleAddChange} value={newTodo.description}></input>
          <button onClick={this.addTodo}>Add</button>
        </div>
        <Todo item={this.headerColumn} />
        {/* newly added items go here and get the Have/Want columns, which rearrange them */}
        {todos ? todos.map(item => <Todo item={item} />) : null}
      </div>
    )
  }
}
