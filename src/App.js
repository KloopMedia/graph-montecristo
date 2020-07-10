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
    listOfNodes: null,
    showPagination: false,
    errorMessage: '',
    newCoords: null,
    coords: {},
    allCoords: null,
    newLinks: null,
    links: [],
    allLinks: null,
  }

  componentDidMount() { 
    let urlString =  queryString.parse(window.location.search, {decode: false})
    let query = ''
    if (urlString.nodes) {
      query = "MATCH (n) where id(n) in [" + urlString.nodes + "] return n"
      this.setState({cypherQuery: query})
      this.handleGoClick()
    }
    else if (urlString.url) {
      this.fetchData(urlString)
    }
    else if (urlString.coords) {
      let decodedCoord = decodeURI(urlString.coords);
      let coords = JSON.parse(decodedCoord)
      let ids = Object.keys(coords)
      query = "MATCH (n) where id(n) in [" + ids + "] return n"
      this.setState({newCoords: coords})
      this.setState({cypherQuery: query})
      this.handleGoClick()
    }
    if (urlString.links && (urlString.nodes || urlString.coords)) {
      let decodedLinks = decodeURI(urlString.links)
      let links = JSON.parse(decodedLinks)
      this.setState({newLinks: links})
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
    let nodes = null
    let coords = null
    let links = null

    if (this.state.listOfNodes) {
      nodes = this.state.listOfNodes[value-1]
    }
    else if (this.state.allCoords) {
      coords = this.state.allCoords[value-1]
      nodes = Object.keys(coords)
    }
    if (this.state.allLinks && (this.state.listOfNodes || this.state.allCoords)) {
      links = this.state.allLinks[value-1]
    }

    let query = "MATCH (n) where id(n) in [" + nodes + "] return n"
    this.setState({cypherQuery: query, newCoords: coords, newLinks: links})
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
      let query = 'ERROR'
      if (response.data.nodes) {
        let nodes = response.data.nodes
        query = "MATCH (n) where id(n) in [" + nodes[0] + "] return n"
        this.setState({listOfNodes: nodes})
      }
      else if (response.data.coords) {
        let coords = response.data.coords
        let ids = Object.keys(coords[0])
        query = "MATCH (n) where id(n) in [" + ids + "] return n"
        this.setState({newCoords: coords[0], allCoords: coords})
      }
      if (response.data.links && (response.data.nodes || response.data.coords)) {
        let links = response.data.links
        this.setState({newLinks: links[0], allLinks: links})
      }
      this.setState({showPagination: true, cypherQuery: query})
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
    let count = 0
    if (this.state.listOfNodes) {
      count = this.state.listOfNodes.length
    }
    else if (this.state.allCoords) {
      count = this.state.allCoords.length
    }

    return (
      <Grid container justify="center" style={{
        position: 'absolute',
        left: '50%',
        bottom: '10px',
        WebkitTransform: 'translateX(-50%)',
        transform: 'translateX(-50%)'
        }} >
      <Pagination count={count} onChange={this.handlePaginationChange} size="small" showFirstButton showLastButton />
    </Grid>
    )
  }

  returnCoords = (obj) => {
    this.setState({coords: obj})
  }

  returnLinks = (arr) => {
    this.setState({links: arr})
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
          nodeLinks={this.state.links}
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
            returnLinks={this.returnLinks}
            newLinks={this.state.newLinks}
            />
            {this.state.showPagination? this.returnPagination() : null}
        </AppSideBar>
      </div>
    )
  }
}

export default App;
