import React, { Component} from 'react'
import './App.css'
import axios from 'axios'
import {Divider} from '@mui/material';
//import 'bootstrap/dist/css/bootstrap.min.css'
//import Button from 'react-bootstrap/Button';
//import { Button } from 'react-bootstrap';
//import PostForm from "./PostForm";
var QRCode = require('qrcode.react');

require('dotenv').config()
//const ipAddress = process.env.ip_address
//const ipAddress = "192.168.2.152"

class App extends Component {
    constructor (probs) {
        super(probs)
        this.state = {
            invitation_url: '',
            invitation_url2:'',
            showQRCode: false,
            showQRCode2: false
        }

        this.handleClick = this.handleClick.bind(this)
        this.handleClick2 = this.handleClick2.bind(this)
    }

    handleClick () {
        console.log('Success!')
        
        axios.get('http://localhost:8000/getServiceLink').then(response => {
        console.log(response);
        console.log(response.data);
        this.setState({invitation_url: "http://192.168.2.152:8000/getInvitation?start=Hamburg-Hbf&dest=KoelnBonn-Airport&time=14:41"})});
        this.setState({showQRCode: true});   
    }

    handleClick2 () {
      console.log('Success!')
      axios.get('http://localhost:9229/getServiceLink').then(response => {
      console.log(response);
      console.log(response.data);
      this.setState({invitation_url2: "http://192.168.2.152:9229/getInvitation?start=KoelnBonn-Airport&dest=London-Heathrow-Airport&time=19:45"})});
      this.setState({showQRCode2: true});
    }

  render () {
    return (
          <div class="row" className="App" exact path='/ergebnis'>
              <header className="App-header">
              <h5 class="Abstand">Ergebnis:</h5>
              <div class="column">
                <h6>Streckenabschnitt 1 - Datum: 15.09.2021</h6>
                <h4>Hamburg Hbf - Köln/Bonn Flughafen </h4>
                <h5>Abfahrtzeit 14:41 Uhr - Ankunftszeit 18:45 Uhr | Gleis 3</h5>
                <h5>Mobilitätsdienstleister (MSP):</h5>
                <img src="https://logosmarken.com/wp-content/uploads/2021/03/Deutsche-Bahn-Logo.png" alt="" class="DBLogoIMG"></img>
                <img src="https://cdn-icons-png.flaticon.com/512/1532/1532079.png" alt="Zug - Kostenlose transport Icons" class="DBLogoIMG2"></img>
                  <button  type="button" className='button' onClick={this.handleClick}>Jetzt Zug buchen!</button>
                    {this.state.showQRCode && <p class="pa">Ihr Ticket finden Sie unter folgendem QR-Code oder Link:</p>}
                    {this.state.showQRCode && <QRCode type="QR-Code" className="QR-Code" value={this.state.invitation_url}/>}
                    <Divider/>
                    <a class="a" href="{this.state.invitation_url}">{this.state.invitation_url}</a>
                    <p></p>
              </div>
              
              <div class="column">
                  <h6>Streckenabschnitt 2 - Datum: 15.09.2021</h6>
                  <h4>Köln/Bonn Flughafen - London Heathrow</h4>
                  <h5>Abflugszeit 19:45 - Ankunftszeit 21:05 Uhr | Terminal 1</h5>
                  <h5>Mobilitätsdienstleister (MSP):</h5>
                  <img src="https://logosmarken.com/wp-content/uploads/2020/11/Lufthansa-Logo.png" alt="" class="lufthansaIMG"></img>
                  <img src="https://cdn-icons-png.flaticon.com/512/61/61212.png" alt="Schwarzes flugzeug - Kostenlose transport Icons" class="lufthansaIMG2"></img>
                  <button  type="button" className='button' onClick={this.handleClick2}>Jetzt Flug buchen!</button>
                    {this.state.showQRCode2 && <p class="pa">Ihr Ticket finden Sie unter folgendem QR-Code oder Link:</p>}
                    {this.state.showQRCode2 && <QRCode type="QR-Code" className="QR-Code" value={this.state.invitation_url2}/>}
                    <Divider/>
                    <a class="a" href="{this.state.invitation_url}">{this.state.invitation_url2}</a>
                    <p></p>
                </div>

              </header>
            </div>
    )
  }
}
export default (App)