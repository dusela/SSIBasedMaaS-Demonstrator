import React from 'react'
import './App.css'
import axios from 'axios'
var QRCode = require('qrcode.react');

function buttonClick () {

    const invitation_url = "";
    const invitation_url2 = "";

    const handleClick = () => {
        console.log('Success!')
        axios.get('http://localhost:8000/getServiceLink').then(response => {
        console.log(response);
        console.log(response.data);
         this.setState({invitation_url: "http://192.168.2.102:8000/getInvitation"})});   
    };

    const handleClick2 = () => {
      console.log('Success!')
      axios.get('http://localhost:9229/getServiceLink').then(response => {
      console.log(response);
      console.log(response.data);
       this.setState({invitation_url2: "http://192.168.2.102:9229/getInvitation"})});
    };

    return (
            <div className="App">
              <header className="App-header">
              <h1> Routenplaner+</h1>
              <div>
                <button  type="button" className='button' onClick={handleClick}>Jetzt Zug buchen!</button>
                    <a href="{this.state.invitation_url}">{invitation_url}</a>
                    <QRCode type="QR-Code" className="QR-Code" value={invitation_url}/>
              </div>
              <div>
                <button  type="button" className='button' onClick={handleClick2}>Jetzt Zug buchen!</button>
                    <a href="{this.state.invitation_url}">{invitation_url2}</a>
                    <QRCode type="QR-Code" className="QR-Code" excavate={true} value={invitation_url2}/>
              </div>
              </header>
            </div>
    );
};

export default (buttonClick)