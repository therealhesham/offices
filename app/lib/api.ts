export async function getOrder(id: string) {
    const response = await fetch(`http://localhost:3002/api/orders/${id}`);
  
    if (!response.ok) return null;
    return response.json();
  }