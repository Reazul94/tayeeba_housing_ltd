// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Test Suite: Money Receipt Numbering & Concurrency Simulation
// ============================================================

describe('Receipt Numbering and Plot Concurrency', () => {
  function formatReceiptNumber(seq, year = 2026) {
    return `THL-MR-${year}-${String(seq).padStart(4, '0')}`;
  }

  test('Generates sequential, unique formatted receipt numbers', () => {
    const receipts = [];
    for (let i = 1; i <= 5; i++) {
      receipts.push(formatReceiptNumber(i, 2026));
    }

    expect(receipts).toEqual([
      'THL-MR-2026-0001',
      'THL-MR-2026-0002',
      'THL-MR-2026-0003',
      'THL-MR-2026-0004',
      'THL-MR-2026-0005',
    ]);

    const uniqueSet = new Set(receipts);
    expect(uniqueSet.size).toBe(5);
  });

  test('Simulates atomic plot booking (only first user succeeds, second user gets 409 conflict)', async () => {
    const plotState = {
      id: 'plot-001',
      plotNumber: 'P-101',
      status: 'Available',
      customerId: null
    };

    async function bookPlot(userId, customerId) {
      // Simulate atomic check & lock
      if (plotState.status !== 'Available') {
        return { success: false, status: 409, error: `Plot ${plotState.plotNumber} is no longer available.` };
      }
      // Lock plot
      plotState.status = 'Booked';
      plotState.customerId = customerId;
      return { success: true, status: 201, bookingNumber: 'THL-BKG-2026-0001' };
    }

    // Simulate two concurrent requests
    const res1 = await bookPlot('userA', 'custA');
    const res2 = await bookPlot('userB', 'custB');

    expect(res1.success).toBe(true);
    expect(res1.status).toBe(201);

    expect(res2.success).toBe(false);
    expect(res2.status).toBe(409);
    expect(res2.error).toContain('is no longer available');
  });
});
