const PdfPrinter = require('pdfmake');

// Define standard fonts
const fonts = {
    Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};

const printer = new PdfPrinter(fonts);

/**
 * Generate Loan Agreement PDF
 */
const generateLoanAgreement = async (loan, lender) => {
    const businessName = lender?.businessName || 'MoneyLender';
    const customer = loan.customerId;
    const termsAndConditions = lender?.termsAndConditions || '1. The borrower shall pay the EMI on time.\n2. Late payments will incur penalties.';

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        header: {
            margin: [40, 20, 40, 0],
            columns: [
                { text: businessName.toUpperCase(), style: 'headerBusinessName' },
                { text: 'LOAN AGREEMENT', style: 'headerDocTitle', alignment: 'right' }
            ]
        },
        content: [
            // Decorative Line
            {
                canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 3, color: '#0d9488' }],
                margin: [0, 0, 0, 20]
            },

            // Parties Section
            {
                style: 'boxContainer',
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            stack: [
                                { text: 'AGREEMENT BETWEEN', style: 'sectionLabel' },
                                {
                                    columns: [
                                        {
                                            width: '*',
                                            stack: [
                                                { text: 'LENDER', style: 'subLabel' },
                                                { text: businessName, style: 'partyName' },
                                                { text: lender?.address || '', style: 'partyAddress' }
                                            ]
                                        },
                                        {
                                            width: '*',
                                            stack: [
                                                { text: 'BORROWER', style: 'subLabel' },
                                                { text: `${customer.firstName} ${customer.lastName}`, style: 'partyName' },
                                                { text: `Phone: ${customer.phone}`, style: 'partyAddress' },
                                                { text: customer.address ? `${customer.address.street || ''}, ${customer.address.city || ''}` : '', style: 'partyAddress' }
                                            ]
                                        }
                                    ]
                                },
                                { text: `Date of Agreement: ${new Date().toLocaleDateString()}`, style: 'dateLabel', margin: [0, 10, 0, 0] }
                            ]
                        }
                    ]]
                },
                layout: 'noBorders'
            },

            // Loan Details Section
            { text: 'KEY LOAN TERMS', style: 'sectionHeader', margin: [0, 20, 0, 10] },
            {
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            { text: 'Loan Account Number', style: 'tableLabel' },
                            { text: loan.loanNumber, style: 'tableValue', bold: true }
                        ],
                        [
                            { text: 'Principal Amount', style: 'tableLabel' },
                            { text: `Rs. ${loan.principal.toLocaleString()}`, style: 'tableValue' }
                        ],
                        [
                            { text: 'Interest Rate', style: 'tableLabel' },
                            { text: `${loan.monthlyInterestRate}% per month`, style: 'tableValue' }
                        ],
                        [
                            { text: 'Tenure', style: 'tableLabel' },
                            { text: `${loan.loanDurationMonths} Months`, style: 'tableValue' }
                        ],
                        [
                            { text: 'Monthly EMI', style: 'tableLabel' },
                            { text: `Rs. ${loan.monthlyEMI.toLocaleString()}`, style: 'tableValue', bold: true, color: '#0d9488' }
                        ],
                        [
                            { text: 'Repayment Start Date', style: 'tableLabel' },
                            { text: new Date(loan.startDate).toLocaleDateString(), style: 'tableValue' }
                        ],
                    ]
                },
                layout: {
                    fillColor: (i) => (i % 2 === 0) ? '#f9fafb' : null,
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: () => '#e5e7eb'
                }
            },

            // Terms and Conditions
            { text: 'TERMS AND CONDITIONS', style: 'sectionHeader', margin: [0, 25, 0, 10] },
            {
                text: termsAndConditions,
                style: 'bodyText',
                alignment: 'justify'
            },

            // Signatures
            {
                margin: [0, 50, 0, 0],
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            {
                                stack: [
                                    { text: 'AUTHORIZED SIGNATORY', style: 'signatureTitle' },
                                    lender?.companyStamp ? {
                                        image: lender.companyStamp,
                                        width: 100,
                                        margin: [0, 10, 0, 10]
                                    } : { text: '\n\n\n\n' },
                                    { text: businessName, bold: true },
                                    { text: `PAN: ${lender?.panNumber || 'N/A'}`, fontSize: 8, color: '#6b7280' }
                                ]
                            },
                            {
                                stack: [
                                    { text: 'BORROWER SIGNATURE', style: 'signatureTitle' },
                                    customer.signature ? {
                                        image: customer.signature,
                                        width: 100,
                                        margin: [0, 10, 0, 10]
                                    } : { text: '\n\n\n\n' },
                                    { text: `${customer.firstName} ${customer.lastName}`, bold: true },
                                    { text: `Aadhaar: ${customer.aadhaarNumber || 'N/A'}`, fontSize: 8, color: '#6b7280' }
                                ]
                            }
                        ]
                    ]
                },
                layout: 'noBorders'
            }
        ],
        footer: (currentPage, pageCount) => ({
            columns: [
                { text: `Generated on ${new Date().toLocaleDateString()}`, style: 'footerText' },
                { text: `Page ${currentPage} of ${pageCount}`, style: 'footerText', alignment: 'right' }
            ],
            margin: [40, 20, 40, 0]
        }),
        styles: {
            headerBusinessName: { fontSize: 12, bold: true, color: '#0d9488' },
            headerDocTitle: { fontSize: 12, bold: true, color: '#111827' },
            sectionLabel: { fontSize: 10, bold: true, color: '#6b7280', margin: [0, 0, 0, 10] },
            subLabel: { fontSize: 8, bold: true, color: '#9ca3af', margin: [0, 0, 0, 2] },
            partyName: { fontSize: 12, bold: true, color: '#111827' },
            partyAddress: { fontSize: 9, color: '#4b5563' },
            dateLabel: { fontSize: 9, italics: true, color: '#6b7280', alignment: 'right' },
            sectionHeader: { fontSize: 11, bold: true, color: '#111827', characterSpacing: 0.5 },
            tableLabel: { fontSize: 10, color: '#4b5563', margin: [5, 8, 0, 8] },
            tableValue: { fontSize: 10, color: '#111827', alignment: 'right', margin: [0, 8, 5, 8] },
            bodyText: { fontSize: 10, lineHeight: 1.4, color: '#374151' },
            signatureTitle: { fontSize: 9, bold: true, color: '#6b7280', decoration: 'underline' },
            footerText: { fontSize: 8, color: '#9ca3af' },
            boxContainer: { margin: [0, 0, 0, 20], color: '#f3f4f6' }
        },
        defaultStyle: { font: 'Roboto' }
    };

    return printer.createPdfKitDocument(docDefinition);
};

