@@ .. @@
 import express from 'express';
 import cors from 'cors';
 import helmet from 'helmet';
+import compression from 'compression';
 import rateLimit from 'express-rate-limit';
 import dotenv from 'dotenv';
 
 // Import routes
 import authRoutes from './routes/auth.js';
 import adminRoutes from './routes/admin.js';
 import transactionRoutes from './routes/transactions.js';
 import dashboardRoutes from './routes/dashboard.js';
 import reportsRoutes from './routes/reports.js';
+import exportRoutes from './routes/export.js';
 
 // Import middleware
 import { errorHandler } from './middleware/errorHandler.js';
@@ .. @@
 const app = express();
 const PORT = process.env.PORT || 3001;
 
+// Enable compression
+app.use(compression());
+
 // Security middleware
-app.use(helmet());
+app.use(helmet({
+  contentSecurityPolicy: {
+    directives: {
+      defaultSrc: ["'self'"],
+      styleSrc: ["'self'", "'unsafe-inline'"],
+      scriptSrc: ["'self'"],
+      imgSrc: ["'self'", "data:", "blob:"],
+      connectSrc: ["'self'"],
+      fontSrc: ["'self'"],
+      objectSrc: ["'none'"],
+      mediaSrc: ["'self'"],
+      frameSrc: ["'none'"],
+    },
+  },
+}));
+
 app.use(cors({
   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
   credentials: true
 }));
 
+// Cache control for static assets
+app.use('/static', express.static('public', {
+  maxAge: '1y',
+  etag: true,
+  lastModified: true
+}));
+
 // Rate limiting
@@ .. @@
 app.use('/transactions', transactionRoutes);
 app.use('/dashboard', dashboardRoutes);
 app.use('/reports', reportsRoutes);
+app.use('/export', exportRoutes);
 
+// Offline fallback route
+app.get('/offline', (req, res) => {
+  res.json({ 
+    message: 'You are currently offline. Some features may be limited.',
+    timestamp: new Date().toISOString()
+  });
+});
+
 // 404 handler