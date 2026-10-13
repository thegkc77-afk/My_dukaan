// Unique ID generator for Repair Orders, Sales, Claims, and Handovers

export const generateOrderId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RO-${year}-${randomNum}`;
};

export const generateSalesId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SL-${year}-${randomNum}`;
};

export const generateClaimId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `CLM-${year}-${randomNum}`;
};

export const generateHandoverId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `HND-${year}-${randomNum}`;
};
