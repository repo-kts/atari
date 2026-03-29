const { getAllSections } = require('./backend/config/reportConfig.js');
const sections = getAllSections();
console.log('TOTAL SECTIONS:', sections.length);
sections.forEach(s => console.log(`ID: ${s.id}, Title: ${s.title}, ParentID: ${s.parentSectionId}`));
