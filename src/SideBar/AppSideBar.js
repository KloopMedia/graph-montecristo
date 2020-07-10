import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import LoopIcon from '@material-ui/icons/Loop';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Tooltip from '@material-ui/core/Tooltip'

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    color: 'gray',
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  searchBar: {
    width: '600px', 
    paddingLeft: 13, 
    paddingRight: 13,
    border: '2px solid gray', 
    borderRadius: 25,
  },
}));

export default function PersistentDrawerLeft(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <TextField
          style={{color: 'grey'}}
          className={classes.searchBar}
          value={props.searchText}
          onChange={props.handleSearchTextChange}
          placeholder="Поиск..."
          onKeyPress = {(event) => {
            if (event.key === 'Enter') {
              props.handleGoClick();
            }
          }}
          InputProps={{
            disableUnderline: true,
            inputProps: {
              'aria-label': "Search"
            }
          }}
        />
        <Tooltip title="Поиск">
          <IconButton aria-label="search" onClick={props.handleGoClick}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
        {/* <Tooltip title="Обновить">
          <IconButton aria-label="reset" onClick={props.handleResetClick}>
            <LoopIcon />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="Очистить">
          <IconButton aria-label="clear" onClick={props.handleClearClick}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
        {['Введите запрос:'].map((text, index) => (
          <ListItem key={text}>
            <ListItemText primary={text} />
          </ListItem>
          
        ))}
      </List>
      <List>
          <TextField
           id="query"
           label="Запрос"
           variant="outlined" 
           multiline
           value={props.cypherQuery}
           onChange={props.handleCypherQueryTextChange} />
      </List>
      <List>
        <Button variant="contained"
                className={classes.GoButton}
                onClick={props.handleGoClick}
                startIcon={<PlayArrowIcon />}>Поиск</Button>
      </List>
      <List>
          <TextField
           id="coords"
           label="Координаты"
           variant="outlined" 
           multiline
           value={JSON.stringify(props.nodeCoords)}/>
      </List>
      <List>
      <TextField
           id="links"
           label="Связи"
           variant="outlined" 
           multiline
           value={JSON.stringify(props.nodeLinks)}/>
      </List>
      </Drawer>
      <main style={{padding: 0, height: '100%'}}
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        {props.children}
      </main>
    </div>
  );
}
