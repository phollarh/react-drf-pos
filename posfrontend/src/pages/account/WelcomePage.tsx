import {  useState } from "react";
import { Box, ButtonBase, Chip, Typography } from "@mui/material";
import {
  ShoppingCartOutlined,
  Inventory2Outlined,
  BarChartRounded,
  PeopleOutlineRounded,
  PaymentsOutlined,
  DevicesRounded,
  StorefrontOutlined,
  CheckCircleRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import About from "../AboutPOS";


const blue = "#0648ed";
const navy = "#071d42";

const features = [
  {
    title: "Seamless checkout",
    description: "Quick billing with multiple payment options.",
    detail: "Keep the queue moving.",
    subtitle: "Create orders, review totals and issue receipts.",
    icon: ShoppingCartOutlined,
    metricLabel: "Sales today",
    metric: "$128,400",
    rows: [
      ["Rice · 2 packs", "$120"],
      ["Cooking oil · 1 bottle", "$4"],
      ["Bread · 3 loaves", "$3"],
    ],
    totalLabel: "Receipt total",
    total: "$27",
  },
  {
    title: "Inventory control",
    description: "Keep track of stock and spot low quantities.",
    detail: "Know what is on your shelves.",
    subtitle: "View available quantities before your next sale.",
    icon: Inventory2Outlined,
    metricLabel: "Products in stock",
    metric: "248",
    rows: [
      ["Rice", "42 packs"],
      ["Cooking oil", "18 bottles"],
      ["Bread", "6 loaves"],
    ],
    totalLabel: "Stock overview",
    total: "3 products shown",
  },
  {
    title: "Powerful reports",
    description: "Understand sales, costs and product performance.",
    detail: "See how your business is doing.",
    subtitle: "Turn daily transactions into useful sales summaries.",
    icon: BarChartRounded,
    metricLabel: "Sales this week",
    metric: "₦4,000",
    rows: [
      ["Gross sales", "$4,000"],
      ["Cost of sales", "$1048"],
      ["Gross profit", "$2852"],
    ],
    totalLabel: "Reporting period",
    total: "This week",
  },
  {
    title: "Team access",
    description: "Separate admin, supervisor and staff access.",
    detail: "Give your team the right access.",
    subtitle: "Keep responsibilities clear across your outlets.",
    icon: PeopleOutlineRounded,
    metricLabel: "Team members",
    metric: "8",
    rows: [
      ["Admin", "Business oversight"],
      ["Supervisor", "Outlet management"],
      ["Staff", "Daily sales"],
    ],
    totalLabel: "Access control",
    total: "By role",
  },
  {
    title: "Multiple payments",
    description: "Record cash, card and transfer payments.",
    detail: "Make every payment count.",
    subtitle: "Keep payment methods organised alongside your sales.",
    icon: PaymentsOutlined,
    metricLabel: "Payments today",
    metric: "$18,400",
    rows: [
      ["Cash", "$,000"],
      ["Card", "$7,400"],
      ["Transfer", "$6,000"],
    ],
    totalLabel: "Payment methods",
    total: "Cash · Card · Transfer",
  },
  {
    title: "Access anywhere",
    description: "Use your browser on desktop, tablet or mobile.",
    detail: "Your business, wherever you are.",
    subtitle: "Open your account from a connected device.",
    icon: DevicesRounded,
    metricLabel: "One account",
    metric: "Your business",
    rows: [
      ["Desktop", "At your counter"],
      ["Tablet", "Around your shop"],
      ["Mobile", "On the go"],
    ],
    totalLabel: "Browser access",
    total: "Internet connection required",
  },
];

interface aboutProps{
  aboutRef: React.RefObject<HTMLDivElement>
}

export default function WelcomePage(aboutref:aboutProps) {
  const [selected, setSelected] = useState(0);
  const active = features[selected];
  const ActiveIcon = active.icon;

  return (
    <Box
      component="section"
      aria-label="Welcome to Bukkof POS"
      sx={{
        width: "100%",
    height: "auto",
minHeight: "100%",
overflow: "auto",
        overflowX: "hidden",
        color: navy,
        background:
          "radial-gradient(ellipse at 90% 15%, #ffe5bc 0%, transparent 48%), " +
          "linear-gradient(135deg, #f8faff 0%, #fffdf7 65%, #edf3ff 100%)",
        fontFamily: '"Inter", "Roboto", Arial, sans-serif',
        "& .MuiTypography-root": {
          fontFamily: "inherit",
        },
      }}
    >
      <Box
        sx={{
          minHeight: "100%",
          p: { xs: 2.5, sm: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        
        <Box
          sx={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            alignItems: "center",
            gap: 4,
            "@media (min-width: 1200px)": {
              gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
            },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 24, sm: 30 },
                fontStyle: "italic",
                fontWeight: 600,
                mb: 1,
              }}
            >
              Welcome to
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 42, sm: 56 },
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-2px",
              }}
            >
              <Box component="span" sx={{ color: blue }}>
                BUKKOF
              </Box>
              <br />
              POS SYSTEM
            </Typography>

            <Typography
              sx={{
                mt: 2,
                color: blue,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Smart POS. Smooth Sales. Stronger Business.
            </Typography>

            <Box
              sx={{
                width: 42,
                height: 4,
                bgcolor: "#f6b734",
                borderRadius: 2,
                my: 2,
              }}
            />

            <Typography sx={{ maxWidth: 400, lineHeight: 1.7, fontSize: 15 }}>
              Everything you need to run your business efficiently,
              from sales and inventory to reports and team management.
            </Typography>

            <Box sx={{ display: "grid", gap: 1, mt: 3 }}>
              {features.slice(0, 4).map((feature, index) => {
                const Icon = feature.icon;
                const isSelected = selected === index;

                return (
                  <ButtonBase
                    key={feature.title}
                    onClick={() => setSelected(index)}
                    aria-pressed={isSelected}
                    sx={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      gap: 1.5,
                      p: 1,
                      borderRadius: 3,
                      bgcolor: isSelected ? "#e9efff" : "transparent",
                      transition: "background-color 180ms ease",
                      "&:hover": { bgcolor: "#e9efff" },
                      "&.Mui-focusVisible": {
                        outline: `2px solid ${blue}`,
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "50%",
                        bgcolor: blue,
                        color: "#fff",
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                        {feature.title.toUpperCase()}
                      </Typography>
                      <Typography sx={{ fontSize: 12, mt: 0.3 }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Chip
                icon={<StorefrontOutlined />}
                label="Built for everyday business"
                sx={{ bgcolor: "#fff", color: navy }}
              />
              <Chip
                label="Interactive preview"
                size="small"
                sx={{ alignSelf: "center", bgcolor: "#e8eeff", color: blue }}
              />
            </Box>

            
            <Box
              sx={{
                p: { xs: 0.8, sm: 1.2 },
                bgcolor: navy,
                borderRadius: 4,
                boxShadow: "0 24px 60px rgba(7, 29, 66, 0.2)",
              }}
            >
              <Box
                sx={{
                  bgcolor: "#f3f6fc",
                  borderRadius: 2.5,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: "#fff",
                    borderBottom: "1px solid #e3e9f3",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ fontWeight: 900, color: blue }}>
                    BUKKOF
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#59677c" }}>
                    DEMO DASHBOARD
                  </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 2.5 } }} aria-live="polite">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: blue,
                      mb: 1,
                    }}
                  >
                    <ActiveIcon />
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                      {active.title}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontWeight: 800, fontSize: 21 }}>
                    {active.detail}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#59677c",
                      mt: 0.8,
                      minHeight: 40,
                    }}
                  >
                    {active.subtitle}
                  </Typography>

                  <Box
                    sx={{
                      p: 2,
                      my: 2,
                      borderRadius: 2.5,
                      bgcolor: "#fff",
                      border: "1px solid #e4eaf4",
                    }}
                  >
                    <Typography sx={{ fontSize: 12, color: "#59677c" }}>
                      {active.metricLabel}
                    </Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 0.5 }}>
                      {active.metric}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: "#59677c", mt: 0.5 }}>
                      Sample data for illustration
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "#fff",
                      borderRadius: 2.5,
                      px: 2,
                      border: "1px solid #e4eaf4",
                    }}
                  >
                    {active.rows.map(([label, value], index) => (
                      <Box
                        key={label}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          py: 1.5,
                          borderBottom:
                            index < active.rows.length - 1
                              ? "1px solid #edf0f6"
                              : "none",
                        }}
                      >
                        <Typography sx={{ fontSize: 12 }}>{label}</Typography>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            textAlign: "right",
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: blue,
                      color: "#fff",
                      borderRadius: 2.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 11, opacity: 0.85 }}>
                      {active.totalLabel}
                    </Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, mt: 0.5 }}>
                      {active.total}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography
                sx={{
                  textAlign: "center",
                  color: "#fff",
                  fontSize: 11,
                  letterSpacing: 3,
                  pt: 1,
                  pb: 0.3,
                  fontWeight: 800,
                }}
              >
                BUKKOF
              </Typography>
            </Box>

            {/* Monitor stand */}
            <Box
              sx={{
                width: 60,
                height: 25,
                mx: "auto",
                background: "linear-gradient(90deg, #102a52, #254571, #102a52)",
              }}
            />
            <Box
              sx={{
                width: "44%",
                height: 9,
                mx: "auto",
                bgcolor: navy,
                borderRadius: "8px 8px 3px 3px",
              }}
            />
          </Box>
        </Box>
        {/* about pos  */}
        <Box ref={aboutref.aboutRef}>
              <About/>
        </Box>
        {/* Feature cards */}
        <Box>
          <Typography
            sx={{ fontSize: 12, color: "#59677c", mb: 1.5, textAlign: "center" }}
          >
            Select a feature to explore
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1,
              "@media (min-width: 1500px)": {
                gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              },
            }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isSelected = selected === index;

              return (
                <ButtonBase
                  key={feature.title}
                  onClick={() => setSelected(index)}
                  aria-pressed={isSelected}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    gap: 1,
                    textAlign: "center",
                    bgcolor: isSelected ? "#edf2ff" : "#ffffffd9",
                    border: "1px solid",
                    borderColor: isSelected ? blue : "#e5e9f0",
                    transition: "background-color 180ms ease, border-color 180ms ease",
                    "&:hover": { bgcolor: "#edf2ff", borderColor: blue },
                    "&.Mui-focusVisible": {
                      outline: `2px solid ${blue}`,
                      outlineOffset: 3,
                    },
                  }}
                >
                  <Icon sx={{ color: blue, fontSize: 30 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ fontSize: 11, lineHeight: 1.5 }}>
                    {feature.description}
                  </Typography>
                  <ArrowForwardRounded
                    sx={{ color: blue, fontSize: 17, mt: "auto" }}
                  />
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        {/* Bottom brand strip */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderRadius: 3,
            bgcolor: navy,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
            <ShoppingCartOutlined />
            <Typography sx={{ fontWeight: 800, color: "#ffbd38", fontSize: 15 }}>
              BUKKOF POS SYSTEM
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleRounded sx={{ fontSize: 17, color: "#ffbd38" }} />
            <Typography sx={{ fontSize: 12 }}>
              Sales. Stock. Reports. One place.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}