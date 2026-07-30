import * as React from 'react';
import Accordion, {
  AccordionSlots,
  accordionClasses,
} from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails, {
  accordionDetailsClasses,
} from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Fade from '@mui/material/Fade';
import { Link } from "react-router-dom";
import { Box, List, ListItem, ListItemButton, ListItemText, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from "@mui/material/styles";
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';


export default function SideMenuAccordion({open}: { open: boolean }) {

  const InnerSales = [
  { label: 'Past Receipt',link:"past_receipts" },
  { label: 'Sales Summary',link:"sales_summary" },
  
];
  const theme = useTheme()
  const [expanded, setExpanded] = React.useState(false);
  const isDarkMode = theme.palette.mode === "dark"
  const below600 = useMediaQuery("(max-width:750px)")

  const handleExpansion = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  return (
    <div>
      <Accordion
        disableGutters
        expanded={expanded}
        onChange={handleExpansion}
        slots={{ transition: Fade as AccordionSlots['transition'] }}
        slotProps={{ transition: { timeout: 400 } }}
        sx={
          
          [
            
          expanded
            ? {
              
              backgroundColor:isDarkMode?"none":theme.palette.primary.light,
              boxShadow: `${theme.shadows[0]}`,
              m:0,
                [`& .${accordionClasses.region}`]: {
                  height: 'auto',
                },
                [`& .${accordionDetailsClasses.root}`]: {
                  display: 'block',
                },
              }
            : {
              backgroundColor:isDarkMode?"none":theme.palette.primary.light,
              boxShadow:`${theme.shadows[0]}`,
                [`& .${accordionClasses.region}`]: {
                  height: 0,
                },
                [`& .${accordionDetailsClasses.root}`]: {
                  display: 'none',
                },
              },
        ]}
      >
        <AccordionSummary
          sx={{
            minHeight:32,
            "& .MuiAccordionSummary-content": {my: 0 }

          }}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Box sx={{display:"flex", justifyContent:'center'}}>
            <Tooltip title="expand sales" placement="right-start">
              <Box sx={{ml:open?1:11}}>
               {React.cloneElement(<PointOfSaleIcon/>, {fontSize:!open?'large':'small'})} 
            </Box>
            </Tooltip>
            
            
            <Typography variant='body1' sx={{fontSize:below600?"1em":'1.2em',ml:1.2, fontFamily:'sans-serif'}}>
              Sales
            </Typography>
          </Box>
          
          
        </AccordionSummary>
        <AccordionDetails sx={{py:0, px:2}} >
          <Accordion disableGutters square sx={{backgroundColor:isDarkMode?"none":theme.palette.primary.light,
            boxShadow:theme.shadows[0],
            }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontSize="inherit">Manage Sales</Typography>
            </AccordionSummary>
            <AccordionDetails 
              sx={{py:0}}
            >
              
                <List 
                sx={{
                  py:0
                  // borderTop:`1px solid ${theme.palette.divider}`
                  }}>
                  {InnerSales.map((sales)=>
                      <ListItem
                      key={sales.label}
                        disablePadding
                        sx={{ display: "block"}}
                        dense={true}
                      >
                                        
                        <Link to={`/${sales.link}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                            >
                        <ListItemButton
                          sx={{minHeight:0}}
                                            
                          >

                          <ListItemText
                              primary={
                              <Typography
                                variant="body1"
                                sx={{
                                      fontFamily:'sans-serif',
                                      fontSize:below600?"0.8em":'0.9em',
                                      fontWeight:300,
                                      lineHeight:1.2,
                                      textOverflow:"hidden",
                                      whiteSpace:"nowrap"
                                  }}
                                  >
                                  {sales.label}
                                  </Typography>
                                  }
                                  />
                                    </ListItemButton>
                        </Link>
                
                      </ListItem>
                    
                  
                  )}
                                    
                              
                                        
                  </List>
                
            </AccordionDetails>
          </Accordion>

        </AccordionDetails>
      </Accordion>
    </div>
  );
}
