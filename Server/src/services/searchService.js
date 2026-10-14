import { RepairOrder } from '../models/RepairOrder.js';

const normalize = (text) => (text ? text.toString().toLowerCase().trim() : '');

/**
 * Escapes regex special characters to prevent ReDoS / injection
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Authoritative Tagless Item Search Service
 */
export const searchTaglessItems = async (shopId, query = '', filters = {}) => {
  const cleanQuery = normalize(query).slice(0, 100); // enforce max query length 100
  const queryTokens = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

  // Build base query scoped strictly to shopId
  const dbQuery = { shopId };

  if (filters.category && filters.category !== 'All') {
    dbQuery.category = { $regex: new RegExp(`^${escapeRegex(filters.category)}$`, 'i') };
  }

  if (filters.brand && filters.brand !== 'All') {
    dbQuery.brand = { $regex: new RegExp(`^${escapeRegex(filters.brand)}$`, 'i') };
  }

  if (filters.status && filters.status !== 'All') {
    dbQuery.repairStatus = filters.status;
  }

  // Fetch candidate orders for this shop (limit to reasonable max e.g. 200 for deep in-memory scoring)
  const candidateOrders = await RepairOrder.find(dbQuery).lean();

  if (queryTokens.length === 0) {
    return candidateOrders.map((item) => ({
      ...item,
      id: item.recordId,
      matchScore: 1,
      matchReasons: ['Listed shop record']
    }));
  }

  const results = candidateOrders
    .map((item) => {
      let score = 0;
      const reasons = [];

      const recordId = normalize(item.recordId);
      const name = normalize(item.name);
      const brand = normalize(item.brand);
      const model = normalize(item.model);
      const customer = normalize(item.customerName);
      const phone = normalize(item.customerPhone);
      const marks = normalize(item.distinctiveMarks);
      const problem = normalize(item.reportedProblem);
      const serial = normalize(item.serialNumber);
      const colour = normalize(item.colour);

      // 1. Exact ID match gets highest priority
      if (recordId.includes(cleanQuery)) {
        score += 120;
        reasons.push(`Matched Record ID: ${item.recordId}`);
      }

      // 2. Serial number match
      if (serial && serial.includes(cleanQuery)) {
        score += 100;
        reasons.push(`Serial Number match: ${item.serialNumber}`);
      }

      // 3. Customer name match
      if (customer && customer.includes(cleanQuery)) {
        score += 80;
        reasons.push(`Customer match: ${item.customerName}`);
      }

      // 4. Token matching across characteristics
      let tokensMatchedCount = 0;
      queryTokens.forEach((token) => {
        let tokenMatched = false;

        if (marks && marks.includes(token)) {
          score += 40;
          tokenMatched = true;
          if (!reasons.includes('Distinctive marks match')) {
            reasons.push('Distinctive marks match');
          }
        }

        if (problem && problem.includes(token)) {
          score += 30;
          tokenMatched = true;
          if (!reasons.includes('Reported problem match')) {
            reasons.push('Reported problem match');
          }
        }

        if (brand && brand.includes(token)) {
          score += 25;
          tokenMatched = true;
          if (!reasons.includes(`Brand: ${item.brand}`)) {
            reasons.push(`Brand: ${item.brand}`);
          }
        }

        if (model && model.includes(token)) {
          score += 20;
          tokenMatched = true;
        }

        if (name && name.includes(token)) {
          score += 20;
          tokenMatched = true;
        }

        if (colour && colour.includes(token)) {
          score += 15;
          tokenMatched = true;
          reasons.push(`Colour: ${item.colour}`);
        }

        if (phone && phone.includes(token)) {
          score += 30;
          tokenMatched = true;
          reasons.push('Phone number match');
        }

        if (tokenMatched) tokensMatchedCount++;
      });

      // Bonus if all search tokens matched
      if (tokensMatchedCount === queryTokens.length && queryTokens.length > 1) {
        score += 50;
      }

      if (score === 0) return null;

      return {
        ...item,
        id: item.recordId,
        matchScore: score,
        matchReasons: reasons
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);

  return results;
};
