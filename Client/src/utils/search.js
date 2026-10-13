// Smart search and characteristic matching utility for tagless item discovery

/**
 * Normalizes text for matching
 */
const normalize = (text) => (text ? text.toString().toLowerCase().trim() : '');

/**
 * Searches items (repairs or sales) by multi-field search query
 * Computes a match score and highlights reasons why it matched
 * @param {Array} items 
 * @param {string} query 
 * @param {Object} filters 
 * @returns {Array} items with matchScore and matchReasons, sorted by score descending
 */
export const searchTaglessItems = (items, query = '', filters = {}) => {
  const cleanQuery = normalize(query);
  const queryTokens = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

  return items
    .map((item) => {
      let score = 0;
      const reasons = [];

      // Category filter
      if (filters.category && filters.category !== 'All') {
        if (normalize(item.category) !== normalize(filters.category)) {
          return null;
        }
      }

      // Brand filter
      if (filters.brand && filters.brand !== 'All') {
        if (normalize(item.brand) !== normalize(filters.brand)) {
          return null;
        }
      }

      // Status filter
      if (filters.status && filters.status !== 'All') {
        if (normalize(item.repairStatus || item.warrantyStatus) !== normalize(filters.status)) {
          return null;
        }
      }

      // If no query string, give baseline score
      if (queryTokens.length === 0) {
        return { ...item, matchScore: 1, matchReasons: ['Listed record'] };
      }

      // Searchable attributes
      const id = normalize(item.id);
      const name = normalize(item.name || item.productName);
      const brand = normalize(item.brand);
      const model = normalize(item.model);
      const customer = normalize(item.customerName);
      const phone = normalize(item.customerPhone);
      const marks = normalize(item.distinctiveMarks);
      const problem = normalize(item.reportedProblem || item.defectReported);
      const serial = normalize(item.serialNumber);
      const colour = normalize(item.colour);

      // Exact ID match gets highest priority
      if (id.includes(cleanQuery)) {
        score += 100;
        reasons.push(`Matched ID: ${item.id}`);
      }

      // Exact Customer Name
      if (customer && customer.includes(cleanQuery)) {
        score += 80;
        reasons.push(`Customer: ${item.customerName}`);
      }

      // Serial number match
      if (serial && serial.includes(cleanQuery)) {
        score += 90;
        reasons.push(`Serial: ${item.serialNumber}`);
      }

      // Token matching across all fields
      let tokensMatchedCount = 0;
      queryTokens.forEach((token) => {
        let tokenMatched = false;

        if (marks && marks.includes(token)) {
          score += 35;
          tokenMatched = true;
          if (!reasons.includes('Distinctive marks match')) {
            reasons.push('Distinctive marks match');
          }
        }

        if (problem && problem.includes(token)) {
          score += 25;
          tokenMatched = true;
          if (!reasons.includes('Repair problem match')) {
            reasons.push('Repair problem match');
          }
        }

        if (brand && brand.includes(token)) {
          score += 20;
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
          reasons.push('Customer phone match');
        }

        if (tokenMatched) tokensMatchedCount++;
      });

      // Bonus if all tokens match
      if (tokensMatchedCount === queryTokens.length && queryTokens.length > 1) {
        score += 50;
      }

      if (score === 0) return null;

      return {
        ...item,
        matchScore: score,
        matchReasons: reasons
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);
};
