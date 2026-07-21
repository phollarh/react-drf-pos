import { Box, Container, useMediaQuery } from "@mui/material";
import frontPageImage from "../../assets/frontPageImage.png"
import frontpageMobileView from "../../assets/frontpageMobileView.png"

export default function POSWelcomePage() {
    const below800 = useMediaQuery("(max-width: 800px)")
  return (
    <>
    {below800?
    (
         <Box component="img"
    sx={{    width: "100%",
    height: "100%",
    }}
     src={frontpageMobileView} alt="home image"/>
    ):
    (
        <Box component="img"
    sx={{    width: "100%",
    height: "100%",
    }}
     src={frontPageImage} alt="home image"/>

    )
    }
    </>
    

    
    
      );
}
