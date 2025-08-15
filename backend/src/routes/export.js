import express from 'express';
import puppeteer from 'puppeteer';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 400,
  height: 300,
  backgroundColour: 'white'
});

router.post('/financial-report', async (req, res, next) => {
  try {
    const { startDate, endDate, companyName = 'Urban-IT Ledger' } = req.body;

    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    const reportData = await processFinancialData(transactions, startDate, endDate, companyName);
    const charts = await generateCharts(reportData);
    const pdfBuffer = await generatePDF(reportData, charts);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Urban-IT_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    next(error);
  }
});

async function processFinancialData(transactions, startDate, endDate, companyName) {
  const incomeTransactions = transactions.filter(t => t.type === 'INCOME');
  const expenditureTransactions = transactions.filter(t => t.type === 'EXPENDITURE');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenditure = expenditureTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenditure;

  const incomeByCategory = {};
  incomeTransactions.forEach(t => {
    incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
  });

  const expenditureByCategory = {};
  expenditureTransactions.forEach(t => {
    expenditureByCategory[t.category] = (expenditureByCategory[t.category] || 0) + t.amount;
  });

  return {
    companyName,
    periodCovered: `${startDate || 'Beginning'} - ${endDate || 'Present'}`,
    datePrepared: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    summary: {
      totalIncome,
      totalExpenditure,
      netBalance
    },
    incomeBreakdown: Object.entries(incomeByCategory).map(([category, amount]) => ({
      source: category,
      amount
    })),
    expenditureBreakdown: Object.entries(expenditureByCategory).map(([category, amount]) => ({
      category,
      amount
    })),
    transactions: transactions.slice(0, 20)
  };
}

async function generateCharts(reportData) {
  const charts = {};

  if (reportData.incomeBreakdown.length > 0) {
    const incomeChartConfig = {
      type: 'pie',
      data: {
        labels: reportData.incomeBreakdown.map(item => item.source),
        datasets: [{
          data: reportData.incomeBreakdown.map(item => item.amount),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Income Breakdown',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    };

    charts.incomeChart = await chartJSNodeCanvas.renderToBuffer(incomeChartConfig);
  }

  if (reportData.expenditureBreakdown.length > 0) {
    const expenditureChartConfig = {
      type: 'pie',
      data: {
        labels: reportData.expenditureBreakdown.map(item => item.category),
        datasets: [{
          data: reportData.expenditureBreakdown.map(item => item.amount),
          backgroundColor: [
            '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#06B6D4', '#8B5CF6'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Expenditure Breakdown',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    };

    charts.expenditureChart = await chartJSNodeCanvas.renderToBuffer(expenditureChartConfig);
  }

  const barChartConfig = {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenditure'],
      datasets: [{
        data: [reportData.summary.totalIncome, reportData.summary.totalExpenditure],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Income vs Expenditure',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₵' + value.toLocaleString();
            }
          }
        }
      }
    }
  };

  charts.comparisonChart = await chartJSNodeCanvas.renderToBuffer(barChartConfig);

  return charts;
}

async function generatePDF(reportData, charts) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    const chartImages = {};
    for (const [key, buffer] of Object.entries(charts)) {
      chartImages[key] = `data:image/png;base64,${buffer.toString('base64')}`;
    }

    const htmlContent = generateHTMLContent(reportData, chartImages);

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return pdfBuffer;

  } finally {
    await browser.close();
  }
}

function generateHTMLContent(reportData, chartImages) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Financial Report</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.6;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
        }
        
        .header h1 {
          color: #1F2937;
          font-size: 28px;
          margin: 0 0 10px 0;
          font-weight: bold;
        }
        
        .company-info {
          background: #F8FAFC;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .company-info table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .company-info td {
          padding: 8px 12px;
          border: 1px solid #E5E7EB;
        }
        
        .company-info td:first-child {
          background: #6B7280;
          color: white;
          font-weight: bold;
          width: 40%;
        }
        
        .section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        
        .section h2 {
          color: #1F2937;
          font-size: 20px;
          margin-bottom: 15px;
          border-bottom: 2px solid #E5E7EB;
          padding-bottom: 5px;
        }
        
        .breakdown-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        .breakdown-table th {
          background: #6B7280;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        
        .breakdown-table td {
          padding: 10px 12px;
          border: 1px solid #E5E7EB;
        }
        
        .breakdown-table tr:nth-child(even) {
          background: #F9FAFB;
        }
        
        .amount {
          text-align: right;
          font-weight: bold;
        }
        
        .charts-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          margin: 20px 0;
        }
        
        .chart {
          flex: 1;
          min-width: 300px;
          margin: 10px;
          text-align: center;
        }
        
        .chart img {
          max-width: 100%;
          height: auto;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
        }
        
        .visual-analysis {
          margin-top: 40px;
          page-break-before: always;
        }
        
        .comparison-chart {
          text-align: center;
          margin: 20px 0;
        }
        
        .comparison-chart img {
          max-width: 600px;
          width: 100%;
          height: auto;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #6B7280;
          border-top: 1px solid #E5E7EB;
          padding-top: 20px;
        }
        
        @media print {
          body { print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${reportData.companyName} - Financial Report</h1>
      </div>
      
      <div class="company-info">
        <table>
          <tr>
            <td>Company Name</td>
            <td>${reportData.companyName}</td>
          </tr>
          <tr>
            <td>Period Covered</td>
            <td>${reportData.periodCovered}</td>
          </tr>
          <tr>
            <td>Date Prepared</td>
            <td>${reportData.datePrepared}</td>
          </tr>
          <tr>
            <td>Total Income</td>
            <td class="amount">₵${reportData.summary.totalIncome.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Total Expenditure</td>
            <td class="amount">₵${reportData.summary.totalExpenditure.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Net Balance</td>
            <td class="amount" style="color: ${reportData.summary.netBalance >= 0 ? '#10B981' : '#EF4444'}">
              ₵${reportData.summary.netBalance.toLocaleString()}
            </td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h2>Income Breakdown</h2>
        <table class="breakdown-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Amount (₵)</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.incomeBreakdown.map(item => `
              <tr>
                <td>${item.source}</td>
                <td class="amount">${item.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h2>Expenditure Breakdown</h2>
        <table class="breakdown-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount (₵)</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.expenditureBreakdown.map(item => `
              <tr>
                <td>${item.category}</td>
                <td class="amount">${item.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="visual-analysis page-break">
        <h2>Visual Analysis</h2>
        
        <div class="charts-container">
          ${chartImages.incomeChart ? `
            <div class="chart">
              <img src="${chartImages.incomeChart}" alt="Income Breakdown Chart" />
            </div>
          ` : ''}
          
          ${chartImages.expenditureChart ? `
            <div class="chart">
              <img src="${chartImages.expenditureChart}" alt="Expenditure Breakdown Chart" />
            </div>
          ` : ''}
        </div>
        
        <div class="comparison-chart">
          <img src="${chartImages.comparisonChart}" alt="Income vs Expenditure Comparison" />
        </div>
      </div>
      
      <div class="footer">
        <p>Generated by ${reportData.companyName} Financial Management System</p>
        <p>Report generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}

export default router;