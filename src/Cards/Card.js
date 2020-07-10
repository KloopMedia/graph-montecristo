import React, { useRef, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';

import MinimizeIcon from '@material-ui/icons/Minimize';
import Divider from '@material-ui/core/Divider'

import NestedLinks from './NestedLinks'
import NestedProperties from './NestedProperties'
import cardConfig from '../config'

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 240,
      textAlign: "left",
      height : "auto"
    },
    media: {
      height: 0,
      // paddingTop: '56.25%', // 16:9
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    avatar: {
      backgroundColor: red[500],
    },
    cardContent: {
      paddingTop: 0,
      paddingBottom: 0,
      "&:last-child": {
        paddingBottom: 7
      }
    },
  }));

  const RecipeReviewCard = (props) => {

  const cardRef = useRef();
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  props.getDimensions(dimensions.height, props.node.id)

  useEffect(() => {
    if (cardRef.current) {
      setDimensions({
        width: cardRef.current.offsetWidth * 10,
        height: cardRef.current.offsetHeight * 10 + 20
      });
    }
  }, []);
    
    const classes = useStyles();

    let style = {}
    let avatar = ''
    let subheader = ''
    if (Object.keys(cardConfig).includes(props.node.labels[0])) {
      const label = props.node.labels[0]
      style = cardConfig[label].style 
      avatar = cardConfig[label].icon 
      subheader =
        <a 
          href={props.node.properties[cardConfig[label].subHeaderUrlParam]} 
          target="_blank">{cardConfig[label].subHeaderText}
        </a>
    }
    return (
      <Card className={classes.root} ref={cardRef}>
        <CardHeader
          avatar={
            <Avatar aria-label="recipe" className={classes.avatar} style={style}>
              {avatar}
            </Avatar>
          }
          action={
            <IconButton aria-label="settings" onClick={() => props.onMinimizeClick(props.node.id)}>
              <MinimizeIcon />
            </IconButton>
          }
          subheader={<Typography>{subheader}</Typography>} 
        />
        <CardContent classes={{root: classes.cardContent}} >
          <NestedProperties node={props.node}/>
          <Divider style={{marginTop: 8}} />
          <NestedLinks
            node={props.node}
            vGraph={props.vGraph}
            iGraph={props.iGraph}
            onButtonClick={props.onButtonClick}  />
        </CardContent>
      </Card>
    );
  }
  
  const areEqual = (prevProps, nextProps) => {
    return ((prevProps.vGraph === nextProps.vGraph) && 
            (prevProps.iGraph === nextProps.iGraph)); //&&
            //(prevProps.node === nextProps.node));
  }
  
  export default React.memo(RecipeReviewCard, areEqual);