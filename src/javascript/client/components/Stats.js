import React from 'react';
import '../style.css';

export default class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: []
    };
  }

  componentDidMount() {
    fetch('/all')
      .then(res => res.json())
      .then(body => {
        const { lists } = body;
        this.setState({ lists });
      })
      .catch(err => console.error('Error fetching statistics', err));
  }

  render() {
    const { lists } = this.state;
    return(
      <div className='stats'>
        {lists.map(list => {
          return (
            <div>
              <div>{list.date}</div>
              {list.todos.map(todo => <div>{todo.description}</div>)}
            </div>
          )
        })}
      </div>
    );
  }
}