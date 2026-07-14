// Utilidades de calculo monetario, evitando errores de precision con floats nativos
function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function calculateSaleTotal(items) {
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  return roundMoney(total);
}

function calculateCashDifference(expectedAmount, declaredAmount) {
  return roundMoney(Number(declaredAmount) - Number(expectedAmount));
}

export { roundMoney, calculateSaleTotal, calculateCashDifference }
