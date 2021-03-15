import React from 'react';
import '../style.css';

export default class OpposeEntropy extends React.Component {
  constructor(props) {
    super();
    this.state = {
      meditate1: false,
      meditate2: false,
      exercise: false
    };

    this.host = props.host;
    this.updateEntropyTask = this.updateEntropyTask.bind(this);
  }

  componentDidMount() {
    fetch(`${this.host}/entropy`)
    .then(res => res.json())
    .then(data => {
      const { meditate1, meditate2, exercise } = data;
      this.setState({ meditate1, meditate2, exercise });
    })
    .catch(error => console.error(error));
  }

  updateEntropyTask(event) {
    const type = event.target.name;
    const change = event.target.checked;
    fetch(`${this.host}/entropy?type=${type}&change=${change}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => this.setState({ [type]: data[type] }))
    .catch(error => console.error(error));
  }

  render() {
    const { meditate1, meditate2, exercise } = this.state;
    return (
      <div className='oppose-entropy'>
        <div className='meditate'>
          <div>Meditate</div>
          <div>
            <input type='checkbox' onChange={this.updateEntropyTask} name='meditate1' checked={meditate1}></input>
          </div>
          <div>
            <input type='checkbox' onChange={this.updateEntropyTask} name='meditate2' checked={meditate2}></input>
          </div>
        </div>
        <div className='exercise'>
          <div>Exercise</div>
          <input type='checkbox' onChange={this.updateEntropyTask} name='exercise' checked={exercise}></input>
        </div>
      </div>
    );
  }
}
