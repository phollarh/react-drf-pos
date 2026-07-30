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
import { useNavigate } from "react-router-dom";
import { Box, Button,Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from "@mui/material/styles";
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';


export default function SideMenuAccordionProduct({open}: { open: boolean }) {
  const navigate = useNavigate();
  const below600 = useMediaQuery("(max-width:750px)")
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === "dark"
  
  const [expanded, setExpanded] = React.useState(false);

  const handleExpansion = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const handleClicCat = () => {
      navigate("/categories")
  }

  const handleClicMea = () => {
      navigate("/measurements")
  }

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
              
              backgroundColor: isDarkMode?"none":theme.palette.primary.light,
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
              Tools
            </Typography>
          </Box>
          
          
        </AccordionSummary>
        <AccordionDetails sx={{py:0, px:2}} >
          <Accordion disableGutters square sx={{backgroundColor:isDarkMode?"none":theme.palette.primary.light,
            boxShadow:theme.shadows[0],
            }}>
            {/* <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{fontSize:"inherit"}}>Product</Typography>
            </AccordionSummary> */}
            <AccordionDetails 
              sx={{py:0}}
            >
              
                {/* <List 
                sx={{
                  py:0
                  // borderTop:`1px solid ${theme.palette.divider}`
                  }}>
                  {InnerSales.map((sales, index)=>
                      <ListItem
                      key={index}
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
                                      fontSize:'0.8em',
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
                                    
                              
                                        
                  </List> */}
                
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters square sx={{backgroundColor:isDarkMode?"none":theme.palette.primary.light,border:'none', 
            boxShadow:theme.shadows[0],
            "&:before": {
             display: "none",
            },
            }}>
            <AccordionDetails>
              <Button variant='text'
              onClick={handleClicCat}
              sx={{
                
                padding:0,
                textTransform:"none",
                fontFamily:'sans-serif',
                fontSize:below600?"0.8em":'0.9em',
                fontWeight:400,
                lineHeight:1.2,
                textOverflow:"hidden",
                whiteSpace:"nowrap",
                color:theme.palette.primary.dark
              }}
              >Categories</Button>
            </AccordionDetails>
     
          </Accordion>

          <Accordion disableGutters square sx={{backgroundColor:isDarkMode?"none":theme.palette.primary.light,border:'none', 
            boxShadow:theme.shadows[0],
            "&:before": {
             display: "none",
            },
            }}>   
            <AccordionDetails>
              <Button variant='text'
              onClick={handleClicMea}
              sx={{
                padding:0,
                textTransform:"none",
                fontFamily:'sans-serif',
                fontSize:below600?"0.8em":'0.9em',
                fontWeight:400,
                lineHeight:1.2,
                textOverflow:"hidden",
                whiteSpace:"nowrap",
                color:theme.palette.primary.dark
              }}
              >Measurements</Button>
            </AccordionDetails>
          </Accordion>
        </AccordionDetails>
      </Accordion>

      
    </div>
  );
}
