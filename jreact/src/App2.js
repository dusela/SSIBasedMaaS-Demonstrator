import React, { Component} from 'react'
import './App.css'
import App from './App';
import './components/tabpanel'
import BasicTabs from './components/tabpanel';

class App2 extends Component {
  constructor (probs) {
    super(probs)
    this.state = {
        showResult: false
    }}


  render () {
    return (
            <div class="row" className="App" exact path='/suche'>
            <BasicTabs></BasicTabs>
              <div>
                {this.state.showResult && <App></App>}
              </div>
            </div>
            
    )
  }
}
export default (App2)