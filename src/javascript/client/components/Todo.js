import React from 'react';
import '../style.css';

export default (props) => {
  const { item, handleTodoChange } = props;
  return (
    <div className='list-item'>
      <div>{item.rank}</div>
      <div className='description'>{item.description}</div>
      <div>{item.need.toString()}</div>
      <div>{item.want.toString()}</div>
      <input type='checkbox' name='complete' checked={item.complete} onChange={(e) => handleTodoChange(item.description, ['complete', e.target.checked])}></input>
    </div>
  )
}
