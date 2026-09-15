import { jsPDF } from 'jspdf';
import { UserResumeVersion, CandidateProfile } from '../types';

export function generateResumeFilename(fullName: string, targetRole: string): string {
  const cleanName = (fullName || 'Candidate').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const cleanRole = (targetRole || 'Professional').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  return `${cleanName}_${cleanRole}_Resume.pdf`;
}

/**
 * Professional ATS-Compliant Vector PDF Generator
 * - ISO A4 Page Standard (210 x 297 mm)
 * - 100% Selectable Native Text & ATS Friendly
 * - Precise 15mm margins, mathematical vertical rhythm
 * - Automatic page breaks preventing text clipping & overlapping
 * - Clickable embedded hyperlinks for LinkedIn, GitHub, and Projects
 * - Auto-generated professional filename
 */
export async function exportResumeToPDF(
  resumeData: UserResumeVersion | {
    full_name: string;
    email: string;
    phone?: string;
    location: string;
    title?: string;
    summary?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    skills?: any[];
    technical_skills?: string[];
    soft_skills?: string[];
    experience?: any[];
    projects?: any[];
    education?: any[];
    certifications?: any[];
    achievements?: string[];
    languages?: string[];
  },
  roleName?: string
): Promise<string> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178mm
  const bottomMargin = 16;
  let currentY = 16;

  // Helpers
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      pdf.addPage();
      currentY = 16;
      return true;
    }
    return false;
  };

  const drawSectionHeader = (title: string) => {
    checkPageBreak(12);
    currentY += 2;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(26, 36, 56); // Deep slate navy
    pdf.text(title.toUpperCase(), marginX, currentY);

    // Accent horizontal divider
    pdf.setDrawColor(203, 213, 225); // Slate 300
    pdf.setLineWidth(0.35);
    pdf.line(marginX, currentY + 1.8, pageWidth - marginX, currentY + 1.8);
    currentY += 6;
  };

  // Extract contact fields
  const fullName = ('personal_info' in resumeData) ? resumeData.personal_info.full_name : resumeData.full_name;
  const email = ('personal_info' in resumeData) ? resumeData.personal_info.email : resumeData.email;
  const phone = ('personal_info' in resumeData) ? resumeData.personal_info.phone : resumeData.phone;
  const location = ('personal_info' in resumeData) ? resumeData.personal_info.location : resumeData.location;
  const professionalTitle = ('personal_info' in resumeData) 
    ? (resumeData.personal_info.title || roleName || 'Data & Analytics Specialist') 
    : (resumeData.title || roleName || 'Data & Analytics Specialist');
  
  const linkedin = ('personal_info' in resumeData) ? resumeData.personal_info.linkedin_url : resumeData.linkedin_url;
  const github = ('personal_info' in resumeData) ? resumeData.personal_info.github_url : resumeData.github_url;
  const portfolio = ('personal_info' in resumeData) ? resumeData.personal_info.portfolio_url : resumeData.portfolio_url;
  const summary = resumeData.summary || '';

  // 1. HEADER (Candidate Name & Role)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(19);
  pdf.setTextColor(15, 23, 42); // Slate 900
  pdf.text(fullName.toUpperCase(), marginX, currentY);
  currentY += 5.5;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(37, 99, 235); // Royal Blue
  pdf.text(professionalTitle, marginX, currentY);
  currentY += 4.5;

  // Contact line & clickable links
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.8);
  pdf.setTextColor(71, 85, 105); // Slate 600

  const contactParts: string[] = [];
  if (location) contactParts.push(location);
  if (phone) contactParts.push(phone);
  if (email) contactParts.push(email);

  let contactStr = contactParts.join('  •  ');
  pdf.text(contactStr, marginX, currentY);
  currentY += 4.2;

  // Social & Web Links
  const linkParts: Array<{ text: string; url: string }> = [];
  if (linkedin) linkParts.push({ text: 'LinkedIn', url: linkedin });
  if (github) linkParts.push({ text: 'GitHub', url: github });
  if (portfolio) linkParts.push({ text: 'Portfolio', url: portfolio });

  if (linkParts.length > 0) {
    let linkX = marginX;
    linkParts.forEach((lp, idx) => {
      pdf.setTextColor(37, 99, 235);
      pdf.setFont('helvetica', 'normal');
      pdf.text(lp.text, linkX, currentY);
      pdf.link(linkX, currentY - 3, pdf.getTextWidth(lp.text), 4, { url: lp.url });
      linkX += pdf.getTextWidth(lp.text);

      if (idx < linkParts.length - 1) {
        pdf.setTextColor(148, 163, 184);
        pdf.text('   |   ', linkX, currentY);
        linkX += pdf.getTextWidth('   |   ');
      }
    });
    currentY += 5;
  } else {
    currentY += 2;
  }

  // Header bottom border
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.4);
  pdf.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 4.5;

  // 2. PROFESSIONAL SUMMARY
  if (summary) {
    drawSectionHeader('Professional Summary');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);
    const summaryLines = pdf.splitTextToSize(summary, contentWidth);
    checkPageBreak(summaryLines.length * 4.2);
    pdf.text(summaryLines, marginX, currentY);
    currentY += summaryLines.length * 4.2 + 2;
  }

  // 3. TECHNICAL SKILLS & DOMAIN EXPERTISE
  const skillsList: string[] = [];
  if ('technical_skills' in resumeData && Array.isArray(resumeData.technical_skills) && resumeData.technical_skills.length > 0) {
    skillsList.push(...resumeData.technical_skills);
  } else if ('skills' in resumeData && Array.isArray(resumeData.skills)) {
    skillsList.push(...resumeData.skills.map((s: any) => typeof s === 'string' ? s : s.skill_name));
  }

  if (skillsList.length > 0) {
    drawSectionHeader('Technical Skills & Tools');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);

    // Formatted multi-line skills string
    const skillsText = skillsList.join('   •   ');
    const skillLines = pdf.splitTextToSize(skillsText, contentWidth);
    checkPageBreak(skillLines.length * 4.2);
    pdf.text(skillLines, marginX, currentY);
    currentY += skillLines.length * 4.2 + 2;
  }

  // 4. WORK EXPERIENCE
  const experienceList: any[] = ('experience' in resumeData && Array.isArray(resumeData.experience)) ? resumeData.experience : [];
  if (experienceList.length > 0) {
    drawSectionHeader('Professional Experience');

    for (const exp of experienceList) {
      checkPageBreak(22);

      // Role & Company Line
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.8);
      pdf.setTextColor(15, 23, 42);
      pdf.text(exp.job_title || 'Software Specialist', marginX, currentY);

      // Dates (right-aligned)
      const dateStr = `${exp.start_date || '2023'} - ${exp.end_date || 'Present'}`;
      const dateWidth = pdf.getTextWidth(dateStr);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(dateStr, pageWidth - marginX - dateWidth, currentY);
      currentY += 4.2;

      // Company and Location
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      const compLoc = `${exp.company || 'Tech Org'}${exp.location ? `  •  ${exp.location}` : ''}`;
      pdf.text(compLoc, marginX, currentY);
      currentY += 4;

      // Responsibilities / Bullets
      const bullets: string[] = Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0 
        ? exp.responsibilities 
        : (exp.description ? [exp.description] : []);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.8);
      pdf.setTextColor(51, 65, 85);

      for (const bullet of bullets) {
        const bulletLines = pdf.splitTextToSize(bullet, contentWidth - 5);
        checkPageBreak(bulletLines.length * 4.1 + 1);
        
        // Draw bullet dot
        pdf.setTextColor(37, 99, 235);
        pdf.text('•', marginX + 1, currentY);
        pdf.setTextColor(51, 65, 85);
        pdf.text(bulletLines, marginX + 5, currentY);
        currentY += bulletLines.length * 4.1 + 1.2;
      }
      currentY += 2;
    }
  }

  // 5. KEY PROJECTS
  const projectsList: any[] = ('projects' in resumeData && Array.isArray(resumeData.projects)) ? resumeData.projects : [];
  if (projectsList.length > 0) {
    drawSectionHeader('Technical Projects & Systems');

    for (const proj of projectsList.slice(0, 4)) {
      checkPageBreak(18);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.8);
      pdf.setTextColor(15, 23, 42);
      
      let projTitle = proj.name || 'Data Analytics Project';
      pdf.text(projTitle, marginX, currentY);

      if (proj.github_url || proj.url) {
        const linkUrl = proj.github_url || proj.url;
        const linkLabel = '[Project Link]';
        const linkW = pdf.getTextWidth(linkLabel);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(37, 99, 235);
        pdf.text(linkLabel, pageWidth - marginX - linkW, currentY);
        pdf.link(pageWidth - marginX - linkW, currentY - 3, linkW, 4, { url: linkUrl });
      }
      currentY += 4.2;

      // Project description
      if (proj.description) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.8);
        pdf.setTextColor(51, 65, 85);
        const descLines = pdf.splitTextToSize(proj.description, contentWidth);
        checkPageBreak(descLines.length * 4.1);
        pdf.text(descLines, marginX, currentY);
        currentY += descLines.length * 4.1 + 1.2;
      }

      // Tech stack tag line
      const techStack = [
        ...(Array.isArray(proj.skills_used) ? proj.skills_used : []),
        ...(Array.isArray(proj.keywords) ? proj.keywords : [])
      ].filter(Boolean);

      if (techStack.length > 0 || proj.metrics) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.2);
        pdf.setTextColor(100, 116, 139);
        const techStr = `Technologies: ${techStack.slice(0, 8).join(', ')}${proj.metrics ? ` | Metric: ${proj.metrics}` : ''}`;
        const techLines = pdf.splitTextToSize(techStr, contentWidth);
        checkPageBreak(techLines.length * 3.8);
        pdf.text(techLines, marginX, currentY);
        currentY += techLines.length * 3.8 + 2.5;
      }
    }
  }

  // 6. EDUCATION
  const eduList: any[] = ('education' in resumeData && Array.isArray(resumeData.education)) ? resumeData.education : [];
  if (eduList.length > 0) {
    drawSectionHeader('Education');

    for (const edu of eduList) {
      checkPageBreak(12);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      const degreeText = `${edu.degree || 'Bachelor'} in ${edu.field_of_study || 'Computer Science'}`;
      pdf.text(degreeText, marginX, currentY);

      if (edu.graduation_year) {
        const yearStr = `${edu.graduation_year}`;
        const yearW = pdf.getTextWidth(yearStr);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(yearStr, pageWidth - marginX - yearW, currentY);
      }
      currentY += 4.2;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.8);
      pdf.setTextColor(71, 85, 105);
      const instGpa = `${edu.institution || 'University'}${edu.gpa ? `  •  GPA: ${edu.gpa}` : ''}`;
      pdf.text(instGpa, marginX, currentY);
      currentY += 4.5;
    }
  }

  // 7. CERTIFICATIONS & ACHIEVEMENTS
  const certList: any[] = ('certifications' in resumeData && Array.isArray(resumeData.certifications)) ? resumeData.certifications : [];
  if (certList.length > 0) {
    drawSectionHeader('Certifications & Credentials');

    for (const cert of certList) {
      checkPageBreak(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`•  ${cert.name || 'Professional Certificate'}`, marginX, currentY);

      if (cert.issuer || cert.issue_date) {
        const issuerDate = `${cert.issuer || ''}${cert.issue_date ? ` (${cert.issue_date})` : ''}`;
        const idW = pdf.getTextWidth(issuerDate);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(issuerDate, pageWidth - marginX - idW, currentY);
      }
      currentY += 4.2;
    }
  }

  // Number pages cleanly
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184); // Slate 400
    const footerText = `${fullName}  •  ${professionalTitle}  •  Page ${i} of ${totalPages}`;
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 8);
  }

  // Filename resolution
  const targetRole = roleName || professionalTitle || 'Data_Analyst';
  const filename = generateResumeFilename(fullName, targetRole);

  pdf.save(filename);
  return filename;
}
