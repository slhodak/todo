import React from 'react';
import '../style.css';

export default class OpposeEntropy extends React.Component {
  constructor() {
    super();
    this.state = {
      meditate: 0,
      exercise: 0
    };

    this.updateEntropyTask = this.updateEntropyTask.bind(this);
  }

  componentDidMount() {
    fetch('/entropy')
    .then(res => res.json())
    .then(data => {
      console.log(data);
      const { meditate, exercise } = data;
      this.setState({ meditate, exercise });
    })
    .catch(error => console.error(error));
  }

  updateEntropyTask(event) {
    const type = event.target.name;
    const change = event.target.checked ? 1 : -1;
    fetch(`/entropy?type=${type}&change=${change}`, { method: 'POST' })
    .catch(error => console.error(error));
  }

  render() {
    const { meditate } = this.state;
    return (
      <div className='oppose-entropy'>
        <div className='meditate'>
          <div>Meditate</div>
          <div>
            <input type='checkbox' onChange={this.updateEntropyTask} name='meditate' checked={meditate > 0 ? true : false}></input>
          </div>
          <div>
            <input type='checkbox' onChange={this.updateEntropyTask} name='meditate' checked={meditate > 1 ? true : false}></input>
          </div>
        </div>
        <div className='exercise'>
          <div>Exercise</div>
          <input type='checkbox' onChange={this.updateEntropyTask} name='exercise'></input>
        </div>
      </div>
    );
  }
}
