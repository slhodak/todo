import React from 'react';
import '../style.css';

export default (props) => {
  const { item } = props;
  return (
    <div className='list-item'>
      <div>{item.description}</div>
      <div>{item.have}</div>
      <div>{item.want}</div>
    </div>
  )
}
