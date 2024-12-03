// Generate Table Function
function generateTable() {
    const rows = parseInt(document.getElementById('rows').value);
    const columns = parseInt(document.getElementById('columns').value);
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';

    if (!rows || !columns || rows < 2 || columns < 2) {
        alert("Please enter valid rows and columns (minimum 2 each).");
        return;
    }

    let tableHTML = '<table>';
    tableHTML += '<tr><th></th>';
    for (let j = 0; j < columns; j++) {
        tableHTML += `<th>Destination ${j + 1}</th>`;
    }
    tableHTML += '<th>Supply</th></tr>';

    for (let i = 0; i < rows; i++) {
        tableHTML += `<tr><th>Source ${i + 1}</th>`;
        for (let j = 0; j < columns; j++) {
            tableHTML += `<td><input type="number" min="0" id="cell-${i}-${j}" class="cell"></td>`;
        }
        tableHTML += `<td><input type="number" min="0" id="supply-${i}" class="supply"></td></tr>`;
    }

    tableHTML += '<tr><th>Demand</th>';
    for (let j = 0; j < columns; j++) {
        tableHTML += `<td><input type="number" min="0" id="demand-${j}" class="demand"></td>`;
    }
    tableHTML += '<td></td></tr>';
    tableHTML += '</table>';

    tableContainer.innerHTML = tableHTML;
}

// Reset Results
function resetResults() {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';
}

// Check if Problem Can Be Solved
function canBeSolved(supplies, demands) {
    const totalSupply = supplies.reduce((a, b) => a + b, 0);
    const totalDemand = demands.reduce((a, b) => a + b, 0);
    return totalSupply === totalDemand;
}

// Check for Degeneracy
function checkDegeneracy(allocation, rows, columns) {
    let nonZeroAllocations = 0;
    allocation.forEach(row => row.forEach(cell => {
        if (cell > 0) nonZeroAllocations++;
    }));
    return nonZeroAllocations < (rows + columns - 1);
}

// Display Final Allocation
function displayFinalAllocation(allocation, rows, columns, costs, totalCost, isDegenerate, methodName) {
    let resultHTML = `<h3>Solution using: ${methodName}</h3>`;
    resultHTML += '<table><tr><th></th>';
    for (let j = 0; j < columns; j++) {
        resultHTML += `<th>Destination ${j + 1}</th>`;
    }
    resultHTML += '</tr>';

    allocation.forEach((row, i) => {
        resultHTML += `<tr><th>Source ${i + 1}</th>${row.map(alloc => `<td>${alloc}</td>`).join('')}</tr>`;
    });

    resultHTML += `<tr><th>Total Cost</th><td colspan="${columns}" class="highlight">${totalCost}</td></tr>`;
    resultHTML += `<tr><th>Solution Type</th><td colspan="${columns}" class="highlight">${isDegenerate ? 'Degenerate' : 'Non-Degenerate'}</td></tr></table>`;
    document.getElementById('result-container').innerHTML = resultHTML;
}

// Solve Using Northwest Corner Method
function solveNorthwest() {
    resetResults();
    const rows = parseInt(document.getElementById('rows').value);
    const columns = parseInt(document.getElementById('columns').value);
    const supplies = Array.from({ length: rows }, (_, i) => parseInt(document.getElementById(`supply-${i}`).value));
    const demands = Array.from({ length: columns }, (_, j) => parseInt(document.getElementById(`demand-${j}`).value));
    const costs = Array.from({ length: rows }, (_, i) =>
        Array.from({ length: columns }, (_, j) => parseInt(document.getElementById(`cell-${i}-${j}`).value))
    );

    if (!canBeSolved(supplies, demands)) {
        document.getElementById('result-container').innerHTML = '<h2>CAN\'T BE SOLVED BY NORTHWEST CORNER METHOD</h2>';
        return;
    }

    const allocation = Array.from({ length: rows }, () => Array(columns).fill(0));
    let i = 0, j = 0;
    while (i < rows && j < columns) {
        const allocationAmount = Math.min(supplies[i], demands[j]);
        allocation[i][j] = allocationAmount;
        supplies[i] -= allocationAmount;
        demands[j] -= allocationAmount;

        if (supplies[i] === 0) i++;
        if (demands[j] === 0) j++;
    }

    const totalCost = allocation.reduce((sum, row, x) =>
        sum + row.reduce((rowSum, alloc, y) => rowSum + alloc * costs[x][y], 0), 0);

    const isDegenerate = checkDegeneracy(allocation, rows, columns);
    displayFinalAllocation(allocation, rows, columns, costs, totalCost, isDegenerate, 'Northwest Corner Method');
}

// Solve Using Least Cost Method
function solveLeastCost() {
    resetResults();
    const rows = parseInt(document.getElementById('rows').value);
    const columns = parseInt(document.getElementById('columns').value);
    const supplies = Array.from({ length: rows }, (_, i) => parseInt(document.getElementById(`supply-${i}`).value));
    const demands = Array.from({ length: columns }, (_, j) => parseInt(document.getElementById(`demand-${j}`).value));
    const costs = Array.from({ length: rows }, (_, i) =>
        Array.from({ length: columns }, (_, j) => parseInt(document.getElementById(`cell-${i}-${j}`).value))
    );

    if (!canBeSolved(supplies, demands)) {
        document.getElementById('result-container').innerHTML = '<h2>CAN\'T BE SOLVED BY LEAST COST METHOD</h2>';
        return;
    }

    const allocation = Array.from({ length: rows }, () => Array(columns).fill(0));
    while (supplies.some(s => s > 0) && demands.some(d => d > 0)) {
        let minCost = Infinity, minRow = -1, minCol = -1;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (costs[i][j] < minCost && supplies[i] > 0 && demands[j] > 0) {
                    minCost = costs[i][j];
                    minRow = i;
                    minCol = j;
                }
            }
        }

        const allocationAmount = Math.min(supplies[minRow], demands[minCol]);
        allocation[minRow][minCol] = allocationAmount;
        supplies[minRow] -= allocationAmount;
        demands[minCol] -= allocationAmount;
    }

    const totalCost = allocation.reduce((sum, row, x) =>
        sum + row.reduce((rowSum, alloc, y) => rowSum + alloc * costs[x][y], 0), 0);

    const isDegenerate = checkDegeneracy(allocation, rows, columns);
    displayFinalAllocation(allocation, rows, columns, costs, totalCost, isDegenerate, 'Least Cost Method');
}

// Event Listeners
document.getElementById('generate-button').addEventListener('click', generateTable);
document.getElementById('solve-nw-button').addEventListener('click', solveNorthwest);
document.getElementById('solve-lc-button').addEventListener('click', solveLeastCost);