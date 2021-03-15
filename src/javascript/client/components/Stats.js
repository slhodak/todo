import React from 'react';
import '../style.css';

export default class Stats extends React.Component {
  constructor(props) {
    super();
    this.state = {
      week: {}
    };

    this.host = props.host;
    this.colorCodedPercent = this.colorCodedPercent.bind(this);
  }

  componentDidMount() {
    fetch(`${this.host}/stats/week`)
      .then(res => res.json())
      .then(body => {
        if (body.stats) {
          this.setState({ week: body.stats });
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
    const { todoStats, entropyStats } = week;
    const needPercent = todoStats ? this.colorCodedPercent(todoStats.need.completed, todoStats.need.total) : 'loading...';
    const needWantPercent = todoStats ? this.colorCodedPercent(todoStats.needWant.completed, todoStats.needWant.total) : 'loading...';
    const meditatePercent = entropyStats ? this.colorCodedPercent(entropyStats.meditate.completed, entropyStats.meditate.total) : 'loading...';
    const exercisePercent = entropyStats ? this.colorCodedPercent(entropyStats.exercise.completed, entropyStats.exercise.total) : 'loading...';
    return(
      <div className='stats'>
        <h2>Stats</h2>
        {todoStats ?
          <div className='week-stats'>
            <h3>Last 7 Days</h3>
            <div>Week: {week.startDate} to {week.endDate}</div>
            <div>Need: {todoStats.need.completed} of {todoStats.need.total} &nbsp;&nbsp;{needPercent}</div>
            <div>Need & Want: {todoStats.needWant.completed} of {todoStats.needWant.total} &nbsp;&nbsp;{needWantPercent}</div>
            <div>Want: {todoStats.want.completed} of {todoStats.want.total}</div>
            <div>Neither: {todoStats.neither.completed} of {todoStats.neither.total}</div>
          </div> : null}
        {entropyStats ?
          <div>
            <div>Meditation: {entropyStats.meditate.completed} of {entropyStats.meditate.total} &nbsp;&nbsp;{meditatePercent}</div>
            <div>Exercise: {entropyStats.exercise.completed} of {entropyStats.exercise.total} &nbsp;&nbsp;{exercisePercent}</div>
          </div> : null}
      </div>
    );
  }
}
