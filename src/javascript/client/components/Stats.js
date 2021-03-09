import React from 'react';
import '../style.css';

export default class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      week: {}
    };

    this.colorCodedPercent = this.colorCodedPercent.bind(this);
  }

  componentDidMount() {
    fetch('/stats/week/todos')
      .then(res => res.json())
      .then(body => {
        if (body.stats) {
          const week = this.state;
          week.todo = body.stats.todo;
          // yikes, see below
          week.startDate = body.stats.startDate;
          week.startDate = body.stats.endDate;
          this.setState({ week });
        } else if (body.error) {
          throw new Error(body.error);
        }
      })
      .catch(err => console.error('Error fetching statistics', err));
      fetch('/stats/week/entropy')
      .then(res => res.json())
      .then(body => {
        if (body.stats) {
          const { week } = this.state;
          // yikes, see above
          week.startDate = body.stats.startDate;
          week.startDate = body.stats.endDate;
          week.entropy = body.stats.entropy;
          this.setState({ week });
        } else if (body.error) {
          throw new Error(body.error);
        }
      })
      .catch(err => console.error('Error fetching statistics', err));
  }

  colorCodedPercent(a, b) {
    const percent = Math.round((a / b) * 100);
    let color = '#000000';
    if (percent > 75) {
      color = '#34d91e';
    } else if (percent > 50) {
      color = '#c2bc10';
    } else {
      color = '#f03630';
    }
    return <span style={{ color: color }}>{percent}%</span>;
  }

  render() {
    const { week } = this.state;
    const { todo, entropy } = week;
    const needPercent = todo ? this.colorCodedPercent(todo.need.completed, todo.need.total) : 'loading...';
    const needWantPercent = todo ? this.colorCodedPercent(todo.needWant.completed, todo.needWant.total) : 'loading...';
    const meditatePercent = entropy ? this.colorCodedPercent(entropy.meditate.completed, entropy.meditate.total) : 'loading...';
    const exercisePercent = entropy ? this.colorCodedPercent(entropy.exercise.completed, entropy.exercise.total) : 'loading...';
    return(
      <div className='stats'>
        <h2>Stats</h2>
        {todo ?
          <div className='week-stats'>
            <h3>Last 7 Days</h3>
            <div>Week: {week.startDate} to {week.endDate}</div>
            <div>Need: {todo.need.completed} of {todo.need.total} &nbsp;&nbsp;{needPercent}</div>
            <div>Need & Want: {todo.needWant.completed} of {todo.needWant.total} &nbsp;&nbsp;{needWantPercent}</div>
            <div>Want: {todo.want.completed} of {todo.want.total}</div>
            <div>Neither: {todo.neither.completed} of {todo.neither.total}</div>
          </div> : null}
        {entropy ?
          <div>
            <div>Meditation: {entropy.meditate.completed} of {entropy.meditate.total} &nbsp;&nbsp;{meditatePercent}</div>
            <div>Exercise: {entropy.exercise.completed} of {entropy.exercise.total} &nbsp;&nbsp;{exercisePercent}</div>
          </div> : null}
      </div>
    );
  }
}
