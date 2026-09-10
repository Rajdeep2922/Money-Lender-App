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
 * Generate Personal Loan Agreement PDF
 * @param {Object} loan       - Populated Loan document (customerId populated)
 * @param {Object} lender     - Lender document
 * @param {Object} [snapshot] - Immutable agreementSnapshot embedded in the loan.
 *                              If absent, falls back gracefully. Never fetches live policies.
 */
const generateLoanAgreement = async (loan, lender, snapshot = {}) => {
    const businessName = lender?.businessName || 'MoneyLender';
    const customer = loan.customerId;

    // ── Resolve snapshot metadata (immutable record only, never fetched live) ──
    const s = snapshot || {};
    const agreementVersion  = s.agreementVersion  || 'v1.0';
    const termsVersion      = s.termsVersion      || 'v1.0';

    // ── Helpers ───────────────────────────────────────────────────────────────────
    const fmt = (n) => `Rs. ${(n || 0).toLocaleString('en-IN')}`;
    const fmtDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'N/A';

    // ── Foreclosure — user-friendly wording ───────────────────────────────────────
    const foreclosurePolicyStr = (() => {
        const p = loan.foreclosurePolicy || 'WITHOUT_DISCOUNT';
        if (p === 'NOT_ALLOWED')      return 'Not Allowed';
        if (p === 'WITHOUT_DISCOUNT') return 'Allowed – No Discount';
        if (p === 'MANUAL_DISCOUNT')  return 'Manual Discount Allowed';
        return p;
    })();

    // ── Grace / late fee summary ──────────────────────────────────────────────────
    const graceDays = loan.gracePeriodDays || 0;
    const lateFeeStr = (() => {
        const t = loan.lateFeeType || 'none';
        if (t === 'fixed')      return `Rs. ${loan.lateFeeValue || 0} (fixed) after grace`;
        if (t === 'percentage') return `${loan.lateFeeValue || 0}% of EMI after grace`;
        return 'None';
    })();

    // ── Lender address ────────────────────────────────────────────────────────────
    const lenderAddr = lender?.address
        ? [lender.address.street, lender.address.city, lender.address.state].filter(Boolean).join(', ')
        : '';

    // ── Agreement date line ───────────────────────────────────────────────────────
    const agreementDate = fmtDate(loan.agreementGeneratedAt || new Date());

    // ── Legal Center URL (dynamic — reads FRONTEND_URL from environment) ─────────
    // IMPORTANT: Set FRONTEND_URL in your deployment environment variables.
    // If not set in production, the agreement PDF will show localhost — set it!
    const frontendOrigin = (() => {
        const url = process.env.FRONTEND_URL;
        if (!url && process.env.NODE_ENV === 'production') {
            console.error('[pdfGenerator] WARNING: FRONTEND_URL is not set. PDF will show localhost. Set FRONTEND_URL in your production environment.');
        }
        return (url || 'http://localhost:5173').replace(/\/$/, '');
    })();
    const legalCenterUrl = `${frontendOrigin}/legal`;

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [36, 52, 36, 36],

        // ── No footer ─────────────────────────────────────────────────────────────
        footer: null,

        header: {
            margin: [36, 15, 36, 0],
            columns: [
                { text: businessName.toUpperCase(), fontSize: 11, bold: true, color: '#0d9488' },
                { text: 'PERSONAL LOAN AGREEMENT', fontSize: 11, bold: true, color: '#111827', alignment: 'right' }
            ]
        },

        content: [
            // ── Teal rule ─────────────────────────────────────────────────────────
            {
                canvas: [{ type: 'rect', x: 0, y: 0, w: 523, h: 2, color: '#0d9488' }],
                margin: [0, 0, 0, 10]
            },

            // ── Parties (2-col) ───────────────────────────────────────────────────
            {
                table: {
                    widths: ['*', 8, '*'],
                    body: [[
                        {
                            stack: [
                                { text: 'LENDER', fontSize: 7.5, bold: true, color: '#0d9488', margin: [0, 0, 0, 4] },
                                { text: businessName, fontSize: 10, bold: true, color: '#111827', margin: [0, 0, 0, 2] },
                                lenderAddr ? { text: lenderAddr, fontSize: 7.5, color: '#4b5563', margin: [0, 0, 0, 1] } : { text: '' },
                                { text: `Ph: ${lender?.phone || 'N/A'}  |  ${lender?.email || 'N/A'}`, fontSize: 7.5, color: '#4b5563' },
                                lender?.panNumber ? { text: `PAN: ${lender.panNumber}`, fontSize: 7.5, color: '#6b7280', margin: [0, 1, 0, 0] } : { text: '' },
                            ],
                            fillColor: '#f0fdfa', margin: [8, 7, 8, 7]
                        },
                        { text: '', border: [false, false, false, false] },
                        {
                            stack: [
                                { text: 'BORROWER', fontSize: 7.5, bold: true, color: '#6b7280', margin: [0, 0, 0, 4] },
                                {
                                    columns: [
                                        {
                                            width: '*',
                                            stack: [
                                                { text: `${customer.firstName} ${customer.lastName}`, fontSize: 10, bold: true, color: '#111827', margin: [0, 0, 0, 2] },
                                                { text: `Ph: ${customer.phone || 'N/A'}`, fontSize: 7.5, color: '#4b5563', margin: [0, 0, 0, 1] },
                                                { text: `Email: ${customer.email || 'N/A'}`, fontSize: 7.5, color: '#4b5563', margin: [0, 0, 0, 1] },
                                                customer.aadhaarNumber ? { text: `Aadhaar: ${customer.aadhaarNumber}`, fontSize: 7.5, color: '#6b7280' } : { text: '' },
                                            ]
                                        },
                                        customer.photo
                                            ? { width: 52, stack: [{ image: customer.photo, fit: [48, 58], alignment: 'center' }] }
                                            : { width: 0, text: '' }
                                    ]
                                }
                            ],
                            fillColor: '#f9fafb', margin: [8, 7, 8, 7]
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 0.7,
                    vLineWidth: (i) => (i === 1 || i === 2) ? 0 : 0.7,
                    hLineColor: () => '#d1d5db',
                    vLineColor: () => '#d1d5db',
                    paddingLeft: () => 0, paddingRight: () => 0,
                    paddingTop: () => 0,  paddingBottom: () => 0
                },
                margin: [0, 0, 0, 10]
            },

            // ── Agreement Information line ─────────────────────────────────────────
            {
                text: `Agreement Date: ${agreementDate}    |    Agreement Ref: ${agreementVersion}    |    Policy Ref: ${termsVersion}`,
                fontSize: 7.5, italics: true, color: '#6b7280', alignment: 'right', margin: [0, 0, 0, 12]
            },

            // ── Key Loan Terms ────────────────────────────────────────────────────
            { text: 'KEY LOAN TERMS', fontSize: 9, bold: true, color: '#111827', margin: [0, 0, 0, 5] },
            {
                table: {
                    widths: ['*', '*', '*', '*'],
                    body: [
                        [
                            { text: 'Loan Number',    fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: loan.loanNumber,  fontSize: 7.5, bold: true, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] },
                            { text: 'Principal',      fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: fmt(loan.principal), fontSize: 7.5, bold: true, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] }
                        ],
                        [
                            { text: 'Interest Rate', fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: `${loan.monthlyInterestRate}%/mo (${loan.interestType === 'compound' ? 'Compound' : 'Simple'})`, fontSize: 7.5, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] },
                            { text: 'Tenure',        fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: `${loan.loanDurationMonths} Months`, fontSize: 7.5, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] }
                        ],
                        [
                            { text: 'Monthly EMI',   fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: fmt(loan.monthlyEMI), fontSize: 7.5, bold: true, color: '#0d9488', alignment: 'right', margin: [0, 5, 4, 5] },
                            { text: 'Total Payable', fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: fmt(loan.totalAmountPayable), fontSize: 7.5, bold: true, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] }
                        ],
                        [
                            { text: 'Start Date',   fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: fmtDate(loan.startDate), fontSize: 7.5, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] },
                            { text: 'End Date',     fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: fmtDate(loan.endDate), fontSize: 7.5, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] }
                        ],
                        [
                            { text: 'Grace Period', fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: `${graceDays} day${graceDays !== 1 ? 's' : ''}`, fontSize: 7.5, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] },
                            { text: 'Late Fee',     fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: lateFeeStr,     fontSize: 7.5, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] }
                        ],
                        [
                            { text: 'Foreclosure',    fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: foreclosurePolicyStr, fontSize: 7.5, color: '#111827', alignment: 'right', margin: [0, 5, 4, 5] },
                            { text: 'Total Interest', fontSize: 7.5, color: '#4b5563', margin: [4, 5, 0, 5] },
                            { text: fmt(loan.totalInterestAmount), fontSize: 7.5, color: '#b45309', alignment: 'right', margin: [0, 5, 4, 5] }
                        ],
                    ]
                },
                layout: {
                    fillColor: (i) => i % 2 === 0 ? '#f9fafb' : null,
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e5e7eb',
                    vLineColor: () => '#e5e7eb'
                },
                margin: [0, 0, 0, 14]
            },

            // ── Key Legal Terms ───────────────────────────────────────────────────
            { text: 'KEY LEGAL TERMS', fontSize: 9, bold: true, color: '#111827', margin: [0, 0, 0, 6] },
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            stack: [
                                {
                                    text: 'This loan agreement is governed by the following important policies:',
                                    fontSize: 7.5, color: '#374151', lineHeight: 1.4, margin: [0, 0, 0, 6]
                                },
                                {
                                    ul: [
                                        'Loan repayments must be made according to the agreed EMI schedule.',
                                        'Interest, foreclosure options, grace periods and overdue charges are governed by the agreed loan terms.',
                                        'Your personal information and loan records are securely maintained and used only for legitimate loan administration.',
                                        'The terms and policies accepted at the time of signing remain applicable to this agreement even if future policy updates are published.',
                                    ],
                                    fontSize: 7.5, color: '#374151', lineHeight: 1.45,
                                    markerColor: '#0d9488', margin: [4, 0, 0, 8]
                                },
                                {
                                    text: [
                                        {
                                            text: 'For complete Terms & Conditions and all legal policies, please visit our ',
                                            fontSize: 7.5, color: '#374151'
                                        },
                                        {
                                            text: 'Legal Center',
                                            fontSize: 7.5, color: '#0d9488', bold: true,
                                            link: legalCenterUrl,
                                            decoration: 'underline', decorationColor: '#0d9488'
                                        },
                                        {
                                            text: '.',
                                            fontSize: 7.5, color: '#374151'
                                        },
                                    ]
                                },
                            ],
                            margin: [10, 8, 10, 8]
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#d1d5db',
                    vLineColor: () => '#d1d5db',
                    fillColor: () => '#fafafa'
                },
                margin: [0, 0, 0, 12]
            },

            // ── Borrower Declaration ──────────────────────────────────────────────
            { text: 'BORROWER DECLARATION', fontSize: 9, bold: true, color: '#111827', margin: [0, 0, 0, 5] },
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            text: 'The borrower acknowledges receiving the loan amount stated in this agreement and confirms that they have read, understood, and voluntarily accepted the terms of this Personal Loan Agreement and the applicable legal policies referenced above.',
                            fontSize: 7.5, color: '#374151', lineHeight: 1.5, margin: [10, 7, 10, 7]
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#d1d5db',
                    vLineColor: () => '#d1d5db',
                    fillColor: () => '#fffbeb'
                },
                margin: [0, 0, 0, 16]
            },

            // ── Signature Section ─────────────────────────────────────────────────
            {
                columns: [
                    {
                        width: '45%',
                        stack: [
                            { text: 'LENDER SIGNATURE', fontSize: 7.5, bold: true, color: '#6b7280', margin: [0, 0, 0, 4] },
                            lender?.companyStamp
                                ? { image: lender.companyStamp, width: 55, margin: [0, 3, 0, 3] }
                                : { text: '\n\n', margin: [0, 12, 0, 12] },
                            { text: '____________________________', fontSize: 8.5, color: '#9ca3af' },
                            { text: businessName, fontSize: 8, bold: true, margin: [0, 4, 0, 0] },
                            lender?.panNumber ? { text: `PAN: ${lender.panNumber}`, fontSize: 7, color: '#6b7280' } : { text: '' }
                        ]
                    },
                    { width: '10%', text: '' },
                    {
                        width: '45%',
                        stack: [
                            { text: 'BORROWER SIGNATURE', fontSize: 7.5, bold: true, color: '#6b7280', margin: [0, 0, 0, 4] },
                            customer.signature
                                ? { image: customer.signature, width: 55, margin: [0, 3, 0, 3] }
                                : { text: '\n\n', margin: [0, 12, 0, 12] },
                            { text: '____________________________', fontSize: 8.5, color: '#9ca3af' },
                            { text: `${customer.firstName} ${customer.lastName}`, fontSize: 8, bold: true, margin: [0, 4, 0, 0] },
                            customer.aadhaarNumber ? { text: `Aadhaar: ${customer.aadhaarNumber}`, fontSize: 7, color: '#6b7280' } : { text: '' }
                        ]
                    }
                ]
            }
        ],

        defaultStyle: { font: 'Roboto' }
    };

    return printer.createPdfKitDocument(docDefinition);
};


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
                { text: loan.loanNumber, style: 'headerDocTitle', alignment: 'right' }
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

            // Loan Fully Paid Banner (for completed/closed loans)
            (loan.status === 'completed' || loan.status === 'closed' || loan.remainingBalance <= 0) ? {
                margin: [0, 20, 0, 0],
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: 'LOAN FULLY PAID', fontSize: 14, bold: true, color: '#16a34a', alignment: 'center' },
                            { text: 'This loan has been completely settled. No outstanding balance remains.', fontSize: 9, color: '#4b5563', alignment: 'center', margin: [0, 5, 0, 0] },
                            { text: `Completion Date: ${new Date().toLocaleDateString()}`, fontSize: 8, color: '#6b7280', alignment: 'center', margin: [0, 3, 0, 0] }
                        ],
                        fillColor: '#f0fdf4',
                        margin: [15, 15, 15, 15]
                    }]]
                },
                layout: {
                    hLineWidth: () => 2,
                    vLineWidth: () => 2,
                    hLineColor: () => '#16a34a',
                    vLineColor: () => '#16a34a'
                }
            } : null,

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

