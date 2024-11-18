import React from 'react';
import '../style.css';

export default (props) => {
  const { item, handleTodoChange, deleteTodo } = props;
  return (
    <div className='todo-row todo-item'>
      <div className='description'>{item.description}</div>
      <div className='boolean-factor'>{item.need.toString()}</div>
      <div className='boolean-factor'>{item.want.toString()}</div>
      <div className='complete'>
        <input className='complete-box' type='checkbox' name='complete' checked={item.complete} onChange={(e) => handleTodoChange(item.description, ['complete', e.target.checked])}></input>
      </div>
      <div className='erase-todo-container'>
        <button className='erase-todo' onClick={() => deleteTodo(item.description)}>erase</button>
      </div>
    </div>
  )
}
