import React from 'react';
import '../style.css';

export default (props) => {
  const { item, handleTodoChange, deleteTodo } = props;
  return (
    <div className='todo-row'>
      <div className='description'>{item.description}</div>
      <div>{item.need.toString()}</div>
      <div>{item.want.toString()}</div>
      <input type='checkbox' name='complete' checked={item.complete} onChange={(e) => handleTodoChange(item.description, ['complete', e.target.checked])}></input>
      <button className='erase-todo' onClick={() => deleteTodo(item.description)}>erase</button>
    </div>
  )
}
