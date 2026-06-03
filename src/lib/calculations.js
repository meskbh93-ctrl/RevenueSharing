// Calculate revenue for a service over 5 years
export function calculateServiceRevenue(service) {
  const years = [];
  let price = service.base_price || 0;
  let quantity = service.base_quantity || 0;
  const priceGrowth = service.price_growth_rates || [0, 0, 0, 0, 0];
  const quantityGrowth = service.quantity_growth_rates || [0, 0, 0, 0, 0];

  for (let i = 0; i < 5; i++) {
    if (i > 0) {
      price = price * (1 + (priceGrowth[i - 1] || 0) / 100);
      quantity = quantity * (1 + (quantityGrowth[i - 1] || 0) / 100);
    }
    years.push({
      year: i + 1,
      price: Math.round(price * 100) / 100,
      quantity: Math.round(quantity * 100) / 100,
      revenue: Math.round(price * quantity * 100) / 100,
    });
  }
  return years;
}

// Calculate cost over 5 years
export function calculateCostOverYears(cost) {
  const years = [];
  let amount = cost.base_amount || 0;
  const growthRates = cost.growth_rates || [0, 0, 0, 0, 0];

  for (let i = 0; i < 5; i++) {
    if (i > 0) {
      amount = amount * (1 + (growthRates[i - 1] || 0) / 100);
    }
    years.push({
      year: i + 1,
      amount: Math.round(amount * 100) / 100,
    });
  }
  return years;
}

// Calculate total revenue per year from all services
export function calculateTotalRevenue(services) {
  const totals = [0, 0, 0, 0, 0];
  services.forEach(service => {
    const rev = calculateServiceRevenue(service);
    rev.forEach((y, i) => {
      totals[i] += y.revenue;
    });
  });
  return totals.map((t, i) => ({ year: i + 1, revenue: Math.round(t * 100) / 100 }));
}

// Calculate total costs per year
export function calculateTotalCosts(costs) {
  const opTotals = [0, 0, 0, 0, 0];
  const capTotals = [0, 0, 0, 0, 0];
  
  costs.forEach(cost => {
    const c = calculateCostOverYears(cost);
    c.forEach((y, i) => {
      if (cost.type === 'operational') opTotals[i] += y.amount;
      else capTotals[i] += y.amount;
    });
  });

  return Array.from({ length: 5 }, (_, i) => ({
    year: i + 1,
    operational: Math.round(opTotals[i] * 100) / 100,
    capital: Math.round(capTotals[i] * 100) / 100,
    total: Math.round((opTotals[i] + capTotals[i]) * 100) / 100,
  }));
}

// Calculate income sharing distribution
export function calculateIncomeDistribution(services, costs, sharing) {
  const revTotals = calculateTotalRevenue(services);
  const costTotals = calculateTotalCosts(costs);
  const govShares = sharing?.government_shares || [50, 50, 50, 50, 50];
  const partnerShares = sharing?.partner_shares || [50, 50, 50, 50, 50];

  return Array.from({ length: 5 }, (_, i) => {
    const netIncome = revTotals[i].revenue - costTotals[i].total;
    const govShare = govShares[i] || 50;
    const partShare = partnerShares[i] || 50;
    return {
      year: i + 1,
      revenue: revTotals[i].revenue,
      costs: costTotals[i].total,
      netIncome: Math.round(netIncome * 100) / 100,
      governmentAmount: Math.round(revTotals[i].revenue * govShare / 100 * 100) / 100,
      partnerAmount: Math.round(revTotals[i].revenue * partShare / 100 * 100) / 100,
      governmentPercent: govShare,
      partnerPercent: partShare,
    };
  });
}

export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}