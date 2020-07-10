import React, { Component } from 'react';

import neo4j from 'neo4j-driver'
import Immutable from 'immutable'

import './my-svg.svg'
import MGraph from "../MGraph/MGraph";
import * as gh from './graphHelpers.js'

import CircularProgress from '@material-ui/core/CircularProgress';
import { Grid, Typography, Box } from '@material-ui/core';

class GraphComponent extends Component{

  driver = neo4j.driver('bolt://neo4j.kloop.io:7687')

  state = {
    visibleGraph: Immutable.fromJS({nodes: {}, edges: {}}),
    invisibleGraph: Immutable.fromJS({nodes: {}, edges: {}}),
    cardNodeIds: Immutable.fromJS([9350, 18766, 371947]),
    showSpinner: false,
    showSmallSpinner: false
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isGoClick !== this.props.isGoClick) {
      this.goClick(this.props.cypherQuery)
      this.props.goClick()
    }
    if (prevProps.isClearGraph !== this.props.isClearGraph) {
      this.clearGraphs()
      this.props.clearClick()
    }
  }

  clearGraphs = () => {
    this.setState({visibleGraph: Immutable.fromJS({nodes: {}, edges: {}}),
                   invisibleGraph: Immutable.fromJS({nodes: {}, edges: {}})})
  }

  goClick = (query) => {
    this.props.errorMessage('')
    this.executeQuery(query)
  }

  executeQuery = (cypherQuery) => {
    this.setState({showSpinner: true})
    const session = this.driver.session()
    session
      .run(cypherQuery)
      .then(result => {
        let updatedVisibleGraph = gh.toGraph(result, this.state.visibleGraph.toJS())
        const paramIDs = Object.keys(updatedVisibleGraph.nodes).toString()
        this.setState({
          visibleGraph: Immutable.fromJS(updatedVisibleGraph)
        })
        this.updateInvisible(paramIDs, updatedVisibleGraph, this.state.invisibleGraph.toJS()) 
      })
      .catch(error => {
        console.log(error)
        this.props.errorMessage('Произошла ошибка во время выполнения запроса')
      })
      .then(() => {
        session.close()
        this.setState({showSpinner: false})
      })

  }

  updateInvisible = (paramIDs, updatedVisibleGraph, invisibleGraph) => {
    this.setState({showSmallSpinner: true})
    const invisibleSession = this.driver.session()
    invisibleSession
      .run("MATCH (n)-[r]-(b) WHERE ID(n) in ["+ paramIDs +"] RETURN n, r, b")
      .then(result => {
        const updatedInvisibleGraph = gh.toGraph(result,
          invisibleGraph)
        updatedVisibleGraph = gh.reconcileGraphs(updatedVisibleGraph,
          updatedInvisibleGraph)
        this.setState({
          visibleGraph: Immutable.fromJS(updatedVisibleGraph),
          invisibleGraph: Immutable.fromJS(updatedInvisibleGraph)
        })
      })
      .catch(error => {
        console.log(error)
        this.props.errorMessage('Произошла ошибка при обработке связей')
      })
      .then(() => {
        invisibleSession.close()
        this.setState({showSmallSpinner: false})
      })
  }

  mergeGraphs = (ids, vGraph, iGraph) => {
    ids.forEach((id) => {
      vGraph.edges[id] = iGraph.edges[id]
      vGraph.nodes[vGraph.edges[id].source] = iGraph.nodes[iGraph.edges[id].source] 
      vGraph.nodes[vGraph.edges[id].target] = iGraph.nodes[iGraph.edges[id].target] 
    })
    let updatedVisibleGraph = gh.reconcileGraphs(vGraph, iGraph)
    this.updateInvisible(ids, updatedVisibleGraph, this.state.invisibleGraph.toJS())
    updatedVisibleGraph = gh.reconcileGraphs(updatedVisibleGraph, this.state.invisibleGraph.toJS())
    return updatedVisibleGraph
  }

  findNodes(nodes, edges, edgeIds, nodeKey) {
    const foundNodes = {} 
    Object.keys(nodes).forEach(nodeKey => {
      edgeIds.forEach(edgeId => {
        if (nodes[nodeKey].id === edges[edgeId].source || nodes[nodeKey].id === edges[edgeId].target){
          foundNodes[nodeKey] = nodes[nodeKey]
        }
      })
    }) 
    return foundNodes
  }

  removeElements = (ids, nodeKey, vGraph, iGraph) => {
    const innocentNodes = this.findNodes(vGraph.nodes, vGraph.edges, ids)
    ids.forEach((id) => {
      let direction = 'target'
      let nodeToRemove = vGraph.nodes[vGraph.edges[id][direction]]
      if (nodeToRemove.id === parseInt(nodeKey)){
        direction = 'source'
        nodeToRemove = vGraph.nodes[vGraph.edges[id][direction]]
      }
      
      if (!Object.keys(innocentNodes).includes(String(nodeToRemove.id))){
        delete vGraph.nodes[vGraph.edges[id][direction]]
        delete vGraph.edges[id]
      }
      // delete iGraph.nodes[iGraph.edges[id].source]
      // delete iGraph.nodes[iGraph.edges[id].target]
      // delete iGraph.edges[id]
    })
    console.log('remove vGraph result: ', vGraph)
    return [vGraph, iGraph]
  }

  handleButtonClick = (ids, nodeKey) => {
    const edges = Object.keys(this.state.visibleGraph.toJS().edges)
    let visibleGraph = this.state.visibleGraph.toJS()
    let invisibleGraph = this.state.invisibleGraph.toJS()
    let updatedVisibleGraph = null
    // if ids are already in visible graph
    // if (ids.every(el => edges.includes(el))) {
    //   const graphs = this.removeElements(ids, nodeKey, visibleGraph, invisibleGraph)
    //   updatedVisibleGraph = graphs[0]
    //   // ids = edges.filter(el => !ids.includes(el))
    // } else {
      updatedVisibleGraph = this.mergeGraphs(ids, visibleGraph, invisibleGraph)
    // }
      const nodes = this.findNodes(updatedVisibleGraph.nodes, updatedVisibleGraph.edges, ids)
      this.updateInvisible(Object.keys(nodes), updatedVisibleGraph, invisibleGraph)
    console.log('updated visible graph: ', updatedVisibleGraph)
    this.setState({visibleGraph: Immutable.fromJS(updatedVisibleGraph)})
  }

  removeFromArray = (nodeId) => {
    let cardNodeIds = this.state.cardNodeIds.toJS()
    const idIndex = cardNodeIds.indexOf(parseInt(nodeId))
    if (idIndex > -1) {
      cardNodeIds.splice(idIndex, 1)
    }
    return cardNodeIds
  }

  addToArray = (nodeId) => {
    let cardNodeIds = this.state.cardNodeIds.toJS()
    const idIndex = cardNodeIds.indexOf(parseInt(nodeId))
    if (idIndex === -1) {
      cardNodeIds.push(parseInt(nodeId))
    }
    return cardNodeIds
  }

  handleMinimezeClick = (nodeId) => {
    console.log('minimize clicked', nodeId)
    const cardNodeIds = this.removeFromArray(nodeId)
    this.setState({cardNodeIds: Immutable.fromJS(cardNodeIds)})
  }

  handleNodeClick = (nodeId) => {
    console.log('node clicked', nodeId)
    if (!this.state.cardNodeIds.toJS().includes(parseInt(nodeId))){
      const cardNodeIds = this.addToArray(nodeId)
      this.setState({cardNodeIds: Immutable.fromJS(cardNodeIds)})
    }
  }

  returnSpinner = () => {
    return (
    <div style = {{
      position: 'absolute',
      height: '100px',
      width: '100px',
      top: '50%',
      left: '50%',
      marginLeft: '-50px',
      marginTop: '-50px',
      }}>
      <CircularProgress size={100} style={{color: 'grey'}}/>
    </div>
    )
  }

  returnSmallSpinner = () => {
    return (
      <Grid container alignContent="flex-end" direction="column" style={{position:"absolute", right:0,paddingRight: "10px"}}>
        <Box>
          <CircularProgress size={32} style={{color: 'grey'}}/>
        </Box>
        <Typography variant="body2" component="p" style={{fontSize: "12px"}}>Cвязи загружаются</Typography>
      </Grid>
    )
  }

  render() {
    let graph = null
    if (Object.keys(this.state.visibleGraph.toJS().nodes).length !== 0) {
      graph = <MGraph 
        onButtonClick={this.handleButtonClick}
        onMinimizeClick={this.handleMinimezeClick}
        onNodeClick={this.handleNodeClick}
        visibleGraph={this.state.visibleGraph}
        invisibleGraph={this.state.invisibleGraph}
        cardNodeIds={this.state.cardNodeIds}
        returnCoords={this.props.returnCoords}
        newCoords={this.props.newCoords}
        returnLinks={this.props.returnLinks}
        newLinks={this.props.newLinks}
        />
    }
    return(
      <div>
        {this.state.showSmallSpinner ? this.returnSmallSpinner(): null}
        {this.state.showSpinner ? this.returnSpinner() : graph}
      </div>
    )
  }

}

export default GraphComponent