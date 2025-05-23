const Utils = new class {
    formatTimestamp(seconds) {
        const date = new Date(seconds * 1000); // Convertiamo in millisecondi
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Mese parte da 0
        const yyyy = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${dd}/${mm}/${yyyy} - ${hh}:${min}`;
    }
    formatCompactNumber(num) {
        if (num < 1000) return num.toString();
      
        if (num < 1_000_000) {
          const result = num / 1000;
          return result % 1 === 0 ? `${result}k` : `${result.toFixed(1)}k`;
        }
      
        const result = num / 1_000_000;
        return result % 1 === 0 ? `${result}M` : `${result.toFixed(2)}M`;
    }
}
export default Utils;