/**
 * Generate Loan Statement PDF
 */
const generateLoanStatement = async (loan, lender, payments) => {
    const businessName = lender?.businessName || 'MoneyLender';
    const customer = loan.customerId;

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        header: {
            margin: [40, 20, 40, 0],
            columns: [
                { text: businessName.toUpperCase(), style: 'headerBusinessName' },
                { text: 'STATEMENT OF ACCOUNT', style: 'headerDocTitle', alignment: 'right' }
            ]
        },
        content: [
            // Decorative Line
            {
                canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 3, color: '#0d9488' }],
                margin: [0, 0, 0, 20]
            },

            // Summary Box
            {
                style: 'summaryBox',
                layout: 'noBorders',
                table: {
                    widths: ['*', '*'],
                    body: [[
                        {
                            stack: [
                                { text: 'CUSTOMER DETAILS', style: 'boxLabel' },
                                { text: `${customer.firstName} ${customer.lastName}`, style: 'boxValue', bold: true },
                                { text: customer.phone, style: 'boxValue' },
                                { text: customer.email || '', style: 'boxValue' }
                            ],
                            margin: [15, 15, 15, 15]
                        },
                        {
                            stack: [
                                { text: 'LOAN SUMMARY', style: 'boxLabel', alignment: 'right' },
                                { text: `Loan No: ${loan.loanNumber}`, style: 'boxValue', alignment: 'right' },
                                { text: `Total Due: Rs. ${loan.remainingBalance.toLocaleString()}`, style: 'boxValue', alignment: 'right', bold: true, color: '#0d9488' }
                            ],
                            margin: [15, 15, 15, 15]
                        }
                    ]]
                }
            },

            // Transactions Table
            { text: 'TRANSACTION HISTORY', style: 'sectionHeader', margin: [0, 20, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'DATE', style: 'tableHeader' },
                            { text: 'REFERENCE', style: 'tableHeader' },
                            { text: 'METHOD', style: 'tableHeader' },
                            { text: 'PAID', style: 'tableHeader', alignment: 'right' },
                            { text: 'BALANCE', style: 'tableHeader', alignment: 'right' }
                        ],
                        ...payments.map((p, index) => [
                            { text: new Date(p.paymentDate).toLocaleDateString(), style: 'tableData', fillColor: index % 2 === 0 ? '#f9fafb' : null },
                            { text: p.referenceId || '-', style: 'tableData', fillColor: index % 2 === 0 ? '#f9fafb' : null },
                            { text: p.paymentMethod.replace('_', ' ').toUpperCase(), style: 'tableData', fillColor: index % 2 === 0 ? '#f9fafb' : null },
                            { text: `Rs. ${p.amountPaid.toLocaleString()}`, style: 'tableData', alignment: 'right', fillColor: index % 2 === 0 ? '#f9fafb' : null },
                            { text: `Rs. ${p.balanceAfterPayment.toLocaleString()}`, style: 'tableData', alignment: 'right', fillColor: index % 2 === 0 ? '#f9fafb' : null }
                        ])
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === 1) ? 1 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: () => '#e5e7eb'
                }
            },

            // Footer Stamp
            {
                margin: [0, 40, 0, 0],
                stack: [
                    lender?.companyStamp ? {
                        image: lender.companyStamp,
                        width: 80,
                        alignment: 'right'
                    } : { text: '' },
                    { text: 'Authorized Signatory', fontSize: 8, alignment: 'right', margin: [0, 5, 0, 0] }
                ]
            }
        ],
        footer: (currentPage, pageCount) => ({
            columns: [
                { text: `${businessName} - Statement of Account`, style: 'footerText' },
                { text: `Page ${currentPage} of ${pageCount}`, style: 'footerText', alignment: 'right' }
            ],
            margin: [40, 20, 40, 0]
        }),
        styles: {
            headerBusinessName: { fontSize: 12, bold: true, color: '#0d9488' },
            headerDocTitle: { fontSize: 12, bold: true, color: '#111827' },
            sectionHeader: { fontSize: 11, bold: true, color: '#111827' },
            summaryBox: { fillColor: '#f9fafb' },
            boxLabel: { fontSize: 8, bold: true, color: '#6b7280', margin: [0, 0, 0, 5] },
            boxValue: { fontSize: 10, color: '#1f2937', margin: [0, 0, 0, 2] },
            tableHeader: { fontSize: 9, bold: true, color: '#ffffff', fillColor: '#0d9488', margin: [4, 6, 4, 6] },
            tableData: { fontSize: 9, color: '#374151', margin: [4, 6, 4, 6] },
            footerText: { fontSize: 8, color: '#9ca3af' }
        },
        defaultStyle: { font: 'Roboto' }
    };

    return printer.createPdfKitDocument(docDefinition);
};

