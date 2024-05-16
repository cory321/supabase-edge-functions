// supabase/functions/pdf2/index.ts

import {
	PDFDocument,
	rgb,
	StandardFonts,
} from 'https://cdn.skypack.dev/pdf-lib';

Deno.serve(async (req) => {
	if (req.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 });
	}

	try {
		const { invoiceData } = await req.json();

		// Create a new PDF document
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([600, 800]);

		const { width, height } = page.getSize();
		const fontSize = 12;
		const margin = 50;

		// Load a standard font
		const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

		// Add business information
		page.drawText(invoiceData.businessName, {
			x: margin,
			y: height - margin,
			size: fontSize + 4,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(
			`${invoiceData.businessPhone} | ${invoiceData.businessEmail}`,
			{
				x: margin,
				y: height - margin - 20,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			}
		);

		// Add invoice title
		page.drawText('Invoice', {
			x: margin,
			y: height - margin - 60,
			size: 24,
			font,
			color: rgb(0, 0, 0),
		});

		// Add billing information
		page.drawText('Bill to:', {
			x: margin,
			y: height - margin - 80,
			size: fontSize + 2,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(invoiceData.billTo.name, {
			x: margin,
			y: height - margin - 100,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(invoiceData.billTo.organization, {
			x: margin,
			y: height - margin - 115,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(invoiceData.billTo.address, {
			x: margin,
			y: height - margin - 130,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(invoiceData.billTo.email, {
			x: margin,
			y: height - margin - 145,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(invoiceData.billTo.phone, {
			x: margin,
			y: height - margin - 160,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		// Add invoice details
		page.drawText(`Invoice #: ${invoiceData.invoiceNumber}`, {
			x: margin,
			y: height - margin - 200,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(`PO #: ${invoiceData.poNumber}`, {
			x: margin,
			y: height - margin - 215,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(`Date issued: ${invoiceData.dateIssued}`, {
			x: margin,
			y: height - margin - 230,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(`Next payment due: ${invoiceData.dueDate}`, {
			x: margin,
			y: height - margin - 245,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		// Add service information headers
		const serviceHeaderY = height - 300 - 20; // Adjusted Y coordinate for extra space
		page.drawText('SERVICE INFO', {
			x: margin,
			y: serviceHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText('QTY', {
			x: margin + 100,
			y: serviceHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText('UNIT', {
			x: margin + 150,
			y: serviceHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText('UNIT PRICE', {
			x: margin + 200,
			y: serviceHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText('TOTAL', {
			x: margin + 300,
			y: serviceHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		// Add service items
		let currentY = serviceHeaderY - 20;
		invoiceData.items.forEach((item: any) => {
			page.drawText(item.name, {
				x: margin,
				y: currentY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
			page.drawText(item.description, {
				x: margin + 100,
				y: currentY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
			page.drawText(item.unitCost, {
				x: margin + 200,
				y: currentY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
			page.drawText(item.quantity.toString(), {
				x: margin + 250,
				y: currentY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
			page.drawText(item.lineTotal, {
				x: margin + 300,
				y: currentY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
			currentY -= 20;
		});

		// Add summary
		currentY -= 20; // Add extra space before the summary
		page.drawText('Subtotal', {
			x: margin + 300,
			y: currentY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText(invoiceData.subtotal, {
			x: margin + 400,
			y: currentY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText(`Tax (${invoiceData.taxRate}%)`, {
			x: margin + 300,
			y: currentY - 20,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText(invoiceData.tax, {
			x: margin + 400,
			y: currentY - 20,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		page.drawText('Total (USD)', {
			x: margin + 300,
			y: currentY - 40,
			size: fontSize + 2,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText(invoiceData.total, {
			x: margin + 400,
			y: currentY - 40,
			size: fontSize + 2,
			font,
			color: rgb(0, 0, 0),
		});

		// Add payment schedule header
		const paymentScheduleHeaderY = currentY - 80;
		page.drawText('PAYMENT SCHEDULE', {
			x: margin,
			y: paymentScheduleHeaderY,
			size: fontSize + 2,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText('AMOUNT', {
			x: margin + 150,
			y: paymentScheduleHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText('DUE DATE', {
			x: margin + 250,
			y: paymentScheduleHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText('PAYMENT DATE', {
			x: margin + 350,
			y: paymentScheduleHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText('PAYMENT ID', {
			x: margin + 450,
			y: paymentScheduleHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		page.drawText('STATUS', {
			x: margin + 550,
			y: paymentScheduleHeaderY,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		// Add payment schedule items
		invoiceData.paymentSchedule.forEach((payment: any, index: number) => {
			const paymentScheduleItemY = paymentScheduleHeaderY - 20 * (index + 1);
			page.drawText(payment.amount, {
				x: margin + 150,
				y: paymentScheduleItemY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
			page.drawText(payment.dueDate, {
				x: margin + 250,
				y: paymentScheduleItemY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
			page.drawText(payment.paymentDate, {
				x: margin + 350,
				y: paymentScheduleItemY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
			page.drawText(payment.paymentId, {
				x: margin + 450,
				y: paymentScheduleItemY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
			page.drawText(payment.status, {
				x: margin + 550,
				y: paymentScheduleItemY,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
		});

		const pdfBytes = await pdfDoc.save();

		return new Response(pdfBytes, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'attachment; filename=invoice.pdf',
			},
		});
	} catch (error) {
		console.error('Error generating PDF:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
});

// curl --request POST 'http://localhost:54321/functions/v1/create-pdf-invoice' \
//   --header 'Content-Type: application/json' \
//   --data '{
//     "invoiceData": {
//       "businessName": "ByteLogic Agency",
//       "businessPhone": "(555) 555-5555",
//       "businessEmail": "cory@bytelogic.agency",
//       "invoiceNumber": "05142024-000001",
//       "poNumber": "- - -",
//       "dateIssued": "May 6, 2024",
//       "dueDate": "May 6, 2024",
//       "billTo": {
//         "name": "Cory Williams",
//         "organization": "Organization Name",
//         "address": "123 Cool Street",
//         "email": "cory321@gmail.com",
//         "phone": "555-555-5555"
//       },
//       "subtotal": "$500",
//       "taxRate": "8.75",
//       "tax": "$43.75",
//       "total": "$543.75",
//       "items": [
//         { "name": "Service Item Name", "description": "1 Hour", "unitCost": "$500", "quantity": 1, "lineTotal": "$500" }
//       ],
//       "paymentSchedule": [
//         { "amount": "$543.75", "dueDate": "May 6, 2024", "paymentDate": "", "paymentId": "#000004-001", "status": "" }
//       ]
//     }
//   }' --output invoice.pdf
