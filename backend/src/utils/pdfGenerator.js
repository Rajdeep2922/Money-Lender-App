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

    // Debug: Check if lender has companyStamp
    console.log('PDF Generation - Lender has companyStamp:', !!lender?.companyStamp);

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 45],
        header: {
            margin: [40, 20, 40, 0],
            columns: [
                { text: businessName.toUpperCase(), fontSize: 12, bold: true, color: '#0d9488' },
                { text: 'LOAN AGREEMENT', fontSize: 12, bold: true, color: '#111827', alignment: 'right' }
            ]
        },
        content: [
            // Decorative Line
            {
                canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 2, color: '#0d9488' }],
                margin: [0, 0, 0, 15]
            },

            // Parties Section - Premium Table Layout
            {
                table: {
                    widths: ['*', 20, '*'],
                    body: [
                        [
                            // Lender Column
                            {
                                stack: [
                                    { text: 'LENDER DETAILS', fontSize: 9, bold: true, color: '#0d9488', margin: [0, 0, 0, 5] },
                                    { text: businessName, fontSize: 11, bold: true, color: '#111827', margin: [0, 0, 0, 2] },
                                    { text: lender?.address || 'N/A', fontSize: 9, color: '#4b5563' },
                                    { text: `Phone: ${lender?.phone || 'N/A'}`, fontSize: 9, color: '#4b5563', margin: [0, 2, 0, 0] },
                                    { text: `Email: ${lender?.email || 'N/A'}`, fontSize: 9, color: '#4b5563' }
                                ],
                                fillColor: '#f0fdfa', // Teal-50
                                margin: [10, 10, 10, 10],
                                border: [true, true, true, true],
                                borderColor: ['#ccfbf1', '#ccfbf1', '#ccfbf1', '#ccfbf1']
                            },
                            // Proper Spacer
                            { text: '', border: [false, false, false, false] },
                            // Borrower Column
                            {
                                stack: [
                                    { text: 'BORROWER DETAILS', fontSize: 9, bold: true, color: '#6b7280', margin: [0, 0, 0, 5] },
                                    {
                                        table: {
                                            widths: ['*', 110], // Increased column width for larger photo
                                            body: [
                                                [
                                                    {
                                                        stack: [
                                                            { text: `${customer.firstName} ${customer.lastName}`, fontSize: 13, bold: true, color: '#111827', margin: [0, 0, 0, 3] }, // Increased name size
                                                            { text: `Phone: ${customer.phone}`, fontSize: 10, color: '#4b5563', margin: [0, 0, 0, 2] },
                                                            { text: `Email: ${customer.email || 'N/A'}`, fontSize: 10, color: '#4b5563', margin: [0, 0, 0, 2] },
                                                            { text: customer.address?.city ? `${customer.address.city}, ${customer.address.state}` : '', fontSize: 9, color: '#6b7280' }
                                                        ],
                                                        border: [false, false, false, false],
                                                        verticalAlignment: 'middle', // Vertically center text
                                                        margin: [0, 5, 0, 5]
                                                    },
                                                    {
                                                        // Photo Cell
                                                        stack: [
                                                            customer.photo ? {
                                                                image: customer.photo,
                                                                fit: [90, 110], // Significantly larger photo
                                                                alignment: 'right'
                                                            } : { text: 'No Photo', fontSize: 8, color: '#9ca3af', alignment: 'right' }
                                                        ],
                                                        border: [false, false, false, false],
                                                        verticalAlignment: 'middle', // Vertically center photo
                                                        margin: [0, 0, 5, 0] // Right margin
                                                    }
                                                ]
                                            ]
                                        }
                                    }
                                ],
                                fillColor: '#f9fafb', // Gray-50
                                margin: [10, 10, 10, 10],
                                border: [true, true, true, true],
                                borderColor: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb']
                            }
                        ]
                    ]
                },
                layout: {
                    defaultBorder: false,
                },
                margin: [0, 0, 0, 20]
            },

            // Date
            { text: `Agreement Date: ${new Date().toLocaleDateString()}`, fontSize: 9, italics: true, color: '#6b7280', alignment: 'right', margin: [0, 0, 0, 15] },

            // Loan Details Section
            { text: 'KEY LOAN TERMS', fontSize: 10, bold: true, color: '#111827', margin: [0, 0, 0, 8] },
            {
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            { text: 'Loan Number', fontSize: 9, color: '#4b5563', margin: [5, 6, 0, 6] },
                            { text: loan.loanNumber, fontSize: 9, bold: true, color: '#111827', alignment: 'right', margin: [0, 6, 5, 6] }
                        ],
                        [
                            { text: 'Principal Amount', fontSize: 9, color: '#4b5563', margin: [5, 6, 0, 6] },
                            { text: `Rs. ${loan.principal.toLocaleString()}`, fontSize: 9, color: '#111827', alignment: 'right', margin: [0, 6, 5, 6] }
                        ],
                        [
                            { text: 'Interest Rate', fontSize: 9, color: '#4b5563', margin: [5, 6, 0, 6] },
                            { text: `${loan.monthlyInterestRate}% / month (${loan.interestType === 'compound' ? 'Compound' : 'Simple'})`, fontSize: 9, color: '#111827', alignment: 'right', margin: [0, 6, 5, 6] }
                        ],
                        [
                            { text: 'Tenure', fontSize: 9, color: '#4b5563', margin: [5, 6, 0, 6] },
                            { text: `${loan.loanDurationMonths} Months`, fontSize: 9, color: '#111827', alignment: 'right', margin: [0, 6, 5, 6] }
                        ],
                        [
                            { text: 'Monthly EMI', fontSize: 9, color: '#4b5563', margin: [5, 6, 0, 6] },
                            { text: `Rs. ${loan.monthlyEMI.toLocaleString()}`, fontSize: 9, bold: true, color: '#0d9488', alignment: 'right', margin: [0, 6, 5, 6] }
                        ],
                        [
                            { text: 'Start Date', fontSize: 9, color: '#4b5563', margin: [5, 6, 0, 6] },
                            { text: new Date(loan.startDate).toLocaleDateString(), fontSize: 9, color: '#111827', alignment: 'right', margin: [0, 6, 5, 6] }
                        ],
                        [
                            { text: 'Total Payable', fontSize: 9, color: '#4b5563', margin: [5, 6, 0, 6] },
                            { text: `Rs. ${loan.totalAmountPayable?.toLocaleString() || 'N/A'}`, fontSize: 9, bold: true, color: '#111827', alignment: 'right', margin: [0, 6, 5, 6] }
                        ],
                    ]
                },
                layout: {
                    fillColor: (i) => (i % 2 === 0) ? '#f9fafb' : null,
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0,
                    hLineColor: () => '#e5e7eb'
                }
            },

            // Terms and Conditions
            { text: 'TERMS AND CONDITIONS', fontSize: 10, bold: true, color: '#111827', margin: [0, 15, 0, 8] },
            {
                text: termsAndConditions,
                fontSize: 9,
                lineHeight: 1.4,
                color: '#374151',
                alignment: 'justify'
            },

            // Signatures
            {
                margin: [0, 25, 0, 0],
                columns: [
                    {
                        width: '45%',
                        stack: [
                            { text: 'LENDER SIGNATURE', fontSize: 8, bold: true, color: '#6b7280', decoration: 'underline', margin: [0, 0, 0, 5] },
                            lender?.companyStamp ? {
                                image: lender.companyStamp,
                                width: 60,
                                margin: [0, 5, 0, 5]
                            } : { text: '\n\n', margin: [0, 15, 0, 15] },
                            { text: '________________________', fontSize: 9, color: '#9ca3af' },
                            { text: businessName, fontSize: 9, bold: true, margin: [0, 5, 0, 0] },
                            { text: `PAN: ${lender?.panNumber || 'N/A'}`, fontSize: 7, color: '#6b7280' }
                        ]
                    },
                    {
                        width: '10%',
                        text: ''
                    },
                    {
                        width: '45%',
                        stack: [
                            { text: 'BORROWER SIGNATURE', fontSize: 8, bold: true, color: '#6b7280', decoration: 'underline', margin: [0, 0, 0, 5] },
                            customer.signature ? {
                                image: customer.signature,
                                width: 60,
                                margin: [0, 5, 0, 5]
                            } : { text: '\n\n', margin: [0, 15, 0, 15] },
                            { text: '________________________', fontSize: 9, color: '#9ca3af' },
                            { text: `${customer.firstName} ${customer.lastName}`, fontSize: 9, bold: true, margin: [0, 5, 0, 0] },
                            { text: `Aadhaar: ${customer.aadhaarNumber || 'N/A'}`, fontSize: 7, color: '#6b7280' }
                        ]
                    }
                ]
            }

        ],
        footer: {
            columns: [
                { text: `Generated: ${new Date().toLocaleDateString()}`, fontSize: 7, color: '#9ca3af' },
                { text: 'Page 1 of 1', fontSize: 7, color: '#9ca3af', alignment: 'right' }
            ],
            margin: [40, 10, 40, 0]
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
        pageMargins: [40, 30, 40, 30], // Reduced top/bottom margins
        content: [
            // Header
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: businessName.toUpperCase(), fontSize: 20, bold: true, color: '#0d9488' },
                            { text: lender?.address || '', fontSize: 9, color: '#6b7280', margin: [0, 2, 0, 0] },
                            { text: `Phone: ${lender?.phone || 'N/A'} | Email: ${lender?.email || 'N/A'}`, fontSize: 9, color: '#6b7280' }
                        ]
                    },
                    {
                        width: 'auto',
                        stack: [
                            { text: 'PAYMENT', fontSize: 20, bold: true, color: '#16a34a', alignment: 'right' },
                            { text: 'RECEIPT', fontSize: 20, bold: true, color: '#111827', alignment: 'right' },
                            { text: 'RECEIVED', fontSize: 9, bold: true, color: '#16a34a', alignment: 'right', margin: [0, 3, 0, 0] }
                        ]
                    }
                ]
            },

            // Decorative Line
            {
                canvas: [
                    { type: 'rect', x: 0, y: 10, w: 515, h: 3, color: '#16a34a' }
                ],
                margin: [0, 5, 0, 15]
            },

            // Receipt Info & Customer Details
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'RECEIVED FROM', fontSize: 9, bold: true, color: '#16a34a', margin: [0, 0, 0, 5] },
                            { text: `${customer.firstName} ${customer.lastName}`, fontSize: 12, bold: true, color: '#111827' },
                            { text: customer.phone || '', fontSize: 9, color: '#4b5563', margin: [0, 2, 0, 0] },
                            { text: customer.email || '', fontSize: 9, color: '#4b5563' }
                        ]
                    },
                    {
                        width: 180,
                        table: {
                            widths: ['*', 'auto'],
                            body: [
                                [
                                    { text: 'Receipt No:', fontSize: 9, color: '#6b7280', border: [false, false, false, false] },
                                    { text: payment.referenceId || `RCP-${payment._id.toString().substr(-6).toUpperCase()}`, fontSize: 9, bold: true, alignment: 'right', border: [false, false, false, false] }
                                ],
                                [
                                    { text: 'Payment Date:', fontSize: 9, color: '#6b7280', border: [false, false, false, false] },
                                    { text: paymentDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), fontSize: 9, bold: true, alignment: 'right', border: [false, false, false, false] }
                                ],
                                [
                                    { text: 'Loan Account:', fontSize: 9, color: '#6b7280', border: [false, false, false, false] },
                                    { text: loan.loanNumber, fontSize: 9, bold: true, color: '#0d9488', alignment: 'right', border: [false, false, false, false] }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
                margin: [0, 0, 0, 15]
            },

            // Amount Received Box
            {
                margin: [0, 0, 0, 15],
                table: {
                    widths: ['*'],
                    body: [[{
                        fillColor: '#f0fdf4',
                        stack: [
                            { text: 'AMOUNT RECEIVED', fontSize: 10, bold: true, color: '#166534', alignment: 'center', margin: [0, 0, 0, 5] },
                            { text: `Rs. ${payment.amountPaid.toLocaleString()}`, fontSize: 24, bold: true, color: '#16a34a', alignment: 'center' },
                            { text: `(${numberToWords(payment.amountPaid)} Rupees Only)`, fontSize: 9, color: '#4b5563', alignment: 'center', margin: [0, 5, 0, 0], italics: true }
                        ],
                        margin: [10, 10, 10, 10]
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
                            { text: 'PAYMENT DETAILS', bold: true, fillColor: '#f3f4f6', color: '#374151', margin: [8, 8, 8, 8], colSpan: 2 },
                            {}
                        ],
                        [
                            { text: 'Payment Method', fontSize: 9, color: '#4b5563', margin: [8, 6, 8, 6] },
                            { text: (payment.paymentMethod || 'Cash').replace('_', ' ').toUpperCase(), fontSize: 9, bold: true, alignment: 'right', margin: [8, 6, 8, 6] }
                        ],
                        [
                            { text: 'EMI Amount', fontSize: 9, color: '#4b5563', margin: [8, 6, 8, 6] },
                            { text: `Rs. ${loan.monthlyEMI?.toLocaleString() || 'N/A'}`, fontSize: 9, alignment: 'right', margin: [8, 6, 8, 6] }
                        ],
                        [
                            { text: 'Principal Component', fontSize: 9, color: '#4b5563', margin: [8, 6, 8, 6] },
                            { text: `Rs. ${payment.principalPortion?.toLocaleString() || '0'}`, fontSize: 9, alignment: 'right', margin: [8, 6, 8, 6] }
                        ],
                        [
                            { text: 'Interest Component', fontSize: 9, color: '#4b5563', margin: [8, 6, 8, 6] },
                            { text: `Rs. ${payment.interestPortion?.toLocaleString() || '0'}`, fontSize: 9, alignment: 'right', margin: [8, 6, 8, 6] }
                        ],
                        [
                            { text: 'Outstanding Balance After Payment', fontSize: 9, bold: true, color: '#111827', fillColor: '#fff7ed', margin: [8, 8, 8, 8] },
                            { text: `Rs. ${payment.balanceAfterPayment?.toLocaleString()}`, fontSize: 10, bold: true, color: '#ea580c', fillColor: '#fff7ed', alignment: 'right', margin: [8, 8, 8, 8] }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: () => '#e5e7eb'
                }
            },

            // Bank Details Section (Professional Design)
            (payment.bankDetails && (
                payment.bankDetails.accountNumber ||
                payment.bankDetails.upiId ||
                payment.bankDetails.transactionId ||
                payment.bankDetails.bankName
            )) ? {
                margin: [0, 15, 0, 0],
                table: {
                    widths: ['*'],
                    body: [[{
                        fillColor: '#eff6ff',
                        stack: [
                            // Header
                            {
                                columns: [
                                    {
                                        width: 'auto',
                                        text: payment.bankDetails.upiId ? 'UPI PAYMENT DETAILS' : 'BANK TRANSFER DETAILS',
                                        fontSize: 10,
                                        bold: true,
                                        color: '#1e40af'
                                    },
                                    {
                                        width: '*',
                                        canvas: [{ type: 'line', x1: 10, y1: 5, x2: 350, y2: 5, lineWidth: 1, lineColor: '#93c5fd' }]
                                    }
                                ],
                                margin: [0, 0, 0, 8]
                            },
                            // Details Grid
                            payment.bankDetails.upiId ? {
                                // UPI Details
                                columns: [
                                    {
                                        width: '50%',
                                        stack: [
                                            { text: 'UPI ID', fontSize: 8, color: '#6b7280', margin: [0, 0, 0, 2] },
                                            { text: payment.bankDetails.upiId || '-', fontSize: 9, bold: true, color: '#1f2937' }
                                        ]
                                    },
                                    {
                                        width: '50%',
                                        stack: [
                                            { text: 'Transaction ID', fontSize: 8, color: '#6b7280', margin: [0, 0, 0, 2] },
                                            { text: payment.bankDetails.transactionId || '-', fontSize: 9, bold: true, color: '#059669' }
                                        ]
                                    }
                                ]
                            } : {
                                // Bank Transfer Details
                                stack: [
                                    // First Row: Account Holder & Bank Name
                                    {
                                        columns: [
                                            {
                                                width: '50%',
                                                stack: [
                                                    { text: 'Account Holder Name', fontSize: 8, color: '#6b7280', margin: [0, 0, 0, 2] },
                                                    { text: payment.bankDetails.accountHolderName || '-', fontSize: 9, bold: true, color: '#1f2937' }
                                                ]
                                            },
                                            {
                                                width: '50%',
                                                stack: [
                                                    { text: 'Bank Name', fontSize: 8, color: '#6b7280', margin: [0, 0, 0, 2] },
                                                    { text: payment.bankDetails.bankName || '-', fontSize: 9, bold: true, color: '#1f2937' }
                                                ]
                                            }
                                        ],
                                        margin: [0, 0, 0, 8]
                                    },
                                    // Second Row: Account Number & IFSC
                                    {
                                        columns: [
                                            {
                                                width: '50%',
                                                stack: [
                                                    { text: 'Account Number', fontSize: 8, color: '#6b7280', margin: [0, 0, 0, 2] },
                                                    { text: payment.bankDetails.accountNumber || '-', fontSize: 9, bold: true, color: '#1f2937' }
                                                ]
                                            },
                                            {
                                                width: '50%',
                                                stack: [
                                                    { text: 'IFSC Code', fontSize: 8, color: '#6b7280', margin: [0, 0, 0, 2] },
                                                    { text: payment.bankDetails.ifscCode || '-', fontSize: 9, bold: true, color: '#1f2937' }
                                                ]
                                            }
                                        ],
                                        margin: [0, 0, 0, 8]
                                    },
                                    // Third Row: Branch & Transaction ID
                                    {
                                        columns: [
                                            {
                                                width: '50%',
                                                stack: [
                                                    { text: 'Branch', fontSize: 8, color: '#6b7280', margin: [0, 0, 0, 2] },
                                                    { text: payment.bankDetails.branch || '-', fontSize: 9, color: '#1f2937' }
                                                ]
                                            },
                                            {
                                                width: '50%',
                                                stack: [
                                                    { text: 'Transaction / Cheque No.', fontSize: 8, color: '#6b7280', margin: [0, 0, 0, 2] },
                                                    { text: payment.bankDetails.transactionId || '-', fontSize: 9, bold: true, color: '#059669' }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        margin: [10, 10, 10, 10]
                    }]]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#93c5fd',
                    vLineColor: () => '#93c5fd'
                }
            } : null,

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

            // 1. Payment Record Status (Professional & Compact) - MOVED TO TOP
            (invoice.amountPaid > 0) ? {
                margin: [0, 0, 0, 20],
                table: {
                    widths: ['*', '*', '*'],
                    body: [
                        // Header
                        [
                            { text: 'PAYMENT RECEIVED & STATUS', colSpan: 3, bold: true, fontSize: 10, color: '#1e40af', fillColor: '#dbeafe', margin: [5, 5, 5, 5], border: [true, true, true, true] },
                            {}, {}
                        ],
                        // Key Figures Row
                        [
                            {
                                stack: [
                                    { text: 'AMOUNT PAID', fontSize: 8, color: '#6b7280', bold: true },
                                    { text: `Rs. ${(invoice.amountPaid || 0).toLocaleString()}`, fontSize: 11, color: '#16a34a', bold: true, margin: [0, 2, 0, 0] }
                                ],
                                margin: [5, 5, 5, 5]
                            },
                            {
                                stack: [
                                    { text: 'PAYMENT METHOD', fontSize: 8, color: '#6b7280', bold: true },
                                    { text: (invoice.paymentId?.paymentMethod || 'Manual/Other').toUpperCase().replace('_', ' '), fontSize: 10, color: '#374151', margin: [0, 2, 0, 0] }
                                ],
                                margin: [5, 5, 5, 5]
                            },
                            {
                                stack: [
                                    { text: 'LOAN OUTSTANDING', fontSize: 8, color: '#6b7280', bold: true },
                                    { text: `Rs. ${(invoice.loanId?.remainingBalance || 0).toLocaleString()}`, fontSize: 11, color: '#dc2626', bold: true, margin: [0, 2, 0, 0] }
                                ],
                                margin: [5, 5, 5, 5],
                                fillColor: '#fdf2f2'
                            }
                        ],
                        // Transaction Details Row (only if existing)
                        [(invoice.paymentId?.bankDetails?.transactionId || invoice.paymentId?.referenceId) ? {
                            colSpan: 3,
                            stack: [
                                { text: 'TRANSACTION REFERENCE', fontSize: 8, color: '#6b7280', bold: true },
                                { text: invoice.paymentId?.bankDetails?.transactionId || invoice.paymentId?.referenceId || '-', fontSize: 9, color: '#374151', margin: [0, 2, 0, 0] }
                            ],
                            margin: [5, 5, 5, 5]
                        } : { text: '', colSpan: 3, border: [false, false, false, false] }, {}, {}],
                        // Bank Details Row (only if existing)
                        [(invoice.paymentId?.bankDetails && (invoice.paymentId.bankDetails.bankName || invoice.paymentId.bankDetails.upiId)) ? {
                            colSpan: 3,
                            stack: [
                                { text: 'PAYMENT SOURCE DETAILS', fontSize: 8, color: '#6b7280', bold: true },
                                {
                                    text: invoice.paymentId.bankDetails.upiId
                                        ? `UPI ID: ${invoice.paymentId.bankDetails.upiId}`
                                        : `Bank: ${invoice.paymentId.bankDetails.bankName || '-'} | A/c: ${invoice.paymentId.bankDetails.accountNumber || '-'} | IFSC: ${invoice.paymentId.bankDetails.ifscCode || '-'} | Name: ${invoice.paymentId.bankDetails.accountHolderName || '-'}`,
                                    fontSize: 9, color: '#374151', margin: [0, 2, 0, 0]
                                }
                            ],
                            margin: [5, 5, 5, 5]
                        } : { text: '', colSpan: 3, border: [false, false, false, false] }, {}, {}]
                    ].filter(row => row[0].text !== '')
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: (i) => (i === 0 || i === 3) ? 1 : 0.5,
                    hLineColor: () => '#bfdbfe',
                    vLineColor: () => '#bfdbfe'
                }
            } : null,

            // Financial Summary (Replaces Items Table)
            {
                margin: [0, 20, 0, 0],
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            { text: 'FINANCIAL SUMMARY', colSpan: 2, bold: true, fontSize: 10, color: '#111827', fillColor: '#f3f4f6', margin: [5, 5, 5, 5], border: [true, true, true, true] },
                            {}
                        ],
                        [
                            { text: 'Total EMI Amount Due:', fontSize: 10, color: '#4b5563', margin: [5, 5, 0, 5], border: [true, false, true, false] },
                            { text: `Rs. ${invoice.amountDue.toLocaleString()}`, fontSize: 10, bold: true, alignment: 'right', margin: [0, 5, 5, 5], border: [false, false, true, false] }
                        ],
                        [
                            { text: 'Amount Paid:', fontSize: 10, color: '#16a34a', margin: [5, 5, 0, 5], border: [true, false, true, false] },
                            { text: `Rs. ${(invoice.amountPaid || 0).toLocaleString()}`, fontSize: 10, bold: true, color: '#16a34a', alignment: 'right', margin: [0, 5, 5, 5], border: [false, false, true, false] }
                        ],
                        [
                            { text: 'TOTAL BALANCE DUE:', fontSize: 12, bold: true, color: '#0d9488', fillColor: '#f0fdfa', margin: [5, 8, 0, 8], border: [true, true, true, true] },
                            { text: `Rs. ${(invoice.balanceDue || invoice.amountDue).toLocaleString()}`, fontSize: 13, bold: true, color: '#0d9488', fillColor: '#f0fdfa', alignment: 'right', margin: [0, 8, 5, 8], border: [true, true, true, true] }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e5e7eb',
                    vLineColor: () => '#e5e7eb'
                }
            },

            // Payment Information (Source or Default Lender Info)
            // Payment Information & Customer Signature
            {
                margin: [0, 20, 0, 0],
                stack: [
                    // 2. Lender Payment Instructions (ALWAYS Visible Bottom Section)


                    // 2. Lender Payment Instructions (ALWAYS Visible Bottom Section)
                    // 3. Signatures
                    {
                        margin: [0, 30, 0, 0],
                        columns: [
                            {
                                width: '*',
                                stack: [
                                    { text: 'PAYMENT INSTRUCTIONS', fontSize: 10, bold: true, color: '#0d9488', margin: [0, 0, 0, 8] },
                                    {
                                        table: {
                                            widths: ['auto', '*'],
                                            body: [
                                                [{ text: 'Bank:', fontSize: 9, color: '#6b7280' }, { text: lender?.bankDetails?.bankName || '-', fontSize: 9, bold: true, color: '#374151' }],
                                                [{ text: 'Account:', fontSize: 9, color: '#6b7280' }, { text: lender?.bankDetails?.accountNumber || '-', fontSize: 9, bold: true, color: '#374151' }],
                                                [{ text: 'IFSC:', fontSize: 9, color: '#6b7280' }, { text: lender?.bankDetails?.ifscCode || '-', fontSize: 9, bold: true, color: '#374151' }],
                                                [{ text: 'UPI:', fontSize: 9, color: '#6b7280' }, { text: lender?.upiId || '-', fontSize: 9, bold: true, color: '#374151' }]
                                            ]
                                        },
                                        layout: 'noBorders'
                                    }
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
                                alignment: 'center'
                            }
                        ]
                    }
                ]
            },// Terms & Notes
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

/**
 * Generate Settlement Certificate PDF
 * Includes: Settlement amount, discount, payment method, loan summary
 */
const generateSettlementCertificate = async (loan, lender, settlementData) => {
    const businessName = lender?.businessName || 'MoneyLender';
    const customerName = `${loan.customerId.firstName} ${loan.customerId.lastName}`;
    const customer = loan.customerId;
    const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const paymentMethodLabels = {
        cash: 'Cash',
        bank_transfer: 'Bank Transfer',
        upi: 'UPI',
        cheque: 'Cheque',
        other: 'Other'
    };

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [50, 50, 50, 50],
        content: [
            // Header
            { text: businessName.toUpperCase(), fontSize: 22, bold: true, color: '#0d9488', alignment: 'center' },
            { text: lender?.address || '', fontSize: 9, color: '#6b7280', alignment: 'center', margin: [0, 5, 0, 0] },
            { text: `Phone: ${lender?.phone || 'N/A'} | Email: ${lender?.email || 'N/A'}`, fontSize: 9, color: '#6b7280', alignment: 'center', margin: [0, 3, 0, 0] },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 495, y2: 5, lineWidth: 2, lineColor: '#0d9488' }], margin: [0, 15, 0, 30] },

            // Title
            { text: 'LOAN SETTLEMENT CERTIFICATE', fontSize: 18, bold: true, alignment: 'center', color: '#1f2937', margin: [0, 0, 0, 5] },
            { text: `Certificate No: SC-${loan.loanNumber}`, fontSize: 10, color: '#6b7280', alignment: 'center', margin: [0, 0, 0, 25] },

            // Customer & Loan Info Box
            {
                table: {
                    widths: ['50%', '50%'],
                    body: [
                        [
                            { text: 'BORROWER DETAILS', fillColor: '#f0fdfa', bold: true, fontSize: 10, color: '#0d9488', margin: [8, 8, 8, 8] },
                            { text: 'LOAN DETAILS', fillColor: '#f0fdfa', bold: true, fontSize: 10, color: '#0d9488', margin: [8, 8, 8, 8] }
                        ],
                        [
                            {
                                stack: [
                                    { text: customerName, bold: true, fontSize: 11 },
                                    { text: customer?.phone || '', fontSize: 9, color: '#6b7280', margin: [0, 2, 0, 0] },
                                    { text: customer?.email || '', fontSize: 9, color: '#6b7280' },
                                    { text: `${customer?.address?.street || ''}, ${customer?.address?.city || ''}`, fontSize: 9, color: '#6b7280', margin: [0, 2, 0, 0] }
                                ],
                                margin: [8, 8, 8, 8]
                            },
                            {
                                stack: [
                                    { text: `Loan No: ${loan.loanNumber}`, bold: true, fontSize: 11 },
                                    { text: `Principal: ${formatCurrency(loan.principal)}`, fontSize: 9, margin: [0, 2, 0, 0] },
                                    { text: `Interest Rate: ${loan.monthlyInterestRate}% p.m.`, fontSize: 9 },
                                    { text: `Tenure: ${loan.loanDurationMonths} months`, fontSize: 9 }
                                ],
                                margin: [8, 8, 8, 8]
                            }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e5e7eb',
                    vLineColor: () => '#e5e7eb'
                },
                margin: [0, 0, 0, 20]
            },

            // Settlement Summary
            { text: 'SETTLEMENT SUMMARY', fontSize: 12, bold: true, color: '#1f2937', margin: [0, 10, 0, 10] },
            {
                table: {
                    widths: ['60%', '40%'],
                    body: [
                        [{ text: 'Outstanding Balance', fontSize: 10 }, { text: formatCurrency(settlementData.originalBalance || loan.remainingBalance), fontSize: 10, alignment: 'right' }],
                        settlementData.discount > 0 ? [{ text: 'Settlement Discount', fontSize: 10, color: '#10b981' }, { text: `- ${formatCurrency(settlementData.discount)}`, fontSize: 10, color: '#10b981', alignment: 'right' }] : null,
                        [{ text: 'Final Settlement Amount', bold: true, fontSize: 11 }, { text: formatCurrency(settlementData.settlementAmount), bold: true, fontSize: 11, alignment: 'right', color: '#0d9488' }],
                        [{ text: 'Payment Method', fontSize: 10 }, { text: paymentMethodLabels[settlementData.paymentMethod] || settlementData.paymentMethod, fontSize: 10, alignment: 'right' }],
                        [{ text: 'Settlement Date', fontSize: 10 }, { text: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), fontSize: 10, alignment: 'right' }]
                    ].filter(Boolean)
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0.5 : 0,
                    vLineWidth: () => 0,
                    hLineColor: () => '#e5e7eb',
                    paddingTop: () => 6,
                    paddingBottom: () => 6
                },
                margin: [0, 0, 0, 20]
            },

            // Loan History Summary
            { text: 'LOAN HISTORY', fontSize: 12, bold: true, color: '#1f2937', margin: [0, 10, 0, 10] },
            {
                table: {
                    widths: ['50%', '50%'],
                    body: [
                        [{ text: 'Loan Disbursed On', fontSize: 10 }, { text: new Date(loan.disbursementDate || loan.createdAt).toLocaleDateString('en-IN'), fontSize: 10, alignment: 'right' }],
                        [{ text: 'Total EMIs Paid', fontSize: 10 }, { text: `${loan.paymentsReceived} of ${loan.loanDurationMonths}`, fontSize: 10, alignment: 'right' }],
                        [{ text: 'Total Amount Paid', fontSize: 10 }, { text: formatCurrency(loan.totalAmountPaid || (loan.paymentsReceived * loan.monthlyEMI)), fontSize: 10, alignment: 'right' }],
                        [{ text: 'Loan Status', fontSize: 10 }, { text: 'CLOSED', bold: true, fontSize: 10, color: '#10b981', alignment: 'right' }]
                    ]
                },
                layout: {
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                    paddingTop: () => 4,
                    paddingBottom: () => 4
                },
                margin: [0, 0, 0, 20]
            },

            // Bank Details (if any)
            (settlementData.bankDetails && (settlementData.bankDetails.accountNumber || settlementData.bankDetails.upiId)) ? {
                stack: [
                    { text: settlementData.bankDetails.upiId ? 'UPI PAYMENT DETAILS' : 'BANK PAYMENT DETAILS', fontSize: 12, bold: true, color: '#1f2937', margin: [0, 10, 0, 10] },
                    {
                        table: {
                            widths: ['40%', '60%'],
                            body: [
                                settlementData.bankDetails.upiId ?
                                    [{ text: 'UPI ID', fontSize: 10 }, { text: settlementData.bankDetails.upiId, fontSize: 10 }] : null,
                                settlementData.bankDetails.accountHolderName ?
                                    [{ text: 'Account Holder', fontSize: 10 }, { text: settlementData.bankDetails.accountHolderName, fontSize: 10 }] : null,
                                settlementData.bankDetails.bankName ?
                                    [{ text: 'Bank Name', fontSize: 10 }, { text: settlementData.bankDetails.bankName, fontSize: 10 }] : null,
                                settlementData.bankDetails.accountNumber ?
                                    [{ text: 'Account Number', fontSize: 10 }, { text: settlementData.bankDetails.accountNumber, fontSize: 10 }] : null,
                                settlementData.bankDetails.ifscCode ?
                                    [{ text: 'IFSC Code', fontSize: 10 }, { text: settlementData.bankDetails.ifscCode, fontSize: 10 }] : null,
                                settlementData.bankDetails.branch ?
                                    [{ text: 'Branch', fontSize: 10 }, { text: settlementData.bankDetails.branch, fontSize: 10 }] : null,
                                settlementData.bankDetails.transactionId ?
                                    [{ text: 'Transaction/Cheque No.', fontSize: 10 }, { text: settlementData.bankDetails.transactionId, fontSize: 10, bold: true }] : null,
                            ].filter(Boolean)
                        },
                        layout: {
                            hLineWidth: () => 0,
                            vLineWidth: () => 0,
                            paddingTop: () => 4,
                            paddingBottom: () => 4
                        }
                    }
                ],
                margin: [0, 0, 0, 20]
            } : null,

            // Notes if any
            settlementData.notes ? {
                stack: [
                    { text: 'REMARKS', fontSize: 10, bold: true, color: '#6b7280', margin: [0, 0, 0, 5] },
                    { text: settlementData.notes, fontSize: 10, italics: true, color: '#6b7280' }
                ],
                margin: [0, 0, 0, 20]
            } : null,


            // Certificate Statement
            {
                text: [
                    'This is to certify that the above-mentioned loan has been ',
                    { text: 'FULLY SETTLED AND CLOSED', bold: true, color: '#10b981' },
                    ' as of the date mentioned above. There are no outstanding dues, interest, or penalties remaining against this loan account.'
                ],
                fontSize: 10,
                lineHeight: 1.5,
                margin: [0, 10, 0, 40]
            },

            // Signatures
            {
                columns: [
                    {
                        width: '50%',
                        stack: [
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.5, lineColor: '#9ca3af' }] },
                            { text: 'Borrower Signature', fontSize: 9, color: '#6b7280', margin: [0, 5, 0, 0] },
                            { text: customerName, fontSize: 10, margin: [0, 3, 0, 0] }
                        ]
                    },
                    {
                        width: '50%',
                        stack: [
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.5, lineColor: '#9ca3af' }] },
                            { text: 'Authorized Signatory', fontSize: 9, color: '#6b7280', margin: [0, 5, 0, 0] },
                            { text: `For ${businessName}`, fontSize: 10, margin: [0, 3, 0, 0] }
                        ],
                        alignment: 'right'
                    }
                ],
                margin: [0, 20, 0, 0]
            }
        ].filter(Boolean),
        footer: (currentPage, pageCount) => ({
            columns: [
                { text: `Generated on ${new Date().toLocaleString('en-IN')}`, fontSize: 8, color: '#9ca3af' },
                { text: `Page ${currentPage} of ${pageCount}`, fontSize: 8, color: '#9ca3af', alignment: 'right' }
            ],
            margin: [50, 10, 50, 0]
        }),
        defaultStyle: { font: 'Roboto' }
    };

    return printer.createPdfKitDocument(docDefinition);
};

module.exports = {
    generateLoanAgreement,
    generateLoanStatement,
    generatePaymentReceipt,
    generateLoanClosureNOC,
    generateInvoicePDF,
    generateSettlementCertificate
};
