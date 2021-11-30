import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Routenplaner from '../Routenplaner';

var QRCode = require('qrcode.react');

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Credit Card+" {...a11yProps(0)} />
          <Tab label="Routenplaner+" {...a11yProps(1)} />
          <Tab label="Verification" {...a11yProps(2)} />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>     
        <h3>Ausgabe des Credit Card Credentials:</h3>
        <spacing/>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" class="MasterCard" alt="Logo"/>
        <spacing/>
        <p></p>
        <QRCode type="QR-Code" className="image3" value={'http://192.168.2.152:5229/getInvitation?start=Hamburg-Hbf&dest=KoelnBonn-Airport&time=14:41'}/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Routenplaner></Routenplaner>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <h3>Verification des Reisetickets:</h3>
        <img src="https://media.istockphoto.com/vectors/train-conductor-simple-icon-vector-id1136921793?k=20&amp;m=1136921793&amp;s=612x612&amp;w=0&amp;h=x-m1Gv8G6Rb6x5Y3n7WiEF1xvyARVXQFZedvaMMjxvI=" class="schaffner" alt="Schaffner - Illustrationen und Vektorgrafiken - iStock"/>
        <p></p>
        <QRCode type="QR-Code" className="image2" value={'http://192.168.2.152:6229/getInvitation?start=Hamburg-Hbf&dest=KoelnBonn-Airport&time=14:41'}/>
      </TabPanel>
    </Box>
  );
}
