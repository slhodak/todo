import React from 'react';
import '../style.css';

export default class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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

  render() {
    const { week } = this.state;
    return(
      <div className='stats'>
        <h2>Stats</h2>
        {week ?
          <div className='week-stats'>
            <h3>Last 7 Days</h3>
            <div>Week: {week.startDate} to {week.endDate}</div>
            <div>Need: {week.need.completed} of {week.need.total}</div>
            <div>Need & Want: {week.needWant.completed} of {week.needWant.total}</div>
            <div>Want: {week.want.completed} of {week.want.total}</div>
            <div>Neither: {week.neither.completed} of {week.neither.total}</div>
          </div> : null}
      </div>
    );
  }
}
