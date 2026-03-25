const getRankings = (data) => {
    // Rely on pre-calculated totals from data.json if available
    // Otherwise calculate using fixed NIRF formula
    const rankedData = data.map(inst => {
        if (inst.total) return inst;
        
        const weightage = { TLR: 0.30, RP: 0.30, GO: 0.20, OI: 0.10, PR: 0.10 };
        let total = 0;
        for (const [criteria, weight] of Object.entries(weightage)) {
            total += (inst.scores[criteria] || 0) * weight;
        }
        return { ...inst, total: Math.round(total * 100) / 100 };
    });

    // Sort by total score descending
    rankedData.sort((a, b) => b.total - a.total);

    // Assign rank positions based on the sorted data
    return rankedData.map((inst, index) => ({
        ...inst,
        rank: index + 1
    }));
};

module.exports = { getRankings };
