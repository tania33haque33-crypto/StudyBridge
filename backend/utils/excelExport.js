const ExcelJS = require('exceljs');
const path = require('path');

class ExcelExporter {
  // Export universities to Excel
  static async exportUniversities(universities) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Universities');

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'QS Ranking', key: 'qsRanking', width: 12 },
      { header: 'Total Students', key: 'totalStudents', width: 15 },
      { header: 'Acceptance Rate', key: 'acceptanceRate', width: 15 },
      { header: 'Tuition (Int\'l UG)', key: 'tuition', width: 18 },
      { header: 'Website', key: 'website', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data
    universities.forEach((uni) => {
      worksheet.addRow({
        name: uni.name,
        country: uni.country,
        city: uni.city,
        type: uni.universityType,
        qsRanking: uni.rankings?.qsRanking?.world || 'N/A',
        totalStudents: uni.stats?.totalStudents || 'N/A',
        acceptanceRate: uni.stats?.acceptanceRate ? `${uni.stats.acceptanceRate}%` : 'N/A',
        tuition: uni.tuitionFees?.undergraduate?.international?.amount
          ? `${uni.tuitionFees.undergraduate.international.currency} ${uni.tuitionFees.undergraduate.international.amount}`
          : 'N/A',
        website: uni.website || 'N/A',
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Generate file
    const filename = `universities-${Date.now()}.xlsx`;
    const filepath = path.join(__dirname, '../uploads/temp', filename);

    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  // Export applications to Excel
  static async exportApplications(applications) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applications');

    worksheet.columns = [
      { header: 'Application No', key: 'applicationNumber', width: 20 },
      { header: 'Student Name', key: 'studentName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'University', key: 'university', width: 30 },
      { header: 'Program', key: 'program', width: 30 },
      { header: 'Intake', key: 'intake', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Deadline', key: 'deadline', width: 15 },
      { header: 'Submitted Date', key: 'submittedDate', width: 15 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data
    applications.forEach((app) => {
      worksheet.addRow({
        applicationNumber: app.applicationNumber,
        studentName: `${app.userId?.firstName} ${app.userId?.lastName}`,
        email: app.userId?.email,
        university: app.universityId?.name,
        program: app.programName,
        intake: `${app.intake} ${app.intakeYear}`,
        status: app.status,
        deadline: app.deadline ? new Date(app.deadline).toLocaleDateString() : 'N/A',
        submittedDate: app.timeline?.submitted
          ? new Date(app.timeline.submitted).toLocaleDateString()
          : 'Not Submitted',
      });
    });

    const filename = `applications-${Date.now()}.xlsx`;
    const filepath = path.join(__dirname, '../uploads/temp', filename);

    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  // Export scholarships to Excel
  static async exportScholarships(scholarships) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Scholarships');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Provider', key: 'provider', width: 25 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'Amount', key: 'amount', width: 20 },
      { header: 'Study Level', key: 'studyLevel', width: 20 },
      { header: 'Deadline', key: 'deadline', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    scholarships.forEach((scholarship) => {
      worksheet.addRow({
        name: scholarship.name,
        provider: scholarship.provider,
        type: scholarship.type,
        country: scholarship.country,
        amount: `${scholarship.amount.currency} ${scholarship.amount.value}`,
        studyLevel: scholarship.studyLevel?.join(', ') || 'N/A',
        deadline: new Date(scholarship.deadline).toLocaleDateString(),
        status: scholarship.isActive ? 'Active' : 'Inactive',
      });
    });

    const filename = `scholarships-${Date.now()}.xlsx`;
    const filepath = path.join(__dirname, '../uploads/temp', filename);

    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }
}

module.exports = ExcelExporter;