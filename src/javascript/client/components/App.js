import React from 'react';
import Todo from './Todo';
import OpposeEntropy from './OpposeEntropy';
import Stats from './Stats';
import Blockchain from './Blockchain';
import '../style.css';

export default class App extends React.Component {
  constructor() {
    super();
    this.blankTodo = {
      description: '',
      need: false,
      want: false,
      rating: 0,
      complete: false
    };
    this.state = {
      todos: [],
      newTodo: Object.assign({}, this.blankTodo)
    };
    this.getList = this.getList.bind(this);
    this.handleAddChange = this.handleAddChange.bind(this);
    this.addTodo = this.addTodo.bind(this);
    this.handleTodoChange = this.handleTodoChange.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
    this.resetList = this.resetList.bind(this);
    this.restoreList = this.restoreList.bind(this);
    this.updateListInState = this.updateListInState.bind(this);
  }
  componentDidMount() {
    this.getList(App.getTodayKey());
  }
  static getTodayKey() {
    let today = new Date(Date.now())
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  }
  getList(date) {
    fetch(`/list?date=${date}`, {
      headers: [
        [ 'Accept', 'application/json' ]
      ]
    })
    .then(res => this.updateListInState(res))
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
  rateTodo(todo) {
    if (todo.need) {
      todo.rating += 1;
    }
    if (todo.want) {
      todo.rating -= 1;
    }
    if (!todo.want && !todo.need) {
      todo.rating = -2;
    }
  }
  addTodo() {
    const { newTodo } = this.state;
    this.rateTodo(newTodo);
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
      this.updateListInState(res);
      this.setState({ newTodo: Object.assign({}, this.blankTodo) });
    })
    .catch(err => console.error(`Error adding todo: ${err}`));
  }
  deleteTodo(description) {
    fetch(`/todo?description=${description}`, { method: 'DELETE' })
    .then(res => {
      this.updateListInState(res);
    })
    .catch(err => console.error(`Error deleting todo: ${err}`));
  }
  resetList() {
    console.log('Resetting list');
    fetch('/list/new', { method: 'POST' })
    .then(res => this.updateListInState(res))
    .catch(err => console.error('Error resetting list', err));
  }
  restoreList() {
    console.log('Restoring list from backup, if any');
    fetch(`/list/restore?date=${App.getTodayKey()}`)
    .then(res => this.updateListInState(res))
    .catch(err => console.error('Error restoring list', err));
  }
  updateListInState(response) {
    response.json()
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.list === null) {
        return this.resetList();
      }
      this.setState({ todos: data.list.todos });
    })
    .catch(err => console.error('Error updating list', err));
  }
  render() {
    const { todos, newTodo } = this.state;
    return (
      <div>
        <div className='header-area'>
          <h1>todo {App.getTodayKey()}</h1>
        </div>
        <div className='app-area'>
          <div className='left-panel'>
            <div className='new-todo-container'>
              <div className='input-details'>
                <input className='description' type='text' name='description' onChange={this.handleAddChange} value={newTodo.description}></input>
                <div className='need-want'>
                  <div>
                    <label htmlFor='need'>Need to</label>
                    <input type='checkbox' name='need' onChange={this.handleAddChange} checked={newTodo.need}></input>
                  </div>
                  <div>
                    <label htmlFor='want'>Want to</label>
                    <input type='checkbox' name='want' onChange={this.handleAddChange} checked={newTodo.want}></input>
                  </div>
                </div>
              </div>
              <button className='add-todo' onClick={this.addTodo}>Add</button>
            </div>
            <div className='todo-list'>
              <div className='todo-row header-row'>
                <div className='description'>Description</div>
                <div className='boolean-factor'>Need</div>
                <div className='boolean-factor'>Want</div>
                <div className='complete'>Complete</div>
                <div className='erase-todo-spacer'></div>
              </div>
              {/* newly added items go here and get the Need/Want columns, which rearrange them */}
              {todos ? todos.map(item => <Todo item={item} handleTodoChange={this.handleTodoChange} deleteTodo={this.deleteTodo}/>) : null}
            </div>
          </div>
          <div className='right-panel'>
            <div className='functions'>
              <button onClick={this.resetList} className='resetList'>Reset List</button>
              <button onClick={this.restoreList} className='restore-list'>Restore List (Undo Erase or Reset)</button>
            </div>
            <Blockchain />
            <OpposeEntropy />
          </div>
        </div>
        <div className='bottom-area'>
          <Stats />
        </div>
      </div>
    )
  }
}
