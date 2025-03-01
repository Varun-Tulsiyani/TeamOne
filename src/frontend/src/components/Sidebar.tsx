import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, List, ListItem, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MenuIcon from "@mui/icons-material/Menu";
import styles from "../styles/Sidebar.module.css";

const Sidebar = () => {
    const navigate = useNavigate(); // React Router navigation hook
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(
        JSON.parse(localStorage.getItem("sidebar-collapsed") || "false")
    );

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
        { text: "Report", icon: <AssessmentIcon />, path: "/report" },
        { text: "FAQ", icon: <LiveHelpIcon />, path: "/faq" },
        { text: "Logout", icon: <ExitToAppIcon />, path: "/login" },
    ];

    const handleNavigation = (index: number, path: string) => {
        setActiveIndex(index);
        navigate(path);
    };

    return (
        <Box className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
            <Box className={styles.sidebarIcons}>
                <MenuIcon className={styles.icon} onClick={() => setIsCollapsed(!isCollapsed)}/>
            </Box>

            <List className={styles.navList}>
                {menuItems.map((item, index) => (
                    <Tooltip title={isCollapsed ? item.text : ""} placement="right" key={index}>
                        <ListItem
                            className={`${styles.listItem} ${activeIndex === index ? styles.active : ""}`}
                            onClick={() => handleNavigation(index, item.path)}
                        >
                            <ListItemIcon className={styles.listItemIcon}>{item.icon}</ListItemIcon>
                            {!isCollapsed && <ListItemText primary={item.text}/>}
                        </ListItem>
                    </Tooltip>
                ))}
            </List>
        </Box>
    );
};

export default Sidebar;
