export const getPartsStatsByRobot = async (robot_id: string) => {
    const response = await fetch(`/api/robots/get-today-parts-by-robot?robot_id=${robot_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
}