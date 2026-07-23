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
            // Generate HTML from template (async: awaits custom sections that return Promises)
            const html = await reportTemplateService.generateReportHTML(
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

    async generateReportPartPDF(kvkInfo, sectionsData) {
        try {
            const html = await reportTemplateService.generateReportPartHTML(
                kvkInfo,
                sectionsData,
            );
            return await generatePDF(html, {
                includeSerial: false,
                includeFooter: false,
            });
        } catch (error) {
            console.error('PDF part generation error:', error);
            throw new Error(`Failed to generate PDF part: ${error.message}`);
        }
    }

    async generateReportFrontMatterPDF(kvkInfo, sectionIds, filters, generatedBy) {
        try {
            const html = reportTemplateService.generateReportFrontMatterHTML(
                kvkInfo,
                sectionIds,
                filters,
                generatedBy,
            );
            return await generatePDF(html, {
                includeSerial: true,
                includeFooter: false,
            });
        } catch (error) {
            console.error('PDF front matter generation error:', error);
            throw new Error(`Failed to generate PDF front matter: ${error.message}`);
        }
    }
}

module.exports = new PDFGenerationService();
