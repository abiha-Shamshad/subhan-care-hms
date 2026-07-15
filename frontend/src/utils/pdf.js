import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { subtotalOf, totalOf, outstandingOf } from '../constants/billingData';

const HOSPITAL_NAME = 'Subhan Care Hospital';

const addLetterhead = (doc, subtitle) => {
  doc.setFontSize(16);
  doc.text(HOSPITAL_NAME, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(subtitle, 14, 24);
  doc.setTextColor(0);
};

export const generateInvoicePdf = (invoice) => {
  const doc = new jsPDF();
  addLetterhead(doc, 'Invoice / Receipt');

  doc.setFontSize(10);
  doc.text(`${invoice.invoiceId}`, 196, 18, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('en-CA')}`, 196, 24, { align: 'right' });
  doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString('en-CA')}`, 196, 29, { align: 'right' });
  doc.text(`Patient: ${invoice.patient.split(' (')[0]}`, 14, 34);

  autoTable(doc, {
    startY: 40,
    head: [['Service', 'Qty', 'Rate', 'Amount']],
    body: invoice.services.map((s) => [s.name, s.qty, `Rs. ${Number(s.rate).toLocaleString()}`, `Rs. ${(s.qty * s.rate).toLocaleString()}`]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });

  const rows = [
    ['Subtotal', `Rs. ${subtotalOf(invoice).toLocaleString()}`],
    ...(invoice.discount > 0 ? [['Discount', `- Rs. ${invoice.discount.toLocaleString()}`]] : []),
    ['Total', `Rs. ${totalOf(invoice).toLocaleString()}`],
    ['Paid', `Rs. ${invoice.paid.toLocaleString()}`],
    ['Outstanding', `Rs. ${outstandingOf(invoice).toLocaleString()}`],
  ];
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    body: rows,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
    margin: { left: 120 },
  });

  doc.save(`${invoice.invoiceId}.pdf`);
};

export const generatePrescriptionPdf = (rx) => {
  const doc = new jsPDF();
  addLetterhead(doc, 'Prescription');

  doc.setFontSize(10);
  doc.text(`${rx.rxId}`, 196, 18, { align: 'right' });
  doc.text(`Date: ${new Date(rx.date).toLocaleDateString('en-CA')}`, 196, 24, { align: 'right' });
  doc.text(`Patient: ${rx.patient.split(' (')[0]}`, 14, 34);
  doc.text(`Doctor: ${rx.doctor}`, 14, 40);
  doc.text(`Diagnosis: ${rx.diagnosis}`, 14, 46);

  autoTable(doc, {
    startY: 52,
    head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
    body: rx.medications.map((m) => [m.name, m.dosage, m.frequency, m.duration || '—', m.instructions || '—']),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });

  if (rx.notes) {
    doc.setFontSize(10);
    doc.text(`Notes: ${rx.notes}`, 14, doc.lastAutoTable.finalY + 10);
  }

  doc.save(`${rx.rxId}.pdf`);
};