/**
 * Generate Payment Receipt PDF
 */
const generatePaymentReceipt = async (payment, lender) => {
    const { loanId: loan, customerId: customer } = payment;
    const businessName = lender?.businessName || 'MoneyLender';
    const paymentDate = new Date(payment.paymentDate);

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 60],
        content: [
            // Header
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: businessName.toUpperCase(), fontSize: 22, bold: true, color: '#0d9488' },
                            { text: lender?.address || '', fontSize: 9, color: '#6b7280', margin: [0, 3, 0, 0] },
                            { text: `Phone: ${lender?.phone || 'N/A'} | Email: ${lender?.email || 'N/A'}`, fontSize: 9, color: '#6b7280' }
                        ]
                    },
                    {
                        width: 'auto',
                        stack: [
                            { text: 'PAYMENT', fontSize: 24, bold: true, color: '#16a34a', alignment: 'right' },
                            { text: 'RECEIPT', fontSize: 24, bold: true, color: '#111827', alignment: 'right' },
                            { text: 'RECEIVED', fontSize: 10, bold: true, color: '#16a34a', alignment: 'right', margin: [0, 5, 0, 0] }
                        ]
                    }
                ]
            },

            // Decorative Line
            {
                canvas: [
                    { type: 'rect', x: 0, y: 10, w: 515, h: 3, color: '#16a34a' }
                ],
                margin: [0, 10, 0, 25]
            },

            // Receipt Info & Customer Details
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'RECEIVED FROM', fontSize: 10, bold: true, color: '#16a34a', margin: [0, 0, 0, 8] },
                            { text: `${customer.firstName} ${customer.lastName}`, fontSize: 14, bold: true, color: '#111827' },
                            { text: customer.phone || '', fontSize: 10, color: '#4b5563', margin: [0, 3, 0, 0] },
                            { text: customer.email || '', fontSize: 10, color: '#4b5563' }
                        ]
                    },
                    {
                        width: 180,
                        table: {
                            widths: ['*', 'auto'],
                            body: [
                                [
                                    { text: 'Receipt No:', fontSize: 10, color: '#6b7280', border: [false, false, false, false] },
                                    { text: payment.referenceId || `RCP-${payment._id.toString().substr(-6).toUpperCase()}`, fontSize: 10, bold: true, alignment: 'right', border: [false, false, false, false] }
                                ],
                                [
                                    { text: 'Payment Date:', fontSize: 10, color: '#6b7280', border: [false, false, false, false] },
                                    { text: paymentDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), fontSize: 10, bold: true, alignment: 'right', border: [false, false, false, false] }
                                ],
                                [
                                    { text: 'Loan Account:', fontSize: 10, color: '#6b7280', border: [false, false, false, false] },
                                    { text: loan.loanNumber, fontSize: 10, bold: true, color: '#0d9488', alignment: 'right', border: [false, false, false, false] }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
                margin: [0, 0, 0, 25]
            },

            // Amount Received Box
            {
                margin: [0, 0, 0, 25],
                table: {
                    widths: ['*'],
                    body: [[{
                        fillColor: '#f0fdf4',
                        stack: [
                            { text: 'AMOUNT RECEIVED', fontSize: 12, bold: true, color: '#166534', alignment: 'center', margin: [0, 0, 0, 8] },
                            { text: `Rs. ${payment.amountPaid.toLocaleString()}`, fontSize: 32, bold: true, color: '#16a34a', alignment: 'center' },
                            { text: `(${numberToWords(payment.amountPaid)} Rupees Only)`, fontSize: 10, color: '#4b5563', alignment: 'center', margin: [0, 8, 0, 0], italics: true }
                        ],
                        margin: [20, 20, 20, 20]
                    }]]
                },
                layout: {
                    hLineWidth: () => 2,
                    vLineWidth: () => 2,
                    hLineColor: () => '#16a34a',
                    vLineColor: () => '#16a34a'
                }
            },

            // Payment Details Table
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto'],
                    body: [
                        [
                            { text: 'PAYMENT DETAILS', bold: true, fillColor: '#f3f4f6', color: '#374151', margin: [10, 10, 10, 10], colSpan: 2 },
                            {}
                        ],
                        [
                            { text: 'Payment Method', fontSize: 10, color: '#4b5563', margin: [10, 8, 10, 8] },
                            { text: (payment.paymentMethod || 'Cash').replace('_', ' ').toUpperCase(), fontSize: 10, bold: true, alignment: 'right', margin: [10, 8, 10, 8] }
                        ],
                        [
                            { text: 'EMI Amount', fontSize: 10, color: '#4b5563', margin: [10, 8, 10, 8] },
                            { text: `Rs. ${loan.monthlyEMI?.toLocaleString() || 'N/A'}`, fontSize: 10, alignment: 'right', margin: [10, 8, 10, 8] }
                        ],
                        [
                            { text: 'Principal Component', fontSize: 10, color: '#4b5563', margin: [10, 8, 10, 8] },
                            { text: `Rs. ${payment.principalPortion?.toLocaleString() || '0'}`, fontSize: 10, alignment: 'right', margin: [10, 8, 10, 8] }
                        ],
                        [
                            { text: 'Interest Component', fontSize: 10, color: '#4b5563', margin: [10, 8, 10, 8] },
                            { text: `Rs. ${payment.interestPortion?.toLocaleString() || '0'}`, fontSize: 10, alignment: 'right', margin: [10, 8, 10, 8] }
                        ],
                        [
                            { text: 'Outstanding Balance After Payment', fontSize: 10, bold: true, color: '#111827', fillColor: '#fff7ed', margin: [10, 10, 10, 10] },
                            { text: `Rs. ${payment.balanceAfterPayment?.toLocaleString()}`, fontSize: 11, bold: true, color: '#ea580c', fillColor: '#fff7ed', alignment: 'right', margin: [10, 10, 10, 10] }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: () => '#e5e7eb'
                }
            },

            // Customer Signature Section
            {
                margin: [0, 40, 0, 0],
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'Thank you for your payment!', fontSize: 12, bold: true, color: '#16a34a' },
                            { text: 'This receipt is computer generated and valid without signature.', fontSize: 9, color: '#9ca3af', margin: [0, 5, 0, 0] }
                        ]
                    },
                    {
                        width: 120,
                        stack: [
                            { text: 'CUSTOMER ACKNOWLEDGEMENT', fontSize: 8, bold: true, color: '#6b7280', alignment: 'center', margin: [0, 0, 0, 8] },
                            customer.signature ? { image: customer.signature, width: 80, height: 40, alignment: 'center' } : { text: '', margin: [0, 40, 0, 0] },
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 1, lineColor: '#9ca3af' }], margin: [0, 8, 0, 5] },
                            { text: 'Payer', fontSize: 8, color: '#4b5563', alignment: 'center' }
                        ],
                        alignment: 'center'
                    },
                    {
                        width: 120,
                        stack: [
                            { text: 'AUTHORIZED SIGNATORY', fontSize: 8, bold: true, color: '#6b7280', alignment: 'center', margin: [0, 0, 0, 8] },
                            lender?.companyStamp ? { image: lender.companyStamp, width: 80, height: 40, alignment: 'center' } : { text: '', margin: [0, 40, 0, 0] },
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 1, lineColor: '#9ca3af' }], margin: [0, 8, 0, 5] },
                            { text: 'For ' + businessName, fontSize: 8, color: '#4b5563', alignment: 'center' }
                        ],
                        alignment: 'center',
                        margin: [20, 0, 0, 0]
                    }
                ]
            }
        ],
        footer: (currentPage, pageCount) => ({
            columns: [
                { text: `Receipt generated on ${new Date().toLocaleDateString('en-IN')}`, fontSize: 8, color: '#9ca3af', margin: [40, 0, 0, 0] },
                { text: `Page ${currentPage} of ${pageCount}`, fontSize: 8, color: '#9ca3af', alignment: 'right', margin: [0, 0, 40, 0] }
            ]
        }),
        defaultStyle: { font: 'Roboto' }
    };

    return printer.createPdfKitDocument(docDefinition);
};

// Helper function to convert number to words
const numberToWords = (num) => {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (n) => {
        if (n === 0) return '';
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    const numInt = Math.floor(num);
    if (numInt >= 10000000) return convertLessThanThousand(Math.floor(numInt / 10000000)) + ' Crore ' + numberToWords(numInt % 10000000);
    if (numInt >= 100000) return convertLessThanThousand(Math.floor(numInt / 100000)) + ' Lakh ' + numberToWords(numInt % 100000);
    if (numInt >= 1000) return convertLessThanThousand(Math.floor(numInt / 1000)) + ' Thousand ' + convertLessThanThousand(numInt % 1000);
    return convertLessThanThousand(numInt);
};

/**
 * Generate No Objection Certificate (NOC)
 */
const generateLoanClosureNOC = async (loan, lender) => {
    const businessName = lender?.businessName || 'MoneyLender';
    const customerName = `${loan.customerId.firstName} ${loan.customerId.lastName}`;

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [60, 60, 60, 60],
        content: [
            { text: businessName.toUpperCase(), fontSize: 20, bold: true, color: '#0d9488', alignment: 'center' },
            { text: lender?.address || '', fontSize: 9, color: '#6b7280', alignment: 'center', margin: [0, 5, 0, 0] },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 475, y2: 5, lineWidth: 1.5, lineColor: '#0d9488' }], margin: [0, 10, 0, 40] },
            { text: 'NO OBJECTION CERTIFICATE', fontSize: 18, bold: true, alignment: 'center', decoration: 'underline', margin: [0, 0, 0, 40] },
            {
                text: [
                    { text: 'To Whomsoever It May Concern,\n\n', bold: true },
                    'This is to certify that ',
                    { text: customerName, bold: true },
                    ', has fully settled and repaid the loan availed from ',
                    { text: businessName, bold: true },
                    ' under Loan Account Number ',
                    { text: loan.loanNumber, bold: true },
                    '.\n\n',
                    'As on ',
                    { text: new Date().toLocaleDateString(), bold: true },
                    ', there are no outstanding dues, interest, or penalties pending against the aforementioned loan account.\n\n',
                    'We hereby declare that we have ',
                    { text: 'NO OBJECTION', bold: true },
                    ' towards the closure of this loan account.\n\n\n'
                ],
                style: 'bodyText'
            },
            {
                margin: [0, 60, 0, 0],
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'For ' + businessName, bold: true },
                            lender?.companyStamp ? { image: lender.companyStamp, width: 100, margin: [0, 10, 0, 0] } : { text: '\n\n\n' },
                            { text: '(Authorized Signatory)', fontSize: 9, italics: true }
                        ]
                    },
                    {
                        width: 'auto',
                        stack: [
                            { text: 'Date: ' + new Date().toLocaleDateString() }
                        ],
                        alignment: 'right'
                    }
                ]
            }
        ],
        styles: { bodyText: { fontSize: 12, lineHeight: 1.6 } },
        defaultStyle: { font: 'Roboto' }
    };

    return printer.createPdfKitDocument(docDefinition);
};

/**
 * Generate Invoice PDF - Professional Design
 */
const generateInvoicePDF = async (invoice, lender) => {
    const businessName = lender?.businessName || 'MoneyLender';
    const customer = invoice.customerId;
    const loan = invoice.loanId;
    const invoiceDate = new Date(invoice.invoiceDate || invoice.createdAt);
    const dueDate = new Date(invoice.dueDate);
    const isOverdue = dueDate < new Date() && invoice.status !== 'paid';

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 60],
        content: [
            // Header with Business Info
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: businessName.toUpperCase(), fontSize: 22, bold: true, color: '#0d9488' },
                            { text: lender?.address || '', fontSize: 9, color: '#6b7280', margin: [0, 3, 0, 0] },
                            { text: `Phone: ${lender?.phone || 'N/A'}`, fontSize: 9, color: '#6b7280' },
                            { text: `Email: ${lender?.email || 'N/A'}`, fontSize: 9, color: '#6b7280' }
                        ]
                    },
                    {
                        width: 'auto',
                        stack: [
                            {
                                text: 'INVOICE',
                                fontSize: 28,
                                bold: true,
                                color: '#111827',
                                alignment: 'right'
                            },
                            {
                                text: isOverdue ? 'OVERDUE' : (invoice.status === 'paid' ? 'PAID' : 'PENDING'),
                                fontSize: 12,
                                bold: true,
                                color: isOverdue ? '#dc2626' : (invoice.status === 'paid' ? '#16a34a' : '#f59e0b'),
                                alignment: 'right',
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    }
                ]
            },

            // Decorative Line
            {
                canvas: [
                    { type: 'rect', x: 0, y: 10, w: 515, h: 3, color: '#0d9488' }
                ],
                margin: [0, 10, 0, 25]
            },

            // Invoice Details & Customer Info
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'BILL TO', fontSize: 10, bold: true, color: '#0d9488', margin: [0, 0, 0, 8] },
                            { text: `${customer.firstName} ${customer.lastName}`, fontSize: 14, bold: true, color: '#111827' },
                            { text: customer.phone || '', fontSize: 10, color: '#4b5563', margin: [0, 3, 0, 0] },
                            { text: customer.email || '', fontSize: 10, color: '#4b5563' },
                            customer.address ? {
                                text: `${customer.address.street || ''}, ${customer.address.city || ''}, ${customer.address.state || ''}`,
                                fontSize: 9,
                                color: '#6b7280',
                                margin: [0, 3, 0, 0]
                            } : {}
                        ]
                    },
                    {
                        width: 180,
                        table: {
                            widths: ['*', 'auto'],
                            body: [
                                [
                                    { text: 'Invoice No:', fontSize: 10, color: '#6b7280', border: [false, false, false, false] },
                                    { text: invoice.invoiceNumber, fontSize: 10, bold: true, alignment: 'right', border: [false, false, false, false] }
                                ],
                                [
                                    { text: 'Invoice Date:', fontSize: 10, color: '#6b7280', border: [false, false, false, false] },
                                    { text: invoiceDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), fontSize: 10, alignment: 'right', border: [false, false, false, false] }
                                ],
                                [
                                    { text: 'Due Date:', fontSize: 10, color: '#6b7280', border: [false, false, false, false] },
                                    { text: dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), fontSize: 10, bold: true, color: isOverdue ? '#dc2626' : '#111827', alignment: 'right', border: [false, false, false, false] }
                                ],
                                [
                                    { text: 'Loan Account:', fontSize: 10, color: '#6b7280', border: [false, false, false, false] },
                                    { text: loan.loanNumber, fontSize: 10, bold: true, color: '#0d9488', alignment: 'right', border: [false, false, false, false] }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
                margin: [0, 0, 0, 30]
            },

            // Items Table
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto'],
                    body: [
                        [
                            { text: '#', bold: true, fillColor: '#0d9488', color: '#ffffff', alignment: 'center', margin: [8, 10, 8, 10] },
                            { text: 'DESCRIPTION', bold: true, fillColor: '#0d9488', color: '#ffffff', margin: [10, 10, 10, 10] },
                            { text: 'EMI DUE', bold: true, fillColor: '#0d9488', color: '#ffffff', alignment: 'center', margin: [10, 10, 10, 10] },
                            { text: 'AMOUNT', bold: true, fillColor: '#0d9488', color: '#ffffff', alignment: 'right', margin: [10, 10, 10, 10] }
                        ],
                        [
                            { text: '1', alignment: 'center', margin: [8, 12, 8, 12], color: '#4b5563' },
                            {
                                stack: [
                                    { text: 'Monthly EMI Payment', fontSize: 11, bold: true, color: '#111827' },
                                    { text: `Loan: ${loan.loanNumber} | Principal: Rs. ${loan.principal?.toLocaleString() || 'N/A'}`, fontSize: 9, color: '#6b7280', margin: [0, 3, 0, 0] }
                                ],
                                margin: [10, 10, 10, 10]
                            },
                            { text: dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), alignment: 'center', margin: [10, 12, 10, 12], color: '#4b5563' },
                            { text: `Rs. ${invoice.amountDue.toLocaleString()}`, alignment: 'right', margin: [10, 12, 10, 12], bold: true, color: '#111827' }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0,
                    vLineWidth: () => 0,
                    hLineColor: () => '#e5e7eb',
                    paddingLeft: () => 0,
                    paddingRight: () => 0
                }
            },

            // Summary Box
            {
                margin: [0, 20, 0, 0],
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 200,
                        table: {
                            widths: ['*', 'auto'],
                            body: [
                                [
                                    { text: 'Subtotal:', fontSize: 10, color: '#6b7280', border: [false, false, false, false], margin: [0, 5, 0, 5] },
                                    { text: `Rs. ${invoice.amountDue.toLocaleString()}`, fontSize: 10, alignment: 'right', border: [false, false, false, false], margin: [0, 5, 0, 5] }
                                ],
                                [
                                    { text: 'Paid:', fontSize: 10, color: '#16a34a', border: [false, false, false, false], margin: [0, 5, 0, 5] },
                                    { text: `Rs. ${(invoice.amountPaid || 0).toLocaleString()}`, fontSize: 10, color: '#16a34a', alignment: 'right', border: [false, false, false, false], margin: [0, 5, 0, 5] }
                                ],
                                [
                                    { text: 'TOTAL DUE:', fontSize: 12, bold: true, color: '#111827', fillColor: '#f3f4f6', border: [false, false, false, false], margin: [8, 10, 8, 10] },
                                    { text: `Rs. ${(invoice.balanceDue || invoice.amountDue).toLocaleString()}`, fontSize: 14, bold: true, color: '#0d9488', fillColor: '#f3f4f6', alignment: 'right', border: [false, false, false, false], margin: [8, 10, 8, 10] }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ]
            },

            // Payment Information & Customer Signature
            {
                margin: [0, 40, 0, 0],
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'PAYMENT INFORMATION', fontSize: 10, bold: true, color: '#0d9488', margin: [0, 0, 0, 10] },
                            { text: `Bank: ${lender?.bankName || 'Contact for details'}`, fontSize: 9, color: '#4b5563' },
                            { text: `Account: ${lender?.accountNumber || 'N/A'}`, fontSize: 9, color: '#4b5563' },
                            { text: `IFSC: ${lender?.ifscCode || 'N/A'}`, fontSize: 9, color: '#4b5563' },
                            { text: `UPI: ${lender?.upiId || 'N/A'}`, fontSize: 9, color: '#4b5563', margin: [0, 0, 0, 10] }
                        ]
                    },
                    {
                        width: 140,
                        stack: [
                            { text: 'CUSTOMER SIGNATURE', fontSize: 8, bold: true, color: '#6b7280', alignment: 'center', margin: [0, 0, 0, 8] },
                            customer.signature ? { image: customer.signature, width: 90, alignment: 'center', margin: [0, 5, 0, 5] } : { text: '', margin: [0, 40, 0, 0] },
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1, lineColor: '#9ca3af' }], margin: [0, 8, 0, 5] },
                            { text: 'Borrower', fontSize: 8, color: '#4b5563', alignment: 'center' }
                        ],
                        alignment: 'center'
                    },
                    {
                        width: 140,
                        stack: [
                            { text: 'AUTHORIZED SIGNATORY', fontSize: 8, bold: true, color: '#6b7280', alignment: 'center', margin: [0, 0, 0, 8] },
                            lender?.companyStamp ? { image: lender.companyStamp, width: 90, alignment: 'center', margin: [0, 5, 0, 5] } : { text: '', margin: [0, 40, 0, 0] },
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1, lineColor: '#9ca3af' }], margin: [0, 8, 0, 5] },
                            { text: 'For ' + businessName, fontSize: 8, color: '#4b5563', alignment: 'center' }
                        ],
                        alignment: 'center',
                        margin: [20, 0, 0, 0]
                    }
                ]
            },

            // Terms & Notes
            {
                margin: [0, 30, 0, 0],
                stack: [
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#e5e7eb' }] },
                    { text: 'TERMS & CONDITIONS', fontSize: 9, bold: true, color: '#6b7280', margin: [0, 15, 0, 5] },
                    { text: '1. Payment is due by the date specified above. Late payments may incur additional charges.', fontSize: 8, color: '#9ca3af' },
                    { text: '2. Please include the invoice number as reference when making payment.', fontSize: 8, color: '#9ca3af' },
                    { text: '3. This is a computer-generated invoice and does not require a physical signature.', fontSize: 8, color: '#9ca3af' }
                ]
            }
        ],
        footer: (currentPage, pageCount) => ({
            columns: [
                { text: `Generated on ${new Date().toLocaleDateString('en-IN')}`, fontSize: 8, color: '#9ca3af', margin: [40, 0, 0, 0] },
                { text: `Page ${currentPage} of ${pageCount}`, fontSize: 8, color: '#9ca3af', alignment: 'right', margin: [0, 0, 40, 0] }
            ]
        }),
        styles: {
            tableHeader: { bold: true, fontSize: 10, color: '#ffffff' }
        },
        defaultStyle: { font: 'Roboto' }
    };

    return printer.createPdfKitDocument(docDefinition);
};

module.exports = {
    generateLoanAgreement,
    generateLoanStatement,
    generatePaymentReceipt,
    generateLoanClosureNOC,
    generateInvoicePDF
};
