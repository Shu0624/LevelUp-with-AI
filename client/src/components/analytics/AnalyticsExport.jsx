import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2, Calendar, Filter } from 'lucide-react';

const AnalyticsExport = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('csv');
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setError('');
    try {
      if (format === 'csv') {
        const res = await api.get('/analytics/export?format=csv', { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `levelup_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // JSON preview
        const res = await api.get('/analytics/export');
        setPreviewData(res.data);
      }
    } catch (err) {
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    if (!previewData || previewData.length === 0) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>LevelUp Analytics Report — ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
          h1 { font-size: 24px; color: #6366f1; margin-bottom: 6px; }
          h2 { font-size: 14px; color: #666; margin-bottom: 24px; font-weight: normal; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { background: #f0f0ff; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #6366f1; }
          td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          tr:nth-child(even) { background: #fafafa; }
          .footer { margin-top: 32px; font-size: 11px; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>📊 LevelUp Analytics Report</h1>
        <h2>Generated on ${new Date().toLocaleString()}</h2>
        <table>
          <thead>
            <tr>
              ${Object.keys(previewData[0]).map(k => `<th>${k.replace(/([A-Z])/g, ' $1').trim()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${previewData.map(row =>
              `<tr>${Object.values(row).map(v => `<td>${v}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
        <div class="footer">LevelUp Platform — Confidential Report</div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Download className="text-primary" size={22} /> Export Data
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Format</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('csv')}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all ${
                  format === 'csv'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary'
                }`}
              >
                📄 CSV File
              </button>
              <button
                onClick={() => setFormat('json')}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all ${
                  format === 'json'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary'
                }`}
              >
                📊 Preview & Print
              </button>
            </div>
          </div>

          {/* Info */}
          <div>
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Contents</label>
            <p className="text-sm text-muted-foreground p-3 bg-secondary/30 rounded-2xl border border-border/50">
              Exports all students visible in your scope with study hours, quiz scores, streak data, and last active date.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {format === 'csv' ? 'Download CSV' : 'Load Preview'}
          </button>

          {previewData && (
            <button
              onClick={handlePrintReport}
              className="px-6 py-3 bg-accent text-accent-foreground rounded-2xl font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all flex items-center gap-2"
            >
              <FileText size={16} /> Print as PDF
            </button>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-destructive font-medium">{error}</p>
        )}
      </motion.div>

      {/* Preview Table */}
      {previewData && previewData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-6 overflow-x-auto"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">
            Preview ({previewData.length} students)
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {Object.keys(previewData[0]).map(key => (
                  <th key={key} className="text-left py-3 px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.slice(0, 20).map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="py-3 px-3 text-foreground">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {previewData.length > 20 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Showing first 20 of {previewData.length} rows. Download CSV for complete data.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsExport;
