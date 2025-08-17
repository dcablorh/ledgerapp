@@ .. @@
   const formatAmount = (amount: number, type: string) => {
     const sign = type === 'Expenditure' ? '-' : '+';
+    return `${sign}GH₵${amount}`;
   };