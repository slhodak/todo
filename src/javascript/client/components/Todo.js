import React from 'react';
import '../style.css';

export default (props) => {
  const { item, handleTodoChange, deleteTodo } = props;
  return (
    <div className='todo-row todo-item'>
      <div className='description'>{item.description}</div>
      <div>{item.need.toString()}</div>
      <div>{item.want.toString()}</div>
      <div>
        <input type='checkbox' name='complete' checked={item.complete} onChange={(e) => handleTodoChange(item.description, ['complete', e.target.checked])}></input>
      </div>
      <button className='erase-todo' onClick={() => deleteTodo(item.description)}>erase</button>
    </div>
  )
}
