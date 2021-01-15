import React from 'react';
import '../style.css';

export default (props) => {
  const { item } = props;
  return (
    <div className='list-item'>
      <div>{item.rank}</div>
      <div className='description'>{item.description}</div>
      <div>{item.need.toString()}</div>
      <div>{item.want.toString()}</div>
    </div>
  )
}
