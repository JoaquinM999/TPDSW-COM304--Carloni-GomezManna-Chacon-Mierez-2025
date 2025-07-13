export const getCategorias = async () => {
    const response = await fetch('http://localhost:3000/api/categoria');
    if (!response.ok) {
      throw new Error('No se pudieron obtener las categorías');
    }
    return await response.json();
  };
  