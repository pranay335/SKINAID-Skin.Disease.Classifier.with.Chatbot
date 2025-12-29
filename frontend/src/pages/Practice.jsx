import React, { Component } from "react";

class LifeCycleDemo extends Component {
  constructor() {
    super();
    this.state = { count: 0 };
    console.log("1️⃣ Initialization Phase: Constructor called");
  }

  componentDidMount() {
    console.log("2️⃣ Mounting Phase: componentDidMount called");
  }

  componentDidUpdate() {
    console.log("3️⃣ Updating Phase: componentDidUpdate called");
  }

  componentWillUnmount() {
    console.log("4️⃣ Unmounting Phase: componentWillUnmount called");
  }

  render() {
    console.log("Render method called");
    return (
      <div>
        <h2>Count: {this.state.count}</h2>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}

export default LifeCycleDemo;
