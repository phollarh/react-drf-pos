import React, { useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Chip,
    Container,
    Divider,
    Grid,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import LockClockOutlinedIcon from "@mui/icons-material/LockClockOutlined";

type GuideItem = {
    title: string;
    description: string;
    steps?: string[];
    note?: string;
};

type GuideSection = {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    items: GuideItem[];
};

const MainUserGuide = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const below800 = useMediaQuery("(max-width:800px)");

    const [searchValue, setSearchValue] = useState("");
    const [expanded, setExpanded] = useState<string | false>("getting-started");

    const sections: GuideSection[] = [
        {
            id: "getting-started",
            title: "Getting Started",
            description: "Set up BUKKOF POS and prepare your outlet for everyday use.",
            icon: <RocketLaunchOutlinedIcon />,
            items: [
                {
                    title: "Create your account",
                    description:
                        "Register your business account and sign in to begin setting up the POS.",
                    steps: [
                        "Create your account using the registration page.",
                        "Sign in with your account credentials.",
                        "Complete the initial outlet setup.",
                        "Add the products and staff needed for your outlet.",
                        "Authorize a POS session as an administrator, supervisor or staff member.",
                    ],
                },
                {
                    title: "Set up an outlet",
                    description:
                        "An outlet represents the business location currently being operated on the POS.",
                    steps: [
                        "Create or select your outlet.",
                        "Activate the outlet on the current computer.",
                        "Confirm that products and staff shown belong to the correct outlet.",
                    ],
                    note:
                        "Products, sales, inventory and staff activity are associated with the active outlet.",
                },
                {
                    title: "Recommended first setup",
                    description:
                        "Complete these tasks before beginning normal sales operations.",
                    steps: [
                        "Activate your outlet.",
                        "Add your products.",
                        "Enter product selling and cost prices.",
                        "Add staff members.",
                        "Confirm inventory quantities.",
                        "Confirm your receipt printer setup.",
                        "Start the appropriate POS authorization session before beginning work.",
                    ],
                },
            ],
        },

        {
            id: "outlet",
            title: "Outlet Management",
            description: "Understand how the active outlet controls the POS environment.",
            icon: <StorefrontOutlinedIcon />,
            items: [
                {
                    title: "What is an outlet?",
                    description:
                        "An outlet is the business location currently being managed by the POS.",
                },
                {
                    title: "Active outlet",
                    description:
                        "The active outlet determines which products, staff, sales and inventory records are used on the current computer.",
                },
                {
                    title: "Changing outlet",
                    description:
                        "Only change the active outlet when the computer is being used for another business location.",
                    note:
                        "Always confirm the active outlet before performing important operations.",
                },
            ],
        },

        {
            id: "authorization-session",
            title: "POS Authorization & Sessions",
            description:
                "Choose who is using the POS, apply the correct access level and safely end a temporary session.",
            icon: <LockClockOutlinedIcon />,
            items: [
                {
                    title: "Account sign-in and POS authorization",
                    description:
                        "Signing into the business account and authorizing a POS user are two different steps. Account sign-in identifies the business owner account, while POS authorization identifies the administrator, supervisor or staff member currently using the application.",
                    note:
                        "A signed-in business account must still authorize a POS session before protected POS pages and operations can be used.",
                },
                {
                    title: "Starting a POS session",
                    description:
                        "Use the authorization page to choose the person and role that will operate the POS.",
                    steps: [
                        "Confirm that the correct outlet is active.",
                        "Choose Admin, Supervisor or Staff under Use POS As.",
                        "Select the outlet when it is not already selected.",
                        "Select the correct staff member when using the POS as a supervisor or staff member.",
                        "Enter the administrator password or the selected staff member's PIN.",
                        "Select Authorize and Continue.",
                    ],
                },
                {
                    title: "Administrator session",
                    description:
                        "An administrator session uses the business account password and provides access to administrative and operational areas allowed by the system.",
                    note:
                        "Do not share the administrator password with normal sales staff.",
                },
                {
                    title: "Supervisor session",
                    description:
                        "A supervisor must select their own staff record and enter their own PIN. Supervisor access is limited to the outlet and permissions associated with that supervisor.",
                    note:
                        "Another supervisor's PIN must not be used to authorize the person currently operating the POS.",
                },
                {
                    title: "Staff session",
                    description:
                        "A staff session provides access to normal sales and operational duties. Management pages and sensitive actions remain unavailable unless an administrator or supervisor performs the required authorization.",
                },
                {
                    title: "Session expiry",
                    description:
                        "A POS authorization session is temporary and expires after the configured session period. When it expires, return to the authorization page and identify the next person using the POS.",
                    note:
                        "The active outlet can remain selected after a POS session ends. Ending a POS session does not automatically deactivate the outlet or sign the business account out.",
                },
                {
                    title: "Ending a POS session",
                    description:
                        "Use End Session when another person needs to use the POS or when the current operator is finished.",
                    steps: [
                        "Select End Session from the active-user area.",
                        "The temporary POS authorization is cleared.",
                        "Any remembered authorization for sensitive actions is also cleared.",
                        "The application returns to the authorization page.",
                        "The next user must select their identity and enter their own password or PIN.",
                    ],
                    note:
                        "Ending a POS session is different from completely logging a staff member out of the outlet. Staff login status and temporary POS authorization are tracked separately.",
                },
                {
                    title: "Changing from one user to another",
                    description:
                        "Always end the current session before another administrator, supervisor or staff member begins using the POS.",
                    note:
                        "Starting a new POS session clears remembered sensitive-action authorization from the previous session.",
                },
                {
                    title: "Authorization problems",
                    description:
                        "If authorization is refused, confirm the selected outlet, role, staff record and password or PIN before trying again.",
                    steps: [
                        "Confirm that an outlet is active.",
                        "Confirm that the selected staff member belongs to that outlet.",
                        "Confirm that Supervisor or Staff matches the selected person's actual role.",
                        "Enter the selected person's own PIN, or the account password when authorizing as Admin.",
                        "If the session has expired, return to the authorization page and start a new session.",
                    ],
                },
            ],
        },

        {
            id: "staff",
            title: "Staff & Access",
            description: "Manage staff activity and understand staff assignment.",
            icon: <GroupsOutlinedIcon />,
            items: [
                {
                    title: "Adding staff",
                    description:
                        "Authorized users can add staff members who belong to the active outlet.",
                    steps: [
                        "Open the staff management section.",
                        "Select the option to add a staff member.",
                        "Enter the staff details.",
                        "Complete the required authorization when prompted.",
                    ],
                },
                {
                    title: "Active staff",
                    description:
                        "Multiple staff members can be signed in and active within the same outlet environment, but only the person identified by the current POS authorization session should operate the application.",
                    note:
                        "Being active does not automatically mean a staff member is currently authorized to use the POS or assigned to issue a receipt.",
                },
                {
                    title: "Assigned staff",
                    description:
                        "The assigned staff member is the person currently authorized to perform the relevant sales transaction.",
                    steps: [
                        "Staff signs into the outlet.",
                        "The staff member becomes active.",
                        "The current user starts the correct POS authorization session.",
                        "The appropriate staff member is assigned for the sale.",
                        "The transaction can then be associated with that staff member.",
                    ],
                },
                {
                    title: "Active vs assigned staff",
                    description:
                        "A staff member may be signed in and active without being the staff member currently assigned to issue receipts.",
                    note:
                        "This distinction allows BUKKOF POS to track who is present separately from who performs a transaction.",
                },
            ],
        },

        {
            id: "products",
            title: "Products",
            description: "Create and manage the products sold by your outlet.",
            icon: <Inventory2OutlinedIcon />,
            items: [
                {
                    title: "Adding a product",
                    description:
                        "Authorized users can create products that will be available for sale.",
                    steps: [
                        "Open Products.",
                        "Choose Add Product.",
                        "Enter the product name.",
                        "Enter the selling price.",
                        "Enter the cost price where required.",
                        "Enter the initial inventory quantity.",
                        "Save the product.",
                    ],
                },
                {
                    title: "Product information",
                    description:
                        "A product may contain information such as its name, selling price, cost price, quantity and sales history.",
                },
                {
                    title: "Updating products",
                    description:
                        "Use the product management section to update product details when necessary.",
                    note:
                        "Sensitive product changes may require additional authorization.",
                },
            ],
        },

        {
            id: "inventory",
            title: "Inventory",
            description: "Track stock quantities and review inventory activity.",
            icon: <Inventory2OutlinedIcon />,
            items: [
                {
                    title: "Inventory management",
                    description:
                        "Inventory management helps you keep track of stock available for each product.",
                },
                {
                    title: "Inventory log",
                    description:
                        "The inventory log records stock-related activity instead of only showing the latest quantity.",
                    steps: [
                        "Open a product or inventory summary.",
                        "Review the inventory history.",
                        "Check who performed the action.",
                        "Review the action type.",
                        "Review the affected quantity.",
                        "Check when the action occurred.",
                    ],
                },
                {
                    title: "Inventory summary",
                    description:
                        "The product summary may show inventory history using fields such as Performed By, Action, Quantity and Created At.",
                },
                {
                    title: "Load more inventory history",
                    description:
                        "If more inventory records exist, use the load-more control to retrieve additional history.",
                },
            ],
        },

        {
            id: "sales",
            title: "Sales & Receipts",
            description: "Process customer sales and issue receipts.",
            icon: <PointOfSaleOutlinedIcon />,
            items: [
                {
                    title: "Typical sales flow",
                    description:
                        "A normal sale moves from staff activity to receipt completion.",
                    steps: [
                        "Confirm the correct outlet is active.",
                        "Ensure the staff member is active.",
                        "Assign the appropriate staff member if required.",
                        "Select the customer's products.",
                        "Enter quantities.",
                        "Review the order.",
                        "Complete the transaction.",
                        "Issue or print the receipt.",
                    ],
                },
                {
                    title: "Issued receipt",
                    description:
                        "An issued receipt represents a completed sale recorded by the POS.",
                },
                {
                    title: "Tracking the staff responsible",
                    description:
                        "Sales can be associated with the staff member assigned to the transaction.",
                },
            ],
        },

        {
            id: "sales-analysis",
            title: "Sales Analysis",
            description: "Review product sales, profit and performance.",
            icon: <AssessmentOutlinedIcon />,
            items: [
                {
                    title: "Sales periods",
                    description:
                        "Sales information can be filtered using predefined periods.",
                    steps: [
                        "Today",
                        "Yesterday",
                        "This Week",
                        "This Month",
                        "Last Week",
                        "Last Month",
                        "Custom Date Range",
                    ],
                },
                {
                    title: "Custom date range",
                    description:
                        "Use Custom when you need to analyse sales between dates that do not match the predefined filters.",
                    steps: [
                        "Select Custom.",
                        "Choose the start date.",
                        "Choose the end date.",
                        "Confirm the selection.",
                        "Review the returned sales information.",
                    ],
                },
                {
                    title: "Total sales",
                    description:
                        "Total sales represents the monetary value generated by the selected product or period.",
                },
                {
                    title: "Issued quantity",
                    description:
                        "Quantity sold shows how much of the product was sold during the selected period.",
                },
                {
                    title: "Total profit",
                    description:
                        "Profit represents the amount remaining after considering the recorded product cost.",
                },
                {
                    title: "Sales contribution",
                    description:
                        "Sales contribution helps show how much a product contributes to the broader sales calculation used by the system.",
                },
                {
                    title: "Sales overview chart",
                    description:
                        "The weekly sales overview helps you visually compare sales activity from Monday through Sunday.",
                },
            ],
        },

        {
            id: "notifications",
            title: "Notifications",
            description: "Stay informed about important outlet and system activity.",
            icon: <NotificationsNoneOutlinedIcon />,
            items: [
                {
                    title: "Real-time notifications",
                    description:
                        "BUKKOF POS can receive real-time notifications while the application is running.",
                },
                {
                    title: "General notifications",
                    description:
                        "Some notifications can be available even before a user signs in.",
                },
                {
                    title: "User notifications",
                    description:
                        "After sign-in, notifications specific to the current user can also be delivered.",
                },
                {
                    title: "Notification history",
                    description:
                        "Open Notifications to review available messages and previously received activity.",
                },
            ],
        },

        {
            id: "printing",
            title: "Printing",
            description: "Prepare and use receipt printing.",
            icon: <PrintOutlinedIcon />,
            items: [
                {
                    title: "Receipt printing",
                    description:
                        "BUKKOF POS can communicate with the local printing environment when issuing receipts.",
                },
                {
                    title: "QZ Tray",
                    description:
                        "The application uses QZ Tray as part of the local printer communication setup.",
                    steps: [
                        "Ensure QZ Tray is installed and running.",
                        "Confirm the correct printer is available.",
                        "Complete a test transaction where appropriate.",
                        "Confirm that the receipt prints correctly.",
                    ],
                },
                {
                    title: "Receipt paper size",
                    description:
                        "Select the paper width that matches the thermal printer used by the active outlet.",
                    steps: [
                        "Choose 58 mm for a small thermal receipt printer.",
                        "Choose 80 mm for a standard supermarket receipt printer.",
                        "Save the printer setting for the active outlet.",
                        "Print a test receipt and confirm that no text is cut off.",
                    ],
                    note:
                        "Printer settings belong to the selected outlet and may be different for another outlet.",
                },
            ],
        },

        {
            id: "security",
            title: "Security & Permissions",
            description: "Understand protected actions and access levels.",
            icon: <SecurityOutlinedIcon />,
            items: [
                {
                    title: "Protected actions",
                    description:
                        "Sensitive actions may require additional password authorization.",
                    steps: [
                        "Adding or updating staff.",
                        "Adding or modifying products.",
                        "Performing other restricted management operations.",
                    ],
                },
                {
                    title: "Remembered authorization",
                    description:
                        "When the remember option is selected, successful administrator or supervisor authorization may remain available for up to 15 minutes so repeated sensitive actions do not require the password or PIN every time.",
                    note:
                        "Remembered authorization is cleared when the POS session is ended or a new POS session is activated.",
                },
                {
                    title: "Administrative access",
                    description:
                        "Administrative users may have access to business-sensitive areas such as product management, staff management, profit and sales analysis.",
                },
                {
                    title: "Sales staff access",
                    description:
                        "Normal sales staff should primarily have access to the tools needed to perform sales and operational duties.",
                },
            ],
        },

        {
            id: "daily-workflow",
            title: "Daily Workflow",
            description: "A simple sequence for operating BUKKOF POS each day.",
            icon: <TimelineOutlinedIcon />,
            items: [
                {
                    title: "Opening the POS",
                    description:
                        "Use this sequence when preparing the outlet for the day.",
                    steps: [
                        "Open BUKKOF POS.",
                        "Confirm or activate the correct outlet.",
                        "Confirm staff availability.",
                        "Authorize the administrator, supervisor or staff member who will use the POS.",
                        "Confirm product and inventory information.",
                        "Confirm the printer is available.",
                        "Begin sales operations.",
                    ],
                },
                {
                    title: "During the day",
                    description:
                        "Continue processing sales while monitoring inventory and notifications. End the current POS session before another person takes over the terminal.",
                },
                {
                    title: "Management review",
                    description:
                        "Authorized users can review sales, product performance, profit and inventory activity.",
                },
            ],
        },

        {
            id: "roles",
            title: "User Responsibilities",
            description: "Understand the typical responsibilities of each type of user.",
            icon: <PersonOutlineIcon />,
            items: [
                {
                    title: "Owner / Administrator",
                    description:
                        "Responsible for outlet configuration, staff management, product management, inventory oversight and business analysis.",
                },
                {
                    title: "Supervisor",
                    description:
                        "May supervise staff, inventory activity and day-to-day outlet operations depending on permissions.",
                },
                {
                    title: "Sales staff",
                    description:
                        "Primarily responsible for customer transactions, receipt issuing and normal POS operations.",
                },
            ],
        },
    ];

    const filteredSections = useMemo(() => {
        const search = searchValue.trim().toLowerCase();

        if (!search) {
            return sections;
        }

        return sections
            .map((section) => {
                const sectionMatches =
                    section.title.toLowerCase().includes(search) ||
                    section.description.toLowerCase().includes(search);

                const matchingItems = section.items.filter((item) => {
                    return (
                        item.title.toLowerCase().includes(search) ||
                        item.description.toLowerCase().includes(search) ||
                        item.note?.toLowerCase().includes(search) ||
                        item.steps?.some((step) =>
                            step.toLowerCase().includes(search)
                        )
                    );
                });

                if (sectionMatches) {
                    return section;
                }

                if (matchingItems.length > 0) {
                    return {
                        ...section,
                        items: matchingItems,
                    };
                }

                return null;
            })
            .filter(Boolean) as GuideSection[];
    }, [searchValue]);

    const scrollToSection = (id: string) => {
        setExpanded(id);

        // setTimeout(() => {
        //     document.getElementById(id)?.scrollIntoView({
        //         behavior: "smooth",
        //         block: "start",
        //     });
        // }, 200);
    };

    return (
        <Container
            maxWidth="xl"
            sx={{
                py: { xs: 2, md: 4 },
                px: { xs: 1.5, sm: 2.5, md: 4 },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    mb: 3,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    background:
                        isDarkMode
                            ? theme.palette.background.paper
                            : theme.palette.primary.light,
                }}
            >
                <Stack
                    direction={below800 ? "column" : "row"}
                    justifyContent="space-between"
                    alignItems={below800 ? "flex-start" : "center"}
                    spacing={2}
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            mb={1}
                        >
                            <HelpOutlineOutlinedIcon
                                sx={{
                                    fontSize: { xs: 28, md: 34 },
                                    color: theme.palette.primary.main,
                                }}
                            />

                            <Typography
                                variant={below800 ? "h5" : "h4"}
                                sx={{
                                    fontWeight: 800,
                                    fontFamily: "sans-serif",
                                }}
                            >
                                BUKKOF POS User Guide
                            </Typography>
                        </Stack>

                        <Typography
                            sx={{
                                maxWidth: 750,
                                color: theme.palette.text.secondary,
                                lineHeight: 1.7,
                            }}
                        >
                            Learn how to set up your outlet, manage staff and
                            inventory, authorize POS sessions, issue receipts,
                            review sales and use BUKKOF POS effectively.
                        </Typography>
                    </Box>

                    <Chip
                        icon={<CheckCircleOutlineIcon />}
                        label="Help Centre"
                        variant="outlined"
                        sx={{
                            fontWeight: 600,
                            px: 1,
                        }}
                    />
                </Stack>

                <TextField
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    fullWidth
                    placeholder="Search the user guide..."
                    size="small"
                    sx={{
                        mt: 3,
                        maxWidth: 650,
                        "& .MuiOutlinedInput-root": {
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 2,
                        },
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Paper>

            <Alert
                severity="info"
                sx={{
                    mb: 3,
                    borderRadius: 2,
                }}
            >
                Some sections and actions may only be available to users with
                the required permissions.
            </Alert>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper
                        elevation={1}
                        sx={{
                            p: 1.5,
                            borderRadius: 3,
                            position: { md: "sticky" },
                            top: { md: 80 },
                            maxHeight: { md: "calc(100vh - 100px)" },
                            overflowY: { md: "auto" },
                            border: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Typography
                            sx={{
                                px: 1.5,
                                pt: 1,
                                pb: 1.5,
                                fontWeight: 800,
                                fontFamily: "sans-serif",
                            }}
                        >
                            Guide Contents
                        </Typography>

                        <Divider />

                        <List
                            dense
                            sx={{
                                pt: 1,
                            }}
                        >
                            {sections.map((section) => (
                                <ListItem
                                    key={section.id}
                                    component="button"
                                    // onClick={() =>
                                    //     console.log(section.id)
                                    //     scrollToSection(section.id)
                                    // }
                                    onClick={()=>{
                                        console.log(section.id)
                                        scrollToSection(section.id)
                                    }}
                                    sx={{
                                        border: "none",
                                        width: "100%",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        borderRadius: 2,
                                        mb: 0.5,
                                        backgroundColor:
                                            expanded === section.id
                                                ? theme.palette.action.selected
                                                : "transparent",

                                        "&:hover": {
                                            backgroundColor:
                                                theme.palette.action.hover,
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 36,
                                            color:
                                                expanded === section.id
                                                    ? theme.palette.primary.main
                                                    : theme.palette.text
                                                          .secondary,
                                        }}
                                    >
                                        {section.icon}
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={section.title}
                                        slotProps={{
                                            primary: {
                                                fontSize: "0.9rem",
                                                fontWeight:
                                                    expanded === section.id
                                                        ? 700
                                                        : 500,
                                            },
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 9 }}>
                    <Stack spacing={2}>
                        {filteredSections.length === 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 5,
                                    textAlign: "center",
                                    borderRadius: 3,
                                    border: `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <SearchIcon
                                    sx={{
                                        fontSize: 50,
                                        color: theme.palette.text.disabled,
                                        mb: 1,
                                    }}
                                />

                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 700 }}
                                >
                                    No guide section found
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 1,
                                        color: theme.palette.text.secondary,
                                    }}
                                >
                                    Try searching for authorization, sessions,
                                    sales, inventory, staff, printing or
                                    notifications.
                                </Typography>
                            </Paper>
                        )}

                        {filteredSections.map((section) => (
                            <Accordion
                                key={section.id}
                                id={section.id}
                                expanded={
                                    searchValue.length > 0
                                        ? true
                                        : expanded === section.id
                                }
                                onChange={(_, isExpanded) => {
                                    setExpanded(
                                        isExpanded ? section.id : false
                                    );
                                }}
                                slotProps={{
                                    transition:{
                                        onEntered() {
                                            if (expanded === section.id && !searchValue) {
                                            document
                                                .getElementById(section.id)
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                    block: "start",
                                                });
                                        }
                                            
                                        },
                                    }
                                }}
                                disableGutters
                                elevation={1}
                                sx={{
                                    borderRadius: "12px !important",
                                    overflow: "hidden",
                                    border: `1px solid ${theme.palette.divider}`,
                                    "&:before": {
                                        display: "none",
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        px: { xs: 2, md: 3 },
                                        py: 1,
                                        backgroundColor:
                                            expanded === section.id
                                                ? theme.palette.action.hover
                                                : theme.palette.background
                                                      .paper,
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                    >
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: 2,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color:
                                                    theme.palette.primary.main,
                                                backgroundColor:
                                                    theme.palette.action.hover,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {section.icon}
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 800,
                                                    fontFamily: "sans-serif",
                                                }}
                                            >
                                                {section.title}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color:
                                                        theme.palette.text
                                                            .secondary,
                                                    mt: 0.25,
                                                }}
                                            >
                                                {section.description}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </AccordionSummary>

                                <AccordionDetails
                                    sx={{
                                        px: { xs: 2, md: 3 },
                                        pb: 3,
                                    }}
                                >
                                    <Stack spacing={2}>
                                        {section.items.map(
                                            (item, index) => (
                                                <Paper
                                                    key={`${section.id}-${index}`}
                                                    elevation={0}
                                                    sx={{
                                                        p: { xs: 2, md: 2.5 },
                                                        borderRadius: 2,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        backgroundColor:
                                                            isDarkMode
                                                                ? theme.palette
                                                                      .background
                                                                      .default
                                                                : theme.palette
                                                                      .background
                                                                      .paper,
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 750,
                                                            fontFamily:
                                                                "sans-serif",
                                                            mb: 0.75,
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color:
                                                                theme.palette
                                                                    .text
                                                                    .secondary,
                                                            lineHeight: 1.7,
                                                        }}
                                                    >
                                                        {item.description}
                                                    </Typography>

                                                    {item.steps &&
                                                        item.steps.length >
                                                            0 && (
                                                            <List
                                                                dense
                                                                sx={{
                                                                    mt: 1,
                                                                    pb: 0,
                                                                }}
                                                            >
                                                                {item.steps.map(
                                                                    (
                                                                        step,
                                                                        stepIndex
                                                                    ) => (
                                                                        <ListItem
                                                                            key={
                                                                                stepIndex
                                                                            }
                                                                            sx={{
                                                                                px: 0,
                                                                                py: 0.35,
                                                                                alignItems:
                                                                                    "flex-start",
                                                                            }}
                                                                        >
                                                                            <ListItemIcon
                                                                                sx={{
                                                                                    minWidth: 30,
                                                                                    mt: 0.25,
                                                                                }}
                                                                            >
                                                                                <CheckCircleOutlineIcon
                                                                                    sx={{
                                                                                        fontSize: 18,
                                                                                        color:
                                                                                            theme
                                                                                                .palette
                                                                                                .primary
                                                                                                .main,
                                                                                    }}
                                                                                />
                                                                            </ListItemIcon>

                                                                            <ListItemText
                                                                                primary={
                                                                                    step
                                                                                }
                                                                                slotProps={{
                                                                                    primary:
                                                                                        {
                                                                                            fontSize:
                                                                                                "0.88rem",
                                                                                            lineHeight: 1.6,
                                                                                        },
                                                                                }}
                                                                            />
                                                                        </ListItem>
                                                                    )
                                                                )}
                                                            </List>
                                                        )}

                                                    {item.note && (
                                                        <Alert
                                                            severity="info"
                                                            icon={false}
                                                            sx={{
                                                                mt: 1.5,
                                                                py: 0.5,
                                                                borderRadius: 2,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    lineHeight: 1.6,
                                                                }}
                                                            >
                                                                <strong>
                                                                    Note:
                                                                </strong>{" "}
                                                                {item.note}
                                                            </Typography>
                                                        </Alert>
                                                    )}
                                                </Paper>
                                            )
                                        )}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Stack>
                </Grid>
            </Grid>

            <Paper
                elevation={0}
                sx={{
                    mt: 4,
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Stack
                    direction={below800 ? "column" : "row"}
                    spacing={2}
                    alignItems={below800 ? "flex-start" : "center"}
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                fontFamily: "sans-serif",
                            }}
                        >
                            Need help using BUKKOF POS?
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 0.5,
                                color: theme.palette.text.secondary,
                            }}
                        >
                            Search this guide first.{" "}
                            <Typography
                                component="span"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                }}
                            >
                                Can&apos;t find what you need? Contact support.
                            </Typography>
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Chip
                            icon={<ReceiptLongOutlinedIcon />}
                            label="Sales"
                            variant="outlined"
                        />

                        <Chip
                            icon={<AdminPanelSettingsOutlinedIcon />}
                            label="Administration"
                            variant="outlined"
                        />
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
};

export default MainUserGuide;
