import React from 'react';
import ReactDOM from 'react-dom';
import ListItem from './ListItem';
import '../style.css';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      listItems: [ {
          description: 'bake a cake',
          have: 1,
          want: 1
        }
      ]
    }
  }
  render() {
    const { listItems } = this.state;
    return (
      <div>
        <h1>TODO</h1>
        <input type="text"></input><button>Add</button>
        <ol>
          {/* newly added items go here and get the Have/Want columns, which rearrange them */}
          {listItems.map(item => <ListItem item={item} />)}
        </ol>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
