const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  // Generate Application Summary PDF
  static async generateApplicationPDF(application, university, user) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `application-${application._id}.pdf`;
        const filepath = path.join(__dirname, '../uploads/temp', filename);

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('Application Summary', { align: 'center' })
          .moveDown();

        // Application Details
        doc.fontSize(12).font('Helvetica');

        doc
          .font('Helvetica-Bold')
          .text('Application Number: ')
          .font('Helvetica')
          .text(application.applicationNumber, { continued: true })
          .moveDown();

        doc
          .font('Helvetica-Bold')
          .text('Student Name: ')
          .font('Helvetica')
          .text(`${user.firstName} ${user.lastName}`, { continued: true })
          .moveDown();

        doc
          .font('Helvetica-Bold')
          .text('Email: ')
          .font('Helvetica')
          .text(user.email, { continued: true })
          .moveDown()
          .moveDown();

        // University Details
        doc.fontSize(16).font('Helvetica-Bold').text('University Details').moveDown();
        doc.fontSize(12).font('Helvetica');

        doc
          .font('Helvetica-Bold')
          .text('University: ')
          .font('Helvetica')
          .text(university.name, { continued: true })
          .moveDown();

        doc
          .font('Helvetica-Bold')
          .text('Location: ')
          .font('Helvetica')
          .text(`${university.city}, ${university.country}`, { continued: true })
          .moveDown();

        doc
          .font('Helvetica-Bold')
          .text('Program: ')
          .font('Helvetica')
          .text(application.programName, { continued: true })
          .moveDown();

        doc
          .font('Helvetica-Bold')
          .text('Intake: ')
          .font('Helvetica')
          .text(`${application.intake} ${application.intakeYear}`, { continued: true })
          .moveDown();

        doc
          .font('Helvetica-Bold')
          .text('Status: ')
          .font('Helvetica')
          .text(application.status, { continued: true })
          .moveDown()
          .moveDown();

        // Documents
        if (application.documents && application.documents.length > 0) {
          doc.fontSize(16).font('Helvetica-Bold').text('Submitted Documents').moveDown();
          doc.fontSize(12).font('Helvetica');

          application.documents.forEach((doc, index) => {
            doc
              .text(`${index + 1}. ${doc.name} (${doc.type}) - ${doc.status}`)
              .moveDown(0.5);
          });
        }

        // Footer
        doc
          .moveDown()
          .moveDown()
          .fontSize(10)
          .text(
            `Generated on ${new Date().toLocaleDateString()} by StudyBridge`,
            { align: 'center' }
          );

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate University Profile PDF
  static async generateUniversityProfilePDF(university) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `university-${university._id}.pdf`;
        const filepath = path.join(__dirname, '../uploads/temp', filename);

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text(university.name, { align: 'center' })
          .moveDown();

        doc
          .fontSize(14)
          .font('Helvetica')
          .text(`${university.city}, ${university.country}`, { align: 'center' })
          .moveDown()
          .moveDown();

        // Overview
        doc.fontSize(16).font('Helvetica-Bold').text('Overview').moveDown();
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(university.overview.description, { align: 'justify' })
          .moveDown()
          .moveDown();

        // Rankings
        if (university.rankings) {
          doc.fontSize(16).font('Helvetica-Bold').text('Rankings').moveDown();
          doc.fontSize(12).font('Helvetica');

          if (university.rankings.qsRanking?.world) {
            doc.text(`QS World Ranking: #${university.rankings.qsRanking.world}`).moveDown(0.5);
          }

          if (university.rankings.timesRanking?.world) {
            doc
              .text(`Times Higher Education: #${university.rankings.timesRanking.world}`)
              .moveDown();
          }
        }

        // Statistics
        if (university.stats) {
          doc.moveDown().fontSize(16).font('Helvetica-Bold').text('Statistics').moveDown();
          doc.fontSize(12).font('Helvetica');

          if (university.stats.totalStudents) {
            doc
              .text(`Total Students: ${university.stats.totalStudents.toLocaleString()}`)
              .moveDown(0.5);
          }

          if (university.stats.acceptanceRate) {
            doc.text(`Acceptance Rate: ${university.stats.acceptanceRate}%`).moveDown(0.5);
          }

          if (university.stats.employmentRate) {
            doc.text(`Employment Rate: ${university.stats.employmentRate}%`).moveDown();
          }
        }

        // Footer
        doc
          .moveDown()
          .moveDown()
          .fontSize(10)
          .text(
            `Generated on ${new Date().toLocaleDateString()} by StudyBridge`,
            { align: 'center' }
          );

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;