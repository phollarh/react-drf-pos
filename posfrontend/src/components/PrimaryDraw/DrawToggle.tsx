import { ChevronLeft, ChevronRight } from "@mui/icons-material"
import { Box, IconButton } from "@mui/material"
type Props = {
    open: boolean,
    handleDrawOpen: () => void
    handleDrawClosed: () => void
}
const DrawToggle: React.FC<Props> = ({ open, handleDrawOpen, handleDrawClosed }) => {
    return (
        <Box sx={{
            // mt:2,
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <IconButton sx={{mt:5}} onClick={open ? handleDrawClosed : handleDrawOpen}>
                {open ? <ChevronLeft sx={{fontSize:'30px'}} /> : <ChevronRight sx={{fontSize:'30px'}} />}
            </IconButton>
        </Box>
    )
}
export default DrawToggle