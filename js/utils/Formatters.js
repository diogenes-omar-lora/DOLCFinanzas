export function formatDate(dateString) {
    if (!dateString) return '';
    
    // Extraer la parte de la fecha (YYYY-MM-DD) sin tiempo
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(num => parseInt(num, 10));
    
    // Crear fecha local sin conversión UTC
    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-ES');
}

export function formatCurrency(amount) {
    // Formatear número con comas para miles y dos decimales
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}