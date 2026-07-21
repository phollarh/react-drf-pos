import { createTheme, responsiveFontSizes } from "@mui/material"


declare module "@mui/material/styles"{
    interface Theme {
        primaryAppBar : {
            height:number;
        };
         primaryDraw: {
            width: number;
            closed: number;
        };
         SecondaryDraw: {
            width?: number;

        };
        MainDrawWidth: {
            width:number
        },
    }
    interface ThemeOptions {
        primaryAppBar?: {
            height?:number
        };
         primaryDraw: {
            width?: number;
            closed?: number;
        };
        SecondaryDraw: {
            width?: number;

        };
        MainDrawWidth: {
            width:number
        },
         
    }

}

export const createMuiTheme = (mode: "light"| "dark") =>{
    let theme = createTheme({
    primaryAppBar:{
        height:80,
    },
    primaryDraw: {
            width: 270,
            closed: 60,
        },
    MainDrawWidth: {
            width: 400
        },
    SecondaryDraw: {
            width: 300
        },
    typography:{
        fontFamily:["IBM Plex Sans", "san-serif"].join(","),
    },
    palette: {
        mode,
           primary:{
            main:'#616161',
            light:'#f5f5f5'
           }
    },
        
    components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        boxShadow: "none", // Ensures no shadow is shown
                        backgroundColor: "transparent"
                    },
                },
                defaultProps: {
                    elevation: 0,
                }
            }
        }


    });
    theme = responsiveFontSizes(theme);
    return theme
   
}

export default createMuiTheme;