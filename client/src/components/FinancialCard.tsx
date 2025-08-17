@@ .. @@
   const formatValue = () => {
     if (type === 'transactions') {
       return value.toString();
     }
     const formattedValue = Math.abs(value).toLocaleString();
     const sign = type === 'expense' || (type === 'balance' && value < 0) ? '-' : '+';
+    return `${sign}GH₵${formattedValue}`;
   };