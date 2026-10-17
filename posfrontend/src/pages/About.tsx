import {
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  Inventory2Outlined,
  ReceiptLongOutlined,
  BarChartRounded,
  GroupsOutlined,
} from "@mui/icons-material";


const features = [
  {
    icon: ReceiptLongOutlined,
    title: "Everyday sales",
    text: "Create orders, hold unfinished sales, record payments and print receipts.",
  },
  {
    icon: Inventory2Outlined,
    title: "Stock management",
    text: "Organise products, track inventory and sell by units, weight, packs or cartons.",
  },
  {
    icon: BarChartRounded,
    title: "Useful reports",
    text: "Review sales, costs and gross profit to understand how your business is performing.",
  },
  {
    icon: GroupsOutlined,
    title: "Outlets and team access",
    text: "Manage outlets and give administrators, supervisors and staff access suited to their roles.",
  },
];

export default function About() {
    
  return (
    <Box sx={{ p: { xs: 3, sm: 4 },width:"100%", mx: "auto" }}>
      <Typography
        variant="overline"
        sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 2 }}
      >
        ABOUT BUKKOF
      </Typography>

      <Typography
        component="h1"
        variant="h4"
        sx={{ fontWeight: 800, mt: 1, mb: 2 }}
      >
        Make everyday business easier.
      </Typography>

      <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
        Bukkof POS brings sales, inventory and business reports together
        in one place. It helps you keep track of what you sell, what remains
        in stock and how your business is doing.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={3}>
        {features.map(({ icon: Icon, title, text }) => (
          <Stack key={title} direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 3,
                bgcolor: "action.hover",
                color: "primary.main",
              }}
            >
              <Icon />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                {title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                {text}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>

      <Box
        sx={{
          mt: 4,
          p: 2,
          borderRadius: 3,
          bgcolor: "action.hover",
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
          Access Bukkof POS through your browser on a computer, tablet or
          phone. An internet connection is required. Receipt printing
          through QZ Tray requires setup on your printing computer.
        </Typography>
      </Box>

    </Box>
  );
}