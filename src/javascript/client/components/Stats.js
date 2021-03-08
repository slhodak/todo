import React from 'react';
import '../style.css';

export default class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.colorCodedPercent = this.colorCodedPercent.bind(this);
  }

  componentDidMount() {
    fetch('/stats/week')
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
    } else if (percent > 25) {
      color = '#f03630';
    }
    return <span style={{ color: color }}>{percent}%</span>;
  }

  render() {
    const { week } = this.state;
    const needPercent = week ? this.colorCodedPercent(week.need.completed, week.need.total) : 'loading...';
    const needWantPercent = week ? this.colorCodedPercent(week.needWant.completed, week.needWant.total) : 'loading...';
    return(
      <div className='stats'>
        <h2>Stats</h2>
        {week ?
          <div className='week-stats'>
            <h3>Last 7 Days</h3>
            <div>Week: {week.startDate} to {week.endDate}</div>
            <div>Need: {week.need.completed} of {week.need.total} &nbsp;&nbsp;{needPercent}</div>
            <div>Need & Want: {week.needWant.completed} of {week.needWant.total} &nbsp;&nbsp;{needWantPercent}</div>
            <div>Want: {week.want.completed} of {week.want.total}</div>
            <div>Neither: {week.neither.completed} of {week.neither.total}</div>
          </div> : null}
      </div>
    );
  }
}
