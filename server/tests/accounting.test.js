// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Test Suite: Double-Entry Accounting Validation
// ============================================================

describe('Double-Entry Accounting Rules', () => {
  function validateJournalEntry(lines) {
    if (!lines || lines.length < 2) {
      return { valid: false, error: 'Journal entry requires at least 2 lines.' };
    }

    const totalDebit = lines.reduce((sum, l) => sum + parseFloat(l.debitAmount || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + parseFloat(l.creditAmount || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return {
        valid: false,
        error: `Unbalanced entry: Total Debit (${totalDebit}) != Total Credit (${totalCredit})`
      };
    }

    return { valid: true, totalDebit, totalCredit };
  }

  test('Rejects unbalanced journal entry (Debit 100,000 vs Credit 90,000)', () => {
    const lines = [
      { accountCode: '1001', accountName: 'Cash in Hand', debitAmount: 100000, creditAmount: 0 },
      { accountCode: '4001', accountName: 'Plot Sales Revenue', debitAmount: 0, creditAmount: 90000 }
    ];

    const result = validateJournalEntry(lines);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unbalanced entry');
  });

  test('Accepts balanced journal entry (Debit 100,000 vs Credit 100,000)', () => {
    const lines = [
      { accountCode: '1001', accountName: 'Cash in Hand', debitAmount: 100000, creditAmount: 0 },
      { accountCode: '4001', accountName: 'Plot Sales Revenue', debitAmount: 0, creditAmount: 100000 }
    ];

    const result = validateJournalEntry(lines);
    expect(result.valid).toBe(true);
    expect(result.totalDebit).toBe(100000);
    expect(result.totalCredit).toBe(100000);
  });

  test('Rejects single line journal entry', () => {
    const lines = [
      { accountCode: '1001', accountName: 'Cash in Hand', debitAmount: 50000, creditAmount: 0 }
    ];

    const result = validateJournalEntry(lines);
    expect(result.valid).toBe(false);
  });
});
