import React, { Component } from 'react';
import './App.css';
import './my-svg.svg'
import GraphComponent from './components/GraphComponent'
import Pagination from '@material-ui/lab/Pagination';
import queryString from 'query-string'
import AppSideBar from './SideBar/AppSideBar'
import Grid from '@material-ui/core/Grid'

const axios = require('axios').default;

class App extends Component {

  state = {
    cypherQuery: "MATCH (n) where id(n) in [2437183, 18766, 2460290, 371947, 9350, 2437735, 1150073] return n",
    searchText: "",
    goClick: false,
    clearGraph: false,
    listOfNodes: [],
    showPagination: false,
    errorMessage: '',
    newCoords: null,
    coords: {}
  }

  componentDidMount() { 
    let urlString =  queryString.parse(window.location.search, {decode: false})
    let query = ''
    console.log("URL STRING", urlString)
    if (urlString.nodes) {
      query = "MATCH (n) where id(n) in [" + urlString.nodes + "] return n"
      console.log("NODES", query)
      this.setState({cypherQuery: query})
      this.handleGoClick()
    }
    else if (urlString.url) {
      console.log("urlString", urlString)
      this.fetchData(urlString)
    }
    else if (urlString.coords) {
      let dec = decodeURI(urlString.coords);
      let obj = JSON.parse(dec)
      console.log(obj)
      let ids = Object.keys(obj)
      query = "MATCH (n) where id(n) in [" + ids + "] return n"
      this.setState({newCoords: obj})
      this.setState({cypherQuery: query})
      this.handleGoClick()
    }
  }

  handleCypherQueryTextChange = (event) => {
    this.setState({cypherQuery: event.target.value})
  }

  handleSearchTextChange = (event) => {
    let query = "MATCH (n) where n.text_search =~ '.*" + event.target.value.toLowerCase() + ".*' return n"
    this.setState({searchText: event.target.value, cypherQuery: query})
  }

  handlePaginationChange = (event, value) => {
    this.handleClearClick()
    let nodes = this.state.listOfNodes[value - 1]
    let query = "MATCH (n) where id(n) in [" + nodes.join() + "] return n"
    this.setState({cypherQuery: query})
    this.handleGoClick()
  }

  fetchData = (urlString) => {
    axios.get(urlString.url, {
      params: {
        token: urlString.token
      }
    })
    .then(response => {
      // handle success
      console.log(response);
      let query = "MATCH (n) where id(n) in [" + response.data[0].join() + "] return n"
      console.log(query)
      this.setState({listOfNodes: response.data, showPagination: true, cypherQuery: query})
      this.handleGoClick()
    })
    .catch(error => {
      // handle error
      this.setState({errorMessage: 'Произошла ошибка при запросе данных. Проверье интернет-соединение' })
      console.log('There has been a problem with your fetch operation: ' + error.message);
    })
  }

  handleGoClick = () => {
    this.setState({goClick: true});
    console.log('go button clicked')
    console.log('state goClicked ', this.state.goClick)
  }

  goClick = () => {
    this.setState({goClick: false})
  }

  handleClearClick = () => {
    this.setState({clearGraph: true})
  }

  clearClick = () => {
    this.setState({clearGraph: false})
  }

  handleResetClick = () => {
    this.handleClearClick()
    this.handleGoClick()
  }
  handleError = (errorMessage) => {
    this.setState({errorMessage: errorMessage})
  }

  returnPagination = () => {
    return (
      <Grid container justify="center" style={{
        position: 'absolute',
        left: '50%',
        bottom: '10px',
        WebkitTransform: 'translateX(-50%)',
        transform: 'translateX(-50%)'
        }} >
      <Pagination count={this.state.listOfNodes.length} onChange={this.handlePaginationChange} size="small" showFirstButton showLastButton />
    </Grid>
    )
  }

  returnCoords = (obj) => {
    this.setState({coords: obj})
  }
  
  render() {
    return(
      <div className='App'>
        <AppSideBar 
          cypherQuery={this.state.cypherQuery}
          handleCypherQueryTextChange={this.handleCypherQueryTextChange}
          searchText={this.state.searchText}
          handleSearchTextChange={this.handleSearchTextChange}
          handleGoClick={this.handleGoClick} 
          // handleResetClick={this.handleResetClick}
          handleClearClick={this.handleClearClick}
          nodeCoords={this.state.coords}
          >
          {this.state.errorMessage &&
            <h3 className="error"> { this.state.errorMessage } </h3> }
          <GraphComponent 
            cypherQuery={this.state.cypherQuery}
            isGoClick={this.state.goClick}
            goClick={this.goClick}
            isClearGraph={this.state.clearGraph}
            clearClick={this.clearClick}
            errorMessage={this.handleError}
            returnCoords={this.returnCoords}
            newCoords={this.state.newCoords}
            />
            {this.state.showPagination? this.returnPagination() : null}
        </AppSideBar>
      </div>
    )
  }
}

export default App;
