// Discrepancy rule (agree this with your team before the backend is connected):
// quantityDifference = |expectedQuantity - verifiedQuantity|
export function calculateDiscrepancy(expected, verified) {
    const diff = expected - verified;
    return {
        quantityDifference: Math.abs(diff),
        discrepancyType: diff === 0 ? 'NONE' : diff > 0 ? 'SHORTAGE' : 'EXCESS',
    };
}