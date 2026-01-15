import React, {useState} from "react";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button
} from "@mui/material";

const LoginPage = () => {
    const [fromData, setFormData] = useState({
        login: "",
        password: ""
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };