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
        pageMargins: [40, 40, 40, 40],
        content: [
            // Header
            {
                columns: [
                    {
                        text: businessName.toUpperCase(),
                        style: 'businessName',
                        width: '*'
                    },
                    {
                        text: 'LOAN AGREEMENT',
                        style: 'documentTitle',
                        alignment: 'right',
                        width: 'auto'
                    }
                ]
            },
            {
                text: lender?.address || '',
                style: 'businessAddress',
            },
            {
                canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#e5e7eb' }],
                margin: [0, 5, 0, 20]
            },

            // Agreement Text
            {
                text: [
                    'This Loan Agreement is made on ',
                    { text: new Date().toLocaleDateString(), bold: true },
                    ' between ',
                    { text: businessName, bold: true },
                    ' (hereinafter referred to as "Lender") and ',
                    { text: `${customer.firstName} ${customer.lastName}`, bold: true },
                    ' (hereinafter referred to as "Borrower").'
                ],
                style: 'bodyText',
                margin: [0, 10, 0, 20]
            },

            // Loan Details Table
            {
                table: {
                    widths: ['*', '*'],
                    body: [
                        [{ text: 'Loan Number', style: 'tableHeader' }, { text: loan.loanNumber, style: 'tableCell' }],
                        [{ text: 'Principal Amount', style: 'tableHeader' }, { text: `Rs. ${loan.principal.toLocaleString()}`, style: 'tableCell' }],
                        [{ text: 'Interest Rate (Monthly)', style: 'tableHeader' }, { text: `${loan.monthlyInterestRate}%`, style: 'tableCell' }],
                        [{ text: 'Loan Tenure', style: 'tableHeader' }, { text: `${loan.loanDurationMonths} Months`, style: 'tableCell' }],
                        [{ text: 'Monthly EMI', style: 'tableHeader' }, { text: `Rs. ${loan.monthlyEMI.toLocaleString()}`, style: 'tableCell' }],
                        [{ text: 'Start Date', style: 'tableHeader' }, { text: new Date(loan.startDate).toLocaleDateString(), style: 'tableCell' }],
                    ]
                },
                margin: [0, 0, 0, 30]
            },

            // Terms and Conditions
            { text: 'Terms and Conditions', style: 'sectionHeader' },
            {
                text: termsAndConditions,
                style: 'bodyText',
                margin: [0, 10, 0, 30]
            },

            // Signatures
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'AUTHORIZED SIGNATORY', style: 'signatureTitle' },
                            lender?.companyStamp ? {
                                image: lender.companyStamp,
                                width: 100,
                                margin: [0, 10, 0, 10]
                            } : { text: '\n\n\n\n' },
                            { text: businessName, bold: true },
                            { text: `PAN: ${lender?.panNumber || 'N/A'}`, fontSize: 8 }
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: 'BORROWER SIGNATURE', style: 'signatureTitle' },
                            customer.signature ? {
                                image: customer.signature,
                                width: 100,
                                margin: [0, 10, 0, 10]
                            } : { text: '\n\n\n\n' },
                            { text: `${customer.firstName} ${customer.lastName}`, bold: true },
                            { text: `Aadhaar: ${customer.aadhaarNumber || 'N/A'}`, fontSize: 8 }
                        ]
                    }
                ],
                margin: [0, 20, 0, 0]
            }
        ],
        styles: {
            businessName: { fontSize: 18, bold: true, color: '#0d9488' },
            businessAddress: { fontSize: 9, color: '#6b7280' },
            documentTitle: { fontSize: 16, bold: true, color: '#111827' },
            sectionHeader: { fontSize: 14, bold: true, color: '#111827', margin: [0, 10, 0, 5] },
            bodyText: { fontSize: 11, lineHeight: 1.5 },
            tableHeader: { bold: true, fillColor: '#f9fafb', padding: 8 },
            tableCell: { padding: 8 },
            signatureTitle: { fontSize: 10, bold: true, color: '#6b7280', margin: [0, 0, 0, 10] }
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
        pageMargins: [40, 40, 40, 40],
        content: [
            // Header
            {
                columns: [
                    {
                        text: businessName.toUpperCase(),
                        style: 'businessName',
                    },
                    {
                        text: 'STATEMENT OF ACCOUNT',
                        style: 'documentTitle',
                        alignment: 'right',
                    }
                ]
            },
            {
                canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#e5e7eb' }],
                margin: [0, 5, 0, 20]
            },

            // Summary
            {
                columns: [
                    {
                        stack: [
                            { text: 'BORROWER', style: 'label' },
                            { text: `${customer.firstName} ${customer.lastName}`, bold: true },
                            { text: `Phone: ${customer.phone}` }
                        ]
                    },
                    {
                        stack: [
                            { text: 'LOAN SUMMARY', style: 'label', alignment: 'right' },
                            { text: `Loan No: ${loan.loanNumber}`, bold: true, alignment: 'right' },
                            { text: `Outstanding: Rs. ${loan.remainingBalance.toLocaleString()}`, color: '#0d9488', bold: true, alignment: 'right' }
                        ]
                    }
                ],
                margin: [0, 0, 0, 30]
            },

            // Payments Table
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'DATE', style: 'tableHeader' },
                            { text: 'REFERENCE', style: 'tableHeader' },
                            { text: 'METHOD', style: 'tableHeader' },
                            { text: 'AMOUNT', style: 'tableHeader', alignment: 'right' },
                            { text: 'BALANCE', style: 'tableHeader', alignment: 'right' }
                        ],
                        ...payments.map(p => [
                            new Date(p.paymentDate).toLocaleDateString(),
                            p.referenceId || '-',
                            p.paymentMethod.replace('_', ' ').toUpperCase(),
                            `Rs. ${p.amountPaid.toLocaleString()}`,
                            `Rs. ${p.balanceAfterPayment.toLocaleString()}`
                        ])
                    ]
                }
            },

            // Footer Stamp
            {
                margin: [0, 50, 0, 0],
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
        styles: {
            businessName: { fontSize: 16, bold: true, color: '#0d9488' },
            documentTitle: { fontSize: 14, bold: true, color: '#111827' },
            label: { fontSize: 8, color: '#6b7280', margin: [0, 0, 0, 2] },
            tableHeader: { bold: true, fontSize: 10, fillColor: '#f3f4f6', padding: 5 }
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
                            { text: '✓ RECEIVED', fontSize: 10, bold: true, color: '#16a34a', alignment: 'right', margin: [0, 5, 0, 0] }
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
                            { text: `₹ ${payment.amountPaid.toLocaleString()}`, fontSize: 32, bold: true, color: '#16a34a', alignment: 'center' },
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
                            { text: `₹ ${loan.monthlyEMI?.toLocaleString() || 'N/A'}`, fontSize: 10, alignment: 'right', margin: [10, 8, 10, 8] }
                        ],
                        [
                            { text: 'Principal Component', fontSize: 10, color: '#4b5563', margin: [10, 8, 10, 8] },
                            { text: `₹ ${payment.principalComponent?.toLocaleString() || 'N/A'}`, fontSize: 10, alignment: 'right', margin: [10, 8, 10, 8] }
                        ],
                        [
                            { text: 'Interest Component', fontSize: 10, color: '#4b5563', margin: [10, 8, 10, 8] },
                            { text: `₹ ${payment.interestComponent?.toLocaleString() || 'N/A'}`, fontSize: 10, alignment: 'right', margin: [10, 8, 10, 8] }
                        ],
                        [
                            { text: 'Outstanding Balance After Payment', fontSize: 10, bold: true, color: '#111827', fillColor: '#fff7ed', margin: [10, 10, 10, 10] },
                            { text: `₹ ${payment.balanceAfterPayment?.toLocaleString() || loan.remainingBalance?.toLocaleString() || 'N/A'}`, fontSize: 11, bold: true, color: '#ea580c', fillColor: '#fff7ed', alignment: 'right', margin: [10, 10, 10, 10] }
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
                        width: 120,
                        stack: [
                            { text: 'CUSTOMER SIGNATURE', fontSize: 8, bold: true, color: '#6b7280', alignment: 'center', margin: [0, 0, 0, 8] },
                            customer.signature ? { image: customer.signature, width: 80, height: 40, alignment: 'center' } : { text: '', margin: [0, 40, 0, 0] },
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 1, lineColor: '#9ca3af' }], margin: [0, 8, 0, 5] },
                            { text: 'Borrower', fontSize: 8, color: '#4b5563', alignment: 'center' }
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
