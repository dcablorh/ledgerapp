@@ .. @@
 import { Download, Calendar } from 'lucide-react';
 import { reportsAPI } from '../utils/api';
-import {generateFinancialReportPDF} from '../utils/exportPDF';
+import { exportAPI } from '../utils/api';
 
 const Reports: React.FC = () => {
@@ .. @@
   const [isLoading, setIsLoading] = useState(false);
   const [transactions, setTransactions] = useState<Transaction[]>([]);
+  const [isExporting, setIsExporting] = useState(false);
 
   const loadReportsData = async () => {
@@ .. @@
   React.useEffect(() => {
     loadReportsData();
   }, [startDate, endDate, selectedYear]);
 
+  const handleExportPDF = async () => {
+    try {
+      setIsExporting(true);
+      
+      const pdfBlob = await exportAPI.generateFinancialReport({
+        startDate,
+        endDate,
+        companyName: 'Urban-IT Ledger'
+      });
+      
+      // Create download link
+      const url = window.URL.createObjectURL(pdfBlob);
+      const link = document.createElement('a');
+      link.href = url;
+      link.download = `Urban-IT_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
+      document.body.appendChild(link);
+      link.click();
+      document.body.removeChild(link);
+      window.URL.revokeObjectURL(url);
+      
+    } catch (error) {
+      console.error('Failed to export PDF:', error);
+      alert('Failed to export PDF. Please try again.');
+    } finally {
+      setIsExporting(false);
+    }
+  };
+
   const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
 
@@ .. @@
         </div>
         <button
-  onClick={() =>
-    generateFinancialReportPDF({
-      businessName: 'Urban-IT',
-      startDate: startDate,
-      endDate: endDate,
-      transactions: transactions
-    })
-  }
-    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
-    disabled={isLoading}>
-    <Download className="w-5 h-5" />
-     Export PDF
-      </button>
+          onClick={handleExportPDF}
+          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
+          disabled={isLoading || isExporting}
+        >
+          <Download className="w-5 h-5" />
+          {isExporting ? 'Generating PDF...' : 'Export PDF Report'}
+        </button>
 
       </div>