/**
 * Generate Customized Personal Loan Agreement PDF
 * Reads purely from immutable snapshot.customAgreementDetails. Never reads live loan data.
 * @param {Object} snapshot - loan.agreementSnapshot
 * @param {Object} lender   - Lender document
 */
const generateCustomizedAgreement = async (snapshot = {}, lender = {}) => {
    const details = snapshot.customAgreementDetails || {};
    const businessName = lender?.businessName || 'MoneyLender';
    const agreementVersion = snapshot.agreementVersion || 'v1.0';

    const fmt = (n) => `Rs. ${(n || 0).toLocaleString('en-IN')}`;
    const fmtDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'N/A';

    const foreclosurePolicyStr = (() => {
        const p = details.foreclosurePolicy || 'WITHOUT_DISCOUNT';
        if (p === 'NOT_ALLOWED') return 'Not Allowed';
        if (p === 'WITHOUT_DISCOUNT') return 'Allowed – No Discount';
        if (p === 'MANUAL_DISCOUNT') return 'Manual Discount Allowed';
        return p;
    })();

    const lenderAddr = lender?.address
        ? [lender.address.street, lender.address.city, lender.address.state].filter(Boolean).join(', ')
        : '';

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const legalCenterUrl = `${frontendUrl.replace(/\/$/, '')}/legal`;

    const content = [
        // Header
        {
            columns: [
                {
                    stack: [
                        { text: businessName.toUpperCase(), fontSize: 16, bold: true, color: '#0f766e' },
                        { text: 'PERSONAL LOAN AGREEMENT', fontSize: 12, bold: true, color: '#1e293b', margin: [0, 4, 0, 0] },
                        { text: `Agreement Version: ${agreementVersion}`, fontSize: 9, color: '#64748b', margin: [0, 2, 0, 0] }
                    ]
                },
                {
                    stack: [
                        { text: `Date: ${fmtDate(snapshot.generatedAt || details.approvedAt || new Date())}`, fontSize: 9, alignment: 'right', color: '#64748b' },
                        { text: 'Customized Agreement', fontSize: 9, alignment: 'right', bold: true, color: '#0f766e', margin: [0, 2, 0, 0] }
                    ]
                }
            ],
            margin: [0, 0, 0, 20]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#0f766e' }] },
        { text: '', margin: [0, 10, 0, 0] },

        // Parties: Lender & Borrower
        {
            columns: [
                {
                    width: '50%',
                    stack: [
                        { text: 'LENDER DETAILS', fontSize: 10, bold: true, color: '#0f766e', margin: [0, 0, 0, 5] },
                        { text: businessName, bold: true, fontSize: 10 },
                        lender?.phone ? { text: `Phone: ${lender.phone}`, fontSize: 9, color: '#334155', margin: [0, 2, 0, 0] } : null,
                        lender?.email ? { text: `Email: ${lender.email}`, fontSize: 9, color: '#334155', margin: [0, 2, 0, 0] } : null,
                        lenderAddr ? { text: `Address: ${lenderAddr}`, fontSize: 9, color: '#334155', margin: [0, 2, 0, 0] } : null,
                    ].filter(Boolean)
                },
                {
                    width: '50%',
                    stack: [
                        { text: 'BORROWER DETAILS', fontSize: 10, bold: true, color: '#0f766e', margin: [0, 0, 0, 5] },
                        { text: details.borrowerName || 'N/A', bold: true, fontSize: 10 },
                        { text: `Phone: ${details.borrowerPhone || 'N/A'}`, fontSize: 9, color: '#334155', margin: [0, 2, 0, 0] },
                    ]
                }
            ],
            margin: [0, 10, 0, 15]
        },

        // Loan Terms Table
        { text: '1. LOAN & REPAYMENT TERMS', fontSize: 11, bold: true, color: '#0f766e', margin: [0, 10, 0, 6] },
        {
            table: {
                widths: ['35%', '65%'],
                body: [
                    [{ text: 'Principal Loan Amount', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: fmt(details.loanAmount), bold: true, fontSize: 9 }],
                    [{ text: 'Interest Type', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: `${details.interestType || 'Simple'} ${details.interestRate ? `(${details.interestRate}%)` : ''} ${details.interestAmount ? `(Rs. ${details.interestAmount})` : ''}`, fontSize: 9 }],
                    [{ text: 'Interest Period', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: details.interestPeriod || 'monthly', fontSize: 9 }],
                    [{ text: 'Loan Tenure', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: `${details.tenureValue} ${details.tenureUnit || 'months'}`, fontSize: 9 }],
                    [{ text: 'Repayment Amount', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: `${fmt(details.repaymentAmount)} (${details.repaymentFrequency || 'monthly'})`, bold: true, fontSize: 9 }],
                    [{ text: 'Start Date', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: fmtDate(details.startDate), fontSize: 9 }],
                    [{ text: 'First Payment Date', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: fmtDate(details.firstPaymentDate), fontSize: 9 }],
                    [{ text: 'Foreclosure Policy', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: foreclosurePolicyStr, fontSize: 9 }],
                    ...(details.gracePeriodDays ? [[{ text: 'Grace Period', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: `${details.gracePeriodDays} days`, fontSize: 9 }]] : []),
                    ...(details.lateFeeType && details.lateFeeType !== 'none' ? [[{ text: 'Late Payment Fee', bold: true, fontSize: 9, fillColor: '#f8fafc' }, { text: details.lateFeeType === 'fixed' ? `Rs. ${details.lateFeeValue} (fixed)` : `${details.lateFeeValue}% after grace`, fontSize: 9 }]] : []),
                ]
            },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#e2e8f0',
                vLineColor: () => '#e2e8f0',
                paddingTop: () => 4,
                paddingBottom: () => 4,
            },
            margin: [0, 0, 0, 15]
        },

        // Additional Agreed Terms (if present)
        ...(details.additionalAgreedTerms ? [
            { text: '2. ADDITIONAL AGREED TERMS', fontSize: 11, bold: true, color: '#0f766e', margin: [0, 5, 0, 6] },
            {
                table: {
                    widths: ['100%'],
                    body: [
                        [{ text: details.additionalAgreedTerms, fontSize: 9, color: '#1e293b', lineHeight: 1.3, fillColor: '#f8fafc' }]
                    ]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#cbd5e1',
                    vLineColor: () => '#cbd5e1',
                    paddingTop: () => 8,
                    paddingBottom: () => 8,
                    paddingLeft: () => 10,
                    paddingRight: () => 10,
                },
                margin: [0, 0, 0, 15]
            }
        ] : []),

        // KEY LEGAL TERMS
        { text: `${details.additionalAgreedTerms ? '3' : '2'}. KEY LEGAL TERMS`, fontSize: 11, bold: true, color: '#0f766e', margin: [0, 5, 0, 6] },
        {
            ul: [
                { text: 'The borrower agrees to repay the loan in accordance with the agreed schedule.', fontSize: 9, margin: [0, 2, 0, 2] },
                { text: 'Default in payments may incur late charges and legal recourse as permitted by law.', fontSize: 9, margin: [0, 2, 0, 2] },
                { text: 'Foreclosure terms are governed strictly as specified in this agreement.', fontSize: 9, margin: [0, 2, 0, 2] },
                { text: 'Standard platform policies, dispute resolution, and lender rights remain fully binding.', fontSize: 9, margin: [0, 2, 0, 2] }
            ],
            margin: [10, 0, 0, 8]
        },
        {
            text: [
                { text: 'For institutional terms, dispute resolution, and regulatory disclosures, review the ', fontSize: 9, color: '#475569' },
                { text: 'Legal Center', link: legalCenterUrl, color: '#0f766e', decoration: 'underline', bold: true, fontSize: 9 },
                { text: '.', fontSize: 9, color: '#475569' }
            ],
            margin: [0, 0, 0, 15]
        },

        // BORROWER DECLARATION
        { text: `${details.additionalAgreedTerms ? '4' : '3'}. BORROWER DECLARATION`, fontSize: 11, bold: true, color: '#0f766e', margin: [0, 5, 0, 6] },
        {
            text: 'I confirm that I have read, understood, and agreed to all the terms, repayment obligations, and legal policies outlined in this agreement.',
            fontSize: 9,
            italics: true,
            color: '#334155',
            margin: [0, 0, 0, 25]
        },

        // SIGNATURES
        {
            columns: [
                {
                    width: '50%',
                    stack: [
                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 0.5, lineColor: '#94a3b8' }] },
                        { text: 'Borrower Signature', fontSize: 9, color: '#64748b', margin: [0, 5, 0, 0] },
                        { text: details.borrowerName || 'Borrower', fontSize: 10, bold: true, margin: [0, 3, 0, 0] }
                    ]
                },
                {
                    width: '50%',
                    stack: [
                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 0.5, lineColor: '#94a3b8' }] },
                        { text: 'Authorized Signatory', fontSize: 9, color: '#64748b', margin: [0, 5, 0, 0] },
                        { text: `For ${businessName}`, fontSize: 10, bold: true, margin: [0, 3, 0, 0] }
                    ],
                    alignment: 'right'
                }
            ],
            margin: [0, 15, 0, 0]
        }
    ];

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content,
        defaultStyle: { font: 'Roboto' }
    };

    return printer.createPdfKitDocument(docDefinition);
};

module.exports = {
    generateLoanAgreement,
    generateCustomizedAgreement,
    generateLoanStatement,
    generatePaymentReceipt,
    generateLoanClosureNOC,
    generateInvoicePDF,
    generateSettlementCertificate
};
