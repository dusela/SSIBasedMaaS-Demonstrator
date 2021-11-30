import React, { Component} from 'react'
import './App.css'
import {Button} from '@mui/material/';
import App from './App';
import './components/tabpanel'

class Routenplaner extends Component {
  constructor (probs) {
    super(probs)
    this.state = {
        showResult: false
    }}


  render () {
    return (
            <div class="row" className="App" exact path='/suche'>
              <header className="App-header">
              <h1 class="p">Routenplaner+</h1>
              <form class="Abstand">
                <label for="AStandort">Aktueller Standort:</label>
                <input name="APosition" id="AusgangsPosition" type="text" value="Hamburg Hauptbahnhof" />
                <br></br>
                <br></br>
                <label for="AStandort">Zieldestination:</label>
                <input name="ZPosition" id="ZielPosition" type="text" value="London Heathrow" />
                <Button size="small" variant="contained" color="success" onClick={() => this.setState({showResult: true})}>Suchen</Button>
              </form>
              </header>
              <div>
                {this.state.showResult && <App></App>}
              </div>
            </div>
            
    )
  }
}
export default (Routenplaner)