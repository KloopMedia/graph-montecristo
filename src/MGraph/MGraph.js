import React, { useState, useEffect } from "react";
import {Graph} from "react-d3-graph";
import Card from '../Cards/Card';
import CardConfig from '../config';
import translate from '../Cards/utils/translate';
import shorten from '../Cards/utils/shorten';
import { relationshipConfig } from '../config';

const displayGraph = (props) => {
  const dispGraph = {
    nodes: Object.values(props.visibleGraph.toJS().nodes),
    links: Object.values(props.visibleGraph.toJS().edges),
  }

  let cardNodeIds = props.cardNodeIds.toJS()
  //console.log('mgraph card nodes: ', cardNodeIds)
  dispGraph.nodes = dispGraph.nodes.map((node) => {
    console.log("NODE", node)

    // if node.id is in array, apply viewGenerator

    if (cardNodeIds.includes(node.id)) { 
     node.size = 4000;
     node.dispLabel = " "
     node.viewGenerator = (n) => {
      return <Card 
                node={n}
                vGraph={props.visibleGraph} 
                iGraph={props.invisibleGraph} 
                onButtonClick={props.onButtonClick}
                onMinimizeClick={props.onMinimizeClick} />
    }} else { // else return SVG icon 
      node.svg = CardConfig[node.labels[0]].svg
      node.size = 600
      node.fontSize = 16
      node.dispLabel = shorten(node.properties[CardConfig[node.labels[0]].contentTextParam])
    }

    return node
   })


   dispGraph.links = dispGraph.links.map((clearLink) => {

    const link = {...clearLink, ...relationshipConfig[clearLink.type].linkConf }

      // if PARTICIPATED_IN.properties not empty
     if (relationshipConfig[link.type].properties.length !== 0) {
        
        relationshipConfig[link.type].result.forEach(conf => {
          // if node.result in value AND regex=true
          if (conf.value.toLowerCase().includes(link.properties.result.substring(0,7).toLowerCase()) && conf.regex) {
            link.color = conf.color
          }
          else {
            console.log("LINK NOT RED")
          }});

        let label = ''
        for ( let value of Object.values((relationshipConfig[link.type].properties))) { // for [proposed_price, result]
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

const MGraph = (props) => {

  const [windowHeight, setWindowHeight] = useState(window.innerHeight - 110);

  useEffect(() => {
    function handleResize() {
      setWindowHeight(window.innerHeight - 110);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const myConfig = {
    height: windowHeight,
    // width:'100%',
    //height: 1000,
    //width: 1000,
    // staticGraphWithDragAndDrop: true,
    // nodeHighlightBehavior: true,
    node: {
      labelProperty: "dispLabel"
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

  return <Graph
    config={myConfig}
    id="d3graph" // id is mandatory, if no id is defined rd3g will throw an error
    data={displayGraph(props)}
    onDoubleClickNode ={(nodeId) => {props.onNodeClick(nodeId)}}
  />
}

const areEqual = (prevProps, nextProps) => {
  return (prevProps.visibleGraph === nextProps.visibleGraph) 
          && (prevProps.invisibleGraph === nextProps.invisibleGraph)
          && (prevProps.cardNodeIds === nextProps.cardNodeIds)
}

export default React.memo(MGraph, areEqual);

