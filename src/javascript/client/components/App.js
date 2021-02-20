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
      rank: 0,
      complete: false
    };
    this.state = {
      todos: [],
      newTodo: Object.assign({}, this.blankTodo)
    };
    this.headerColumn = { rank: "Rank", description: "Description", need: "Need", want: "Want" };
    this.getList = this.getList.bind(this);
    this.handleAddChange = this.handleAddChange.bind(this);
    this.addTodo = this.addTodo.bind(this);
    this.handleTodoChange = this.handleTodoChange.bind(this);
    this.updateList = this.updateList.bind(this);
    this.clearToday = this.clearToday.bind(this);
  }
  componentDidMount() {
    this.getList(this.getTodayKey());
  }
  getTodayKey() {
    let today = new Date(Date.now())
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
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
    this.upsertTodo(newTodo);
  }
  handleTodoChange(description, [property, value]) {
    const { todos } = this.state;
    let todo = todos.find(todo => todo.description === description);
    todo[property] = value;
    this.upsertTodo(todo);
  }
  upsertTodo(todo) {
    fetch('/todo', {
      method: 'POST',
      headers: [
        [ 'Content-type', 'application/json' ]
      ],
      body: JSON.stringify(todo)
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
      this.setState({ todos: data.todos });
    })
    .catch(err => console.error('Error updating list', err));
  }
  clearToday() {
    fetch('/todos', { method: 'DELETE' })
    .then(res => this.updateList(res))
    .catch(err => console.error('Error clearing list', err));
  }
  render() {
    const { todos, newTodo } = this.state;
    return (
      <div>
        <h1>todo</h1>
        <div>
          <label htmlFor='need'>Need</label>
          <input type='checkbox' name='need' onChange={this.handleAddChange} checked={newTodo.need}></input>
          <label htmlFor='want'>Want</label>
          <input type='checkbox' name='want' onChange={this.handleAddChange} checked={newTodo.want}></input>
          <label htmlFor='description'>Description</label>
          <input type='text' name='description' onChange={this.handleAddChange} value={newTodo.description}></input>
          <button onClick={this.addTodo}>Add</button>
        </div>
        <button onClick={this.clearToday} className='clear'>Clear</button>
        <div className='header-column'>
          <div>Rank</div>
          <div>Description</div>
          <div>Need</div>
          <div>Want</div>
          <div>Complete</div>
        </div>
        {/* newly added items go here and get the Have/Want columns, which rearrange them */}
        {todos ? todos.map(item => <Todo item={item} handleTodoChange={this.handleTodoChange}/>) : null}
      </div>
    )
  }
}
