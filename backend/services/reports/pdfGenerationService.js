const { generatePDF } = require('../../utils/exportHelper.js');
const reportTemplateService = require('./reportTemplateService.js');

/**
 * PDF Generation Service
 * Handles PDF generation for reports
 */
class PDFGenerationService {
    /**
     * Generate PDF report
     */
    async generateReportPDF(kvkInfo, sectionsData, filters, generatedBy) {
        try {
            // Generate HTML from template
            const html = reportTemplateService.generateReportHTML(
                kvkInfo,
                sectionsData,
                filters,
                generatedBy
            );

            // Generate PDF from HTML
            const pdfBuffer = await generatePDF(html);

            return pdfBuffer;
        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }
}

module.exports = new PDFGenerationService();
