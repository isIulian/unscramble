import React, { Component } from 'react';
import '../App.css';

class Keyboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            topRow: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
            middleRow: ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
            bottomRow: ["Z", "X", "C", "V", "B", "N", "M", "←", "Enter"]
        };
    }

    handleClick = (event) => {
        this.props.keyboardType(event.currentTarget.textContent);
    };

    render () {

        return (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: "340px", textAlign: "center", marginBottom: '5px' }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
                    {this.state.topRow.map((letter, idx) =>
                        <div className='keyStyle' key={letter} onClick={this.handleClick} >{letter}</div>
                    )}</div>  <br />
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
                    {this.state.middleRow.map((letter, idx) =>
                        <div className='keyStyle' key={letter} onClick={this.handleClick} >{letter}</div>
                    )}</div><br />
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
                    {this.state.bottomRow.map((letter, idx) =>
                        <div className='keyStyle' key={letter} onClick={this.handleClick} >{letter}</div>
                    )}
                </div>
            </div>
        )


    }

}

export default Keyboard;