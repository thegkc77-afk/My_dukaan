/**
 * Generates collision-resistant human readable record IDs scoped to a shop
 */
export const generateRecordId = async (model, prefix, shopId, digits = 4) => {
  const year = new Date().getFullYear();
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;

  for (let attempt = 0; attempt < 10; attempt++) {
    const randomNum = Math.floor(min + Math.random() * (max - min + 1));
    const recordId = `${prefix}-${year}-${randomNum}`;

    // Verify uniqueness within this shop
    const exists = await model.findOne({ shopId, recordId });
    if (!exists) {
      return recordId;
    }
  }

  // Fallback with timestamp suffix if collisions happen
  const timestampSuffix = Date.now().toString().slice(-digits);
  return `${prefix}-${year}-${timestampSuffix}`;
};
