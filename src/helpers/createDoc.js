import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

const createDoc = (data) => {
  return new Document({
    sections: [
      {
        properties: {},
        children: [
          // A Styled Title
          new Paragraph({
            text: "Project Report 2026",
            heading: "Title",
            spacing: { after: 200 },
          }),

          // Basic Text with Bold/Italic
          new Paragraph({
            children: [
              new TextRun("This is a "),
              new TextRun({
                text: "fully customized",
                bold: true,
                color: "2E74B5",
              }),
              new TextRun({
                text: " document generated via Node.js.",
                italics: true,
              }),
            ],
          }),

          // A Simple Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Feature")] }),
                  new TableCell({ children: [new Paragraph("Status")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Customization")] }),
                  new TableCell({ children: [new Paragraph("Full")] }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });
};

export default createDoc;
