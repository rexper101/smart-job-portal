/**
 * Smart Job Portal - Express Server
 * Main entry point for the Node.js backend
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const dns = require('dns');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Use Google DNS to resolve MongoDB Atlas SRV records (fixes ISP DNS issues)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Connect to MongoDB
connectDB();

const app = express();

