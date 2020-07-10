import React, { useState, useEffect, useRef } from "react";
import {Graph} from "react-d3-graph";
import Card from '../Cards/Card';
import CardConfig from '../config';
import translate from '../Cards/utils/translate';
import shorten from '../Cards/utils/shorten';
import {relationshipConfig} from '../config';

const objNode = {}
const MGraph = (props) => {
  const [dim, setDim] = useState({}) // DO NOT DELETE

  const displayGraph = (props) => {
    const dispGraph = {
      nodes: Object.values(props.visibleGraph.toJS().nodes),
      links: Object.values(props.visibleGraph.toJS().edges),
    }

    let cardNodeIds = props.cardNodeIds.toJS()
    //console.log('mgraph card nodes: ', cardNodeIds)
    dispGraph.nodes = dispGraph.nodes.map((node) => {
      // if node.id is in array, apply viewGenerator
      if (cardNodeIds.includes(node.id)) {
        
        node.fontSize = 16
        node.dispLabel = " "
        node.viewGenerator = (n) => {
          const getDimensions = (dim, id) => {
             setDim(dim)
             objNode[id] = dim
          }
          return <Card
            node={n}
            getDimensions={getDimensions}
            vGraph={props.visibleGraph}
            iGraph={props.invisibleGraph}
            onButtonClick={props.onButtonClick}
            onMinimizeClick={props.onMinimizeClick}/>
        }
      } else { // else return SVG icon
        node.svg = CardConfig[node.labels[0]].svg
        node.size = 600
        node.fontSize = 16
        node.highlightFontSize = 24
        node.dispLabel = shorten(node.properties[CardConfig[node.labels[0]].contentTextParam])
      }

      return node
    })

    ///// Dynamic height
    dispGraph.nodes = dispGraph.nodes.map((node) => {
      if (cardNodeIds.includes(node.id)) {
        node.size = {
          height: objNode[node.id],
          width: 2400
        }
      }
      if (props.newCoords && props.newCoords.hasOwnProperty(node.id)) {
        node.x = props.newCoords[node.id].x
        node.y = props.newCoords[node.id].y
      }
      return node
    })
    ////

    dispGraph.links = dispGraph.links.map((clearLink) => {
      const link = {...clearLink, ...relationshipConfig[clearLink.type].linkConf}

      // if PARTICIPATED_IN.properties not empty
      if (relationshipConfig[link.type].properties.length !== 0) {

        relationshipConfig[link.type].result.forEach(conf => {
          // if node.result in value AND regex=true
          if (conf.value.toLowerCase().includes(link.properties.result.substring(0, 7).toLowerCase()) && conf.regex) {
            link.color = conf.color
          } else {
            console.log("LINK NOT RED")
          }
        });

        let label = ''
        for (let value of Object.values((relationshipConfig[link.type].properties))) { // for [proposed_price, result]
          label = label + link.properties[value] + ' '
        }
        link.dispLabel = label
      }
      // if PARTICIPATED_IN.properties IS empty
      else {
        link.dispLabel = translate(link.type, 'ru')
      }
      return link
    })

    /* DO NOT DELETE

    if (Object.keys(link.properties).length !== 0) {
       link.label = Object.values(link.properties).join(" ")
    }
    else {
     link.label = translate(link.type, 'ru')
   }
    console.log('LINK', link)
    return link
  }) */
    return dispGraph
  };

  const [windowHeight, setWindowHeight] = useState(window.innerHeight - 110);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWindowHeight(window.innerHeight - 110);
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const myConfig = {
    height: windowHeight,
    width: windowWidth,
    staticGraphWithDragAndDrop: props.newCoords ? true : false,
    //height: 1000,
    //width: 1000,
    // staticGraphWithDragAndDrop: true,
    // nodeHighlightBehavior: true,
    node: {
      labelProperty: "dispLabel",
      fontSize: 14
    },
    //   color: "lightgreen",
    //   labelProperty: 'label',
    //   highlightStrokeColor: "blue",
    //   size: 3300,
    //   fontSize: 16
    //
    //
    // }
    // ,
    "d3": {
      "alphaTarget": 0.05,
      "gravity": -100,
      "linkLength": 100,
      "linkStrength": 1,
      "disableLinkForce": false
    },
    link: {
      highlightColor: "lightblue",
      renderLabel: true,
      labelProperty: 'dispLabel'

    },
  };

  const graphRef = useRef()

  useEffect(()=> {
    handlePosChange()
    if (props.newLinks && !graphRef.current.state.d3Links.length) {
      graphRef.current.state.d3Links = props.newLinks
    }
    let links = graphRef.current.state.d3Links
    props.returnLinks(links)
    
  })

  const handlePosChange = () => {
    let nodes = graphRef.current.state.nodes
    let coords = {}
    for (const [key, value] of Object.entries(nodes)) {
      coords[key] = {x: value.x, y: value.y}
    }
    props.returnCoords(coords)
  }

  return <Graph
    ref={graphRef}
    config={myConfig}
    id="d3graph" // id is mandatory, if no id is defined rd3g will throw an error
    data={displayGraph(props)}
    onNodePositionChange={(nodeId, x, y) => {
      handlePosChange()
    }}
    onDoubleClickNode={(nodeId) => {
      props.onNodeClick(nodeId)
    }}
  />
}

const areEqual = (prevProps, nextProps) => {
  return (prevProps.visibleGraph === nextProps.visibleGraph)
    && (prevProps.invisibleGraph === nextProps.invisibleGraph)
    && (prevProps.cardNodeIds === nextProps.cardNodeIds)
}

export default React.memo(MGraph, areEqual);

